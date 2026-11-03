// Shared pieces of the differential-geometry demos: the catalogue of surfaces
// (each a formula r(u, v) in the shape parameters a and b, differentiated
// symbolically once), atlases, a surface mesh that recolours by curvature, a
// colour bar, picking a point of the surface under the mouse, and formatting.

import { parse, Node, freeSymbols, evaluate, toTeX } from '../../core/expr';
import {
  symbolicSurface, compileSurface, Surface, SymbolicSurface, Chart, V2, V3, localGeometry, LocalGeometry,
} from '../../core/numeric/geometry';
import type { Viewport3D, SurfaceHandle, PointHandle } from '../../engine/viewport3d';
import * as THREE from 'three';
import { colormapCss, Colormap } from '../../engine/colors';
import type { ChoiceSpec, DemoCtx } from '../types';
import type { ParamSpec } from '../../core/input/classify';

// ── formatting ─────────────────────────────────────────────────────────────
export const fmt = (x: number, d = 4): string => {
  if (!Number.isFinite(x)) return Number.isNaN(x) ? 'undefined' : x > 0 ? '∞' : '−∞';
  if (x !== 0 && Math.abs(x) < 1e-4) return x.toExponential(Math.max(0, d - 2)).replace('-', '−');
  const s = String(+x.toPrecision(d));
  return (Math.abs(+s) < 1e-15 ? '0' : s).replace('-', '−');
};
/** a number for TeX (scientific notation as ×10^) */
export const tx = (x: number, d = 4): string => {
  if (!Number.isFinite(x)) return Number.isNaN(x) ? '\\text{undef.}' : x > 0 ? '\\infty' : '-\\infty';
  if (x !== 0 && (Math.abs(x) < 1e-4 || Math.abs(x) >= 1e6)) { const [m, e] = x.toExponential(Math.max(0, d - 2)).split('e'); return `${m}\\times10^{${+e}}`; }
  const s = String(+x.toPrecision(d));
  return Math.abs(+s) < 1e-15 ? '0' : s;
};
export const vecTeX = (v: ArrayLike<number>, d = 3) => `(${Array.from(v).map((x) => tx(x, d)).join(',\\ ')})`;
export const matTeX = (M: number[][], d = 4) => {
  const big = Math.max(1e-300, ...M.flat().filter(Number.isFinite).map(Math.abs));
  return `\\begin{pmatrix}${M.map((r) => r.map((x) => tx(Math.abs(x) < 1e-12 * big ? 0 : x, d)).join(' & ')).join(' \\\\ ')}\\end{pmatrix}`;
};
export const wrapPi = (x: number) => Math.atan2(Math.sin(x), Math.cos(x));
export const deg = (x: number) => `${fmt((x * 180) / Math.PI, 4)}°`;

// ── the surface catalogue ──────────────────────────────────────────────────
export interface SurfDef {
  id: string;
  label: string;
  /** r(u, v) in the shape parameters a, b */
  src: string;
  tex: string;
  /** what a and b mean here ('' when unused) */
  aMeans: string; bMeans: string;
  u: (a: number, b: number) => [number, number];
  v: (a: number, b: number) => [number, number];
  periodicU?: boolean; periodicV?: boolean;
  /** a good default point */
  start: V2;
  /** exact curvature, for comparison (TeX and a function) */
  Ktex?: string;
  K?: (u: number, v: number, a: number, b: number) => number;
  Htex?: string;
  /** surfaces of revolution: which coordinate is the angle about the axis, and ρ(u, v) the distance from the axis */
  rot?: 'u' | 'v';
  rho?: (u: number, v: number, a: number, b: number) => number;
  /** an extra chart (a rotated copy) and the inverses that make the pair an atlas */
  atlas?: { src: string; inverse1: (p: V3, a: number, b: number) => V2 | null; inverse2: (p: V3, a: number, b: number) => V2 | null; quality: (u: number, v: number) => number };
  /** the shape is closed (compact without boundary): Gauss–Bonnet gives χ */
  closed?: { chi: number; genus: number };
}

const acos1 = (x: number) => Math.acos(Math.max(-1, Math.min(1, x)));

