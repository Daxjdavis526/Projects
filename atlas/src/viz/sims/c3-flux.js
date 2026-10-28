// Flux through a surface in space, and the theorems that trade it for
// something else. A parametrized surface (u, v) ↦ r(u, v) sits in a vector
// field F. Gold arrows show the field at points of the surface; each patch of
// the surface is tinted by the flux integrand F · n̂ — blue where the field
// crosses along the chosen normal, red where it crosses against it, grey
// where it only skims along. The readout integrates F · dS = F · (r_u × r_v)
// du dv numerically. Options: one small patch at (u₀, v₀) with the edge
// vectors r_u Δu and r_v Δv, its parallelogram and its normal (surface area);
// a flip of the orientation; the flux of the curl instead of F, with the
// surface's edge and the circulation round it (Stokes); a closed surface with
// the integral of the divergence over the solid inside (the divergence
// theorem). Several surfaces → a choice, and `ghosts` draws the others
// faintly — the "butterfly nets" that share one edge.
//
//   { type: 'c3-flux', params: {
//       F: ['x', 'y', 'z'],                 // the field: expressions of x, y, z and slider keys (omit for a bare surface)
//       divF: null, curlF: null,            // optional exact div F (an expression) and curl F ([..3]); else numerical
//       surfaces: [{ label: 'Hemisphere',   // a label for the choice (plain text)
//         x: 'sin(u)*cos(v)', y: 'sin(u)*sin(v)', z: 'cos(u)', u: [0, 'pi/2'], v: [0, '2*pi'],
//         pieces: null,                     // or [{ x, y, z, u, v }, …]: one surface in several pieces (a closed box)
//         boundary: { x: 'cos(t)', y: 'sin(t)', z: '0', t: [0, '2*pi'] },   // its edge, walked by the right-hand rule
//         volume: { kind: 'ball', c: [0, 0, 0], r: 1 } }, …],              // or box { x, y, z } | cylinder { c: [x, y], r, z }
//       surface: 0,                         // the one shown first; several → a choice
//       integrand: 'flux',                  // 'flux' F · dS | 'curl' (∇ × F) · dS | 'none'
//       flip: false, flipToggle: null,      // n = r_u × r_v, or its opposite (a toggle, except in a question's picture)
//       tint: true, arrows: true, arrowsOn: 'surface',   // tint by the integrand; field arrows on the surface or on a 'grid'
//       normals: true, ghosts: false,
//       patch: null,                        // { u: 'u0', v: 'v0', du: 0.3, dv: 0.3 } (numbers or slider keys); with
//                                           //   frac: true all four are fractions of the surface's own u and v ranges
//       points: [{ at: [x, y, z], label, color }],
//       readouts: ['flux', 'area', 'circ', 'volume', 'patch'],   // which numbers to show; [] or false hides them all
//       n: 22, quad: 16,                    // the drawn grid; Gauss–Legendre panels per direction for the integrals
//       sliders, choices, toggles, constants,
//       range: 2, axes: true, axisLabels, yaw, pitch, dist, target, scale } }   // range: the axes' length and arrow scale
//
// The camera aims at the middle of the surfaces and stands back far enough to see them
// whole, unless target or dist says otherwise.
//
// The integrals are computed numerically by model/c3-vector.js.

import { View3D } from '../three-d.js';
import { fn } from '../model/exprfn.js';
import * as M from '../model/c3-vector.js';

export const defaults = {
  F: ['x', 'y', 'z'], divF: null, curlF: null,
  surfaces: [{ label: 'Sphere', x: 'sin(u)*cos(v)', y: 'sin(u)*sin(v)', z: 'cos(u)', u: [0, 'pi'], v: [0, '2*pi'], volume: { kind: 'ball', c: [0, 0, 0], r: 1 } }],
  surface: 0, integrand: 'flux', flip: false, flipToggle: null, tint: true, arrows: true, arrowsOn: 'surface',
  normals: true, ghosts: false, patch: null, points: [], readouts: ['flux'], n: 22, range: 1.6, axes: true,
};

