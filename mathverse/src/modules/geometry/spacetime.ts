// Curved spacetime, honestly: Flamm's paraboloid (the exact embedding of the
// spatial geometry of a Schwarzschild slice — the extra dimension is
// fictitious, and planets do not follow its geodesics) versus the rubber-sheet
// cartoon; and the actual Lorentzian geometry of the (t, r) plane: light cones
// in Schwarzschild, Eddington–Finkelstein and Kruskal coordinates.

import type { DemoDef, DemoCtx, DemoInstance, Readout } from '../types';
import { parse } from '../../core/expr';
import { metricFromExprs, geodesicRhs, quadForm, odeSolve, traceGeodesic, flammZ, properRadialDistance, V3 } from '../../core/numeric/geometry';
import { SERIES } from '../../engine/colors';
import { fmt, COLORS, adhocSurface, SurfaceMesh, deg } from './lib';

type View = NonNullable<DemoCtx['view3d']>;
type Curve = ReturnType<View['addCurve']>;
type Pt = ReturnType<View['addPoint']>;
type P2 = [number, number];

// ═══ Embedding diagrams: Flamm's paraboloid vs the rubber sheet ══════════════
const equatorial = metricFromExprs([['-(1 - 2 m/r)', '0', '0'], ['0', '1/(1 - 2 m/r)', '0'], ['0', '0', 'r^2']].map((r) => r.map((e) => parse(e, { names: ['phi'] }))), ['t', 'r', 'phi'], { m: 1 });

const flammDemo: DemoDef = {
  id: 'geometry.flamm', module: 'geometry', title: "Embedding diagrams: Flamm's paraboloid",
  topic: 'Introductory general relativity · embedding diagrams · spatial vs spacetime curvature · orbits',
  summary: 'The space around a black hole, at one instant, has the geometry of Flamm’s paraboloid: radial distances are longer than Δr. This is an exact picture of *space* — the height is fictitious and time is missing — so orbits are not its geodesics. The rubber sheet is a cartoon of the Newtonian potential, not of geometry.',
  tex: 'dl^2 = \\frac{dr^2}{1 - r_s/r} + r^2\\,d\\phi^2 \\;=\\; dr^2 + dz^2 + r^2 d\\phi^2 \\ \\text{on}\\ z = 2\\sqrt{r_s(r - r_s)}',
  view: '3d',
  params: [
    { key: 'r1', label: 'marked radius r (units of M)', value: 5, min: 2.05, max: 20, step: 0.01 },
    { key: 'r0', label: 'orbit: start radius (periapsis or apoapsis)', value: 10, min: 4, max: 20, step: 0.01 },
    { key: 'L', label: 'orbit: angular momentum L/M', value: 3.9, min: 2, max: 6, step: 0.005 },
    { key: 'turns', label: 'orbit: proper time (orbits)', value: 3, min: 0.5, max: 10, step: 0.05 },
  ],
  choices: [{ key: 'picture', label: 'Picture', value: 'flamm', options: [['flamm', "Flamm's paraboloid — exact spatial geometry"], ['rubber', 'Rubber sheet — a cartoon of the Newtonian potential']] }],
  toggles: [{ key: 'orbit', label: 'A real orbit (timelike geodesic of spacetime)', value: true }, { key: 'spatial', label: 'A geodesic of the curved space (same start)', value: true }, { key: 'rings', label: 'Rings every 1 M in r', value: true }],
  experiments: [
    'Read the proper radial distance between r and r + 1M: always more than 1M, enormously more near r_s = 2M. That stretching is what the paraboloid’s slope shows.',
    'Compare the gold orbit (a real planet) with the cyan curve (a geodesic of the curved *space*, launched the same way): the planet circles, the spatial geodesic escapes. Gravity in GR comes mostly from the curvature of *time* (g_tt), which the paraboloid does not show.',
    'Lower L: the orbit precesses more and finally plunges (no stable orbits below r = 6M).',
    'Switch to the rubber sheet: same funnel look, different meaning. Its depth is −M/r — a potential, drawn using gravity to explain gravity.',
  ],
  connections: ['geometry.lightcones', 'geometry.riemann', 'geometry.geodesics', 'geometry.deviation'],
  accuracy: 'The paraboloid and proper distances are exact formulas. The orbit is a numerical solution (adaptive Dormand–Prince, rtol 1e−10) of the geodesic equation of the Schwarzschild metric restricted to the equatorial plane, with Christoffel symbols from exact symbolic derivatives; g(u, u) = −1 is monitored. The cyan curve is an RK4 geodesic of the paraboloid. Units: G = c = M = 1.',
  create: (ctx) => createFlamm(ctx),
};

