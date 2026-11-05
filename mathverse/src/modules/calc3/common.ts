// Shared helpers for the Calculus III demos: reading the learner's formulas
// (scalar or vector, with parameters a, b, c), exact symbolic derivatives with
// a labelled numerical fallback, theme-aware colours, and a few three.js
// objects the shared viewport does not provide (line segments, triangle
// meshes, instanced boxes and arrows) — all updated in place, never rebuilt.

import * as THREE from 'three';
import { Node, parse, compile, derivative, freeSymbols, CONSTANTS, NotDifferentiable, simplify, toTeX, Fn } from '../../core/expr';
import type { Viewport3D, V3, Handle, Bounds } from '../../engine/viewport3d';
import type { QuadResult } from '../../core/numeric/quad';
import type { ParamSpec } from '../../core/input/classify';

export type { V3 };

export const fmt = (v: number, d = 4): string => (Number.isFinite(v) ? String(+v.toPrecision(d)) : Number.isNaN(v) ? 'undefined' : v > 0 ? '∞' : '−∞');
/** a numerical result with its error estimate */
export const fmtQ = (r: QuadResult, d = 9): string => `${fmt(r.value, d)} ± ${r.error < 1e-15 ? '1e−15' : r.error.toExponential(1).replace('-', '−')}`;
export const fmtV = (v: ArrayLike<number>, d = 3): string => `(${Array.from(v).map((x) => fmt(x, d)).join(', ')})`;
export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
export const deg = (r: number) => (r * 180) / Math.PI;

/** The slider parameters every demo with typed input may use. */
export const PARAM_NAMES = ['a', 'b'];
export const paramSpecs = (a = 1, b = 1): ParamSpec[] => [
  { key: 'a', label: 'a (a parameter for your formula)', value: a, min: -3, max: 3, step: 0.01 },
  { key: 'b', label: 'b (a parameter for your formula)', value: b, min: -3, max: 3, step: 0.01 },
];
export const paramVals = (p: Record<string, number>): Record<string, number> => ({ a: p.a ?? 1, b: p.b ?? 1 });

/** Remove a leading "f(x, y) =", "z =", "F =" or "r(t) =" from typed input. */
export function stripLhs(src: string): string {
  const m = /^\s*[A-Za-z][A-Za-z0-9_]*\s*(\([^()]*\))?\s*=(?!=)/.exec(src);
  return m ? src.slice(m[0].length) : src;
}

/** Split a vector expression into components: (P, Q), k·(P, Q), (P, Q)/s, −(P, Q), (P, Q) ± (R, S). */
export function components(n: Node): Node[] {
  switch (n.t) {
    case 'tuple': return n.items;
    case 'neg': return components(n.a).map((c) => ({ t: 'neg', a: c }) as Node);
    case 'mul': case 'div': case 'add': case 'sub': {
      const A = components(n.a), B = components(n.b);
      if (A.length === 1 && B.length === 1) return [n];
      if (n.t === 'mul' && A.length === 1) return B.map((b) => ({ t: 'mul', a: n.a, b }) as Node);
      if ((n.t === 'mul' || n.t === 'div') && B.length === 1) return A.map((a) => ({ t: n.t, a, b: n.b }) as Node);
      if ((n.t === 'add' || n.t === 'sub') && A.length === B.length) return A.map((a, i) => ({ t: n.t, a, b: B[i] }) as Node);
      throw new Error('Vectors of different lengths cannot be combined here');
    }
    default: return [n];
  }
}

export interface Parsed { items: Node[]; error?: undefined }
export interface ParseFail { items?: undefined; error: string }

/**
 * Parse the learner's formula in the given variables (and parameters a, b, c).
 * `want` is the number of components required (1 for a scalar). Never throws.
 */