export const SURFACES: SurfDef[] = [
  { id: 'sphere', label: 'Sphere', src: '(a sin(u) cos(v), a sin(u) sin(v), a cos(u))', tex: '\\mathbf r = a(\\sin u\\cos v,\\ \\sin u\\sin v,\\ \\cos u)', aMeans: 'radius', bMeans: '',
    u: () => [0, Math.PI], v: () => [-Math.PI, Math.PI], periodicV: true, start: [1.0, -0.7], Ktex: 'K = 1/a^2', K: (_u, _v, a) => 1 / (a * a), Htex: 'H = -1/a', rot: 'v', rho: (u, _v, a) => a * Math.sin(u),
    atlas: { src: '(a cos(u), a sin(u) cos(v), a sin(u) sin(v))', inverse1: (p, a) => [acos1(p[2] / a), Math.atan2(p[1], p[0])], inverse2: (p, a) => [acos1(p[0] / a), Math.atan2(p[2], p[1])], quality: (u) => Math.sin(u) },
    closed: { chi: 2, genus: 0 } },
  { id: 'torus', label: 'Torus', src: '((a + b cos(v)) cos(u), (a + b cos(v)) sin(u), b sin(v))', tex: '\\mathbf r = ((a + b\\cos v)\\cos u,\\ (a + b\\cos v)\\sin u,\\ b\\sin v)', aMeans: 'distance to the tube centre', bMeans: 'tube radius',
    u: () => [-Math.PI, Math.PI], v: () => [-Math.PI, Math.PI], periodicU: true, periodicV: true, start: [-0.6, 0.6], Ktex: 'K = \\dfrac{\\cos v}{b(a + b\\cos v)}', K: (_u, v, a, b) => Math.cos(v) / (b * (a + b * Math.cos(v))), Htex: 'H = -\\dfrac{a + 2b\\cos v}{2b(a+b\\cos v)}', rot: 'u', rho: (_u, v, a, b) => a + b * Math.cos(v),
    closed: { chi: 0, genus: 1 } },
  { id: 'saddle', label: 'Saddle (hyperbolic paraboloid)', src: '(u, v, b (u^2 - v^2))', tex: '\\mathbf r = (u,\\ v,\\ b(u^2 - v^2))', aMeans: 'half-width of the patch', bMeans: 'steepness',
    u: (a) => [-a, a], v: (a) => [-a, a], start: [0.35, -0.25], Ktex: 'K = \\dfrac{-4b^2}{(1 + 4b^2(u^2+v^2))^2}', K: (u, v, _a, b) => (-4 * b * b) / (1 + 4 * b * b * (u * u + v * v)) ** 2 },
  { id: 'cylinder', label: 'Cylinder', src: '(a cos(u), a sin(u), v)', tex: '\\mathbf r = (a\\cos u,\\ a\\sin u,\\ v)', aMeans: 'radius', bMeans: '',
    u: () => [-Math.PI, Math.PI], v: () => [-2, 2], periodicU: true, start: [0.3, -0.6], Ktex: 'K = 0', K: () => 0, Htex: 'H = -1/(2a)', rot: 'u', rho: (_u, _v, a) => a },
  { id: 'cone', label: 'Cone', src: '(v cos(u), v sin(u), b v)', tex: '\\mathbf r = (v\\cos u,\\ v\\sin u,\\ b\\,v)', aMeans: 'slant extent (v ≤ a)', bMeans: 'slope (half-angle α: tan α = 1/b)',
    u: () => [-Math.PI, Math.PI], v: (a) => [0, a], periodicU: true, start: [0.3, 1.1], Ktex: 'K = 0 \\ (\\text{apex: a conical singularity})', K: () => 0, rot: 'u', rho: (_u, v) => v },
  { id: 'catenoid', label: 'Catenoid', src: '(a cosh(v) cos(u), a cosh(v) sin(u), a v)', tex: '\\mathbf r = a(\\cosh v\\cos u,\\ \\cosh v\\sin u,\\ v)', aMeans: 'neck radius', bMeans: '',
    u: () => [-Math.PI, Math.PI], v: () => [-1.3, 1.3], periodicU: true, start: [0.3, 0.35], Ktex: 'K = -\\dfrac{1}{a^2\\cosh^4 v}', K: (_u, v, a) => -1 / (a * a * Math.cosh(v) ** 4), Htex: 'H = 0 \\ (\\text{minimal})', rot: 'u', rho: (_u, v, a) => a * Math.cosh(v) },
  { id: 'helicoid', label: 'Helicoid', src: '(a sinh(v) sin(u), -a sinh(v) cos(u), a u)', tex: '\\mathbf r = a(\\sinh v\\sin u,\\ -\\sinh v\\cos u,\\ u)', aMeans: 'scale', bMeans: '',
    u: () => [-Math.PI, Math.PI], v: () => [-1.3, 1.3], start: [0.3, 0.35], Ktex: 'K = -\\dfrac{1}{a^2\\cosh^4 v}', K: (_u, v, a) => -1 / (a * a * Math.cosh(v) ** 4), Htex: 'H = 0 \\ (\\text{minimal})' },
  { id: 'pseudosphere', label: 'Pseudosphere (K = −1/a²)', src: '(a cos(v) / cosh(u), a sin(v) / cosh(u), a (u - tanh(u)))', tex: '\\mathbf r = a(\\operatorname{sech} u\\cos v,\\ \\operatorname{sech} u\\sin v,\\ u - \\tanh u)', aMeans: 'radius of the rim', bMeans: '',
    u: () => [0.06, 3.2], v: () => [-Math.PI, Math.PI], periodicV: true, start: [0.9, 0.3], Ktex: 'K = -1/a^2', K: (_u, _v, a) => -1 / (a * a), rot: 'v', rho: (u, _v, a) => a / Math.cosh(u) },
  { id: 'bump', label: 'Gaussian bump', src: '(u, v, b exp(-(u^2 + v^2)))', tex: '\\mathbf r = (u,\\ v,\\ b\\,e^{-(u^2+v^2)})', aMeans: 'half-width of the patch', bMeans: 'height of the bump',
    u: (a) => [-a, a], v: (a) => [-a, a], start: [-1.6, -0.5] },
  { id: 'plane', label: 'Plane', src: '(u, v, 0)', tex: '\\mathbf r = (u,\\ v,\\ 0)', aMeans: 'half-width of the patch', bMeans: '',
    u: (a) => [-a, a], v: (a) => [-a, a], start: [0.3, -0.2], Ktex: 'K = 0', K: () => 0, Htex: 'H = 0' },
  { id: 'polarplane', label: 'Plane in polar coordinates', src: '(u cos(v), u sin(v), 0)', tex: '\\mathbf r = (u\\cos v,\\ u\\sin v,\\ 0)', aMeans: 'outer radius', bMeans: '',
    u: (a) => [0, a], v: () => [-Math.PI, Math.PI], periodicV: true, start: [1.2, 0.5], Ktex: 'K = 0', K: () => 0, Htex: 'H = 0', rot: 'v', rho: (u) => u },
  { id: 'custom', label: 'Your surface r(u, v) — type it below', src: '', tex: '', aMeans: 'used if your formula contains a', bMeans: 'used if your formula contains b',
    u: () => [-1.5, 1.5], v: () => [-1.5, 1.5], start: [0.4, 0.3] },
];
export const byId = new Map(SURFACES.map((s) => [s.id, s]));