function createFlamm(ctx: DemoCtx): DemoInstance {
  const v = ctx.view3d!;
  const mesh = new SurfaceMesh(v);
  const rs = 2, R = 22;
  let orbit: Curve | null = null, spatial: Curve | null = null, mark: Curve | null = null, hz: Curve | null = null, star: Pt | null = null;
  const rings: Curve[] = [];
  let pic = '';
  const update = () => {
    const flamm = ctx.choices.picture !== 'rubber';
    const zf = flamm ? (r: number) => flammZ(rs, r) : (r: number) => Math.max(-14, -12 / r) + 6;
    if (pic !== ctx.choices.picture) {
      pic = ctx.choices.picture;
      const b = flamm
        ? adhocSurface('flamm', 'Flamm', '(u cos(v), u sin(v), 2 sqrt(b (u - b)))', { b: rs }, [rs * 1.0002, R], [-Math.PI, Math.PI], { periodicV: true })
        : adhocSurface('rubber', 'rubber sheet', '(u cos(v), u sin(v), 6 - 12/u)', {}, [0.86, R], [-Math.PI, Math.PI], { periodicV: true });
      mesh.reset();
      mesh.set(b, 'checker', { res: 90, fit: false });
      v.setBounds({ x: [-R, R], y: [-R, R], z: [-4, 18] });
      v.resetCamera();
      rings.splice(0).forEach((h) => h.dispose());
      for (let r = 3; r <= 20; r += 1) rings.push(v.addCurve(Array.from({ length: 121 }, (_, i) => [r * Math.cos((2 * Math.PI * i) / 120), r * Math.sin((2 * Math.PI * i) / 120), zf(r) + 0.05] as V3), { color: '#c9cfdb', radius: 0 }));
      hz?.dispose(); hz = flamm ? v.addCurve(Array.from({ length: 121 }, (_, i) => [rs * Math.cos((2 * Math.PI * i) / 120), rs * Math.sin((2 * Math.PI * i) / 120), 0.05] as V3), { color: SERIES[2], radius: 0.12 }) : null;
      star?.dispose(); star = flamm ? null : v.addPoint([0, 0, -6.5], { color: '#ffd166', size: 0.8 });
    }
    rings.forEach((h) => h.visible(!!ctx.toggles.rings));
    const r1 = ctx.params.r1;
    const mk = Array.from({ length: 121 }, (_, i) => [r1 * Math.cos((2 * Math.PI * i) / 120), r1 * Math.sin((2 * Math.PI * i) / 120), zf(r1) + 0.08] as V3);
    if (!mark) mark = v.addCurve(mk, { color: COLORS.vec, radius: 0.1 }); else mark.set(mk);
    // a real orbit: timelike geodesic of Schwarzschild, equatorial, starting with ṙ = 0
    const r0 = ctx.params.r0, Lm = ctx.params.L, f0 = 1 - rs / r0, phid = Lm / (r0 * r0), td = Math.sqrt((1 + r0 * r0 * phid * phid) / f0);
    const tau = ctx.params.turns * 2 * Math.PI * Math.pow(r0, 1.5);
    const sol = odeSolve(geodesicRhs(equatorial), [0, r0, 0, td, 0, phid], 0, tau, { rtol: 1e-10, atol: 1e-12, maxStep: tau / 1500 });
    const op: V3[] = [];
    let plunged = false, norm = 0;
    for (const y of sol.y) { if (y[1] <= rs * 1.001) { plunged = true; break; } op.push([y[1] * Math.cos(y[2]), y[1] * Math.sin(y[2]), zf(y[1]) + 0.12]); norm = Math.max(norm, Math.abs(quadForm(equatorial.g(y), y.slice(3)) + 1)); }
    if (!orbit) orbit = v.addCurve(op.length > 1 ? op : [[r0, 0, 0], [r0, 0, 0]], { color: COLORS.geo, radius: 0.12 }); else orbit.set(op.length > 1 ? op : [[r0, 0, 0], [r0, 0, 0]]);
    orbit.visible(!!ctx.toggles.orbit);
    // precession: angle between successive periapses
    const rr = sol.y.map((y) => y[1]), ph = sol.y.map((y) => y[2]);
    const peri: number[] = [];
    for (let i = 1; i < rr.length - 1; i++) if (rr[i] < rr[i - 1] && rr[i] <= rr[i + 1]) peri.push(ph[i]);
    const rmin = Math.min(...rr), rmax = Math.max(...rr);
    const prec = peri.length >= 2 ? peri[1] - peri[0] - 2 * Math.PI : NaN;
    const aS = (rmin + rmax) / 2, e = (rmax - rmin) / (rmax + rmin), weak = (6 * Math.PI) / (aS * (1 - e * e));
    // a geodesic of the curved space, launched the same way (tangentially at r0)
    let sp: V3[] = [];
    if (flamm) {
      const b = adhocSurface('flamm', 'Flamm', '(u cos(v), u sin(v), 2 sqrt(b (u - b)))', { b: rs }, [rs * 1.0002, R], [-Math.PI, Math.PI], { periodicV: true });
      const g = traceGeodesic(b.charts, { chart: 0, u: r0, v: 0, du: 0, dv: 1 }, 60, { h: 0.04, maxPoints: 800 });
      sp = g.points.map((q) => [q.p[0], q.p[1], q.p[2] + 0.15] as V3);
    }
    if (!spatial) spatial = v.addCurve(sp.length > 1 ? sp : [[0, 0, 0], [0, 0, 0]], { color: COLORS.alt, radius: 0.09 }); else spatial.set(sp.length > 1 ? sp : [[0, 0, 0], [0, 0, 0]]);
    spatial.visible(flamm && !!ctx.toggles.spatial);
    const rows: Readout[] = flamm ? [
      { label: 'Schwarzschild radius r_s = 2M', value: '2' },
      { label: `proper distance from r = ${fmt(r1, 4)} to r + 1`, value: `${fmt(properRadialDistance(rs, r1, r1 + 1), 8)}  (Δr = 1)` },
      { label: `proper distance from the horizon to r = ${fmt(r1, 4)}`, value: `${fmt(properRadialDistance(rs, rs, r1), 8)}  (Δr = ${fmt(r1 - rs, 6)})` },
      { label: 'circumference of the ring', value: `2πr = ${fmt(2 * Math.PI * r1, 7)}` },
      { label: 'slope dz/dr of the paraboloid', value: fmt(Math.sqrt(rs / (r1 - rs)), 6), tone: 'muted' },
    ] : [{ label: 'rubber sheet', value: 'height ∝ −M/r: a picture of the Newtonian potential, not of any geometry', tone: 'warn' }];
    rows.push(
      { label: 'orbit: r range', value: plunged ? 'plunges into the black hole' : `${fmt(rmin, 5)} … ${fmt(rmax, 5)}`, tone: plunged ? 'bad' : undefined },
      { label: 'periapsis advance per orbit', value: Number.isFinite(prec) ? `${deg(prec)} (numerical)` : '— (fewer than two periapses)' },
      { label: 'weak-field estimate 6πM/(a(1−e²))', value: Number.isFinite(prec) ? `${deg(weak)} (approximation)` : '—', tone: 'muted' },
      { label: 'max |g(u,u) + 1| along the orbit', value: `${norm.toExponential(1)} (numerical)`, tone: norm < 1e-6 ? 'good' : 'warn' },
    );
    ctx.setReadouts(rows);
    ctx.warn(flamm ? '' : 'Cartoon: the rubber sheet uses gravity (a ball rolling down) to explain gravity. Its depth is not a distance; nothing in general relativity is shaped like this.');
    ctx.setNote(flamm
      ? `**What this picture is.** The equatorial slice $t = \\text{const}, \\theta = \\pi/2$ of Schwarzschild space has metric $dl^2 = dr^2/(1 - r_s/r) + r^2d\\phi^2$. The surface $z = 2\\sqrt{r_s(r - r_s)}$ in flat ℝ³ has exactly the same metric, so lengths measured *along the surface* are true proper distances (the rings are 1M apart in r, yet much farther apart along the surface near the throat). **What it is not.** The vertical direction is fictitious — no extra dimension exists; only the surface’s intrinsic geometry means anything. Time is missing entirely, and with it most of gravity: a planet (gold) follows a geodesic of 4-dimensional *spacetime*, not of this surface (cyan). See *Light cones* for the Lorentzian geometry.`
      : 'The familiar “heavy ball on a trampoline” picture: a sheet sagging into the shape of the Newtonian potential −M/r. It conveys “things roll toward masses”, but it explains gravity with gravity, its height is not a distance, and it shows neither spatial curvature (Flamm) nor the curvature of time that actually drives orbits.');
  };
  return { update, dispose() { v.clear(); } };
}

