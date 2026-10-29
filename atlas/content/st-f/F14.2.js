// The geodesic lab, level 2 — the orbit equation u″ + u = M/L² + 3Mu²
// (u = 1/r, ′ = d/dφ, G = c = 1) integrated with RK4 at fixed dφ, periapses
// located as events (u′ = 0) by the cubic Hermite interpolant, and the advance
// per radial period checked against the exact 4K(m)/√(2M(u₃ − u₁)) − 2π. The
// strong-field orbit (rₚ, rₐ) = (10, 25)M advances 1.98369 rad per orbit
// (6πM/p says 1.32): RK4 + Hermite converges at order 4, velocity Verlet at
// order 2, and RK4 with a linearly interpolated periapsis wanders. Mercury:
// RK4 at 200 steps per orbit gives 47.35″/century, but a Newtonian run at the
// same step gives 4.37″ — pure numerical precession, 2πh⁴/120 per orbit —
// and the difference is 42.9807″ (exact: 42.98068″). Also: L and E from the
// apsides, step counts from hᵖ scaling, Richardson's error estimate, and a
// third RK4 stage built from k₁ (clean order 2). Level 1 is F14.1, level 3 F14.3.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { orbitOf, precession, perCentury, MERCURY, PLANETS, M_SUN_M, n12, lg } from './_geo.js';

const t = String.raw;

// ── the Explore: (10, 25)M, three codes, steps 2π/N ──
const O = orbitOf(10, 25);
const NS = [40, 80, 160, 320, 640, 1280];
const CODES = [
  { key: 1, label: 'RK4, Hermite periapsis', color: 'accent', o: { method: 'rk4', locate: 'hermite' } },
  { key: 2, label: 'RK4, linear periapsis', color: 'bad', o: { method: 'rk4', locate: 'linear' } },
  { key: 3, label: 'Verlet, Hermite periapsis', color: 'gold', o: { method: 'verlet', locate: 'hermite' } },
].map((C) => ({ ...C, e: NS.map((N) => precession(10, 25, N, C.o).adv - O.exact) }));
const ORD = CODES.map((C) => Math.log2(Math.abs(C.e[C.e.length - 2] / C.e[C.e.length - 1])));
const wh = (k) => `step(0.5 - abs(cd - ${k}))`;
const hOf = (N) => (2 * Math.PI) / N;
const errPts = (C, o = {}) => C.e.map((e, i) => ({ x: n12(lg(hOf(NS[i]))), y: n12(lg(Math.abs(e))), r: 4.5, color: C.color, ...o }));

// ── the worked example: Mercury ──
const ME = MERCURY, MM = M_SUN_M;
const OM = orbitOf(ME.a * (1 - ME.e), ME.a * (1 + ME.e), MM);
const EXACT_CY = perCentury(OM.exact, ME.P), WEAK_CY = perCentury(OM.weak, ME.P);
const MN = [100, 200, 400, 800, 1600].map((N) => {
  const gr = perCentury(precession(OM.rp, OM.ra, N, { M: MM }).adv, ME.P), nw = perCentury(precession(OM.rp, OM.ra, N, { M: MM, newton: true }).adv, ME.P);
  return { N, gr, nw, d: gr - nw };
});
const M200 = MN[1];
const PHASE200 = (2 * Math.PI * hOf(200) ** 4) / 120;

// a precessing orbit drawn from an RK4 path: points (x, y) = (cos φ, sin φ)/u
function orbitPts(rp, ra, turns = 2, o = {}) {
  const P = precession(rp, ra, 400, { orbits: turns, path: true }).path;
  const step = Math.max(1, Math.round(P.length / 700));
  return P.filter((_, i) => i % step === 0).map(([ph, u]) => ({ x: n12(Math.cos(ph) / u), y: n12(Math.sin(ph) / u), r: 1.4, color: 'accent', ...o }));
}
// the cubic u′² = 2M(u − u₁)(u − u₂)(u − u₃) with its roots
function cubicPic(Ob, caption) {
  const { u1, u2, u3 } = Ob, top = u3 * 1.12;
  const g = `2*(x - ${n12(u1)})*(x - ${n12(u2)})*(x - ${n12(u3)})`;
  const ys = Array.from({ length: 200 }, (_, i) => { const x = (top * i) / 199; return 2 * (x - u1) * (x - u2) * (x - u3); });
  const ymax = Math.max(...ys.filter((_, i) => (top * i) / 199 < u3)), ymin = Math.min(...ys);
  return {
    type: 'graph',
    params: {
      x: [0, +n12(top)], y: [+n12(Math.max(ymin, -1.4 * ymax)), +n12(1.5 * ymax)], aspect: 'wide', axesAt: 'edge', xlabel: 'u = 1/r (1/M)', ylabel: 'u′²', yticks: 0,
      curves: [{ fn: g, color: 'gold', width: 2.2 }],
      shade: [{ fn: g, lower: '0', from: n12(u1), to: n12(u2), color: 'accent', alpha: 0.3 }],
      points: [{ x: n12(u1), y: 0, r: 5, color: 'accent', label: 'u₁ = 1/rₐ', labelDy: 14, labelAlign: 'right', labelDx: -10 }, { x: n12(u2), y: 0, r: 5, color: 'accent', label: 'u₂ = 1/rₚ', labelDy: 14, labelDx: 10 }, { x: n12(u3), y: 0, r: 5, color: 'bad', label: 'u₃', labelDy: 14, labelAlign: 'right', labelDx: -10 }],
    },
    caption,
  };
}