export function readFormula(src: string, vars: string[], want: number, what: string): Parsed | ParseFail {
  const text = stripLhs(src).trim();
  if (!text) return { error: `Type ${what}` };
  let node: Node;
  try { node = parse(text, { names: [...vars, ...PARAM_NAMES] }); }
  catch (e) { return { error: `Cannot read ${what}: ${(e as Error).message}` }; }
  let items: Node[];
  try { items = components(node); } catch (e) { return { error: (e as Error).message }; }
  if (items.length !== want) return { error: want === 1 ? `${what[0].toUpperCase()}${what.slice(1)} should be a single expression, not a vector` : `${what[0].toUpperCase()}${what.slice(1)} needs ${want} components, like (${vars.slice(0, want).join(', ')}) — found ${items.length}` };
  const allowed = new Set([...vars, ...PARAM_NAMES]);
  for (const it of items) {
    for (const s of freeSymbols(it)) if (!allowed.has(s) && !(s in CONSTANTS)) return { error: `“${s}” is not one of ${vars.join(', ')} or a parameter a, b` };
    if (it.t === 'tuple' || it.t === 'matrix') return { error: `Each component of ${what} must be a number-valued expression` };
  }
  return { items };
}

/** Exact symbolic derivative, or null when MathVerse has no formula for a function used (callers then label a numerical one). */
export function dSym(n: Node | null, x: string): Node | null {
  if (!n) return null;
  try { return derivative(n, x); } catch (e) { if (e instanceof NotDifferentiable) return null; throw e; }
}
export const subN = (a: Node, b: Node): Node => simplify({ t: 'sub', a, b });
export const addN = (a: Node, b: Node): Node => simplify({ t: 'add', a, b });
export const texOf = (n: Node | null): string => (n ? toTeX(n) : '\\text{(numerical)}');

/** Compile with parameters; a function of an array of variable values. */
export function fnOf(n: Node, vars: string[], pv: Record<string, number>): Fn { return compile(n, vars, pv); }

/**
 * A partial derivative as a compiled function: exact when the symbolic derivative exists,
 * otherwise a central difference (`exact` reports which).
 */
export function partial(n: Node, d: Node | null, vars: string[], k: number, pv: Record<string, number>): { f: Fn; exact: boolean } {
  if (d) return { f: compile(d, vars, pv), exact: true };
  const f = compile(n, vars, pv);
  const tmp = new Float64Array(vars.length);
  return {
    exact: false,
    f: (v) => {
      for (let i = 0; i < vars.length; i++) tmp[i] = v[i];
      const h = 1e-5 * Math.max(1, Math.abs(v[k]));
      tmp[k] = v[k] + h; const a = f(tmp); tmp[k] = v[k] - h; const b = f(tmp);
      return (a - b) / (2 * h);
    },
  };
}

export interface D2 { f: Fn; fx: Fn; fy: Fn; fxx: Fn; fxy: Fn; fyy: Fn; nx: Node | null; ny: Node | null; nxx: Node | null; nxy: Node | null; nyy: Node | null; exact1: boolean; exact2: boolean }
/** f, its gradient and Hessian in two variables: exact (symbolic) where possible, else central differences (flagged). */
export function derivs2(n: Node, pv: Record<string, number>, vars: [string, string] = ['x', 'y']): D2 {
  const [X, Y] = vars;
  const nx = dSym(n, X), ny = dSym(n, Y);
  const nxx = dSym(nx, X), nxy = dSym(nx, Y), nyy = dSym(ny, Y);
  const f = compile(n, vars, pv);
  const fd1 = (k: 0 | 1): Fn => (v) => { const h = 1e-5 * Math.max(1, Math.abs(v[k])); return k === 0 ? (f([v[0] + h, v[1]]) - f([v[0] - h, v[1]])) / (2 * h) : (f([v[0], v[1] + h]) - f([v[0], v[1] - h])) / (2 * h); };
  const fd2 = (k: 'xx' | 'xy' | 'yy'): Fn => (v) => {
    const h = 1e-4 * Math.max(1, Math.abs(v[0]), Math.abs(v[1])), x = v[0], y = v[1];
    if (k === 'xx') return (f([x + h, y]) - 2 * f([x, y]) + f([x - h, y])) / (h * h);
    if (k === 'yy') return (f([x, y + h]) - 2 * f([x, y]) + f([x, y - h])) / (h * h);
    return (f([x + h, y + h]) - f([x + h, y - h]) - f([x - h, y + h]) + f([x - h, y - h])) / (4 * h * h);
  };
  const c = (m: Node | null, fb: Fn) => (m ? compile(m, vars, pv) : fb);
  return { f, fx: c(nx, fd1(0)), fy: c(ny, fd1(1)), fxx: c(nxx, fd2('xx')), fxy: c(nxy, fd2('xy')), fyy: c(nyy, fd2('yy')), nx, ny, nxx, nxy, nyy, exact1: !!(nx && ny), exact2: !!(nxx && nxy && nyy) };
}