export function surfaceChoice(value = 'sphere', only?: string[]): ChoiceSpec {
  return { key: 'surface', label: 'Surface', value, options: SURFACES.filter((s) => !only || only.includes(s.id)).map((s) => [s.id, s.label] as [string, string]) };
}
export const SHAPE_PARAMS: ParamSpec[] = [
  { key: 'a', label: 'shape a', value: 1.5, min: 0.3, max: 3, step: 0.01 },
  { key: 'b', label: 'shape b', value: 0.6, min: 0.05, max: 2, step: 0.01 },
];
export const POINT_PARAMS: ParamSpec[] = [
  { key: 'pu', label: 'u of the point (drag it)', value: 1.05, min: -3.2, max: 3.2, step: 0.005 },
  { key: 'pv', label: 'v of the point', value: 0.5, min: -3.2, max: 3.2, step: 0.005 },
];
export const CUSTOM_INPUT = { label: 'r(u, v) =', value: 'r(u,v) = (u, v, (u^3 - 3u v^2)/3); u in [-1.4, 1.4]; v in [-1.4, 1.4]', placeholder: '(x(u,v), y(u,v), z(u,v)); u in [lo, hi]; v in [lo, hi]' };

// ── building a surface from the controls ───────────────────────────────────
export interface Built {
  def: SurfDef;
  S: Surface;
  charts: Chart[];
  u: [number, number]; v: [number, number];
  a: number; b: number;
  /** a size for arrows and markers */
  scale: number;
  /** changes whenever the geometry changes */
  key: string;
  tex: string;
  /** a problem with the typed surface (the previous good one is kept) */
  error: string;
}