// ── the code exercise: (9, 30)M ──
const O9 = orbitOf(9, 30), E9 = [100, 200].map((N) => precession(9, 30, N).adv - O9.exact);

// ── checkpoint: the k₃ bug (third stage built from k₁) ──
function bugPrec(N) {
  const g = (u) => 1 / O.L2 - u + 3 * u * u, h = hOf(N);
  let u = 1 / 25, w = 0, phi = 0;
  const peri = [];
  while (peri.length < 2) {
    const u0 = u, w0 = w;
    const k1u = w, k1w = g(u), k2u = w + (h / 2) * k1w, k2w = g(u + (h / 2) * k1u), k3u = w + (h / 2) * k1w, k3w = g(u + (h / 2) * k1u), k4u = w + h * k3w, k4w = g(u + h * k3u);
    u += (h / 6) * (k1u + 2 * k2u + 2 * k3u + k4u); w += (h / 6) * (k1w + 2 * k2w + 2 * k3w + k4w);
    if (w0 > 0 && w <= 0) {           // the correct cubic Hermite locator, as in _geo.js
      const a0 = g(u0), a1 = g(u);
      const H = (s) => (2 * s ** 3 - 3 * s * s + 1) * w0 + (s ** 3 - 2 * s * s + s) * h * a0 + (-2 * s ** 3 + 3 * s * s) * w + (s ** 3 - s * s) * h * a1;
      let lo = 0, hi = 1;
      for (let i = 0; i < 80; i++) { const mid = (lo + hi) / 2; if (H(mid) > 0) lo = mid; else hi = mid; }
      peri.push(phi + h * ((lo + hi) / 2));
    }
    phi += h;
  }
  return peri[1] - peri[0] - 2 * Math.PI;
}
const BUG = NS.slice(0, 5).map((N) => bugPrec(N) - O.exact);