// ═══ Light cones in Schwarzschild spacetime ══════════════════════════════════
const M = 1;
const rstar = (r: number) => r + 2 * M * Math.log(Math.abs(r / (2 * M) - 1));
/** (r, t̃) in ingoing Eddington–Finkelstein → Kruskal (X, T) */
function toKruskal(r: number, tt: number): P2 | null {
  const t = tt - 2 * M * Math.log(Math.abs(r / (2 * M) - 1));
  if (!Number.isFinite(t)) return null;
  const s = Math.sqrt(Math.abs(r / (2 * M) - 1)) * Math.exp(r / (4 * M));
  return r > 2 * M ? [s * Math.cosh(t / (4 * M)), s * Math.sinh(t / (4 * M))] : [s * Math.sinh(t / (4 * M)), s * Math.cosh(t / (4 * M))];
}
/** solve (1 − r/2M) e^{r/2M} = T² − X² for r (monotone decreasing in r) */
function rFromKruskal(X: number, T: number): number {
  const w = T * T - X * X;
  if (w >= 1) return 0;
  let lo = 0, hi = 60;
  for (let i = 0; i < 100; i++) { const m = (lo + hi) / 2; if ((1 - m / (2 * M)) * Math.exp(m / (2 * M)) > w) lo = m; else hi = m; }
  return (lo + hi) / 2;
}