const symCache = new Map<string, SymbolicSurface>();
function symbolic(src: string): SymbolicSurface {
  let s = symCache.get(src);
  if (!s) {
    const n = parse(src);
    if (n.t !== 'tuple' || n.items.length !== 3) throw new Error('Type three components: (x(u,v), y(u,v), z(u,v))');
    const extra = [...freeSymbols(n)].filter((x) => !['u', 'v', 'a', 'b'].includes(x));
    if (extra.length) throw new Error(`Use only u, v and the shape parameters a, b — “${extra[0]}” has no value`);
    s = symbolicSurface(n.items as Node[]);
    symCache.set(src, s);
  }
  return s;
}

/** Parse “r(u,v) = (…); u in [lo, hi]; v in [lo, hi]”. */
export function parseCustom(input: string): { src: string; u: [number, number]; v: [number, number] } {
  const parts = input.split(';').map((s) => s.trim()).filter(Boolean);
  let src = (parts.shift() ?? '').replace(/^\s*r\s*\(\s*u\s*,\s*v\s*\)\s*=\s*/, '').replace(/^\s*r\s*=\s*/, '');
  let u: [number, number] = [-1.5, 1.5], v: [number, number] = [-1.5, 1.5];
  for (const p of parts) {
    const m = /^([uv])\s*(?:in|∈|:|=)\s*\[(.+),(.+)\]$/.exec(p);
    if (!m) throw new Error(`Write the domain as “u in [lo, hi]” — could not read “${p}”`);
    const lo = evaluate(parse(m[2])), hi = evaluate(parse(m[3]));
    if (!(Number.isFinite(lo) && Number.isFinite(hi) && hi > lo)) throw new Error(`The interval for ${m[1]} must have lo < hi`);
    if (m[1] === 'u') u = [lo, hi]; else v = [lo, hi];
  }
  src = src.trim();
  return { src, u, v };
}

const builtCache = new Map<string, Built>();
let lastGoodCustom: Built | null = null;

/** The surface the controls describe (cached; recompiled only when a, b, the choice or the formula change). */
export function buildSurface(id: string, a: number, b: number, input = ''): Built {
  const def = byId.get(id) ?? SURFACES[0];
  const key = `${def.id}|${a}|${b}|${def.id === 'custom' ? input : ''}`;
  const hit = builtCache.get(key);
  if (hit) return hit;
  let built: Built;
  if (def.id === 'custom') {
    try {
      const c = parseCustom(input);
      const S = compileSurface(symbolic(c.src), { a, b });
      const chart: Chart = { surface: S, u: c.u, v: c.v };
      built = { def, S, charts: [chart], u: c.u, v: c.v, a, b, scale: 1, key, tex: `\\mathbf r(u,v) = ${texOf(c.src)}`, error: '' };
      built.scale = sizeOf(built);
      const probe = S.r((c.u[0] + c.u[1]) / 2, (c.v[0] + c.v[1]) / 2);
      if (!probe.every(Number.isFinite)) throw new Error('The surface is undefined in the middle of its domain');
      lastGoodCustom = built;
    } catch (e) {
      const msg = (e as Error).message;
      if (lastGoodCustom) return { ...lastGoodCustom, error: msg };
      const fallback = buildSurface('plane', 1.5, b);
      return { ...fallback, error: msg };
    }
  } else {
    const S = compileSurface(symbolic(def.src), { a, b });
    const U = def.u(a, b), V = def.v(a, b);
    const c1: Chart = { surface: S, u: U, v: V, periodicU: def.periodicU, periodicV: def.periodicV };
    const charts = [c1];
    if (def.atlas) {
      const at = def.atlas;
      c1.quality = at.quality; c1.inverse = (p) => at.inverse1(p, a, b);
      charts.push({ surface: compileSurface(symbolic(at.src), { a, b }), u: U, v: V, periodicU: def.periodicU, periodicV: def.periodicV, quality: at.quality, inverse: (p) => at.inverse2(p, a, b) });
    }
    built = { def, S, charts, u: U, v: V, a, b, scale: 1, key, tex: def.tex, error: '' };
    built.scale = sizeOf(built);
  }
  if (builtCache.size > 60) builtCache.clear();
  builtCache.set(key, built);
  return built;
}