export default lesson({
  id: 'st-f.F14.2',
  title: 'Level 2: the orbit equation u(φ)',
  minutes: 17, difficulty: 3,
  equation: t`u'' + u = \frac{M}{L^2} + 3Mu^2`,
  intro: t`For orbits, a better independent variable than proper time is the angle $\varphi$ itself. With $u = 1/r$, the geodesic equation becomes the orbit equation above ([derived in gr.S25.d](#/lesson/gr.S25.d)): Newton’s orbit equation plus the term $3Mu^2$. Integrated at fixed steps in $\varphi$, it is the natural tool for measuring **precession**: a periapsis is an *event*, the place where $u' = 0$ with $u$ at a maximum, and the advance per orbit is the angle between successive periapses minus $2\pi$. For a bound orbit the exact answer is known:

$$\Delta\varphi = \frac{4K(m)}{\sqrt{2M(u_3 - u_1)}} - 2\pi$$

with $u_1 = 1/r_a$ and $u_2 = 1/r_p$ the apsides, $u_3 = 1/2M - u_1 - u_2$ and $m = (u_2 - u_1)/(u_3 - u_1)$. So a code’s precession can be checked to many digits — and that is how you discover that the hard part is not the integrator but finding the periapsis, and subtracting the code’s own numerical precession.`,
  symbols: [
    { tex: 'u', text: 'the inverse radius $1/r$, in units of $1/M$' },
    { tex: t`\varphi,\ u''`, text: 'the orbital angle (the independent variable here) and $d^2u/d\\varphi^2$' },
    { tex: 'M', text: 'the central mass, as a length ($GM/c^2$; $1477$ m for the Sun) with $G = c = 1$' },
    { tex: 'L', text: 'the angular momentum per unit mass, $r^2\\,d\\varphi/d\\tau$, conserved; $M/L^2$ alone gives Newton’s ellipse $u = (1 + e\\cos\\varphi)/p$' },
    { tex: '3Mu^2', text: 'general relativity’s correction: tiny far out, decisive near the black hole; it makes the orbit precess' },
    { tex: t`\Delta\varphi`, text: 'the periapsis advance per radial period, in radians; the weak-field limit is $6\\pi M/p$ with $p = 2r_pr_a/(r_p + r_a)$' },
    { tex: 'K(m)', text: 'the complete elliptic integral of the first kind, $\\int_0^{\\pi/2} d\\theta/\\sqrt{1 - m\\sin^2\\theta}$ — `scipy.special.ellipk(m)` in Python' },
  ],
  why: 'Precession is how GR was first confirmed and how binary pulsars and the stars at the Galactic Centre are weighed; measuring it numerically is a lesson in events, error constants and cancelling a code’s own systematic error.',
  visual: {
    type: 'graph',
    title: 'Which part of the code sets the order?',
    lead: t`The orbit $(r_p, r_a) = (10, 25)M$ advances $\Delta\varphi = ${O.exact.toFixed(6)}$ rad per orbit — ${Math.round((O.exact * 180) / Math.PI)}°, where the weak-field $6\pi M/p$ would say $${O.weak.toFixed(3)}$. Each dot is a code’s error in $\Delta\varphi$, from runs with $N = 40$ to $1280$ steps per $2\pi$, on log–log axes. Choose the integrator and the way the periapsis is located between steps.`,
    tasks: [
      `RK4 with the Hermite locator: slope 4 all the way (finest pair ${ORD[0].toFixed(2)}).`,
      'The same RK4 with a straight line through u′ at the two ends of the step: the errors jump about, even changing sign — the locator, not the integrator, now sets the error.',
      `Velocity Verlet: a clean slope 2 (${ORD[2].toFixed(2)}), the spurious precession of F10.2, always of the same sign.`,
    ],
    params: {
      x: [-2.4, -0.7], y: [-13, -1.5], xlog: true, ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'step dφ (rad)', ylabel: '|error in Δφ| (rad)',
      choices: [{ key: 'cd', label: 'Code', options: CODES.map((C) => [C.key, C.label]), value: 1, explain: 'Hermite: the cubic through u′ and u″ at both ends of the step (fourth order). Linear: a straight line through u′ alone (second order).' }],
      points: CODES.flatMap((C) => errPts(C, { when: wh(C.key) })),
      curves: [
        { fn: `${n12(lg(Math.abs(CODES[0].e[0])))} + 4*(x - ${n12(lg(hOf(40)))})`, color: 'ink4', width: 1.2, dash: true, domain: [-2.4, -0.7], label: 'slope 4', labelAt: -1.5, labelDy: 16 },
        { fn: `${n12(lg(Math.abs(CODES[2].e[0])))} + 2*(x - ${n12(lg(hOf(40)))})`, color: 'ink4', width: 1.2, dash: true, domain: [-2.4, -0.7], label: 'slope 2', labelAt: -2.2, labelDy: 16 },
      ],
      readouts: [{ label: 'observed order, finest pair', expr: CODES.map((C, i) => `${wh(C.key)}*${n12(ORD[i])}`).join(' + '), digits: 3 }],
    },
    caption: 'Exact float64 runs from apoapsis, one radial period each, against the elliptic-integral value. Dashed lines are reference slopes, not fits.',
  },
  example: {
    prompt: t`Measure Mercury’s relativistic perihelion advance with the orbit equation: $GM_\odot/c^2 = ${MM.toFixed(1)}\ \text{m}$, $a = 5.7909\times10^{10}\ \text{m}$, $e = 0.20563$, orbital period $87.969$ days. Use RK4 at $N = 200$ steps per $2\pi$ and give the answer in arcseconds per century.`,
    visual: {
      type: 'graph',
      params: {
        x: [1.85, 3.35], y: [0, 125], xlog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'steps per orbit N', ylabel: '″ per century',
        points: [...MN.map((m) => ({ x: n12(lg(m.N)), y: n12(m.gr), r: 5, color: 'gold' })), ...MN.map((m) => ({ x: n12(lg(m.N)), y: n12(Math.max(m.nw, 0)), r: 5, color: 'bad' })), ...MN.map((m) => ({ x: n12(lg(m.N)), y: n12(m.d), r: 5, color: 'accent' }))],
        hlines: [{ y: n12(EXACT_CY), color: 'ink3', label: 'exact 42.98″' }],
        legend: [{ label: 'GR run', color: 'gold', point: true }, { label: 'Newton run (pure numerical error)', color: 'bad', point: true }, { label: 'GR run − Newton run', color: 'accent', point: true }], legendAt: 'tr',
      },
      caption: 'RK4 runs of one Mercury orbit at five step counts. The Newton run has no physical precession at all.',
    },
    steps: [
      { label: 'Set up', text: t`$r_p = a(1 - e)$ and $r_a = a(1 + e)$ give $u_1 = ${tex(OM.u1, 5)}$ and $u_2 = ${tex(OM.u2, 5)}\ \text{m}^{-1}$; with $M = ${MM.toFixed(1)}$ m the third root is $u_3 = 1/2M - u_1 - u_2$ and $L^2 = 1/\bigl(u_1u_2 + (u_1 + u_2)u_3\bigr) = ${tex(OM.L2, 5)}\ \text{m}^2$. Start at aphelion: $u = u_1$, $u' = 0$.` },
      { label: 'Run and locate', text: t`RK4 at $d\varphi = 2\pi/200$. Where $u'$ changes sign from $+$ to $-$, fit the cubic through $u'$ and $u'' = M/L^2 - u + 3Mu^2$ at both ends of the step and find its root: the perihelion angle, to fourth order. One orbit later, the next. The advance, times $415.2$ orbits per century, is $${M200.gr.toFixed(3)}''$ — ten percent too much.` },
      { label: 'The numerical precession', text: t`Drop $3Mu^2$ and run again with the same step. Newtonian gravity has no precession, yet this run gives $${M200.nw.toFixed(3)}''$ per century: RK4’s own phase error. For the linear equation $u'' + u = \text{const}$, RK4 turns $h$ less than $h$ of phase per step, by $h^5/120$, so each orbit ends $2\pi h^4/120 = ${tex(PHASE200, 3)}$ rad late — exactly that ${M200.nw.toFixed(2)}″.` },
      { label: 'Subtract', text: t`$${M200.gr.toFixed(4)} - ${M200.nw.toFixed(4)} = ${M200.d.toFixed(5)}''$ per century. The relativistic term is a tiny perturbation of the same linear equation, so both runs carry almost exactly the same numerical precession, and it cancels. At $N = 100$ the two runs are $${MN[0].gr.toFixed(1)}''$ and $${MN[0].nw.toFixed(1)}''$, and their difference is still $${MN[0].d.toFixed(4)}''$.` },
      { label: 'Check', text: t`The elliptic-integral formula gives $${EXACT_CY.toFixed(5)}''$ per century and the weak-field $6\pi M/p$ gives $${WEAK_CY.toFixed(5)}''$ — Mercury is so far out that the two agree to a millionth. It is the 43″ per century that Newtonian gravity could not explain.` },
    ],
    answer: t`About $${M200.d.toFixed(2)}''$ per century — but only after subtracting the Newtonian run’s $${M200.nw.toFixed(2)}''$ of purely numerical precession from the raw $${M200.gr.toFixed(2)}''$.`,
  },
  practice: [
    num({
      id: 'L-from-apsides', difficulty: 2,
      gen(r) {
        const rp = r.pick([8, 9, 11, 12]), ra = r.pick([20, 24, 30, 40]), Ob = orbitOf(rp, ra), ans = Ob.L;
        const newton = Math.sqrt(Ob.p);
        return {
          prompt: t`An orbit has periapsis $r_p = ${rp}M$ and apoapsis $r_a = ${ra}M$. The orbit equation’s cubic $u'^2 = 2M(u - u_1)(u - u_2)(u - u_3)$ fixes $L^2 = 1/\bigl(u_1u_2 + (u_1 + u_2)u_3\bigr)$ with $u_3 = 1/2M - u_1 - u_2$. What is $L$, in units of $M$?`,
          visual: cubicPic(Ob, 'The cubic u′² against u (not to scale vertically): the orbit lives between its roots u₁ and u₂ (shaded), where u′² ≥ 0. Its third root u₃ lies further in.'),
          answer: ans, tol: { rel: 0.003 },
          errors: [{ value: newton, feedback: t`$\sqrt{Mp}$ is Newton’s angular momentum. In GR the third root $u_3$ enters: use the formula.` }, { value: Ob.L2, feedback: 'That is L²; take the square root.' }].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: [t`$u_1 = 1/${ra} = ${(1 / ra).toFixed(5)}$, $u_2 = 1/${rp} = ${(1 / rp).toFixed(5)}$, $u_3 = 0.5 - u_1 - u_2 = ${Ob.u3.toFixed(5)}$.`, t`$u_1u_2 + (u_1 + u_2)u_3 = ${(1 / Ob.L2).toFixed(6)}$; invert and take the square root.`],
          teach: 'The apsides are the roots of the orbit equation’s energy cubic, so they fix L (and E) — the initial data a code needs.',
          explain: t`$L^2 = 1/${(1 / Ob.L2).toFixed(6)} = ${Ob.L2.toFixed(4)}$, so $L = ${ans.toFixed(4)}M$ (Newton’s $\sqrt{Mp}$ would be $${newton.toFixed(4)}M$). The energy follows too: $E^2 = (1 - 2Mu_2)(1 + L^2u_2^2)$, $E = ${Ob.E.toFixed(5)}$.`,
        };
      },
    }),
    num({
      id: 'exact-precession', difficulty: 3,
      gen(r) {
        const rp = r.pick([8, 12, 15, 20]), ra = r.pick([25, 35, 50]), Ob = orbitOf(rp, ra), ans = Ob.exact;
        return {
          prompt: t`For $(r_p, r_a) = (${rp}, ${ra})M$: $u_1 = 1/${ra}$, $u_2 = 1/${rp}$, $u_3 = ${Ob.u3.toFixed(6)}$, so $m = ${Ob.m.toFixed(6)}$ and $K(m) = ${Ob.K.toFixed(6)}$. What is the exact periapsis advance per orbit, in radians?`,
          visual: cubicPic(Ob, 'The orbit equation’s cubic u′² = 2M(u − u₁)(u − u₂)(u − u₃) (vertical scale arbitrary). The time spent between u₁ and u₂ sets the period in φ.'),
          answer: ans, units: 'rad', tol: { rel: 0.002 },
          errors: [{ value: Ob.Phi, feedback: t`That is the whole radial period $\Phi$ in $\varphi$; the advance is $\Phi - 2\pi$.` }, { value: Ob.weak, feedback: t`$6\pi M/p$ is only the weak-field limit; at these radii the exact value is noticeably larger.` }].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: [t`$\Phi = 4K(m)/\sqrt{2M(u_3 - u_1)}$ with $M = 1$.`, t`$\Phi = 4\times${Ob.K.toFixed(6)}/\sqrt{2\times${(Ob.u3 - Ob.u1).toFixed(6)}}$; subtract $2\pi$.`],
          teach: 'The orbit equation can be integrated exactly with an elliptic integral: a precision benchmark for any orbit code.',
          explain: t`$\Phi = ${Ob.Phi.toFixed(6)}$, so $\Delta\varphi = ${ans.toFixed(5)}$ rad (${((ans * 180) / Math.PI).toFixed(2)}°) per orbit, against the weak-field $6\pi M/p = ${Ob.weak.toFixed(5)}$ with $p = ${Ob.p.toFixed(3)}M$ — the ratio is $${(ans / Ob.weak).toFixed(3)}$.`,
        };
      },
    }),
    mcq({
      id: 'linear-locator', difficulty: 3,
      prompt: t`An RK4 code measures the precession of the $(10, 25)M$ orbit. Its errors jump about from one step size to the next, and even change sign. It finds each periapsis by drawing a straight line through $u'$ at the two ends of the step where $u'$ changes sign. What is wrong?`,
      visual: {
        type: 'graph',
        params: { x: [-2.4, -0.7], y: [-13, -1.5], xlog: true, ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'step dφ (rad)', ylabel: '|error in Δφ| (rad)',
          points: [...errPts(CODES[1]), ...errPts(CODES[0], { r: 3.5 })],
          legend: [{ label: 'the code', color: 'bad', point: true }, { label: 'RK4 with a cubic locator', color: 'accent', point: true }], legendAt: 'br' },
        caption: 'The Explore’s data: the same RK4 with two ways of locating the periapsis.',
      },
      choices: [
        t`The linear locator is only second-order accurate, with an error that depends on where in its step the periapsis falls; use the cubic Hermite interpolant through $u'$ and $u''$, which is fourth order`,
        'RK4 loses accuracy near the periapsis, where u changes fastest; shrink the step there',
        'Round-off: the errors are near machine precision',
        'The precession should be measured between apoapses instead',
      ],
      answer: 0,
      why: {
        1: 'u changes smoothly in φ; the integrator’s own error keeps falling at slope 4, as the blue points show.',
        2: 'The jumps sit at 10⁻⁷ to 10⁻⁹ rad, far above round-off in φ (about 10⁻¹⁵).',
        3: 'Apoapses are found the same way, with the same locator error.',
      },
      hints: ['Separate the two parts of the code: the integrator and the event locator.', 'What is the error of a straight line through two points of a curve, and does it depend on where the root falls?'],
      teach: 'An event located between steps is only as accurate as the interpolant: match its order to the integrator’s, or it caps the whole measurement.',
      explain: t`A chord through two points of a curved $u'(\varphi)$ misses its root by $O(h^2)$, with a size and sign set by where the root falls in the step — so the measured precession wanders as the steps change. The cubic Hermite interpolant uses $u''$, which the ODE gives for free, and is fourth order. (The Atlas’s [orbit explorer](#/explore/orbit) uses the linear locator: good enough to show precession to two digits, not to test RK4.)`,
    }),
    num({
      id: 'rk4-phase', difficulty: 2,
      gen(r) {
        const N = r.pick([50, 100, 150, 300, 500]), h = hOf(N), ans = (2 * Math.PI * h ** 4) / 120;
        return {
          prompt: t`A Newtonian orbit run with RK4 at $N = ${N}$ steps per $2\pi$ should not precess at all, but RK4 lags the true phase of $u'' + u = M/L^2$ by $h^5/120$ per step. How much spurious advance per orbit, in radians, does that give?`,
          visual: {
            type: 'graph',
            params: { x: [-1.3, 1.3], y: [-1.15, 1.15], equal: true, aspect: 'wide', axesAt: 'edge', xlabel: 'u − M/L² (scaled)', ylabel: 'u′ (scaled)', xticks: 0, yticks: 0,
              curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, 2 * Math.PI], color: 'ink3', width: 1.4, dash: true }],
              points: Array.from({ length: 6 }, (_, k) => ({ x: n12(Math.cos(-k * 0.6)), y: n12(Math.sin(-k * 0.6)), r: 4.5, color: 'ink3', ...(k === 5 ? { label: 'exact', labelDx: -12, labelAlign: 'right', labelDy: 4 } : {}) })).concat(Array.from({ length: 6 }, (_, k) => ({ x: n12(0.86 * Math.cos(-k * 0.5)), y: n12(0.86 * Math.sin(-k * 0.5)), r: 4.5, color: 'accent', ...(k === 5 ? { label: 'RK4', labelDx: 10, labelDy: -4 } : {}) }))) },
            caption: 'Schematic: the Newtonian orbit equation is an oscillator, a rotation in the (u, u′) plane. Five steps from the same start, clockwise from the right: RK4 (blue, drawn on a smaller circle to keep the two apart) turns a little less than the exact step (grey) each time — the lag hugely exaggerated.',
          },
          answer: ans, units: 'rad', tol: { rel: 0.01 },
          errors: [{ value: h ** 5 / 120, feedback: 'That is the lag of one step. An orbit is N steps.' }, { value: h ** 4 / 120, feedback: t`Per orbit the lag is $N\times h^5/120$ with $N = 2\pi/h$: $2\pi h^4/120$.` }],
          hints: [t`$h = 2\pi/${N}$.`, t`Per orbit: $N\cdot h^5/120 = 2\pi h^4/120$.`],
          teach: 'RK4’s phase error on an oscillator is h⁵/120 per step: a spurious precession of 2πh⁴/120 per orbit, the same in the Newtonian and the GR run.',
          explain: t`$h = ${h.toFixed(5)}$, so $2\pi h^4/120 = ${tex(ans, 3)}$ rad per orbit. It falls 16 times for every doubling of $N$, and it is why a GR code should difference against a Newtonian run made with the same step.`,
        };
      },
    }),
    num({
      id: 'steps-needed', difficulty: 3, transfer: true,
      gen(r) {
        const N0 = r.pick([100, 200]), row = MN.find((m) => m.N === N0), target = r.pick([0.1, 0.01]);
        const ex = +row.nw.toPrecision(3), want = (EXACT_CY * target) / 100, ans = N0 * (ex / want) ** 0.25;
        return {
          prompt: t`Without the Newtonian subtraction, an RK4 run of Mercury at $N = ${N0}$ steps per orbit overestimates the precession by $${ex}''$ per century. Assuming the excess falls as $h^4$, about how many steps per orbit would bring it below ${target}% of the true $42.98''$?`,
          visual: {
            type: 'graph',
            params: { x: [1.8, 3.6], y: [-3.5, 2.5], xlog: true, ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'steps per orbit N', ylabel: 'excess (″ per century)',
              points: MN.filter((m) => m.N <= N0).map((m) => ({ x: n12(lg(m.N)), y: n12(lg(m.nw)), r: 5, color: 'bad' })),
              hlines: [{ y: n12(lg(want)), color: 'good', label: `${target}% of 42.98″` }] },
            caption: 'The numerical excess at the step counts already run, and the target.',
          },
          answer: ans, tol: { rel: 0.03 },
          errors: [{ value: N0 * (ex / want), feedback: 'The excess falls as h⁴ = (2π/N)⁴, so N grows only as the fourth root of the reduction you need.' }, { value: N0 * (ex / want) ** 0.5, feedback: 'RK4’s excess is fourth order, not second: take the fourth root.' }],
          hints: [t`Target: $${target}\%\times42.98'' = ${tex(want, 3)}''$.`, t`$(N/${N0})^4 = ${ex}/${tex(want, 3)}$, so $N = ${N0}\times(${tex(ex / want, 4)})^{1/4}$.`],
          teach: 'With a verified order p, an error measured at one step predicts the step for any target: N grows as the p-th root of the reduction.',
          explain: t`$(${tex(ex / want, 4)})^{1/4} = ${((ex / want) ** 0.25).toFixed(3)}$, so $N \approx ${Math.round(ans)}$ steps per orbit. Or keep $N = ${N0}$ and subtract a Newtonian run — far cheaper, and better.`,
        };
      },
    }),
    num({
      id: 'verlet-order', difficulty: 2,
      gen(r) {
        const rp = r.pick([9, 11, 14]), N = r.pick([100, 200]), k = r.pick([2, 3, 4]);
        const Ob = orbitOf(rp, 30), d = +(precession(rp, 30, N, { method: 'verlet' }).adv - Ob.exact).toPrecision(3), ans = d / (k * k);
        return {
          prompt: t`Velocity Verlet run on the orbit equation for $(r_p, r_a) = (${rp}, 30)M$ at $N = ${N}$ steps per orbit gets the precession wrong by $${tex(d, 3)}$ rad. What error do you expect at $${k * N}$ steps per orbit?`,
          visual: { type: 'graph', params: { x: [-33, 33], y: [-33, 33], equal: true, aspect: 'wide', axesAt: 'edge', xlabel: 'x (M)', ylabel: 'y (M)', points: [...orbitPts(rp, 30, 2), { x: 0, y: 0, r: 5, color: 'void' }] }, caption: 'Two radial periods of the orbit (an accurate RK4 path); its periapsis advances each time round.' },
          answer: ans, units: 'rad', tol: { rel: 0.03 },
          errors: [{ value: d / k ** 4, feedback: 'Verlet is second order: the error falls as h², not h⁴.' }, { value: d / k, feedback: 'Second order: divide by the square of the step ratio.' }],
          hints: ['Velocity Verlet is second order: error ∝ h².', t`$${k}\times$ the steps divides $h$ by ${k}, so the error by $${k * k}$.`],
          teach: 'Verlet’s spurious precession is a clean h² effect: predictable, and always the same sign.',
          explain: t`$${tex(d, 3)}/${k * k} = ${tex(ans, 3)}$ rad. Because it is so regular, two Verlet runs and Richardson extrapolation with $2^2$ would remove most of it.`,
        };
      },
    }),
    code({
      id: 'periapsis', difficulty: 3,
      prompt: t`Measure the precession of the orbit $(r_p, r_a) = (9, 30)M$ ($M = 1$). The program integrates $u'' = M/L^2 - u + 3Mu^2$ from apoapsis with RK4 and spots the step where $u'$ changes sign from $+$ to $-$. Complete \`locate(w0, a0, w1, a1, h)\`: return the fraction $s \in [0, 1]$ of the step where the cubic Hermite interpolant of $u'$ vanishes — through $u'$ = \`w0\`, \`w1\` and $u''$ = \`a0\`, \`a1\` at its two ends. Then \`precession(N)\` returns the advance per orbit.`,
      starter: t`import numpy as np

M, rp, ra = 1.0, 9.0, 30.0
u1, u2 = 1 / ra, 1 / rp
u3 = 1 / (2 * M) - u1 - u2
L2 = 1 / (u1 * u2 + (u1 + u2) * u3)
g = lambda u: M / L2 - u + 3 * M * u * u        # u'' as a function of u

def locate(w0, a0, w1, a1, h):
    # cubic Hermite: H(s) = (2s^3 - 3s^2 + 1) w0 + (s^3 - 2s^2 + s) h a0
    #                     + (-2s^3 + 3s^2) w1 + (s^3 - s^2) h a1;  find H(s) = 0
    return 0.5

def precession(N):
    h = 2 * np.pi / N
    u, w, phi, peri = u1, 0.0, 0.0, []
    while len(peri) < 2:
        u0, w0 = u, w
        k1 = (w, g(u)); k2 = (w + h/2*k1[1], g(u + h/2*k1[0]))
        k3 = (w + h/2*k2[1], g(u + h/2*k2[0])); k4 = (w + h*k3[1], g(u + h*k3[0]))
        u += h/6 * (k1[0] + 2*k2[0] + 2*k3[0] + k4[0])
        w += h/6 * (k1[1] + 2*k2[1] + 2*k3[1] + k4[1])
        if w0 > 0 and w <= 0:
            peri.append(phi + h * locate(w0, g(u0), w, g(u), h))
        phi += h
    return peri[1] - peri[0] - 2 * np.pi

print(precession(100), precession(200))
`,
      answer: t`import numpy as np

M, rp, ra = 1.0, 9.0, 30.0
u1, u2 = 1 / ra, 1 / rp
u3 = 1 / (2 * M) - u1 - u2
L2 = 1 / (u1 * u2 + (u1 + u2) * u3)
g = lambda u: M / L2 - u + 3 * M * u * u        # u'' as a function of u

def locate(w0, a0, w1, a1, h):
    H = lambda s: ((2*s**3 - 3*s**2 + 1) * w0 + (s**3 - 2*s**2 + s) * h * a0
                   + (-2*s**3 + 3*s**2) * w1 + (s**3 - s**2) * h * a1)
    lo, hi = 0.0, 1.0
    for _ in range(60):
        mid = 0.5 * (lo + hi)
        if H(mid) > 0:
            lo = mid
        else:
            hi = mid
    return 0.5 * (lo + hi)

def precession(N):
    h = 2 * np.pi / N
    u, w, phi, peri = u1, 0.0, 0.0, []
    while len(peri) < 2:
        u0, w0 = u, w
        k1 = (w, g(u)); k2 = (w + h/2*k1[1], g(u + h/2*k1[0]))
        k3 = (w + h/2*k2[1], g(u + h/2*k2[0])); k4 = (w + h*k3[1], g(u + h*k3[0]))
        u += h/6 * (k1[0] + 2*k2[0] + 2*k3[0] + k4[0])
        w += h/6 * (k1[1] + 2*k2[1] + 2*k3[1] + k4[1])
        if w0 > 0 and w <= 0:
            peri.append(phi + h * locate(w0, g(u0), w, g(u), h))
        phi += h
    return peri[1] - peri[0] - 2 * np.pi

print(precession(100), precession(200))`,
      tests: [
        { name: t`at $N = 200$ the advance is within $10^{-7}$ rad of the exact $${O9.exact.toFixed(7)}$`, code: `abs(precession(200) - ${n12(O9.exact)}) < 1e-7` },
        { name: t`the error falls about 16-fold from $N = 100$ to $N = 200$`, code: `12 < abs(precession(100) - ${n12(O9.exact)}) / abs(precession(200) - ${n12(O9.exact)}) < 20` },
        { name: 'locate finds the zero of a cubic that crosses mid-step', code: 'abs(locate(1.0, 0.0, -1.0, 0.0, 1.0) - 0.5) < 1e-9' },
      ],
      hints: ['Define H(s) from the formula in the comment; H(0) = w0 > 0 and H(1) = w1 ≤ 0.', 'Bisection on [0, 1]: 60 halvings, keep lo where H > 0 and hi where H ≤ 0, return the midpoint.', 'Return 0.5·(lo + hi); precession(N) then multiplies by h.'],
      teach: 'An event between steps — a periapsis, a horizon crossing, burnout — is located by interpolating with the derivative the ODE already gives, at the integrator’s own order.',
      explain: t`With the cubic locator the errors are $${tex(E9[0], 2)}$ and $${tex(E9[1], 2)}$ rad at $N = 100$ and $200$: order $${Math.log2(E9[0] / E9[1]).toFixed(2)}$, and the advance is $${O9.exact.toFixed(6)}$ rad (exact, from $K(m)$). Returning the fixed 0.5 (the starter) gives an $O(h)$ error instead.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-planet', difficulty: 2, transfer: true,
      gen(r) {
        const name = r.pick(['Mercury', 'Venus', 'Earth']), N = r.pick([100, 200, 400]), Pl = PLANETS[name];
        const Ob = orbitOf(Pl.a * (1 - Pl.e), Pl.a * (1 + Pl.e), MM);
        const gr = +perCentury(precession(Ob.rp, Ob.ra, N, { M: MM }).adv, Pl.P).toFixed(4), nw = +perCentury(precession(Ob.rp, Ob.ra, N, { M: MM, newton: true }).adv, Pl.P).toFixed(4);
        const ans = gr - nw;
        return {
          prompt: t`A student runs the orbit equation for ${name} with RK4 at $N = ${N}$ steps per orbit, once with the $3Mu^2$ term and once without, the same way. The runs give $${gr.toFixed(4)}''$ and $${nw.toFixed(4)}''$ of perihelion advance per century. What is general relativity’s contribution, in arcseconds per century?`,
          visual: {
            type: 'graph',
            params: { x: [-1.6, 1.6], y: [-1.15, 1.15], equal: true, aspect: 'wide', axesAt: 'edge', xlabel: '', ylabel: '', xticks: 0, yticks: 0,
              curves: [{ polar: `${n12(1 - Pl.e * Pl.e)}/(1 + ${Pl.e}*cos(theta))`, theta: [0, 2 * Math.PI], color: 'accent', width: 2 }],
              points: [{ x: 0, y: 0, r: 6, color: 'gold', label: 'Sun' }, { x: n12(1 - Pl.e), y: 0, r: 4, color: 'accent', label: 'perihelion' }] },
            caption: `${name}’s orbit to scale (eccentricity ${Pl.e}), in units of its semi-major axis.`,
          },
          answer: ans, units: 'arcsec', tol: { rel: 0.003 },
          errors: [{ value: gr, feedback: 'The GR run includes RK4’s own numerical precession; the Newtonian run measures exactly that. Subtract it.' }, { value: gr + nw, feedback: 'Subtract the Newtonian run: its precession is numerical error that the GR run carries too.' }].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: ['Newtonian gravity gives no perihelion advance for a lone planet. What is the Newtonian run measuring?', 'Both runs share the same numerical precession; take the difference.'],
          teach: 'Differencing against a run without the physical effect, at the same step, cancels the numerical error the two share.',
          explain: t`$${gr.toFixed(4)} - ${nw.toFixed(4)} = ${ans.toFixed(3)}''$ per century; the exact value is $${perCentury(Ob.exact, Pl.P).toFixed(3)}''$. ${name === 'Mercury' ? 'It is the 43″ per century that Newtonian gravity could not explain.' : `${name}’s is far harder to observe: its orbit is nearly circular, so its perihelion is poorly defined.`}`,
        };
      },
    }),
    num({
      id: 'cp-error-estimate', difficulty: 3,
      gen(r) {
        const rp = r.pick([8, 10, 12]), ra = r.pick([20, 30, 40]), N = r.pick([50, 80, 100]);
        const Ob = orbitOf(rp, ra);
        const a = +precession(rp, ra, N).adv.toFixed(10), b = +precession(rp, ra, 2 * N).adv.toFixed(10), ans = (a - b) / 15;
        return {
          prompt: t`RK4 with a Hermite periapsis locator gives a precession of $${a.toFixed(10)}$ rad per orbit for $(r_p, r_a) = (${rp}, ${ra})M$ at $N = ${N}$ steps per orbit, and $${b.toFixed(10)}$ rad at $N = ${2 * N}$. Assuming fourth order, by how much does the finer run still exceed the true value?`,
          visual: { type: 'graph', params: { x: [-1.1 * ra, 1.1 * ra], y: [-1.1 * ra, 1.1 * ra], equal: true, aspect: 'wide', axesAt: 'edge', xlabel: 'x (M)', ylabel: 'y (M)', points: [...orbitPts(rp, ra, 2), { x: 0, y: 0, r: 5, color: 'void' }] }, caption: `Two radial periods of the orbit; the periapsis advances by about ${Math.round((Ob.exact * 180) / Math.PI)}° each time.` },
          answer: ans, units: 'rad', tol: { rel: 0.02 },
          errors: [{ value: a - b, feedback: 'The difference overestimates the error: the remaining error is the difference divided by 2⁴ − 1 = 15.' }, { value: (a - b) / 3, feedback: 'For fourth order divide by 2⁴ − 1 = 15, not 2² − 1.' }],
          hints: [t`$A_{h/2} - A \approx (A_h - A_{h/2})/(2^p - 1)$ ([F13.2](#/lesson/st-f.F13.2)).`, t`$(${a.toFixed(10)} - ${b.toFixed(10)})/15$.`],
          teach: 'Two runs of verified order give an error estimate for the better one — and Richardson’s extrapolated value.',
          explain: t`$(${tex(a - b, 4)})/15 = ${tex(ans, 3)}$ rad. Subtracting it gives $${(b - ans).toFixed(10)}$; the exact elliptic value is $${Ob.exact.toFixed(10)}$, so the extrapolated value is off by only $${tex(Math.abs(b - ans - Ob.exact), 1)}$ rad.`,
        };
      },
    }),
    mcq({
      id: 'cp-bug', difficulty: 3,
      prompt: t`A homemade RK4 measures the $(10, 25)M$ precession at a clean order 2 — every halving of the step cuts the error fourfold — even though the periapsis locator is a correct cubic. Which bug fits?`,
      visual: {
        type: 'graph',
        params: { x: [-2.4, -0.7], y: [-13, -1.5], xlog: true, ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'step dφ (rad)', ylabel: '|error in Δφ| (rad)',
          points: [...BUG.map((e, i) => ({ x: n12(lg(hOf(NS[i]))), y: n12(lg(Math.abs(e))), r: 4.5, color: 'bad' })), ...errPts(CODES[0], { r: 3.5 })],
          legend: [{ label: 'homemade RK4', color: 'bad', point: true }, { label: 'correct RK4', color: 'accent', point: true }], legendAt: 'br' },
        caption: 'Errors in the precession per orbit, log–log.',
      },
      choices: [
        t`The third stage is built from $k_1$ instead of $k_2$ — the method is no longer RK4`,
        t`The stages are evaluated at the wrong values of $\varphi$`,
        'The step is too large for RK4 to be stable',
        'Double precision is not enough to resolve the precession',
      ],
      answer: 0,
      why: {
        1: 'The orbit equation does not contain φ explicitly, so stage “times” cannot matter here (F13.1’s bug needs a forced equation).',
        2: 'An unstable method would blow up, not converge cleanly at slope 2.',
        3: 'Round-off would set a floor near 10⁻¹⁴, not a slope.',
      },
      hints: ['Which of these bugs can change the order on an autonomous equation u″ = g(u)?', 'Write out the stages with k₃ = g(u + h/2·k₁): what does the method become?'],
      teach: 'An order test identifies the class of a bug: a wrong stage changes the order on any problem; a wrong stage time only on a forced one.',
      explain: t`With $k_3$ built from $k_1$, $k_3 = k_2$, and the update $(k_1 + 4k_2 + k_4)/6$ is a different, second-order method. The measured orders are $${BUG.slice(1).map((e, i) => Math.log2(Math.abs(BUG[i] / e)).toFixed(2)).join(',\\ ')}$. Wrong stage times would do nothing here — the orbit equation is autonomous — which is exactly why a test suite needs a forced problem as well.`,
    }),
  ],
  sources: [
    { label: 'Will (2014), The confrontation between general relativity and experiment, Living Rev. Relativ. 17, 4', url: 'https://doi.org/10.12942/lrr-2014-4' },
    { label: 'Chandrasekhar, The Mathematical Theory of Black Holes (Oxford 1983), §19: bound geodesics and elliptic integrals', url: 'https://global.oup.com/academic/product/the-mathematical-theory-of-black-holes-9780198503705' },
    { label: 'Hairer, Lubich & Wanner, Geometric Numerical Integration, 2nd ed. (Springer 2006), ch. I: the Kepler problem and integrator errors', url: 'https://doi.org/10.1007/3-540-30666-8' },
  ],
});