const lightconesDemo: DemoDef = {
  id: 'geometry.lightcones', module: 'geometry', title: 'Light cones in curved spacetime',
  topic: 'Lorentzian geometry · light cones · Schwarzschild, Eddington–Finkelstein and Kruskal coordinates · event horizons',
  summary: 'This is the real thing: the geometry of time and radius around a black hole, with no embedding and no fictitious dimension. At every event the light cone bounds where anything can go next. Near the horizon the cones tip inward; inside, every future direction points to r = 0.',
  tex: 'ds^2 = -\\Big(1 - \\frac{2M}{r}\\Big)d\\tilde t^{\\,2} + \\frac{4M}{r}\\,d\\tilde t\\,dr + \\Big(1 + \\frac{2M}{r}\\Big)dr^2 + r^2 d\\Omega^2\\qquad (\\tilde t = v - r)',
  view: 'split3d',
  params: [
    { key: 'er', label: 'event: r (units of M) — drag it', value: 3.2, min: 0.05, max: 10, step: 0.005 },
    { key: 'et', label: 'event: time coordinate t̃', value: 1, min: -6, max: 10, step: 0.005 },
  ],
  choices: [{ key: 'coords', label: 'Coordinates', value: 'ef', options: [['mink', 'Flat spacetime (M = 0), for comparison'], ['schw', 'Schwarzschild (t, r)'], ['ef', 'Ingoing Eddington–Finkelstein (t̃, r)'], ['kruskal', 'Kruskal–Szekeres (X, T)']] }],
  toggles: [{ key: 'rays', label: 'Light rays from the event', value: true }, { key: 'grid', label: 'Light cones across the diagram', value: true }],
  experiments: [
    'Flat spacetime: every cone is the same 45° wedge. Anything you do next stays inside it.',
    'Schwarzschild coordinates: the cones pinch shut at r = 2M, as if light froze there. That is a coordinate failure — like longitude at the North Pole.',
    'Eddington–Finkelstein: the same spacetime in coordinates that cross the horizon smoothly. The cones tip inward; at r = 2M the outgoing edge is vertical: light aimed outward hovers.',
    'Drag the event inside r = 2M: both edges of the cone point to smaller r. The singularity is not a place you can avoid but a moment in your future.',
    'Kruskal: cones are 45° everywhere; the horizon is a diagonal line and r = 0 is the hyperbola T² − X² = 1 — spacelike, like “tomorrow”.',
  ],
  connections: ['geometry.flamm', 'geometry.riemann', 'geometry.deviation', 'geometry.charts'],
  accuracy: 'Exact: the null directions solve g(k, k) = 0 in closed form in each coordinate system, the radial light rays are the exact solutions (ingoing t̃ + r = const; outgoing t̃ = r + 4M ln|r/2M − 1| + const), and the 3D cones are built from an orthonormal frame of the exact metric. Units G = c = M = 1.',
  tutorial: [
    { text: '**Spacetime has light cones.** In relativity the geometry is Lorentzian: ds² = −dt² + dx² + … Light travels along ds² = 0, so at every event the light rays form a cone. Your possible futures — every worldline you could follow — lie inside it. In flat spacetime all the cones are the same 45° wedge.', task: 'Drag the event around the flat diagram.', set: { choices: { coords: 'mink' }, params: { er: 3.2, et: 1 }, toggles: { rays: true, grid: true } }, done: (c) => Math.abs(c.params.er - 3.2) > 0.3 || Math.abs(c.params.et - 1) > 0.3 },
    { text: '**A black hole, in Schwarzschild coordinates.** Outside a mass M, ds² = −(1 − 2M/r)dt² + dr²/(1 − 2M/r) + r²dΩ². Plot t against r: the cones narrow toward r = 2M and seem to close. Light “takes forever” to reach the horizon in this time coordinate — but that is the chart failing, not the geometry (curvature is finite there: see *Riemann*).', task: 'Switch to Schwarzschild coordinates and move the event toward r = 2M.', set: { choices: { coords: 'schw' }, params: { er: 5, et: 1 } }, done: (c) => c.choices.coords === 'schw' && c.params.er < 2.6 },
    { text: '**Better coordinates.** Eddington–Finkelstein time t̃ = v − r (with v constant along ingoing light) covers the horizon smoothly. Ingoing light now moves at 45°; outgoing light tilts more and more steeply as r → 2M, and the whole cone tips toward the hole.', task: 'Choose Eddington–Finkelstein and drag the event onto the horizon (r ≈ 2).', set: { choices: { coords: 'ef' }, params: { er: 5, et: 1 } }, done: (c) => c.choices.coords === 'ef' && Math.abs(c.params.er - 2) < 0.08 },
    { text: '**Inside the horizon.** For r < 2M both edges of the cone point toward smaller r. Moving “outward” would mean moving faster than light. r = 0 is in every future: it is a time, not a place.\n\nThe longest proper time from the horizon to r = 0 is πM — 15 microseconds for a solar-mass black hole, 6 hours for the one in M87.', task: 'Drag the event inside the horizon (r < 2).', set: { choices: { coords: 'ef' } }, done: (c) => c.params.er < 1.95 },
    { text: '**Kruskal–Szekeres coordinates** straighten everything: light moves at 45° everywhere. The horizon is the diagonal line T = X; the singularity r = 0 is the hyperbola T² − X² = 1, spacelike — a final moment.', task: 'Switch to Kruskal coordinates.', set: { choices: { coords: 'kruskal' } }, done: (c) => c.choices.coords === 'kruskal' },
    { text: '**Two different pictures, both honest.** *Flamm’s paraboloid* (an embedding diagram) shows the shape of space at one instant; its height is fictitious and it has no time in it. *These light cones* are the actual Lorentzian geometry of the t–r plane — no embedding, no extra dimension (each point stands for a sphere of area 4πr²). The 3D view on the right shows cones on the equatorial plane in Eddington–Finkelstein coordinates: rotate it to see them lean toward the hole.', task: 'Open the embedding diagram afterwards: *Embedding diagrams: Flamm’s paraboloid*.' },
  ],
  create: (ctx) => createLightcones(ctx),
};

