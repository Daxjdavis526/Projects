// The Companion's pictures, drawn with MathVerse's own engines: Plot2D's
// Graphics for the plane, Viewport3D for space. One function per picture;
// every value comes from the same exact expressions the worked steps use.

import type { Graphics, View } from '../engine/plot2d';
import type { Viewport3D, V3, Bounds, Handle } from '../engine/viewport3d';
import { SERIES } from '../engine/colors';
import { Node, compile, derivative, nthDerivative, freeSymbols, parse, evaluate, Fn } from '../core/expr';
import { solveAdaptive } from '../core/numeric/ode';
import type { Analysis } from './model';
import type { Visual, Marks, Work } from './tasks';
import { fixedOf } from './tasks';

export interface DrawCtx {
  an: Analysis;
  viz: string;
  values: Record<string, number>;
  work: Work | null;
  at: string;
  dark: boolean;
  setParam: (key: string, v: number) => void;
}

export const tone = (i = 0) => SERIES[i % SERIES.length];
const safe = (n: Node, vars: string[], fixed: Record<string, number>): Fn | null => { try { return compile(n, vars, fixed); } catch { return null; } };
const f1 = (n: Node, x: string, fixed: Record<string, number>) => { const f = safe(n, [x], fixed); return f ? (t: number) => f([t]) : null; };

/** A view that frames these functions on [a, b] (robust to poles: 5th–95th percentile). */
export function fitView(fns: ((x: number) => number)[], a: number, b: number, extra: [number, number][] = []): View {
  const ys: number[] = [];
  for (const f of fns) for (let i = 0; i <= 200; i++) { const y = f(a + ((b - a) * i) / 200); if (Number.isFinite(y)) ys.push(y); }
  for (const [, y] of extra) if (Number.isFinite(y)) ys.push(y);
  ys.sort((p, q) => p - q);
  let lo = ys.length ? ys[Math.floor(ys.length * 0.08)] : -3, hi = ys.length ? ys[Math.floor(ys.length * 0.92)] : 3;
  lo = Math.min(lo, 0); hi = Math.max(hi, 0);
  if (hi - lo < 1e-6) { lo -= 1; hi += 1; }
  const pad = (hi - lo) * 0.15;
  return { x0: a, x1: b, y0: lo - pad, y1: hi + pad };
}

/** The view a picture starts in. */
export function initialView(c: DrawCtx, visual: Visual | null): View {
  const { an, values } = c;
  const fixed = fixedOf(an, values);
  if (visual?.k === 'curves') {
    const fns = visual.items.map((it) => f1(it.node, visual.x, fixed)).filter((f): f is (t: number) => number => !!f);
    const xs = (visual.points ?? []).map((p) => p.at[0]).concat(visual.shade ? [visual.shade.lo, visual.shade.hi] : []);
    const cx = xs.length ? (Math.min(...xs) + Math.max(...xs)) / 2 : 0;
    const half = Math.max(5, xs.length ? (Math.max(...xs) - Math.min(...xs)) * 0.8 : 5);
    return fitView(fns, cx - half, cx + half, (visual.points ?? []).map((p) => p.at));
  }
  if (visual?.k === 'rows' || an.kind === 'system') {
    const s = visual?.k === 'rows' && visual.solution ? visual.solution : (c.work?.marks?.points?.[0]?.at ?? [0, 0]);
    const cx = Number.isFinite(s[0]) ? s[0] : 0, cy = Number.isFinite(s[1]) ? s[1] : 0;
    return { x0: cx - 6, x1: cx + 6, y0: cy - 4, y1: cy + 4 };
  }
  if (visual?.k === 'matrix' || an.kind === 'matrix' || an.kind === 'vector') return { x0: -4, x1: 4, y0: -3, y1: 3 };
  const x = an.vars[0] ?? 'x';
  switch (an.kind) {
    case 'function': case 'equation': {
      const fn = an.kind === 'equation' ? [f1(an.equation!.lhs, x, fixed), f1(an.equation!.rhs, x, fixed)] : [f1(an.exprs[0], x, fixed)];
      const fns = (c.viz === 'zero' && an.equation ? [f1(an.equation.F, x, fixed)] : fn).filter((f): f is (t: number) => number => !!f);
      const pts = (c.work?.marks?.points ?? []).map((p) => p.at[0]).filter((v) => Number.isFinite(v) && Math.abs(v) < 12);
      // the widest window (from ±6 down to ±2) in which the graph is not too steep to read: height ≤ 6 × width
      const need = pts.length ? Math.max(...pts.map(Math.abs)) + 1 : 0;
      for (const h of [6, 5, 4, 3, 2]) {
        const half = Math.max(h, need);
        const v = fitView(fns, -half, half);
        if ((v.y1 - v.y0) <= 6 * 2 * half || h === 2) return v;
      }
      return fitView(fns, -6, 6);
    }
    case 'curve2d': case 'polar': {
      const comps = an.kind === 'polar' ? null : an.exprs.map((e) => f1(e, x, fixed));
      const r = an.kind === 'polar' ? f1(an.exprs[0], x, fixed) : null;
      const lo = values.lo ?? -Math.PI, hi = values.hi ?? Math.PI;
      let mx = 1;
      for (let i = 0; i <= 300; i++) {
        const t = lo + ((hi - lo) * i) / 300;
        const p = r ? [r(t) * Math.cos(t), r(t) * Math.sin(t)] : comps!.map((f) => (f ? f(t) : NaN));
        if (p.every(Number.isFinite)) mx = Math.max(mx, Math.abs(p[0]), Math.abs(p[1]));
      }
      mx = Math.min(mx * 1.2, 50);
      return { x0: -mx, x1: mx, y0: -mx, y1: mx };
    }
    case 'ode1': case 'ode2': {
      const t0 = values.t0 ?? 0, T = values.T ?? 8;
      const num = c.work?.marks?.numeric ?? [];
      if (c.viz === 'phaseplane') return { x0: -4, x1: 4, y0: -4, y1: 4 };
      const ys = num.map((p) => p[1]).filter(Number.isFinite).sort((a, b) => a - b);
      const lo = Math.min(-1, ys[Math.floor(ys.length * 0.02)] ?? -3), hi = Math.max(1, ys[Math.floor(ys.length * 0.98)] ?? 3);
      const pad = (hi - lo) * 0.2;
      return { x0: t0 - 0.5, x1: t0 + T + 0.5, y0: lo - pad, y1: hi + pad };
    }
    case 'pde': {
      const p = an.classified!.pde!;
      if (p.family === 'laplace' || p.dims === 2) return { x0: 0, x1: Math.PI, y0: 0, y1: Math.PI };
      return { x0: 0, x1: Math.PI, y0: -1.4, y1: 1.4 };
    }
    default: return { x0: -4, x1: 4, y0: -3, y1: 3 };
  }
}