function texOf(src: string): string {
  try { return toTeX(parse(src)); } catch { return src; }
}

function sizeOf(b: Built): number {
  let m = 0.5;
  for (let i = 0; i <= 12; i++) for (let j = 0; j <= 12; j++) {
    const p = b.S.r(b.u[0] + ((b.u[1] - b.u[0]) * i) / 12, b.v[0] + ((b.v[1] - b.v[0]) * j) / 12);
    if (p.every(Number.isFinite)) m = Math.max(m, Math.abs(p[0]), Math.abs(p[1]), Math.abs(p[2]));
  }
  return Math.min(m, 50);
}

/** Read the surface controls of a demo (choice 'surface', params a, b, the input). */
export function surfaceFromCtx(ctx: DemoCtx, id?: string): Built {
  return buildSurface(id ?? ctx.choices.surface ?? 'sphere', ctx.params.a ?? 1.5, ctx.params.b ?? 0.6, ctx.input);
}

/** Clamp (or wrap) a coordinate pair into the surface's domain. */
export function clampUV(b: Built, u: number, v: number): V2 {
  const fix = (x: number, r: [number, number], per?: boolean) => {
    if (per) { const P = r[1] - r[0]; return r[0] + ((((x - r[0]) % P) + P) % P); }
    const lo = Math.min(r[0], r[1]), hi = Math.max(r[0], r[1]), pad = (hi - lo) * 1e-3;
    return Math.min(hi - pad, Math.max(lo + pad, x));
  };
  return [fix(u, b.u, b.def.periodicU), fix(v, b.v, b.def.periodicV)];
}

/** The (u, v) of the surface point nearest p: Gauss–Newton from a guess, a coarse search if that fails. */
export function nearestUV(b: Built, p: V3, guess: V2): V2 {
  const S = b.S, j = new Float64Array(18);
  const refine = (g: V2): [V2, number] => {
    let [u, v] = g;
    for (let it = 0; it < 12; it++) {
      S.jet(u, v, j);
      const d = [p[0] - j[0], p[1] - j[1], p[2] - j[2]];
      const E = j[3] ** 2 + j[4] ** 2 + j[5] ** 2, F = j[3] * j[6] + j[4] * j[7] + j[5] * j[8], G = j[6] ** 2 + j[7] ** 2 + j[8] ** 2;
      const a1 = d[0] * j[3] + d[1] * j[4] + d[2] * j[5], a2 = d[0] * j[6] + d[1] * j[7] + d[2] * j[8];
      const D = E * G - F * F;
      if (!(D > 1e-14)) break;
      let du = (G * a1 - F * a2) / D, dv = (E * a2 - F * a1) / D;
      const lim = 0.5 * Math.max(b.u[1] - b.u[0], b.v[1] - b.v[0]) / 4;
      const m = Math.hypot(du, dv); if (m > lim) { du *= lim / m; dv *= lim / m; }
      [u, v] = clampUV(b, u + du, v + dv);
      if (m < 1e-10) break;
    }
    const q = S.r(u, v);
    return [[u, v], Math.hypot(q[0] - p[0], q[1] - p[1], q[2] - p[2])];
  };
  const [g1, d1] = refine(clampUV(b, guess[0], guess[1]));
  if (d1 < 0.02 * b.scale) return g1;
  let best: V2 = g1, bd = d1;
  for (let i = 0; i <= 30; i++) for (let k = 0; k <= 30; k++) {
    const u = b.u[0] + ((b.u[1] - b.u[0]) * i) / 30, v = b.v[0] + ((b.v[1] - b.v[0]) * k) / 30;
    const q = S.r(u, v);
    const dd = Math.hypot(q[0] - p[0], q[1] - p[1], q[2] - p[2]);
    if (dd < bd) { bd = dd; best = [u, v]; }
  }
  return refine(best)[0];
}

/** Local geometry at a point, with the coordinates clamped into the domain. */
export function geomAt(b: Built, u: number, v: number): LocalGeometry {
  const [uu, vv] = clampUV(b, u, v);
  return localGeometry(b.S, uu, vv);
}

// ── the surface mesh ───────────────────────────────────────────────────────
export type ColorBy = 'K' | 'H' | 'k1' | 'k2' | 'uniform' | 'height' | 'checker';