/** Split "A ; B" input into parts (the separator may also be a newline). */
export const splitParts = (src: string): string[] => stripLhs(src).split(/;|\n/).map((s) => s.trim());

/** Curl and divergence of a 3D field, symbolically (null entries when a derivative has no formula). */
export function curlDiv3(F: Node[]): { div: Node | null; curl: (Node | null)[] } {
  const [P, Q, R] = F;
  const d = (n: Node, v: string) => dSym(n, v);
  const Px = d(P, 'x'), Py = d(P, 'y'), Pz = d(P, 'z'), Qx = d(Q, 'x'), Qy = d(Q, 'y'), Qz = d(Q, 'z'), Rx = d(R, 'x'), Ry = d(R, 'y'), Rz = d(R, 'z');
  const both = (a: Node | null, b: Node | null, op: 'add' | 'sub') => (a && b ? simplify({ t: op, a, b }) : null);
  const div = Px && Qy && Rz ? simplify({ t: 'add', a: { t: 'add', a: Px, b: Qy }, b: Rz }) : null;
  return { div, curl: [both(Ry, Qz, 'sub'), both(Pz, Rx, 'sub'), both(Qx, Py, 'sub')] };
}

// ── colours ────────────────────────────────────────────────────────────────
export interface Palette { ink: string; muted: string; faint: string; blue: string; gold: string; red: string; green: string; violet: string; cyan: string; orange: string; pink: string; bg: string }
export function palette(dark: boolean): Palette {
  return dark
    ? { ink: '#e6e9ef', muted: '#8b93a7', faint: 'rgba(160,170,190,0.35)', blue: '#6aa9ff', gold: '#f2c14e', red: '#ef6b73', green: '#6fcf97', violet: '#b48cff', cyan: '#4fd1d9', orange: '#ff9f5a', pink: '#e879c6', bg: '#0d1017' }
    : { ink: '#1b1f2a', muted: '#5b6375', faint: 'rgba(40,50,70,0.3)', blue: '#2f6fd6', gold: '#b7860b', red: '#d1414c', green: '#23935a', violet: '#7c4ddb', cyan: '#138f97', orange: '#d4691f', pink: '#c0399a', bg: '#f7f8fa' };
}

// ── 3D helpers ─────────────────────────────────────────────────────────────

/** Fit the viewport to new bounds when they differ noticeably; re-aim the camera the first time. */
export function fitBounds(v: Viewport3D, b: Bounds, state: { fitted?: boolean }) {
  const cur = v.getBounds();
  const span = Math.max(b.x[1] - b.x[0], b.y[1] - b.y[0], b.z[1] - b.z[0]);
  const diff = Math.max(...(['x', 'y', 'z'] as const).flatMap((k) => [Math.abs(cur[k][0] - b[k][0]), Math.abs(cur[k][1] - b[k][1])]));
  if (diff > span * 0.12 || !state.fitted) { v.setBounds(b); if (!state.fitted) v.resetCamera(); state.fitted = true; }
}