/** Use equal axes for this picture? */
export const equalAxes = (an: Analysis, viz: string, visual: Visual | null) =>
  !visual || visual.k !== 'curves' ? ['curve2d', 'polar', 'implicit2d', 'matrix', 'vector', 'field2d', 'odeSystem', 'surface', 'pde'].includes(an.kind) || viz === 'phaseplane' || visual?.k === 'matrix' : false;

// ── 2D ──────────────────────────────────────────────────────────────────────

const pointStyle = (dark: boolean, i = 2) => ({ fill: tone(i), color: dark ? '#0d1017' : '#ffffff', width: 2 });

function drawMarks2(g: Graphics, m: Marks | undefined, dark: boolean, yOf?: (x: number) => number) {
  if (!m) return;
  for (const l of m.lines ?? []) { const L = (g.view.x1 - g.view.x0); g.line([l.at[0] - L, l.at[1] - l.m * L], [l.at[0] + L, l.at[1] + l.m * L], { color: tone(4), width: 1.6, dash: [6, 4] }); }
  for (const p of m.points ?? []) { const y = p.at.length > 1 ? p.at[1] : yOf ? yOf(p.at[0]) : 0; if (Number.isFinite(p.at[0]) && Number.isFinite(y)) g.point([p.at[0], y], 5, pointStyle(dark)); }
}

export function drawVisual(g: Graphics, v: Visual, c: DrawCtx) {
  const fixed = fixedOf(c.an, c.values);
  if (v.k === 'curves') {
    if (v.shade) { const f = f1(v.shade.node, v.x, fixed); if (f) g.fillBetween(f, () => 0, v.shade.lo, v.shade.hi, { fill: tone(0), alpha: 0.22 }); }
    v.items.forEach((it) => { const f = f1(it.node, v.x, fixed); if (f) g.fn(f, { color: tone(it.tone ?? 0), width: 2.4, dash: it.dash ? [7, 5] : undefined }); });
    for (const l of v.lines ?? []) { const L = g.view.x1 - g.view.x0; g.line([l.at[0] - L, l.at[1] - l.m * L], [l.at[0] + L, l.at[1] + l.m * L], { color: tone(4), width: 1.6, dash: [6, 4] }); }
    for (const p of v.points ?? []) if (p.at.every(Number.isFinite)) g.point(p.at, 5, pointStyle(c.dark, p.tone ?? 2));
  } else if (v.k === 'rows') drawRows(g, v.rows, v.solution ?? null, c.dark);
  else if (v.k === 'matrix') drawMatrix(g, v.M, v.vectors ?? [], c.dark);
}