export class SurfaceMesh {
  handle: SurfaceHandle | null = null;
  private key = '';
  private fitId = '';
  private fitScale = 0;
  range: [number, number] = [0, 0];
  constructor(private v: Viewport3D) {}
  /** Draw (or redraw if anything changed) the surface. Returns the colour range used. */
  set(b: Built, colorBy: ColorBy, opts: { res?: number; opacity?: number; color?: string; fit?: boolean; clipK?: number } = {}): [number, number] {
    const res = opts.res ?? 90;
    const key = `${b.key}|${colorBy}|${res}|${opts.opacity ?? 1}|${opts.color ?? ''}`;
    if (key === this.key && this.handle) return this.range;
    const fitChanged = this.fitId !== b.def.id || Math.abs(b.scale / this.fitScale - 1) > 0.25;
    this.key = key;
    const f = (u: number, v: number): V3 | null => { const p = b.S.r(u, v); return p.every(Number.isFinite) && Math.max(Math.abs(p[0]), Math.abs(p[1]), Math.abs(p[2])) < 1e3 ? p : null; };
    let colorFn: ((p: V3, u: number, v: number) => number) | 'uniform' | 'height' = 'uniform';
    let range: [number, number] | undefined;
    let cmap: Colormap = 'turbo';
    if (colorBy === 'height') colorFn = 'height';
    else if (colorBy === 'checker') { colorFn = (_p, u, v) => (Math.floor((u - b.u[0]) / ((b.u[1] - b.u[0]) / 12)) + Math.floor((v - b.v[0]) / ((b.v[1] - b.v[0]) / 12))) % 2; range = [-0.6, 1.6]; cmap = 'ice'; }
    else if (colorBy !== 'uniform') {
      const val = (u: number, v: number) => { const g = localGeometry(b.S, u, v); return colorBy === 'K' ? g.K : colorBy === 'H' ? g.H : colorBy === 'k1' ? g.k1 : g.k2; };
      // a symmetric range from a robust maximum (curvature blows up at singular points)
      const vals: number[] = [];
      for (let i = 0; i <= 24; i++) for (let k = 0; k <= 24; k++) {
        const x = val(b.u[0] + ((b.u[1] - b.u[0]) * (i + 0.5)) / 25.0, b.v[0] + ((b.v[1] - b.v[0]) * (k + 0.5)) / 25.0);
        if (Number.isFinite(x)) vals.push(Math.abs(x));
      }
      vals.sort((x, y) => x - y);
      let m = vals.length ? vals[Math.floor(vals.length * 0.97)] : 1;
      if (opts.clipK) m = Math.min(m, opts.clipK);
      if (!(m > 1e-9)) m = 1;
      // (nearly) constant curvature: a light tint of the right sign instead of full saturation
      if (vals.length && vals[vals.length - 1] - vals[0] < 0.05 * m) m *= 3;
      range = [-m, m];
      cmap = 'coolwarm';
      colorFn = (_p, u, v) => { const x = val(u, v); return Number.isFinite(x) ? Math.max(-m, Math.min(m, x)) : 0; };
    }
    const so = { uRange: b.u, vRange: b.v, res, colorBy: colorFn, colormap: cmap, colorRange: range, color: opts.color ?? '#7f9fd6', opacity: opts.opacity ?? 1 };
    if (!this.handle) this.handle = this.v.addSurface(f, so); else this.handle.update(f, so);
    if ((opts.fit ?? true) && fitChanged) {
      const first = this.fitId !== b.def.id;
      this.fitId = b.def.id; this.fitScale = b.scale;
      const s = b.scale * 1.08;
      this.v.setBounds({ x: [-s, s], y: [-s, s], z: [-s, s] });
      if (first) this.v.resetCamera();
    }
    this.range = range ?? [0, 0];
    return this.range;
  }
  visible(on: boolean) { this.handle?.visible(on); }
  reset() { this.key = ''; this.fitId = ''; }
}