/** Range of f on an n × n grid over a rectangle (finite values only). */
export function rangeOf(f: (x: number, y: number) => number, x0: number, x1: number, y0: number, y1: number, n = 40): [number, number] {
  let lo = Infinity, hi = -Infinity;
  for (let j = 0; j <= n; j++) for (let i = 0; i <= n; i++) {
    const z = f(x0 + ((x1 - x0) * i) / n, y0 + ((y1 - y0) * j) / n);
    if (Number.isFinite(z)) { if (z < lo) lo = z; if (z > hi) hi = z; }
  }
  return Number.isFinite(lo) ? [lo, hi] : [-1, 1];
}

/** Robust z-limits for drawing a graph: the 2nd–98th percentile range, so one spike does not flatten the picture. */
export function zLimits(f: (x: number, y: number) => number, x0: number, x1: number, y0: number, y1: number): [number, number] {
  const vals: number[] = [];
  const n = 40;
  for (let j = 0; j <= n; j++) for (let i = 0; i <= n; i++) { const z = f(x0 + ((x1 - x0) * i) / n, y0 + ((y1 - y0) * j) / n); if (Number.isFinite(z)) vals.push(z); }
  if (!vals.length) return [-1, 1];
  vals.sort((p, q) => p - q);
  const lo = vals[Math.floor(vals.length * 0.02)], hi = vals[Math.ceil(vals.length * 0.98) - 1];
  const pad = Math.max((hi - lo) * 0.25, 1e-3);
  return [Math.max(vals[0], lo - pad), Math.min(vals[vals.length - 1], hi + pad)];
}

export interface Segs { handle: Handle; set(flat: ArrayLike<number>, colors?: ArrayLike<number>): void; setColor(c: string): void }
/** Many straight segments in one draw call: flat [x1,y1,z1, x2,y2,z2, …], optional per-vertex RGB colours. */
export function addSegments(v: Viewport3D, color: string, opacity = 1): Segs {
  const geo = new THREE.BufferGeometry();
  let cap = 0, vc = false;
  const mat = new THREE.LineBasicMaterial({ color, transparent: opacity < 1, opacity });
  const obj = new THREE.LineSegments(geo, mat);
  obj.frustumCulled = false;
  const handle = v.addObject(obj);
  return {
    handle,
    set(flat, colors) {
      const n = Math.floor(flat.length / 3);
      if (n > cap) {
        cap = Math.max(n, cap * 2, 64);
        geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(cap * 3), 3));
        geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(cap * 3).fill(1), 3));
      }
      if (cap) {
        const a = geo.attributes.position as THREE.BufferAttribute; (a.array as Float32Array).set(flat); a.needsUpdate = true;
        if (colors) { (geo.attributes.color.array as Float32Array).set(colors); geo.attributes.color.needsUpdate = true; }
      }
      if (!!colors !== vc) { vc = !!colors; mat.vertexColors = vc; if (vc) mat.color.set('#ffffff'); else mat.color.set(color); mat.needsUpdate = true; }
      geo.setDrawRange(0, n);
      v.requestRender();
    },
    setColor(c) { color = c; if (!vc) mat.color.set(c); v.requestRender(); },
  };
}

export interface Tris { handle: Handle; set(flat: ArrayLike<number>, colors?: ArrayLike<number>): void; setColor(c: string): void; mesh: THREE.Mesh }
/** Triangles (flat positions, 9 numbers each); optional per-vertex colours. Double-sided, translucent when opacity < 1. */
export function addTris(v: Viewport3D, color: string, opacity = 1): Tris {
  const geo = new THREE.BufferGeometry();
  let cap = 0, vc = false;
  const mat = new THREE.MeshStandardMaterial({ color, side: THREE.DoubleSide, transparent: opacity < 1, opacity, depthWrite: opacity >= 1, roughness: 0.6 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.frustumCulled = false;
  const handle = v.addObject(mesh);
  return {
    handle, mesh,
    set(flat, colors) {
      const n = Math.floor(flat.length / 3);
      if (n > cap) {
        cap = Math.max(n, cap * 2, 96);
        geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(cap * 3), 3));
        geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(cap * 3).fill(1), 3));
      }
      if (!cap) return;
      (geo.attributes.position.array as Float32Array).set(flat);
      geo.attributes.position.needsUpdate = true;
      if (colors) { (geo.attributes.color.array as Float32Array).set(colors); geo.attributes.color.needsUpdate = true; }
      if (!!colors !== vc) { vc = !!colors; mat.vertexColors = vc; if (vc) mat.color.set('#ffffff'); mat.needsUpdate = true; }
      geo.setDrawRange(0, n);
      geo.computeVertexNormals();
      v.requestRender();
    },
    setColor(c) { if (!vc) mat.color.set(c); v.requestRender(); },
  };
}