function drawRows(g: Graphics, rows: number[][], sol: number[] | null, dark: boolean) {
  rows.forEach((r, i) => {
    const [a, b, k] = [r[0], r[1], r[r.length - 1]];
    if (r.length !== 3) return;
    const s = { color: tone(i), width: 2.4 };
    if (Math.abs(b) > 1e-12) g.fn((x) => (k - a * x) / b, s);
    else if (Math.abs(a) > 1e-12) g.line([k / a, g.view.y0], [k / a, g.view.y1], s);
    else if (Math.abs(k) > 1e-12) g.text([g.view.x0, g.view.y1], `row ${i + 1}: 0 = ${+k.toPrecision(4)} — no points at all`, { color: tone(i) }, 8, 18 + 16 * i);
  });
  if (sol && sol.length === 2 && sol.every(Number.isFinite)) g.point([sol[0], sol[1]], 6, pointStyle(dark));
}

function drawMatrix(g: Graphics, M: number[][], vectors: { v: number[]; label: string }[], dark: boolean) {
  if (M.length !== 2 || M[0].length !== 2) { g.text([g.view.x0, g.view.y1], 'The picture shows 2×2 matrices; open the full demo for 3×3.', {}, 10, 20); return; }
  const T = (p: [number, number]): [number, number] => [M[0][0] * p[0] + M[0][1] * p[1], M[1][0] * p[0] + M[1][1] * p[1]];
  const gc = dark ? 'rgba(106,169,255,0.28)' : 'rgba(47,111,220,0.28)';
  for (let k = -6; k <= 6; k++) { g.line(T([k, -6]), T([k, 6]), { color: gc, width: 1 }); g.line(T([-6, k]), T([6, k]), { color: gc, width: 1 }); }
  g.polygon([T([0, 0]), T([1, 0]), T([1, 1]), T([0, 1])], { fill: tone(1), alpha: 0.35, color: tone(1), width: 1.5 });
  g.polygon([[0, 0], [1, 0], [1, 1], [0, 1]], { color: dark ? '#7d8597' : '#6b7385', width: 1, dash: [4, 4] });
  g.arrow([0, 0], T([1, 0]), { color: tone(0), width: 2.4 }); g.text(T([1, 0]), 'Ae₁', { color: tone(0) }, 6, -6);
  g.arrow([0, 0], T([0, 1]), { color: tone(2), width: 2.4 }); g.text(T([0, 1]), 'Ae₂', { color: tone(2) }, 6, -6);
  vectors.forEach((e, i) => {
    const L = Math.hypot(e.v[0], e.v[1]) || 1, d: [number, number] = [e.v[0] / L, e.v[1] / L];
    g.line([-8 * d[0], -8 * d[1]], [8 * d[0], 8 * d[1]], { color: tone(3 + i), width: 1.4, dash: [6, 4] });
    g.text([2.2 * d[0], 2.2 * d[1]], e.label, { color: tone(3 + i) }, 6, -6);
  });
}