// ── a colour bar over the 3D view ──────────────────────────────────────────
export class ColorBar {
  private el: HTMLDivElement;
  constructor(v: Viewport3D | { canvas: HTMLCanvasElement }) {
    const host = ('renderer' in v ? v.renderer.domElement : v.canvas).parentElement!;
    this.el = document.createElement('div');
    Object.assign(this.el.style, { position: 'absolute', right: '12px', bottom: '12px', width: '190px', padding: '6px 8px 4px', borderRadius: '8px', background: 'var(--bg2, rgba(20,24,32,.8))', border: '1px solid var(--line, #333)', font: '11px Inter, system-ui, sans-serif', color: 'var(--ink, #ddd)', pointerEvents: 'none', zIndex: '2' });
    host.appendChild(this.el);
  }
  set(title: string, lo: number, hi: number, cmap: Colormap = 'coolwarm', note = '') {
    const stops = Array.from({ length: 9 }, (_, i) => colormapCss(cmap, i / 8)).join(',');
    this.el.style.display = '';
    this.el.innerHTML = `<div style="font-weight:600;margin-bottom:3px">${title}</div><div style="height:9px;border-radius:3px;background:linear-gradient(90deg,${stops})"></div><div style="display:flex;justify-content:space-between;margin-top:2px;opacity:.85"><span>${fmt(lo, 3)}</span><span>0</span><span>${fmt(hi, 3)}</span></div>${note ? `<div style="opacity:.75;margin-top:2px">${note}</div>` : ''}`;
  }
  hide() { this.el.style.display = 'none'; }
  dispose() { this.el.remove(); }
}

/** Points of the coordinate curve through (u0, v0): which = 'u' varies u. */
export function coordCurve(b: Built, which: 'u' | 'v', u0: number, v0: number, n = 160): V3[] {
  const r = which === 'u' ? b.u : b.v;
  const out: V3[] = [];
  for (let i = 0; i <= n; i++) {
    const t = r[0] + ((r[1] - r[0]) * i) / n;
    const p = which === 'u' ? b.S.r(t, v0) : b.S.r(u0, t);
    if (p.every(Number.isFinite)) out.push(p);
  }
  return out;
}

/** p + k n (to lift curves off the surface so they are not hidden in it). */
export const lift = (p: V3, n: V3, k: number): V3 => [p[0] + n[0] * k, p[1] + n[1] * k, p[2] + n[2] * k];

/** Lift a curve given in coordinates off the surface along the normal. */
export function liftedCurve(b: Built, uv: V2[], k: number): V3[] {
  return uv.map(([u, v]) => { const g = localGeometry(b.S, u, v); return g.regular ? lift(g.r, g.n, k) : g.r; });
}

/** Keep a handle list in sync with a desired count (creating/disposing as needed). */
export function pool<T extends { dispose(): void; visible(v: boolean): void }>(list: T[], n: number, make: () => T): T[] {
  while (list.length < n) list.push(make());
  for (let i = 0; i < list.length; i++) list[i].visible(i < n);
  return list;
}

/** Readout row describing the shape parameters. */
export function shapeNote(b: Built): string {
  const parts: string[] = [];
  if (b.def.aMeans) parts.push(`a = ${fmt(b.a, 3)} (${b.def.aMeans})`);
  if (b.def.bMeans) parts.push(`b = ${fmt(b.b, 3)} (${b.def.bMeans})`);
  return parts.join(', ');
}

export const COLORS = { ru: '#ef6b73', rv: '#6fcf97', n: '#6aa9ff', plane: '#b48cff', geo: '#f2c14e', vec: '#ff9f5a', point: '#ffffff', alt: '#4fd1d9', pink: '#e879c6' };

/** A surface from any formula (not in the catalogue): used for deforming families. */
export function adhocSurface(id: string, label: string, src: string, params: Record<string, number>, u: [number, number], v: [number, number], extra: Partial<SurfDef> = {}): Built {
  const S = compileSurface(symbolic(src), params);
  const def: SurfDef = { id, label, src, tex: texOf(src), aMeans: '', bMeans: '', u: () => u, v: () => v, start: [(u[0] + u[1]) / 2, (v[0] + v[1]) / 2], ...extra };
  const b: Built = { def, S, charts: [{ surface: S, u, v, periodicU: def.periodicU, periodicV: def.periodicV }], u, v, a: params.a ?? 0, b: params.b ?? 0, scale: 1, key: `${id}|${JSON.stringify(params)}`, tex: def.tex, error: '' };
  b.scale = sizeOf(b);
  return b;
}