export interface Boxes { handle: Handle; begin(): void; push(center: V3, size: V3, color: THREE.Color, basis?: [V3, V3, V3]): void; end(): void }
/** Instanced boxes (Riemann cells), optionally oriented by an orthonormal basis. */
export function addBoxes(v: Viewport3D, max: number, opacity = 1): Boxes {
  const mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ roughness: 0.55, transparent: opacity < 1, opacity, depthWrite: opacity >= 1 }), max);
  mesh.count = 0;
  mesh.frustumCulled = false;
  const handle = v.addObject(mesh);
  const m4 = new THREE.Matrix4(), rot = new THREE.Matrix4(), pos = new THREE.Vector3(), q = new THREE.Quaternion(), s = new THREE.Vector3();
  let k = 0;
  return {
    handle,
    begin() { k = 0; },
    push(c, size, color, basis) {
      if (k >= max) return;
      if (basis) { rot.makeBasis(new THREE.Vector3(...basis[0]), new THREE.Vector3(...basis[1]), new THREE.Vector3(...basis[2])); q.setFromRotationMatrix(rot); } else q.identity();
      m4.compose(pos.set(c[0], c[1], c[2]), q, s.set(Math.max(size[0], 1e-6), Math.max(size[1], 1e-6), Math.max(size[2], 1e-6)));
      mesh.setMatrixAt(k, m4);
      mesh.setColorAt(k, color);
      k++;
    },
    end() { mesh.count = k; mesh.instanceMatrix.needsUpdate = true; if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true; v.requestRender(); },
  };
}

export interface Arrows { handle: Handle; begin(): void; push(o: V3, vec: V3, color: THREE.Color | string): void; end(): void }
/** Many arrows in two draw calls (instanced shafts and heads); radius in world units. */
export function addArrows(v: Viewport3D, max: number, radius: number): Arrows {
  const shaftG = new THREE.CylinderGeometry(1, 1, 1, 8); shaftG.translate(0, 0.5, 0);
  const headG = new THREE.ConeGeometry(1, 1, 12); headG.translate(0, 0.5, 0);
  const mat = new THREE.MeshStandardMaterial({ roughness: 0.45 });
  const shafts = new THREE.InstancedMesh(shaftG, mat, max), heads = new THREE.InstancedMesh(headG, mat, max);
  shafts.count = heads.count = 0;
  shafts.frustumCulled = heads.frustumCulled = false;
  const g = new THREE.Group(); g.add(shafts, heads);
  const handle = v.addObject(g);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0), dir = new THREE.Vector3(), pos = new THREE.Vector3(), sc = new THREE.Vector3(), col = new THREE.Color();
  let k = 0;
  return {
    handle,
    begin() { k = 0; },
    push(o, vec, color) {
      const L = Math.hypot(vec[0], vec[1], vec[2]);
      if (k >= max || !(L > 1e-9) || !Number.isFinite(L)) return;
      dir.set(vec[0] / L, vec[1] / L, vec[2] / L);
      q.setFromUnitVectors(up, dir);
      const head = Math.min(L * 0.4, radius * 6), shaft = L - head;
      m4.compose(pos.set(o[0], o[1], o[2]), q, sc.set(radius, shaft, radius)); shafts.setMatrixAt(k, m4);
      m4.compose(pos.set(o[0] + dir.x * shaft, o[1] + dir.y * shaft, o[2] + dir.z * shaft), q, sc.set(radius * 2.4, head, radius * 2.4)); heads.setMatrixAt(k, m4);
      if (typeof color === 'string') col.set(color); else col.copy(color);
      shafts.setColorAt(k, col); heads.setColorAt(k, col);
      k++;
    },
    end() {
      shafts.count = heads.count = k;
      for (const m of [shafts, heads]) { m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; }
      v.requestRender();
    },
  };
}