/** The problem's own picture (no step selected). */
export function drawDefault(g: Graphics, c: DrawCtx) {
  const { an, viz, values, work, dark, setParam } = c;
  const fixed = fixedOf(an, values);
  const x = an.vars[0] ?? 'x';
  const marks = work?.marks;
  switch (an.kind) {
    case 'function': {
      const f = an.exprs[0];
      const F = f1(f, x, fixed);
      if (!F) return;
      if (viz === 'area') {
        const lo = values.lo ?? 0, hi = values.hi ?? 2;
        g.fillBetween(F, () => 0, Math.min(lo, hi), Math.max(lo, hi), { fill: tone(0), alpha: 0.25 });
        g.fn(F, { color: tone(0), width: 2.6 });
        g.handle({ id: 'lo', at: [lo, 0], color: tone(1), label: 'a', onDrag: ([px]) => setParam('lo', +px.toFixed(3)), constrain: ([px]) => [px, 0] });
        g.handle({ id: 'hi', at: [hi, 0], color: tone(1), label: 'b', onDrag: ([px]) => setParam('hi', +px.toFixed(3)), constrain: ([px]) => [px, 0] });
        return;
      }
      if (viz === 'taylor') {
        let a = 0; try { a = evaluate(parse(c.at || '0'), fixed); } catch { a = 0; }
        if (!Number.isFinite(a)) a = 0;
        const n = Math.max(1, Math.min(12, Math.round(values.order ?? 5)));
        const coeffs: number[] = [];
        let fact = 1;
        try { for (let k = 0; k <= n; k++) { if (k) fact *= k; coeffs.push((f1(nthDerivative(f, x, k), x, fixed)?.(a) ?? NaN) / fact); } } catch { /* no derivative formula */ }
        g.fn(F, { color: tone(0), width: 2.6 });
        if (coeffs.length && coeffs.every(Number.isFinite)) g.fn((t) => coeffs.reduceRight((s, ck) => s * (t - a) + ck, 0), { color: tone(1), width: 2.2, dash: [7, 5] });
        g.point([a, F(a)], 5, pointStyle(dark));
        g.text([g.view.x0, g.view.y1], `Taylor polynomial of order ${n} about ${+a.toPrecision(4)}`, { color: tone(1) }, 10, 18);
        return;
      }
      let D: ((t: number) => number) | null = null;
      try { D = f1(derivative(f, x), x, fixed); } catch { D = null; }
      const anti = marks?.curve && c.work?.task === 'integral' ? f1(marks.curve, x, fixed) : null;
      if (anti) g.fn(anti, { color: tone(3), width: 2.2 });
      else if (D) g.fn(D, { color: tone(1), width: 1.8, dash: [7, 5], alpha: 0.85 });
      g.fn(F, { color: tone(0), width: 2.6 });
      for (const p of marks?.points ?? []) { const y = F(p.at[0]); if (Number.isFinite(y)) g.point([p.at[0], y], 5, pointStyle(dark, 3)); }
      const x0 = values.x0 ?? 1, y0 = F(x0), m = D ? D(x0) : NaN;
      if (Number.isFinite(y0) && Number.isFinite(m)) { const L = g.view.x1 - g.view.x0; g.line([x0 - L, y0 - m * L], [x0 + L, y0 + m * L], { color: tone(4), width: 1.6, dash: [6, 4] }); }
      if (Number.isFinite(y0)) g.handle({ id: 'x0', at: [x0, y0], color: tone(2), onDrag: ([px]) => setParam('x0', +px.toFixed(4)), constrain: ([px]) => [px, F(px)] });
      return;
    }
    case 'equation': {
      const e = an.equation!;
      const L = f1(e.lhs, x, fixed), R = f1(e.rhs, x, fixed), Fz = f1(e.F, x, fixed);
      if (viz === 'zero') { if (Fz) g.fn(Fz, { color: tone(0), width: 2.6 }); drawMarks2(g, { points: (marks?.points ?? []).map((p) => ({ at: [p.at[0], 0] })) }, dark); return; }
      if (L) g.fn(L, { color: tone(0), width: 2.6 });
      if (R) g.fn(R, { color: tone(1), width: 2.6 });
      for (const p of marks?.points ?? []) { const y = L?.(p.at[0]); if (y !== undefined && Number.isFinite(y)) g.point([p.at[0], y], 5, pointStyle(dark)); }
      return;
    }
    case 'surface': {
      const f = safe(an.exprs[0], an.vars, fixed);
      if (!f) return;
      const vals: number[] = [];
      const { x0, x1, y0, y1 } = g.view;
      for (let i = 0; i < 40; i++) for (let j = 0; j < 40; j++) { const v = f([x0 + ((x1 - x0) * i) / 39, y0 + ((y1 - y0) * j) / 39]); if (Number.isFinite(v)) vals.push(v); }
      vals.sort((a, b) => a - b);
      const lo = vals[Math.floor(vals.length * 0.03)] ?? -1, hi = vals[Math.floor(vals.length * 0.97)] ?? 1;
      g.heatmap((u, v) => f([u, v]), [lo, hi], 'coolwarm', 140);
      for (let k = 1; k < 12; k++) { const lev = lo + ((hi - lo) * k) / 12; g.implicit((u, v) => f([u, v]) - lev, { color: dark ? 'rgba(255,255,255,0.45)' : 'rgba(20,30,50,0.45)', width: 1 }, 120); }
      const px = values.x0 ?? 0.5, py = values.y0 ?? 0.5;
      let fx = NaN, fy = NaN;
      try { fx = compile(derivative(an.exprs[0], an.vars[0]), an.vars, fixed)([px, py]); fy = compile(derivative(an.exprs[0], an.vars[1]), an.vars, fixed)([px, py]); } catch { /* */ }
      if (Number.isFinite(fx) && Number.isFinite(fy)) {
        const s = 0.6 / Math.max(1e-9, Math.hypot(fx, fy)) * Math.min(1.5, Math.hypot(fx, fy));
        g.arrow([px, py], [px + fx * s, py + fy * s], { color: tone(1), width: 2.6 });
        g.text([px + fx * s, py + fy * s], '∇f', { color: tone(1), font: '600 13px Inter, sans-serif' }, 6, -6);
      }
      for (const p of marks?.points ?? []) if (p.at.length >= 2 && p.at.every(Number.isFinite)) g.point([p.at[0], p.at[1]], 5, pointStyle(dark, 3));
      g.handle({ id: 'p', at: [px, py], color: tone(2), onDrag: ([u, v]) => { setParam('x0', +u.toFixed(3)); setParam('y0', +v.toFixed(3)); } });
      return;
    }
    case 'curve2d': case 'polar': {
      const lo = values.lo ?? -Math.PI, hi = values.hi ?? Math.PI;
      let X: ((t: number) => number) | null, Y: ((t: number) => number) | null;
      if (an.kind === 'polar') { const r = f1(an.exprs[0], x, fixed); X = r && ((t) => r(t) * Math.cos(t)); Y = r && ((t) => r(t) * Math.sin(t)); }
      else { X = f1(an.exprs[0], x, fixed); Y = f1(an.exprs[1], x, fixed); }
      if (!X || !Y) return;
      g.parametric(X, Y, lo, hi, { color: tone(0), width: 2.6 }, 800);
      const t0 = values.x0 ?? 1, h = 1e-5;
      const P: [number, number] = [X(t0), Y(t0)];
      const V: [number, number] = [(X(t0 + h) - X(t0 - h)) / (2 * h), (Y(t0 + h) - Y(t0 - h)) / (2 * h)];
      const arrows = marks?.arrows?.[0];
      const vec = arrows ? [arrows.vec[0], arrows.vec[1]] : V;
      if (P.every(Number.isFinite) && vec.every(Number.isFinite)) { g.arrow(P, [P[0] + vec[0], P[1] + vec[1]], { color: tone(1), width: 2.4 }); g.point(P, 6, pointStyle(dark)); }
      return;
    }
    case 'field2d': {
      const P = safe(an.exprs[0], an.vars, fixed), Q = safe(an.exprs[1], an.vars, fixed);
      if (!P || !Q) return;
      try {
        const div = compile({ t: 'add', a: derivative(an.exprs[0], an.vars[0]), b: derivative(an.exprs[1], an.vars[1]) }, an.vars, fixed);
        const { x0, x1, y0, y1 } = g.view;
        let m = 1e-9; for (let i = 0; i < 20; i++) for (let j = 0; j < 20; j++) { const v = div([x0 + ((x1 - x0) * i) / 19, y0 + ((y1 - y0) * j) / 19]); if (Number.isFinite(v)) m = Math.max(m, Math.abs(v)); }
        g.heatmap((u, v) => div([u, v]), [-1.8 * m, 1.8 * m], 'coolwarm', 100);
      } catch { /* no divergence picture */ }
      g.field((u, v) => [P([u, v]), Q([u, v])], 20, 'plasma');
      const px = values.x0 ?? 1, py = values.y0 ?? 0.5;
      g.handle({ id: 'p', at: [px, py], color: tone(2), onDrag: ([u, v]) => { setParam('x0', +u.toFixed(3)); setParam('y0', +v.toFixed(3)); } });
      return;
    }
    case 'matrix': {
      const m = an.exprs[0];
      if (m.t !== 'matrix') return;
      let M: number[][];
      try { M = m.rows.map((r) => r.map((e) => evaluate(e, fixed))); } catch { return; }
      const vis = work?.steps.map((s) => s.visual).filter((v): v is Extract<Visual, { k: 'matrix' }> => v?.k === 'matrix').at(-1);
      drawMatrix(g, M, vis?.vectors ?? [], dark);
      return;
    }
    case 'vector': {
      let v: number[] = [];
      try { v = an.exprs.map((e) => evaluate(e, fixed)); } catch { return; }
      if (v.length >= 2) { g.arrow([0, 0], [v[0], v[1]], { color: tone(0), width: 2.6 }); g.point([v[0], v[1]], 4, pointStyle(dark)); }
      return;
    }
    case 'system': {
      const s = an.system!;
      if (s.vars.length !== 2) { g.text([g.view.x0, g.view.y1], `${s.vars.length} unknowns: the picture is drawn in 3D.`, {}, 10, 20); return; }
      drawRows(g, s.A.map((r, i) => [...r, s.b[i]]), (marks?.points?.[0]?.at as number[] | undefined) ?? null, dark);
      return;
    }
    case 'implicit2d': {
      const F = safe(an.exprs[0], ['x', 'y'], fixed);
      if (!F) return;
      g.implicit((u, v) => F([u, v]), { color: tone(0), width: 2.6 }, 220);
      drawMarks2(g, marks ? { lines: marks.lines } : undefined, dark);
      const p = marks?.points?.[0]?.at;
      if (p) g.handle({ id: 'x0', at: [p[0], p[1]], color: tone(2), onDrag: ([u]) => setParam('x0', +u.toFixed(3)), constrain: ([u]) => [u, p[1]] });
      return;
    }
    case 'ode1': case 'ode2': case 'odeSystem': return drawOde(g, c);
    case 'pde': return drawPde(g, c);
    default: return;
  }
}

