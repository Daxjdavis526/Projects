// Shared helpers for the ODE demonstrations: number formatting, theme-aware
// colours, sampling, CSV and small 2D drawing aids.

import type { DemoCtx } from '../types';
import type { Graphics, View } from '../../engine/plot2d';
import type { Root } from '../../core/numeric/dynamics';

export type P = [number, number];

export const fmt = (v: number, d = 4): string => {
  if (Number.isNaN(v)) return 'undefined';
  if (!Number.isFinite(v)) return v > 0 ? '∞' : '−∞';
  if (v !== 0 && (Math.abs(v) < 1e-4 || Math.abs(v) >= 1e7)) return v.toExponential(Math.max(1, d - 2)).replace('e', '×10^').replace(/\^\+?(-?\d+)/, (_, e) => toSup(e));
  const s = String(+v.toPrecision(d));
  return s === '-0' ? '0' : s.replace(/^-/, '−');
};
const SUP: Record<string, string> = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
const toSup = (e: string) => e.split('').map((c) => SUP[c] ?? c).join('');

/** A number for TeX (keeps a plain minus sign). */
export const tx = (v: number, d = 4): string => {
  if (!Number.isFinite(v)) return v > 0 ? '\\infty' : v < 0 ? '-\\infty' : '\\text{undefined}';
  if (v !== 0 && (Math.abs(v) < 1e-4 || Math.abs(v) >= 1e7)) { const [m, e] = v.toExponential(Math.max(1, d - 2)).split('e'); return `${m}\\times 10^{${+e}}`; }
  const s = String(+v.toPrecision(d));
  return s === '-0' ? '0' : s;
};

export const fmtRoot = (r: Root, d = 4) => (Math.abs(r.im) < 1e-12 ? fmt(r.re, d) : `${fmt(r.re, d)} ${r.im < 0 ? '−' : '+'} ${fmt(Math.abs(r.im), d)}i`);
export const texRoot = (r: Root, d = 4) => (Math.abs(r.im) < 1e-12 ? tx(r.re, d) : `${tx(r.re, d)} ${r.im < 0 ? '-' : '+'} ${tx(Math.abs(r.im), d)}i`);

export interface Palette { blue: string; gold: string; red: string; green: string; violet: string; cyan: string; orange: string; pink: string; ink: string; muted: string; field: string; faint: string; bg: string; fill: (c: string, a: number) => string }

const DARK = { blue: '#6aa9ff', gold: '#f2c14e', red: '#ef6b73', green: '#6fcf97', violet: '#b48cff', cyan: '#4fd1d9', orange: '#ff9f5a', pink: '#e879c6', ink: '#e6e9ef', muted: '#8b93a7', field: '#7d8597', faint: 'rgba(200,210,230,0.28)', bg: '#0d1017' };
const LIGHT = { blue: '#2f6fd6', gold: '#a87400', red: '#d0384a', green: '#1f8a52', violet: '#7446d0', cyan: '#0e8890', orange: '#cf5c12', pink: '#b8337f', ink: '#1b1f2a', muted: '#5b6375', field: '#8a93a6', faint: 'rgba(40,50,70,0.25)', bg: '#f7f8fa' };

export function pal(ctx: DemoCtx): Palette {
  const p = ctx.dark ? DARK : LIGHT;
  return { ...p, fill: (c: string, a: number) => hexA(c, a) };
}
export const hexA = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};
/** the series order used for families of trajectories */
export const seriesOf = (p: Palette) => [p.blue, p.gold, p.green, p.violet, p.cyan, p.orange, p.pink, p.red];

/** Sample y = f(t) at n + 1 points. */
export function sampleFn(f: (t: number) => number, a: number, b: number, n = 400): P[] {
  const out: P[] = [];
  for (let i = 0; i <= n; i++) { const t = a + ((b - a) * i) / n; out.push([t, f(t)]); }
  return out;
}

/** Split a polyline wherever it leaves a generous box or becomes non-finite (asymptotes, blow-up). */
export function clipRuns(pts: P[], lim: number): P[][] {
  const runs: P[][] = [];
  let cur: P[] = [];
  for (const p of pts) {
    if (Number.isFinite(p[0]) && Number.isFinite(p[1]) && Math.abs(p[1]) < lim) cur.push(p);
    else { if (cur.length > 1) runs.push(cur); cur = []; }
  }
  if (cur.length > 1) runs.push(cur);
  return runs;
}

export function drawRuns(g: Graphics, pts: P[], style: Parameters<Graphics['path']>[1], lim = 1e6) {
  for (const r of clipRuns(pts, lim)) g.path(r, style);
}

/** Comma-separated values with a header row. */
export function csvOf(header: string[], rows: number[][]): string {
  return [header.join(','), ...rows.map((r) => r.map((v) => (Number.isFinite(v) ? String(+v.toPrecision(12)) : '')).join(','))].join('\n');
}

/** The demo's local clock: the timeline time wrapped into [0, T). */
export const loopTime = (t: number, T: number) => (T > 0 ? ((t % T) + T) % T : 0);

/** A text label with a halo-free small font, in math coordinates. */
export function label(g: Graphics, at: P, text: string, color: string, opts: { align?: CanvasTextAlign; baseline?: CanvasTextBaseline; dx?: number; dy?: number; size?: number; bold?: boolean } = {}) {
  g.text(at, text, { color, font: `${opts.bold ? '600 ' : ''}${opts.size ?? 12}px Inter, system-ui, sans-serif`, align: opts.align ?? 'left', baseline: opts.baseline ?? 'middle' }, opts.dx ?? 0, opts.dy ?? 0);
}

/** A view that fits the given ranges, with a margin. */
export function fitView(x: [number, number], y: [number, number], m = 0.06): View {
  const dx = (x[1] - x[0]) || 1, dy = (y[1] - y[0]) || 1;
  return { x0: x[0] - dx * m, x1: x[1] + dx * m, y0: y[0] - dy * m, y1: y[1] + dy * m };
}

/** min/max of the finite values */
export function range(vals: number[], clampAbs = Infinity): [number, number] {
  let lo = Infinity, hi = -Infinity;
  for (const v of vals) if (Number.isFinite(v) && Math.abs(v) <= clampAbs) { if (v < lo) lo = v; if (v > hi) hi = v; }
  if (lo === Infinity) return [-1, 1];
  if (hi - lo < 1e-9) { lo -= 1; hi += 1; }
  return [lo, hi];
}

/** Remember a key; true when it changed (to re-frame a view only when the problem changes, not on every slider move). */
export function changed(): (key: string) => boolean {
  let last = '';
  return (key: string) => { if (key === last) return false; last = key; return true; };
}

/**
 * At most `max` points of a polyline (every k-th, keeping the last). Plot2D
 * reads the canvas size for every point it paints, so animated demos keep
 * their per-frame point count modest.
 */
export function thin<T>(pts: T[], max = 400): T[] {
  if (pts.length <= max) return pts;
  const k = Math.ceil(pts.length / max), out: T[] = [];
  for (let i = 0; i < pts.length; i += k) out.push(pts[i]);
  if (out[out.length - 1] !== pts[pts.length - 1]) out.push(pts[pts.length - 1]);
  return out;
}
