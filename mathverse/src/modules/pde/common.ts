// Shared helpers for the PDE demonstrations: number formatting, theme-aware
// colours, colour-mapped images built once (not per pixel per frame), boundary
// symbols for rods, and a small simulation clock.

import type { DemoCtx } from '../types';
import type { Graphics } from '../../engine/plot2d';
import { colormap, Colormap } from '../../engine/colors';

export type P = [number, number];

const SUP: Record<string, string> = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
/** A number for readouts: significant digits, a real minus sign, ×10ⁿ for the very small or large. */
export const fmt = (v: number, d = 4): string => {
  if (Number.isNaN(v)) return 'undefined';
  if (!Number.isFinite(v)) return v > 0 ? '∞' : '−∞';
  if (v !== 0 && (Math.abs(v) < 1e-4 || Math.abs(v) >= 1e7)) {
    const [m, e] = v.toExponential(Math.max(1, d - 2)).split('e');
    return `${m.replace(/^-/, '−')}×10${String(+e).split('').map((c) => SUP[c] ?? c).join('')}`;
  }
  const s = String(+v.toPrecision(d));
  return s === '-0' ? '0' : s.replace(/^-/, '−');
};
/** A number inside TeX. */
export const tx = (v: number, d = 4): string => {
  if (!Number.isFinite(v)) return v > 0 ? '\\infty' : '-\\infty';
  if (v !== 0 && (Math.abs(v) < 1e-4 || Math.abs(v) >= 1e7)) { const [m, e] = v.toExponential(Math.max(1, d - 2)).split('e'); return `${m}\\times 10^{${+e}}`; }
  const s = String(+v.toPrecision(d));
  return s === '-0' ? '0' : s;
};

export interface Palette { blue: string; gold: string; red: string; green: string; violet: string; cyan: string; orange: string; pink: string; ink: string; muted: string; faint: string; grid: string; bg: string }
const DARK: Palette = { blue: '#6aa9ff', gold: '#f2c14e', red: '#ef6b73', green: '#6fcf97', violet: '#b48cff', cyan: '#4fd1d9', orange: '#ff9f5a', pink: '#e879c6', ink: '#e6e9ef', muted: '#8b93a7', faint: 'rgba(200,210,230,0.35)', grid: 'rgba(200,210,230,0.12)', bg: '#0d1017' };
const LIGHT: Palette = { blue: '#2f6fd6', gold: '#a87400', red: '#d0384a', green: '#1f8a52', violet: '#7446d0', cyan: '#0e8890', orange: '#cf5c12', pink: '#b8337f', ink: '#1b1f2a', muted: '#5b6375', faint: 'rgba(40,50,70,0.35)', grid: 'rgba(40,50,70,0.12)', bg: '#f7f8fa' };
export const pal = (ctx: DemoCtx): Palette => (ctx.dark ? DARK : LIGHT);

/** '#rrggbb' with alpha → rgba() */
export const alpha = (hex: string, a: number) => {
  const h = hex.replace('#', '');
  return `rgba(${parseInt(h.slice(0, 2), 16)},${parseInt(h.slice(2, 4), 16)},${parseInt(h.slice(4, 6), 16)},${a})`;
};

const LUTS = new Map<Colormap, Uint8ClampedArray>();
/** 256 RGB entries of a colormap, built once. */
export function lut(name: Colormap): Uint8ClampedArray {
  let l = LUTS.get(name);
  if (!l) {
    l = new Uint8ClampedArray(256 * 3);
    for (let i = 0; i < 256; i++) { const c = colormap(name, i / 255); l[3 * i] = c.r * 255; l[3 * i + 1] = c.g * 255; l[3 * i + 2] = c.b * 255; }
    LUTS.set(name, l);
  }
  return l;
}

/** A diverging map whose middle is the page background: blue (negative) → background → red (positive). */
const DIV = new Map<boolean, Uint8ClampedArray>();
export function divergingLut(dark: boolean): Uint8ClampedArray {
  let l = DIV.get(dark);
  if (!l) {
    l = new Uint8ClampedArray(256 * 3);
    const stops = dark ? [[95, 160, 255], [40, 80, 170], [16, 20, 30], [190, 60, 60], [255, 150, 110]] : [[30, 70, 190], [110, 150, 230], [246, 247, 250], [230, 120, 110], [170, 20, 30]];
    for (let i = 0; i < 256; i++) {
      const x = (i / 255) * (stops.length - 1), k = Math.min(stops.length - 2, Math.floor(x)), f = x - k;
      for (let ch = 0; ch < 3; ch++) l[3 * i + ch] = stops[k][ch] + (stops[k + 1][ch] - stops[k][ch]) * f;
    }
    DIV.set(dark, l);
  }
  return l;
}

/**
 * A colour-mapped image: value(i, j) for column i (left → right) and row j
 * (bottom → top), mapped from [lo, hi]. NaN is transparent. Reuses `img` when
 * its size matches.
 */