function drawOde(g: Graphics, c: DrawCtx) {
  const { an, values, work, dark, setParam, viz } = c;
  const fixed = fixedOf(an, values);
  const t = an.vars[0], deps = an.dependent ?? ['y'];
  const t0 = values.t0 ?? 0, y0 = values.icY ?? 1, v0 = values.icV ?? 0, T = values.T ?? 8;
  if (an.kind === 'ode1') {
    const f = safe(an.exprs[0], [t, deps[0]], fixed);
    if (f) g.slopeField((u, v) => f([u, v]), 24, { color: dark ? 'rgba(183,191,205,0.45)' : 'rgba(60,68,86,0.45)', width: 1.2 });
  }
  if (an.kind === 'odeSystem' || viz === 'phaseplane') {
    // phase plane: (y, y′) for second order, (x, y) for a planar system
    let rhs: (s: number, u: number[]) => number[];
    if (an.kind === 'ode2') { const f = safe(an.exprs[0], [t, deps[0], `${deps[0]}_p`], fixed); if (!f) return; rhs = (s, u) => [u[1], f([s, u[0], u[1]])]; }
    else { const fs = an.exprs.map((e) => safe(e, [t, ...deps], fixed)); if (fs.some((h) => !h) || deps.length !== 2) { g.text([g.view.x0, g.view.y1], 'The phase portrait is drawn for systems of two equations.', {}, 10, 20); return; } rhs = (s, u) => fs.map((h) => h!([s, ...u])); }
    g.field((u, v) => { const r = rhs(t0, [u, v]); return [r[0], r[1]]; }, 22, 'viridis');
    const tr = solveAdaptive(rhs, [y0, v0], t0, t0 + T, { maxStep: T / 300 });
    g.path(tr.y.map((p) => [p[0], p[1]] as [number, number]), { color: tone(1), width: 2.6 });
    for (const p of work?.marks?.points ?? []) if (p.at.length === 2) g.point([p.at[0], p.at[1]], 5, pointStyle(dark, 3));
    g.handle({ id: 'ic', at: [y0, v0], color: tone(2), onDrag: ([a, b]) => { setParam('icY', +a.toFixed(3)); setParam('icV', +b.toFixed(3)); } });
    return;
  }
  const num = work?.marks?.numeric;
  if (num && num.length) {
    const step = Math.max(1, Math.floor(num.length / 60));
    for (let i = 0; i < num.length; i += step) g.point(num[i], 2.6, { fill: tone(3) });
  }
  const curve = work?.marks?.curve;
  const Y = curve ? f1(curve, t, fixed) : null;
  if (Y) g.fn(Y, { color: tone(0), width: 2.6 }, [t0 - 2, t0 + T + 2]);
  else if (num) g.path(num, { color: tone(0), width: 2.2 });
  g.handle({ id: 'ic', at: [t0, y0], color: tone(2), onDrag: ([a, b]) => { setParam('t0', +a.toFixed(3)); setParam('icY', +b.toFixed(3)); } });
}