const keysOf = (P) => [...(P.sliders || []).map((s) => s.key), ...(P.choices || []).map((c) => c.key), ...(P.toggles || []).map((t) => t.key), ...Object.keys(P.constants || {})];
const tx = (v) => (Number.isFinite(v) ? String(+(Math.abs(v) < 5e-9 ? 0 : v).toPrecision(4)) : '\\text{—}');
const num = (src, env, vars) => (typeof src === 'number' ? src : fn(src, vars)(env));
const piecesOf = (s) => (s.pieces?.length ? s.pieces : [s]);
const NEUTRAL = [150, 160, 178], POS = [92, 157, 255], NEG = [255, 107, 125];

export function mount(F, P) {
  const compact = F.compact;
  const keys = keysOf(P), xyz = ['x', 'y', 'z', ...keys];
  const { canvas, overlay } = F.canvas({ aspect: P.aspect || '', label: P.alt || 'A surface in a vector field, tinted by the flux through it — drag to rotate' });
  for (const s of P.sliders || []) F.slider(s);
  for (const c of P.choices || []) F.choice(c);
  for (const t of P.toggles || []) F.toggle(t);
  const surfaces = P.surfaces || [];
  if (surfaces.length > 1) F.choice({ key: '__surf', label: 'Surface', options: surfaces.map((s, k) => [k, s.label || `Surface ${k + 1}`]), value: P.surface ?? 0, explain: P.surfaceExplain || 'Each is a parametrized surface $\\vec r(u, v)$.' });
  if (P.flipToggle ?? !compact) F.toggle({ key: '__flip', label: 'Flip the orientation', value: !!P.flip, explain: 'Use $-(\\vec r_u\\times\\vec r_v)$ as the normal instead of $\\vec r_u\\times\\vec r_v$.' });
  else F.params.__flip = !!P.flip;

  const hint = document.createElement('div');
  hint.textContent = 'drag to rotate';
  Object.assign(hint.style, { position: 'absolute', right: '10px', bottom: '6px', fontSize: '.72rem', color: 'var(--ink-3)' });
  overlay.append(hint);

  const env = () => { const e = { ...(P.constants || {}) }; for (const k of keys) if (F.params[k] !== undefined) e[k] = +F.params[k]; return e; };
  const R = P.range ?? 1.6;
  // the camera aims at the middle of everything the surfaces span at the starting values, from far
  // enough back to take it all in (and the axes, when they are near), unless target or dist is given
  const frame = (() => {
    const E0 = env(), lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
    for (const s of surfaces) for (const p of piecesOf(s)) {
      try {
        const X = fn(p.x, ['u', 'v', ...keys]), Y = fn(p.y, ['u', 'v', ...keys]), Z = fn(p.z, ['u', 'v', ...keys]);
        const [u0, u1] = p.u.map((t) => num(t, E0, keys)), [v0, v1] = p.v.map((t) => num(t, E0, keys));
        for (let i = 0; i <= 8; i++) for (let j = 0; j <= 8; j++) {
          const e = { ...E0, u: u0 + ((u1 - u0) * i) / 8, v: v0 + ((v1 - v0) * j) / 8 }, q = [X(e), Y(e), Z(e)];
          if (q.every(Number.isFinite)) q.forEach((c, k) => { lo[k] = Math.min(lo[k], c); hi[k] = Math.max(hi[k], c); });
        }
      } catch { /* validate() reports bad expressions */ }
    }
    if (!Number.isFinite(lo[0])) return { target: [0, 0, 0], dist: R * 3.6 };
    const target = lo.map((v, k) => (v + hi[k]) / 2), diag = Math.hypot(...hi.map((v, k) => v - lo[k]));
    return { target, dist: Math.max(1.15 * diag, 2.2) };
  })();
  const view = new View3D(canvas, { yaw: P.yaw ?? 0.6, pitch: P.pitch ?? 0.42, dist: P.dist ?? frame.dist, scale: P.scale ?? 1, target: P.target || frame.target });
  view.onChange = () => draw();
  let cache = null;
  F.onChange(() => { cache = null; draw(); });

  function build() {
    const E = env();
    const mode = P.integrand || (P.F ? 'flux' : 'none');
    const field = P.F ? (() => { const f = P.F.map((s) => fn(s, xyz)); return (x, y, z) => f.map((g) => g({ ...E, x, y, z })); })() : null;
    const curl = !field ? null : P.curlF ? (() => { const f = P.curlF.map((s) => fn(s, xyz)); return (x, y, z) => f.map((g) => g({ ...E, x, y, z })); })() : (x, y, z) => M.curl3(field, x, y, z);
    const div = !field ? null : P.divF ? (() => { const g = fn(P.divF, xyz); return (x, y, z) => g({ ...E, x, y, z }); })() : (x, y, z) => M.div3(field, x, y, z);
    const G = mode === 'curl' ? curl : field;      // the field whose flux is taken
    const sign = F.params.__flip ? -1 : 1;
    const idx = surfaces.length > 1 ? +F.params.__surf || 0 : 0;
    const mk = (s) => piecesOf(s).map((p) => {
      const X = fn(p.x, ['u', 'v', ...keys]), Y = fn(p.y, ['u', 'v', ...keys]), Z = fn(p.z, ['u', 'v', ...keys]);
      const S = (u, v) => { const e = { ...E, u, v }; return [X(e), Y(e), Z(e)]; };
      return { S, u: p.u.map((t) => num(t, E, keys)), v: p.v.map((t) => num(t, E, keys)) };
    });
    const all = surfaces.map(mk);
    const pieces = all[idx] || [];
    const s0 = surfaces[idx] || {};
    // the drawn grid, with the integrand at each quad's centre
    const n = P.n || 22, quads = [];
    let maxI = 1e-12;
    for (const pc of pieces) {
      const [u0, u1] = pc.u, [v0, v1] = pc.v;
      const pts = Array.from({ length: n + 1 }, (_, i) => Array.from({ length: n + 1 }, (_, j) => pc.S(u0 + ((u1 - u0) * i) / n, v0 + ((v1 - v0) * j) / n)));
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
        const u = u0 + ((u1 - u0) * (i + 0.5)) / n, v = v0 + ((v1 - v0) * (j + 0.5)) / n;
        let val = 0;
        if (G && mode !== 'none') {
          const nr = M.normal(pc.S, u, v), L = Math.hypot(...nr);
          val = L > 1e-12 ? (sign * M.dot(G(...pc.S(u, v)), nr)) / L : 0;
          if (Number.isFinite(val)) maxI = Math.max(maxI, Math.abs(val)); else val = 0;
        }
        quads.push({ q: [[pts[i][j], pts[i][j + 1]], [pts[i + 1][j], pts[i + 1][j + 1]]], val });
      }
    }
    // the integrals
    const out = {}, qd = P.quad || 16;
    if (G && mode !== 'none') out.flux = pieces.reduce((t, pc) => t + M.flux(G, pc.S, pc.u, pc.v, { pu: qd, pv: qd, sign }), 0);
    out.area = pieces.reduce((t, pc) => t + M.area(pc.S, pc.u, pc.v), 0);
    let edge = null;
    if (s0.boundary) {
      const b = s0.boundary, bx = fn(b.x, ['t', ...keys]), by = fn(b.y, ['t', ...keys]), bz = fn(b.z, ['t', ...keys]);
      const c = { X: (t) => bx({ ...E, t }), Y: (t) => by({ ...E, t }), Z: (t) => bz({ ...E, t }) };
      let [a, bb] = b.t.map((t) => num(t, E, keys));
      if (sign < 0) [a, bb] = [bb, a];
      edge = { c, a, b: bb };
      if (field) out.circ = M.work(field, c, a, bb, 64);
    }
    if (s0.volume && div) {
      const V = s0.volume;
      if (V.kind === 'ball') out.volume = M.ballIntegral(div, V.c || [0, 0, 0], num(V.r, E, keys), 14);
      else if (V.kind === 'box') out.volume = M.boxIntegral(div, V.x, V.y, V.z, 10);
      else if (V.kind === 'cylinder') out.volume = M.cylinderIntegral(div, V.c || [0, 0], num(V.r, E, keys), V.z, 12);
    }
    return { E, mode, field, G, sign, pieces, all, idx, quads, maxI, out, edge };
  }

  function draw() {
    if (!cache) cache = build();
    const C = cache;
    view.begin();
    if (P.axes !== false) view.axes(R * 1.15, P.axisLabels || ['x', 'y', 'z']);
    // other surfaces, faintly
    if (P.ghosts) C.all.forEach((pcs, k) => {
      if (k === C.idx) return;
      for (const pc of pcs) {
        const m = 14, [u0, u1] = pc.u, [v0, v1] = pc.v;
        const grid = Array.from({ length: m + 1 }, (_, i) => Array.from({ length: m + 1 }, (_, j) => pc.S(u0 + ((u1 - u0) * i) / m, v0 + ((v1 - v0) * j) / m)));
        view.surface(grid, { color: 'ink3', alpha: 0.12, wire: true, wireAlpha: 0.05 });
      }
    });
    // the surface, tinted by the integrand
    const tint = P.tint !== false && C.mode !== 'none' && C.G;
    for (const { q, val } of C.quads) {
      let rgb = [70, 170, 160];
      if (tint) {
        const t = Math.max(-1, Math.min(1, val / C.maxI)), k = Math.abs(t) ** 0.8, end = t >= 0 ? POS : NEG;
        rgb = NEUTRAL.map((v, i) => v + (end[i] - v) * k);
      }
      view.surface(q, { color: `rgb(${rgb.map(Math.round).join(',')})`, alpha: P.alpha ?? 0.82 });
    }
    // field arrows (of the integrated field) on the surface, or on a grid
    const arrowsOf = (G, pts, len) => {
      const vals = pts.map((p) => G(...p)), mags = vals.map((v) => Math.hypot(...v)).filter(Number.isFinite);
      const mx = Math.max(1e-12, ...mags);
      pts.forEach((p, k) => {
        const v = vals[k], m = Math.hypot(...v);
        if (!Number.isFinite(m) || m < 1e-12) return;
        const s = (len * (0.3 + 0.7 * Math.min(1, m / mx))) / m;
        view.arrow(p, [p[0] + v[0] * s, p[1] + v[1] * s, p[2] + v[2] * s], { color: P.arrowColor || 'gold', width: 1.7 });
      });
    };
    if (P.arrows !== false && C.G) {
      let pts = [];
      if (P.arrowsOn === 'grid') {
        const g = P.grid || 4, lo = -R, step = (2 * R) / (g - 1);
        for (let i = 0; i < g; i++) for (let j = 0; j < g; j++) for (let k = 0; k < g; k++) pts.push([lo + i * step, lo + j * step, lo + k * step]);
      } else {
        for (const pc of C.pieces) {
          const [u0, u1] = pc.u, [v0, v1] = pc.v, a = P.arrowGrid?.[0] ?? 5, b = P.arrowGrid?.[1] ?? 7;
          for (let i = 0; i < a; i++) for (let j = 0; j < b; j++) pts.push(pc.S(u0 + ((u1 - u0) * (i + 0.5)) / a, v0 + ((v1 - v0) * (j + 0.5)) / b));
        }
      }
      arrowsOf(C.G, pts, (P.arrowLen ?? 0.42) * R);
    }
    // normals at a few points
    if (P.normals !== false) {
      for (const pc of C.pieces) {
        const [u0, u1] = pc.u, [v0, v1] = pc.v, a = P.normalGrid?.[0] ?? 3, b = P.normalGrid?.[1] ?? 4;
        for (let i = 0; i < a; i++) for (let j = 0; j < b; j++) {
          const u = u0 + ((u1 - u0) * (i + 0.5)) / a, v = v0 + ((v1 - v0) * (j + 0.5)) / b;
          const p = pc.S(u, v), nr = M.normal(pc.S, u, v), L = Math.hypot(...nr);
          if (!(L > 1e-9)) continue;
          const s = (C.sign * 0.32 * R) / L;
          view.arrow(p, [p[0] + nr[0] * s, p[1] + nr[1] * s, p[2] + nr[2] * s], { color: 'ink', width: 1.5 });
        }
      }
    }
    // the edge, walked by the right-hand rule
    if (C.edge) {
      const { c, a, b } = C.edge;
      const pts = Array.from({ length: 121 }, (_, k) => { const t = a + ((b - a) * k) / 120; return [c.X(t), c.Y(t), c.Z(t)]; });
      view.line(pts, { color: 'good', width: 3, bias: 0.08 });
      for (const f of [0.12, 0.37, 0.62, 0.87]) {
        const t1 = a + (b - a) * f, t0 = t1 - (b - a) * 0.025;
        view.arrow([c.X(t0), c.Y(t0), c.Z(t0)], [c.X(t1), c.Y(t1), c.Z(t1)], { color: 'good', width: 3, bias: 0.1 });
      }
      if (C.mode === 'curl' && C.field) {
        const ep = Array.from({ length: 10 }, (_, k) => { const t = a + ((b - a) * (k + 0.5)) / 10; return [c.X(t), c.Y(t), c.Z(t)]; });
        const vals = ep.map((p) => C.field(...p)), mx = Math.max(1e-12, ...vals.map((v) => Math.hypot(...v)).filter(Number.isFinite));
        ep.forEach((p, k) => { const v = vals[k], s = (0.4 * R) / mx; if (Number.isFinite(v[0])) view.arrow(p, [p[0] + v[0] * s, p[1] + v[1] * s, p[2] + v[2] * s], { color: 'violet', width: 1.8 }); });
      }
    }
    // a patch: r_u du, r_v dv, the parallelogram and the normal
    let patchRow = null;
    if (P.patch && C.pieces[0]) {
      const pc = C.pieces[0], E = C.E;
      let u = num(P.patch.u, E, keys), v = num(P.patch.v, E, keys);
      let du = num(P.patch.du ?? 0.3, E, keys), dv = num(P.patch.dv ?? 0.3, E, keys);
      if (P.patch.frac) {          // fractions of the surface's own parameter ranges
        const [u0, u1] = pc.u, [v0, v1] = pc.v;
        du *= u1 - u0; dv *= v1 - v0;
        u = u0 + (u1 - u0 - du) * u; v = v0 + (v1 - v0 - dv) * v;
      }
      const p = pc.S(u, v), [ru, rv] = M.tangents(pc.S, u, v);
      const a = ru.map((x) => x * du), b = rv.map((x) => x * dv), nr = M.cross(a, b), L = Math.hypot(...nr);
      const add = (x, y) => [x[0] + y[0], x[1] + y[1], x[2] + y[2]];
      view.surface([[p, add(p, b)], [add(p, a), add(add(p, a), b)]], { color: 'gold', alpha: 0.6, wire: false });
      view.arrow(p, add(p, a), { color: 'accent', width: 2.6, bias: 0.12 });
      view.arrow(p, add(p, b), { color: 'violet', width: 2.6, bias: 0.12 });
      if (L > 1e-12) { const s = (C.sign * 0.5 * R) / L; view.arrow(p, add(p, nr.map((x) => x * s)), { color: 'ink', width: 2.6, bias: 0.12 }); }
      view.point(p, { color: 'gold', r: 4.5 });
      view.label(add(p, a.map((x) => x * 1.25)), 'rᵤΔu', { color: 'accent' });
      view.label(add(p, b.map((x) => x * 1.25)), 'rᵥΔv', { color: 'violet' });
      patchRow = { factor: Math.hypot(...M.cross(ru, rv)), area: L };
    }
    for (const pt of P.points || []) {
      const at = pt.at.map((s) => num(s, C.E, keys));
      view.point(at, { color: pt.color || 'bad', r: pt.r || 5 });
      if (pt.label) view.label([at[0], at[1], at[2] + 0.14 * R], pt.label, { color: pt.color || 'bad' });
    }
    view.end();

    const want = P.readouts === false ? [] : P.readouts || ['flux'];
    const rows = [];
    const o = C.out, cur = C.mode === 'curl';
    for (const w of want) {
      if (w === 'flux' && o.flux !== undefined) rows.push([cur ? '$\\iint_S (\\nabla\\times\\vec F)\\cdot d\\vec S$' : '$\\iint_S \\vec F\\cdot d\\vec S$', tx(o.flux)]);
      if (w === 'circ' && o.circ !== undefined) rows.push(['$\\oint_{\\partial S} \\vec F\\cdot d\\vec r$', tx(o.circ)]);
      if (w === 'volume' && o.volume !== undefined) rows.push(['$\\iiint_E \\nabla\\cdot\\vec F\\,dV$', tx(o.volume)]);
      if (w === 'area') rows.push(['area of $S$', tx(o.area)]);
      if (w === 'patch' && patchRow) rows.push(['$|\\vec r_u\\times\\vec r_v|$ at the patch', tx(patchRow.factor)], ['patch area $\\approx |\\vec r_u\\times\\vec r_v|\\,\\Delta u\\,\\Delta v$', tx(patchRow.area)]);
    }
    F.readout(rows);
  }
  F.draw(draw);
  F.caption(P.caption || 'Drag to rotate. Gold arrows show the field, lengths compressed; white arrows are the chosen normals. The tint is the flux integrand F · n̂: blue along the normal, red against it. Integrals are computed numerically.');
  return { get: (k) => F.params[k] };
}