/** Points of a parametric curve, sampled n times. */
export function sampleCurve(r: (t: number) => V3, t0: number, t1: number, n: number): V3[] {
  const out: V3[] = [];
  for (let i = 0; i <= n; i++) out.push(r(t0 + ((t1 - t0) * i) / n));
  return out;
}

/** Flat segment list of a closed or open polyline (for addSegments). */
export function polylineSegs(pts: V3[], out: number[] = []): number[] {
  for (let i = 0; i + 1 < pts.length; i++) { const p = pts[i], q = pts[i + 1]; if (p.every(Number.isFinite) && q.every(Number.isFinite)) out.push(p[0], p[1], p[2], q[0], q[1], q[2]); }
  return out;
}

export const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const dot = (a: ArrayLike<number>, b: ArrayLike<number>): number => { let s = 0; for (let i = 0; i < a.length; i++) s += a[i] * b[i]; return s; };
export const norm = (a: ArrayLike<number>): number => Math.sqrt(dot(a, a));
export const scaleV = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
export const addV = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const subV = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const unit = (a: V3): V3 => { const l = norm(a); return l > 0 ? [a[0] / l, a[1] / l, a[2] / l] : [0, 0, 0]; };

/** A run-once guard for a numerically expensive result keyed by its inputs. */
export function memo<T>(): (key: string, compute: () => T) => T {
  let k = '', val: T;
  return (key, compute) => { if (key !== k) { val = compute(); k = key; } return val; };
}

/**
 * The graph z = f(x, y) over a rectangle, kept in one surface handle. Values far outside the
 * robust z-range are cut (holes), so a pole does not flatten the picture. Returns the z-range.
 */
export function makeGraph(v: Viewport3D, opts: { res?: number; opacity?: number } = {}) {
  let h: import('../../engine/viewport3d').SurfaceHandle | null = null;
  const st = { fitted: false };
  return {
    draw(f: (x: number, y: number) => number, x0: number, x1: number, y0: number, y1: number, zFloor?: number): [number, number] {
      const [zl, zh] = zLimits(f, x0, x1, y0, y1);
      const zr = Math.max(zh - zl, 1e-6);
      const lo = Math.min(zl, zFloor ?? 0, 0), hi = Math.max(zh, 0);
      fitBounds(v, { x: [x0, x1], y: [y0, y1], z: [lo, hi === lo ? lo + 1 : hi] }, st);
      const g = (X: number, Y: number): V3 | null => { const z = f(X, Y); return Number.isFinite(z) && z >= zl - zr * 0.3 && z <= zh + zr * 0.3 ? [X, Y, z] : null; };
      const o = { uRange: [x0, x1] as [number, number], vRange: [y0, y1] as [number, number], res: opts.res ?? 90, colorBy: 'height' as const, opacity: opts.opacity ?? 1, colorRange: [zl, zh] as [number, number] };
      if (!h) h = v.addSurface(g, o); else h.update(g, o);
      return [zl, zh];
    },
    visible(on: boolean) { h?.visible(on); },
  };
}

/** Set an arrow and show it only when wanted and of visible length (a zero arrow would leave its label floating). */
export function showArrow(a: { set(o: V3, v: V3): void; visible(on: boolean): void }, o: V3, vec: V3, on = true) {
  a.set(o, vec);
  a.visible(on && Number.isFinite(vec[0] + vec[1] + vec[2]) && Math.hypot(vec[0], vec[1], vec[2]) > 1e-6);
}