function drawPde(g: Graphics, c: DrawCtx) {
  const { an, values, work } = c;
  const fixed = fixedOf(an, values);
  const u = work?.marks?.curve;
  if (!u) return;
  const p = an.classified!.pde!;
  const tt = values.tt ?? 0.2;
  if (p.family === 'laplace' || p.dims === 2) {
    const vars = p.family === 'laplace' ? ['x', 'y'] : ['x', 'y', 't'];
    const f = safe(u, vars, fixed);
    if (!f) return;
    const val = (a: number, b: number) => f(p.family === 'laplace' ? [a, b] : [a, b, tt]);
    let m = 1e-9; for (let i = 0; i < 30; i++) for (let j = 0; j < 30; j++) { const v = val((Math.PI * i) / 29, (Math.PI * j) / 29); if (Number.isFinite(v)) m = Math.max(m, Math.abs(v)); }
    g.heatmap(val, [-m, m], 'coolwarm', 120);
    return;
  }
  const f = safe(u, ['x', 't'], fixed);
  if (!f) return;
  g.fn((x) => f([x, 0]), { color: c.dark ? 'rgba(183,191,205,0.5)' : 'rgba(60,68,86,0.5)', width: 1.4, dash: [5, 4] }, [0, Math.PI]);
  g.fn((x) => f([x, tt]), { color: tone(0), width: 2.8 }, [0, Math.PI]);
  g.text([g.view.x0, g.view.y1], `t = ${+tt.toFixed(3)}   (dashed: t = 0)`, { color: tone(0) }, 10, 18);
}

// ── 3D ──────────────────────────────────────────────────────────────────────

export function needs3D(c: DrawCtx, visual: Visual | null): boolean {
  if (visual) return visual.k === 'rows' && visual.vars.length === 3;
  if (c.an.kind === 'system') return c.an.system!.vars.length === 3;
  return c.an.vizes.find((v) => v.id === c.viz)?.dim === 3;
}