function createLightcones(ctx: DemoCtx): DemoInstance {
  const v = ctx.view3d!, plot = ctx.plot!;
  let built = false;
  const build3d = () => {
    built = true;
    v.setBounds({ x: [-6, 6], y: [-6, 6], z: [0, 7] });
    v.resetCamera();
    // the horizon r = 2M as a cylinder over t̃ ∈ [0, 7], and the singularity r = 0
    v.addSurface((a, z) => [2 * Math.cos(a), 2 * Math.sin(a), z], { uRange: [0, 2 * Math.PI], vRange: [0, 7], res: 40, colorBy: 'uniform', color: '#ef6b73', opacity: 0.18 });
    v.addCurve([[0, 0, 0], [0, 0, 7]], { color: '#ef6b73', radius: 0.06 });
    v.addLabel([2.1, 0, 7.2], 'horizon r = 2M', 'v3-label');
    // future light cones of events on the plane t̃ = 1 at several radii, in an orthonormal frame of the EF metric
    for (const r of [0.8, 1.4, 2, 3, 4.2, 5.5]) for (const ph of [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2]) {
      const f = 1 - 2 / r, gtt = -f, gtr = 2 / r, grr = 1 + 2 / r;
      // a timelike vector u = ∂_t̃ − k ∂_r (k chosen inside the allowed interval), Gram–Schmidt with ∂_r and ∂_φ
      const kmin = (2 / r - 1) / (2 / r + 1), k = (kmin + 1) / 2;
      const guu = gtt - 2 * k * gtr + k * k * grr, nu = Math.sqrt(-guu);
      const e0 = [1 / nu, -k / nu];                                   // (t̃, r) components
      const gr0 = gtr * e0[0] + grr * e0[1];                          // g(∂_r, e0)
      const e1raw = [0 + gr0 * e0[0], 1 + gr0 * e0[1]];               // ∂_r + g(∂_r, e0) e0 (signature −)
      const n1 = Math.sqrt(gtt * e1raw[0] ** 2 + 2 * gtr * e1raw[0] * e1raw[1] + grr * e1raw[1] ** 2);
      const e1 = [e1raw[0] / n1, e1raw[1] / n1];
      const h = 0.9;
      const surf = (s: number, a: number): V3 => {
        // null vector e0 + cos a e1 + sin a e2 (e2 = ∂_φ / r), scaled to Δt̃ = h·s
        const dt = e0[0] + Math.cos(a) * e1[0], dr = e0[1] + Math.cos(a) * e1[1], dphi = Math.sin(a) / r;
        const sc = (h * s) / dt;
        const rr = r + dr * sc, pp = ph + dphi * sc;
        return [rr * Math.cos(pp), rr * Math.sin(pp), 1 + dt * sc];
      };
      v.addSurface(surf, { uRange: [0, 1], vRange: [0, 2 * Math.PI], res: 18, colorBy: 'uniform', color: r < 2 ? '#ff9f5a' : r === 2 ? '#f2c14e' : '#6aa9ff', opacity: 0.75 });
    }
  };
  const update = () => {
    if (!built) build3d();
    const cs = ctx.choices.coords ?? 'ef';
    const er = ctx.params.er, et = ctx.params.et;
    const ink = ctx.dark ? '#c9cfdb' : '#2a3040';
    plot.opts.equal = true;
    // null directions (Δr, Δtime) with Δtime > 0 at radius r, in the chosen coordinates
    const edges = (r: number): [P2, P2] | null => {
      if (cs === 'mink') return [[-1, 1], [1, 1]];
      if (cs === 'ef') {
        const k = (1 + 2 / r) / (1 - 2 / r);
        const out: P2 = Math.abs(r - 2) < 1e-9 ? [0, 1] : k > 0 ? [1, k] : [-1, -k];
        return [[-1, 1], out];
      }
      if (cs === 'schw') {
        const f = 1 - 2 / r;
        if (Math.abs(f) < 1e-9) return null;
        return f > 0 ? [[-1, 1 / f], [1, 1 / f]] : [[-1, 1 / -f], [-1, -1 / -f]];
      }
      return null;
    };
    const norm = (p: P2): P2 => { const l = Math.hypot(p[0], p[1]); return [p[0] / l, p[1] / l]; };
    let view: { x0: number; x1: number; y0: number; y1: number }, xl: string, yl: string;
    if (cs === 'kruskal') { view = { x0: -2.6, x1: 2.6, y0: -1.4, y1: 2.4 }; xl = 'X'; yl = 'T'; }
    else { view = { x0: 0, x1: 10, y0: -4, y1: 8 }; xl = 'r'; yl = cs === 'schw' ? 't' : cs === 'mink' ? 't' : 't̃'; }
    plot.setView(view);
    plot.opts.xLabel = xl; plot.opts.yLabel = yl;
    // the event in plot coordinates
    const ev: P2 | null = cs === 'kruskal' ? toKruskal(er, et) : [er, et];
    plot.setDraw((G) => {
      const h = 0.38;
      if (cs !== 'mink' && cs !== 'kruskal') { G.fillBetween(() => view.y1, () => view.y0, 0, 2, { fill: 'rgba(239,107,115,0.10)' }); G.line([2, view.y0], [2, view.y1], { color: SERIES[2], width: 2 }); G.text([2, view.y1], ' r = 2M (horizon)', { color: SERIES[2], baseline: 'top' }, 4, 4); G.line([0, view.y0], [0, view.y1], { color: SERIES[2], width: 3 }); G.text([0, view.y0], ' r = 0', { color: SERIES[2], baseline: 'bottom' }, 4, -4); }
      if (cs === 'kruskal') {
        G.parametric((s) => Math.sinh(s), (s) => Math.cosh(s), -1.6, 1.6, { color: SERIES[2], width: 3 });
        G.parametric((s) => Math.sinh(s), (s) => -Math.cosh(s), -1.6, 1.6, { color: SERIES[2], width: 3 });
        G.line([-3, -3], [3, 3], { color: SERIES[2], width: 1.6 }); G.line([-3, 3], [3, -3], { color: SERIES[2], width: 1.6 });
        G.text([0.95, 1.4], 'r = 0 (singularity)', { color: SERIES[2] });
        G.text([1.6, 1.5], 'horizon', { color: SERIES[2] });
        for (const r of [1, 1.5, 2.5, 3, 4, 6]) {
          const w = (1 - r / 2) * Math.exp(r / 2);
          if (w > 0) G.parametric((s) => Math.sqrt(w) * Math.sinh(s), (s) => Math.sqrt(w) * Math.cosh(s), -1.5, 1.5, { color: ink, width: 0.8, alpha: 0.35 });
          else G.parametric((s) => Math.sqrt(-w) * Math.cosh(s), (s) => Math.sqrt(-w) * Math.sinh(s), -1.5, 1.5, { color: ink, width: 0.8, alpha: 0.35 });
        }
        if (ctx.toggles.grid) for (let i = -5; i <= 5; i++) for (let j = -3; j <= 5; j++) {
          const p: P2 = [i * 0.45, j * 0.45];
          if (p[1] * p[1] - p[0] * p[0] >= 1) continue;
          G.polygon([p, [p[0] - 0.14, p[1] + 0.14], [p[0] + 0.14, p[1] + 0.14]], { fill: 'rgba(106,169,255,0.28)', color: 'rgba(106,169,255,0.7)', width: 1 });
        }
      } else if (ctx.toggles.grid) {
        for (let r = 0.5; r < 10; r += 0.9) for (let t = -3.5; t < 8; t += 1.2) {
          const e = edges(r);
          if (!e) continue;
          const a = norm(e[0]), b = norm(e[1]);
          const col = cs === 'mink' || r > 2 ? '106,169,255' : '255,159,90';
          G.polygon([[r, t], [r + a[0] * h, t + a[1] * h], [r + b[0] * h, t + b[1] * h]], { fill: `rgba(${col},0.28)`, color: `rgba(${col},0.75)`, width: 1 });
        }
      }
      // light rays from the event (exact)
      if (ctx.toggles.rays && ev) {
        const ray = (pts: P2[], col: string) => G.path(pts.filter((p) => p.every(Number.isFinite)), { color: col, width: 2.4 });
        if (cs === 'mink') { ray([[er, et], [Math.max(0, er - 20), et + Math.min(20, er)]], COLORS.geo); ray([[er, et], [er + 20, et + 20]], COLORS.geo); }
        else if (cs === 'ef') {
          ray([[er, et], [0, et + er]], COLORS.geo);
          const C = et - er - 4 * Math.log(Math.abs(er / 2 - 1));
          const out: P2[] = [];
          if (er > 2) for (let i = 0; i <= 200; i++) { const r = er + (12 * i) / 200; out.push([r, C + r + 4 * Math.log(r / 2 - 1)]); }
          else if (er < 2) for (let i = 0; i <= 200; i++) { const r = er * (1 - i / 200); out.push([r, C + r + 4 * Math.log(Math.abs(r / 2 - 1))]); }
          else out.push([2, et], [2, et + 20]);
          ray(out, COLORS.vec);
        } else if (cs === 'schw') {
          const C1 = et + rstar(er), C2 = et - rstar(er);
          const inn: P2[] = [], out: P2[] = [];
          if (er > 2) { for (let i = 0; i <= 200; i++) { const r = 2 + (er - 2) * Math.pow(1 - i / 200, 2) + 1e-6; inn.push([r, C1 - rstar(r)]); } for (let i = 0; i <= 200; i++) { const r = er + (12 * i) / 200; out.push([r, C2 + rstar(r)]); } }
          else { for (let i = 0; i <= 200; i++) { const r = er * (1 - i / 200); inn.push([r, C1 - rstar(r)]); out.push([r, C2 + rstar(r)]); } }
          ray(inn, COLORS.geo); ray(out, COLORS.vec);
        } else {
          ray([ev, [ev[0] - 4, ev[1] + 4]], COLORS.geo); ray([ev, [ev[0] + 4, ev[1] + 4]], COLORS.vec);
        }
      }
      if (ev) {
        const e = cs === 'kruskal' ? ([[-1, 1], [1, 1]] as [P2, P2]) : edges(er);
        if (e) { const a = norm(e[0]), b = norm(e[1]); G.polygon([ev, [ev[0] + a[0] * 0.7, ev[1] + a[1] * 0.7], [ev[0] + b[0] * 0.7, ev[1] + b[1] * 0.7]], { fill: 'rgba(242,193,78,0.45)', color: COLORS.geo, width: 1.6 }); }
        G.handle({ id: 'ev', at: ev, color: '#ffffff', label: 'event', onDrag: (p) => {
          if (cs === 'kruskal') {
            if (p[1] * p[1] - p[0] * p[0] >= 0.999 || p[1] < -p[0] - 1e-9 && p[1] < p[0]) return;   // regions I and II only
            const r = rFromKruskal(p[0], p[1]);
            const t = r > 2 ? 4 * Math.atanh(Math.max(-0.999999, Math.min(0.999999, p[1] / p[0]))) : 4 * Math.atanh(Math.max(-0.999999, Math.min(0.999999, p[0] / p[1])));
            ctx.setParam('er', Math.max(0.05, Math.min(10, r))); ctx.setParam('et', Math.max(-6, Math.min(10, t + 2 * Math.log(Math.abs(r / 2 - 1)))));
          } else { ctx.setParam('er', Math.max(0.05, Math.min(10, p[0]))); ctx.setParam('et', Math.max(-6, Math.min(10, p[1]))); }
          update();
        } });
      }
    });
    const inside = er < 2, kOut = (1 + 2 / er) / (1 - 2 / er);
    const tauMax = inside ? 2 * (Math.asin(Math.sqrt(er / 2)) - Math.sqrt((er / 2) * (1 - er / 2))) : NaN;
    const rows: Readout[] = [
      { label: 'event', value: `r = ${fmt(er, 5)} M,  t̃ = ${fmt(et, 5)} M` },
      { label: 'region', value: cs === 'mink' ? 'flat spacetime (no mass)' : inside ? 'inside the horizon (r < 2M)' : Math.abs(er - 2) < 0.02 ? 'on the horizon' : 'outside the horizon', tone: cs === 'mink' ? 'muted' : inside ? 'bad' : 'good' },
      { label: 'ingoing light (EF): dt̃/dr', value: '−1' },
      { label: 'outgoing light (EF): dt̃/dr = (1 + 2M/r)/(1 − 2M/r)', value: `${fmt(kOut, 6)}  ${inside ? '(< 0: “outgoing” light also falls in)' : ''}` },
      { label: 'can a signal from here reach far away?', value: cs === 'mink' || er > 2 ? 'yes' : 'no — every future-directed path reaches r = 0', tone: cs === 'mink' || er > 2 ? 'good' : 'bad' },
    ];
    if (inside && cs !== 'mink') rows.push({ label: 'longest proper time to r = 0', value: `${fmt(tauMax, 6)} M  (= ${fmt(tauMax * 4.925e-6 * 1e6, 4)} μs per solar mass)` });
    rows.push({ label: 'what is drawn', value: 'two of the four dimensions (t, r); each point is a sphere of area 4πr²', tone: 'muted' });
    ctx.setReadouts(rows);
    ctx.warn(cs === 'schw' && Math.abs(er - 2) < 0.05 ? 'At r = 2M the Schwarzschild coordinates fail (g_tt = 0, g_rr = ∞): a coordinate singularity, like longitude at a pole. Switch to Eddington–Finkelstein or Kruskal.' : '');
    ctx.setNote(`**This is Lorentzian geometry, not an embedding.** Every number here comes from $ds^2 = 0$ for the Schwarzschild metric written in ${cs === 'ef' ? 'ingoing Eddington–Finkelstein coordinates' : cs === 'schw' ? 'Schwarzschild coordinates' : cs === 'kruskal' ? 'Kruskal–Szekeres coordinates' : 'flat Minkowski coordinates'}. A cone holds all directions with $ds^2 \\le 0$ toward the future — the only directions a massive body can move. Unlike Flamm’s paraboloid (space only, with a fictitious extra dimension) and the rubber sheet (a cartoon), nothing here is added: the cones *are* the causal structure. Gold: ingoing light; orange: “outgoing” light.`);
  };
  return { update, dispose() { v.clear(); } };
}

export const spacetimeDemos: DemoDef[] = [flammDemo, lightconesDemo];