export function heatImage(w: number, h: number, value: (i: number, j: number) => number, lo: number, hi: number, cmap: Colormap | Uint8ClampedArray, img?: ImageData | null): ImageData {
  const out = img && img.width === w && img.height === h ? img : new ImageData(w, h);
  const L = typeof cmap === 'string' ? lut(cmap) : cmap, d = out.data, span = hi - lo || 1;
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const v = value(i, h - 1 - j);
    const k = 4 * (j * w + i);
    if (!Number.isFinite(v)) { d[k + 3] = 0; continue; }
    const c = 3 * Math.max(0, Math.min(255, Math.round(((v - lo) / span) * 255)));
    d[k] = L[c]; d[k + 1] = L[c + 1]; d[k + 2] = L[c + 2]; d[k + 3] = 255;
  }
  return out;
}

/** CSS colour of a colormap value in [0, 1]. */
export function cmapCss(name: Colormap, t: number): string {
  const L = lut(name), c = 3 * Math.max(0, Math.min(255, Math.round(t * 255)));
  return `rgb(${L[c]},${L[c + 1]},${L[c + 2]})`;
}

/** A sampled polyline from arrays. */
export const poly = (xs: ArrayLike<number>, ys: ArrayLike<number>, scale = 1): P[] => {
  const out: P[] = [];
  for (let i = 0; i < xs.length; i++) if (Number.isFinite(ys[i])) out.push([xs[i], ys[i] * scale]);
  return out;
};

/** A function sampled on [a, b]. */
export const sample = (f: (x: number) => number, a: number, b: number, n = 400): P[] => {
  const out: P[] = [];
  for (let i = 0; i <= n; i++) { const x = a + ((b - a) * i) / n; const y = f(x); if (Number.isFinite(y)) out.push([x, y]); }
  return out;
};

export type EndKind = 'dirichlet' | 'neumann' | 'robin' | 'periodic' | 'free' | 'fixed';
/**
 * Draw what an end condition means at x = at (side −1 = left end, +1 = right):
 * a clamp for Dirichlet/fixed, an insulating hatch for Neumann/free, heat
 * leaving for Robin, a loop for periodic.
 */
export function drawEnd(g: Graphics, kind: EndKind, at: number, side: -1 | 1, y0: number, y1: number, c: Palette, label?: string) {
  const v = g.view, w = (v.x1 - v.x0) * 0.018;
  const x = at + side * w * 0.6;
  if (kind === 'dirichlet' || kind === 'fixed') {
    g.polygon([[x, y0], [x + side * w, y0], [x + side * w, y1], [x, y1]], { fill: alpha(c.muted, 0.45), color: c.muted, width: 1 });
  } else if (kind === 'neumann' || kind === 'free') {
    const n = 8;
    for (let k = 0; k <= n; k++) { const y = y0 + ((y1 - y0) * k) / n; g.line([x, y], [x + side * w, y + (y1 - y0) / n], { color: c.muted, width: 1 }); }
    g.line([x, y0], [x, y1], { color: c.muted, width: 2 });
  } else if (kind === 'robin') {
    g.line([x, y0], [x, y1], { color: c.cyan, width: 2, dash: [4, 3] });
    for (let k = 1; k <= 3; k++) { const y = y0 + ((y1 - y0) * k) / 4; g.arrow([x, y], [x + side * w * 2.2, y], { color: c.cyan, width: 1.5 }); }
  } else if (kind === 'periodic') {
    g.line([x, y0], [x, y1], { color: c.violet, width: 2, dash: [2, 3] });
  }
  if (label) g.text([at, y1], label, { color: c.muted, font: '12px Inter, system-ui, sans-serif', align: side < 0 ? 'left' : 'right', baseline: 'bottom' }, side < 0 ? 4 : -4, -4);
}

/**
 * A simulation clock: the timeline's dt (seconds, already speed-scaled) is
 * mapped to simulated time at `rate` units per second, and the solver is
 * stepped with its own fixed step. Caps the work per frame and says when it
 * had to fall behind.
 */
export function advance(dtReal: number, rate: number, stepDt: number, maxSteps: number, step: () => void, state: { lag: number }): { steps: number; behind: boolean } {
  state.lag += dtReal * rate;
  let steps = 0;
  while (state.lag >= stepDt && steps < maxSteps) { step(); state.lag -= stepDt; steps++; }
  const behind = state.lag >= stepDt;
  if (behind) state.lag = 0;            // drop the backlog: the picture slows down rather than stutters
  return { steps, behind };
}

/** CSV from columns. */
export const csv = (header: string[], rows: ArrayLike<number>[]): string => {
  const n = Math.max(0, ...rows.map((r) => r.length));
  const out = [header.join(',')];
  for (let i = 0; i < n; i++) out.push(rows.map((r) => (i < r.length ? String(r[i]) : '')).join(','));
  return out.join('\n');
};

export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