/**
 * Build one layer of the 3D scene. 'static' is what depends only on the problem
 * and its typed parameters (the surface, curve, field, planes of a system);
 * 'dynamic' is what follows the point sliders (the point, tangent plane,
 * gradient, velocity). Returns the handles so a layer can be replaced alone.
 */
function heights(f: Fn, R: number): number[] {
  const zs: number[] = [];
  for (let i = 0; i <= 30; i++) for (let j = 0; j <= 30; j++) { const v = f([-R + (2 * R * i) / 30, -R + (2 * R * j) / 30]); if (Number.isFinite(v)) zs.push(v); }
  return zs.sort((a, b) => a - b);
}
/** The half-width of the square a surface is drawn over: 3, or less if the surface is very steep there. */
export function surfaceHalfWidth(f: Fn): number {
  for (const R of [3, 2.5, 2, 1.5]) {
    const zs = heights(f, R);
    if (!zs.length) continue;
    const span = zs[Math.floor(zs.length * 0.97)] - zs[Math.floor(zs.length * 0.03)];
    if (span <= 1.6 * 2 * R) return R;
  }
  return 1;
}

export function build3D(view: Viewport3D, c: DrawCtx, visual: Visual | null, part: 'static' | 'dynamic'): Handle[] {
  const { an, values, work, setParam } = c;
  const fixed = fixedOf(an, values);
  const H: Handle[] = [];
  const keep = <T extends Handle>(h: T): T => { H.push(h); return h; };
  const S = part === 'static', D = part === 'dynamic';
  const R = 3;
  const setB = (b: Bounds) => { const cur = view.getBounds(); if (JSON.stringify(cur) !== JSON.stringify(b)) { view.setBounds(b); view.resetCamera(); } };
  if ((visual?.k === 'rows') || an.kind === 'system') {
    if (!S) return H;
    const rows = visual?.k === 'rows' ? visual.rows : an.system!.A.map((r, i) => [...r, an.system!.b[i]]);
    const sol = (visual?.k === 'rows' ? visual.solution : null) ?? (work?.marks?.points?.[0]?.at as number[] | undefined) ?? null;
    const ctr: V3 = sol && sol.length === 3 && sol.every(Number.isFinite) ? [sol[0], sol[1], sol[2]] : [0, 0, 0];
    setB({ x: [ctr[0] - 4, ctr[0] + 4], y: [ctr[1] - 4, ctr[1] + 4], z: [ctr[2] - 4, ctr[2] + 4] });
    rows.forEach((r, i) => {
      const n: V3 = [r[0], r[1], r[2]], k = r[3], nn = n[0] ** 2 + n[1] ** 2 + n[2] ** 2;
      if (nn < 1e-18) return;
      // the point of the plane nearest the centre
      const s = (k - (n[0] * ctr[0] + n[1] * ctr[1] + n[2] * ctr[2])) / nn;
      keep(view.addPlane([ctr[0] + s * n[0], ctr[1] + s * n[1], ctr[2] + s * n[2]], n, 7, { color: tone(i), opacity: 0.4 }));
    });
    if (sol && sol.length === 3 && sol.every(Number.isFinite)) keep(view.addPoint([sol[0], sol[1], sol[2]], { color: '#ffffff', label: 'solution' }));
    return H;
  }
  switch (an.kind) {
    case 'surface': {
      const f = safe(an.exprs[0], an.vars, fixed);
      if (!f) return H;
      if (S) {
        // frame the bulk of the surface (3rd–97th percentile of heights) and cut off the tails beyond it;
        // shrink the domain (down to ±1) while the heights would dwarf it — the axes are never rescaled
        const R = surfaceHalfWidth(f);
        const zs = heights(f, R);
        const lo = zs.length ? zs[Math.floor(zs.length * 0.03)] : -1, hi = zs.length ? zs[Math.floor(zs.length * 0.97)] : 1;
        const zr: [number, number] = [Math.min(lo, 0), Math.max(hi, 0)];
        if (zr[1] - zr[0] < 1e-6) { zr[0] -= 1; zr[1] += 1; }
        const pad = 0.06 * (zr[1] - zr[0]);
        const cut: [number, number] = [zr[0] - pad, zr[1] + pad];
        setB({ x: [-R, R], y: [-R, R], z: zr });
        keep(view.addGraph((u, v) => { const z = f([u, v]); return z >= cut[0] && z <= cut[1] ? z : NaN; }, [-R, R], [-R, R], { res: 80, colormap: 'viridis', opacity: 0.92 }));
        for (const p of work?.marks?.points ?? []) if (work?.task === 'critical' && p.at.length === 3 && p.at.every(Number.isFinite)) keep(view.addPoint([p.at[0], p.at[1], p.at[2]], { color: tone(3), label: p.label }));
      }
      if (D) {
        const px = values.x0 ?? 0.5, py = values.y0 ?? 0.5, pz = f([px, py]);
        let fx = NaN, fy = NaN;
        try { fx = compile(derivative(an.exprs[0], an.vars[0]), an.vars, fixed)([px, py]); fy = compile(derivative(an.exprs[0], an.vars[1]), an.vars, fixed)([px, py]); } catch { /* */ }
        if (Number.isFinite(pz)) {
          keep(view.addPoint([px, py, pz], { color: tone(2), drag: { constrain: ([u, v]) => [u, v, f([u, v])], onDrag: ([u, v]) => { setParam('x0', +u.toFixed(3)); setParam('y0', +v.toFixed(3)); } } }));
          if (Number.isFinite(fx) && Number.isFinite(fy)) {
            keep(view.addPlane([px, py, pz], [-fx, -fy, 1], 2.2, { color: '#b48cff', opacity: 0.45 }));
            const s = Math.min(1.5, Math.hypot(fx, fy)) / Math.max(1e-9, Math.hypot(fx, fy));
            keep(view.addArrow([px, py, pz], [fx * s, fy * s, 0], { color: tone(1), label: '∇f' }));
          }
        }
      }
      return H;
    }
    case 'paramSurface': {
      const fs = an.exprs.map((e) => safe(e, an.vars, fixed));
      if (fs.some((h) => !h)) return H;
      const F = (u: number, v: number): V3 | null => { const p = fs.map((h) => h!([u, v])) as V3; return p.every(Number.isFinite) ? p : null; };
      if (S) {
        let m = 1; for (let i = 0; i <= 20; i++) for (let j = 0; j <= 20; j++) { const p = F((2 * Math.PI * i) / 20, (Math.PI * j) / 20); if (p) m = Math.max(m, ...p.map(Math.abs)); }
        m = Math.min(m * 1.1, 20);
        setB({ x: [-m, m], y: [-m, m], z: [-m, m] });
        keep(view.addSurface(F, { uRange: [0, 2 * Math.PI], vRange: [0, Math.PI], res: 70, colormap: 'viridis', opacity: 0.9 }));
      }
      if (D) {
        const P = F(values.x0 ?? 1, values.y0 ?? 1);
        const a = work?.marks?.arrows?.[0];
        if (P) keep(view.addPoint(P, { color: tone(2) }));
        if (P && a) keep(view.addArrow(P, a.vec as V3, { color: tone(1), label: 'n' }));
      }
      return H;
    }
    case 'curve3d': {
      const fs = an.exprs.map((e) => f1(e, an.vars[0], fixed));
      if (fs.some((h) => !h)) return H;
      if (S) {
        const lo = values.lo ?? 0, hi = values.hi ?? 4 * Math.PI;
        const pts: V3[] = [];
        for (let i = 0; i <= 600; i++) { const t = lo + ((hi - lo) * i) / 600; pts.push(fs.map((h) => h!(t)) as V3); }
        const good = pts.filter((p) => p.every(Number.isFinite));
        const lim = (k: number): [number, number] => { const v = good.map((p) => p[k]); return [Math.min(...v, -1), Math.max(...v, 1)]; };
        setB({ x: lim(0), y: lim(1), z: lim(2) });
        keep(view.addCurve(pts, { color: tone(0) }));
      }
      if (D) {
        const t0 = values.x0 ?? 1, h = 1e-5;
        const P = fs.map((g) => g!(t0)) as V3;
        const V = fs.map((g) => (g!(t0 + h) - g!(t0 - h)) / (2 * h)) as V3;
        if (P.every(Number.isFinite)) {
          keep(view.addPoint(P, { color: tone(2) }));
          if (V.every(Number.isFinite)) keep(view.addArrow(P, V, { color: tone(1), label: 'r′' }));
        }
      }
      return H;
    }
    case 'field3d': {
      const fs = an.exprs.map((e) => safe(e, ['x', 'y', 'z'], fixed));
      if (fs.some((h) => !h)) return H;
      if (S) {
        setB({ x: [-R, R], y: [-R, R], z: [-R, R] });
        keep(view.addVectorField((p) => { const v = fs.map((h) => h!(p)) as V3; return v.every(Number.isFinite) ? v : null; }, { n: 7 }));
      }
      if (D) keep(view.addPoint([values.x0 ?? 1, values.y0 ?? 0.5, values.z0 ?? 0.5], { color: tone(2) }));
      return H;
    }
  }
  return H;
}

/** Does the expression depend on a symbol (used to skip work)? */
export const uses = (n: Node, s: string) => freeSymbols(n).has(s);