/** Node-side check used by the content tests. */
export function validate(P) {
  const out = [];
  const keys = keysOf(P);
  const tryParse = (src, vars, where) => { if (src === undefined || src === null || typeof src === 'number') return; try { fn(src, [...vars, ...keys]); } catch (e) { out.push(`c3-flux ${where}: “${src}” — ${e.message}`); } };
  if (P.F !== undefined && P.F !== null) {
    if (!(Array.isArray(P.F) && P.F.length === 3)) out.push('c3-flux F must be three expressions [P, Q, R]');
    else P.F.forEach((s, k) => tryParse(s, ['x', 'y', 'z'], `F[${k}]`));
  }
  if (P.curlF) { if (!(Array.isArray(P.curlF) && P.curlF.length === 3)) out.push('c3-flux curlF must be three expressions'); else P.curlF.forEach((s, k) => tryParse(s, ['x', 'y', 'z'], `curlF[${k}]`)); }
  tryParse(P.divF, ['x', 'y', 'z'], 'divF');
  if (P.integrand && !['flux', 'curl', 'none'].includes(P.integrand)) out.push('c3-flux integrand must be flux, curl or none');
  if (!Array.isArray(P.surfaces) || !P.surfaces.length) out.push('c3-flux needs at least one surface');
  for (const [k, s] of (P.surfaces || []).entries()) {
    for (const [j, p] of piecesOf(s).entries()) {
      const where = `surface ${k + 1}${s.pieces ? ` piece ${j + 1}` : ''}`;
      for (const c of ['x', 'y', 'z']) { if (p[c] === undefined) out.push(`c3-flux ${where} needs ${c}(u, v)`); else tryParse(p[c], ['u', 'v'], `${where} ${c}`); }
      for (const r of ['u', 'v']) {
        if (!(Array.isArray(p[r]) && p[r].length === 2)) out.push(`c3-flux ${where} needs ${r}: [lo, hi]`);
        else p[r].forEach((t) => tryParse(t, [], `${where} ${r} range`));
      }
    }
    if (s.label !== undefined && /\$|\\/.test(s.label)) out.push(`c3-flux surface ${k + 1} label “${s.label}” is plain text (a button): no TeX`);
    if (s.boundary) {
      for (const c of ['x', 'y', 'z']) tryParse(s.boundary[c], ['t'], `surface ${k + 1} boundary ${c}`);
      if (!(Array.isArray(s.boundary.t) && s.boundary.t.length === 2)) out.push(`c3-flux surface ${k + 1} boundary needs t: [a, b]`);
    }
    if (s.volume && !['ball', 'box', 'cylinder'].includes(s.volume.kind)) out.push(`c3-flux surface ${k + 1} volume kind must be ball, box or cylinder`);
  }
  if (P.patch) for (const f of ['u', 'v', 'du', 'dv']) tryParse(P.patch[f], [], `patch ${f}`);
  for (const p of P.points || []) { (p.at || []).forEach((s) => tryParse(s, [], 'point')); if (p.label && /\$|\\/.test(p.label)) out.push(`c3-flux point label “${p.label}” is plain text`); }
  for (const s of P.sliders || []) if (!(s.min < s.max) || s.value < s.min || s.value > s.max) out.push(`slider ${s.key}: value must lie in [min, max]`);
  const RO = ['flux', 'area', 'circ', 'volume', 'patch'];
  if (Array.isArray(P.readouts)) for (const r of P.readouts) if (!RO.includes(r)) out.push(`c3-flux readout “${r}” is not one of ${RO.join(', ')}`);
  return out;
}