/** A point that can be dragged along the surface; it writes its (u, v) to two sliders. */
export function surfaceDragPoint(v: Viewport3D, ctx: DemoCtx, getBuilt: () => Built, onMove: () => void, opts: { keys?: [string, string]; color?: string; size?: number; label?: string } = {}): PointHandle {
  const [ku, kv] = opts.keys ?? ['pu', 'pv'];
  let last: V2 = [ctx.params[ku], ctx.params[kv]];
  const b0 = getBuilt();
  return v.addPoint(b0.S.r(...clampUV(b0, last[0], last[1])), {
    color: opts.color ?? COLORS.point, size: opts.size ?? b0.scale * 0.045, label: opts.label,
    drag: {
      constrain: (p) => { const b = getBuilt(); last = nearestUV(b, p, [ctx.params[ku], ctx.params[kv]]); return b.S.r(last[0], last[1]); },
      onDrag: () => { ctx.setParam(ku, last[0]); ctx.setParam(kv, last[1]); onMove(); },
    },
  });
}

/** Has the surface choice just changed (and the point not been set with it)? Then move the point to the surface's default spot. */
export function followSurfaceChange(ctx: DemoCtx, state: { id?: string; pu?: number; pv?: number }, b: Built, keys: [string, string] = ['pu', 'pv']) {
  const [ku, kv] = keys;
  // first showing with the generic default point: use this surface's own good spot (facing the camera)
  if (state.id === undefined && ctx.params[ku] === 1.05 && ctx.params[kv] === 0.5) { ctx.setParam(ku, b.def.start[0]); ctx.setParam(kv, b.def.start[1]); }
  if (state.id !== undefined && state.id !== b.def.id && ctx.params[ku] === state.pu && ctx.params[kv] === state.pv) {
    ctx.setParam(ku, b.def.start[0]); ctx.setParam(kv, b.def.start[1]);
  }
  const [u, v] = clampUV(b, ctx.params[ku], ctx.params[kv]);
  state.id = b.def.id; state.pu = ctx.params[ku]; state.pv = ctx.params[kv];
  return [u, v] as V2;
}

/** A parametric surface with per-vertex colours chosen by the demo (categorical maps, chart coverage). */
export function paintedSurface(v: Viewport3D, res: number): { update(f: (u: number, w: number) => V3 | null, col: (u: number, w: number) => [number, number, number], ur: [number, number], vr: [number, number], opacity?: number): void; handle: ReturnType<Viewport3D['addObject']> } {
  const geo = new THREE.PlaneGeometry(1, 1, res, res);
  const mat = new THREE.MeshStandardMaterial({ vertexColors: true, side: THREE.DoubleSide, roughness: 0.6, metalness: 0.05 });
  const mesh = new THREE.Mesh(geo, mat);
  const handle = v.addObject(mesh);
  const n = res + 1;
  const cols = new Float32Array(n * n * 3);
  geo.setAttribute('color', new THREE.BufferAttribute(cols, 3));
  return {
    handle,
    update(f, col, ur, vr, opacity = 1) {
      const pos = geo.attributes.position as THREE.BufferAttribute;
      const valid = new Uint8Array(n * n);
      for (let j = 0; j <= res; j++) for (let i = 0; i <= res; i++) {
        const u = ur[0] + ((ur[1] - ur[0]) * i) / res, w = vr[0] + ((vr[1] - vr[0]) * j) / res, k = j * n + i;
        const p = f(u, w);
        if (!p || !p.every(Number.isFinite)) { pos.setXYZ(k, 0, 0, 0); continue; }
        pos.setXYZ(k, p[0], p[1], p[2]); valid[k] = 1;
        const c = col(u, w); cols[3 * k] = c[0]; cols[3 * k + 1] = c[1]; cols[3 * k + 2] = c[2];
      }
      const index: number[] = [];
      for (let j = 0; j < res; j++) for (let i = 0; i < res; i++) { const a = j * n + i, b = a + 1, c = a + n, d = c + 1; if (valid[a] && valid[b] && valid[c]) index.push(a, c, b); if (valid[b] && valid[c] && valid[d]) index.push(b, c, d); }
      geo.setIndex(index); pos.needsUpdate = true; (geo.attributes.color as THREE.BufferAttribute).needsUpdate = true;
      geo.computeVertexNormals(); geo.computeBoundingSphere();
      mat.opacity = opacity; mat.transparent = opacity < 1; mat.depthWrite = opacity >= 1;
      v.requestRender();
    },
  };
}

/** '#rrggbb' → [r, g, b] in 0…1 (linear-ish, as three.js vertex colours expect sRGB-converted values) */
export function rgb(hex: string): [number, number, number] { const c = new THREE.Color(hex); return [c.r, c.g, c.b]; }
