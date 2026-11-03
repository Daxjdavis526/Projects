// Shared pieces of the Linear Algebra demos: number and matrix formatting,
// matrix-entry sliders kept in step with a typed "A = [[…]]", a theme-aware
// palette, 2D drawing helpers (lattices, shapes) and 3D objects the engine does
// not provide (line sets, parallelepipeds, clipped plane patches, draggable
// vectors).

import * as THREE from 'three';
import type { DemoCtx } from '../types';
import type { ParamSpec } from '../../core/input/classify';
import type { Graphics } from '../../engine/plot2d';
import type { Viewport3D, V3, ArrowHandle, PointHandle } from '../../engine/viewport3d';
import type { Mat, Vec } from '../../core/numeric/linalg';
import { parseMatrices } from '../../core/numeric/linmap';

export type P2 = [number, number];

// ── numbers ────────────────────────────────────────────────────────────────
/** A number for display: d significant digits, no "-0", no exponent noise. */
export function fmt(v: number, d = 4): string {
  if (!Number.isFinite(v)) return Number.isNaN(v) ? 'undefined' : v > 0 ? '∞' : '−∞';
  if (Math.abs(v) < 1e-10) return '0';
  const s = String(+v.toPrecision(d));
  return s.startsWith('-') ? '−' + s.slice(1) : s;
}
/** The same for TeX (a plain hyphen-minus is fine there). */
export const tnum = (v: number, d = 3) => fmt(v, d).replace('−', '-');
export const texMat = (M: Mat, d = 3) => `\\begin{bmatrix}${M.map((r) => r.map((v) => tnum(v, d)).join(' & ')).join(' \\\\ ')}\\end{bmatrix}`;
export const texVec = (v: Vec, d = 3) => `\\begin{bmatrix}${v.map((x) => tnum(x, d)).join(' \\\\ ')}\\end{bmatrix}`;
export const vecStr = (v: Vec, d = 3) => `(${v.map((x) => fmt(x, d)).join(', ')})`;
export const matStr = (M: Mat, d = 3) => `[${M.map((r) => `[${r.map((x) => fmt(x, d)).join(', ')}]`).join(', ')}]`;

export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
export const smooth = (t: number) => { const x = clamp(t, 0, 1); return x * x * (3 - 2 * x); };
export const snapTo = (v: number, step: number) => Math.round(v / step) * step;
/** A 2D handle constraint: snap to a grid step, or tidy to 0.01. */
export const snap2 = (step: number) => (p: P2): P2 => (step > 0 ? [snapTo(p[0], step), snapTo(p[1], step)] : [Math.round(p[0] * 100) / 100, Math.round(p[1] * 100) / 100]);

// ── colours ────────────────────────────────────────────────────────────────
export interface Pal {
  c1: string; c2: string; c3: string;       // the columns / basis vectors (x red, y green, z blue, like the axes)
  u: string; v: string; w: string;          // free vectors
  res: string;                              // a result (sum, image, projection)
  eig: string;                              // eigen-directions
  err: string;                              // error / residual / null space
  pos: string; neg: string;                 // positive and negative orientation
  ink: string; muted: string; grid: string; gridT: string;
}
export function pal(dark: boolean): Pal {
  return dark
    ? { c1: '#ef6b73', c2: '#6fcf97', c3: '#6aa9ff', u: '#6aa9ff', v: '#f2c14e', w: '#e879c6', res: '#b48cff', eig: '#c9a7ff', err: '#ff9f5a', pos: '#6aa9ff', neg: '#ff9f5a', ink: '#e6e9ef', muted: '#8b93a7', grid: 'rgba(160,170,190,0.13)', gridT: 'rgba(106,169,255,0.42)' }
    : { c1: '#d03c48', c2: '#22945a', c3: '#2f6fd0', u: '#2f6fd0', v: '#b77a00', w: '#c03c97', res: '#7445d6', eig: '#7445d6', err: '#d9661a', pos: '#2f6fd0', neg: '#d9661a', ink: '#1b1f2a', muted: '#5b6375', grid: 'rgba(40,50,70,0.12)', gridT: 'rgba(47,111,208,0.42)' };
}
/** hex → rgba with alpha */
export function alpha(hex: string, a: number): string {
  const h = hex.replace('#', '');
  return `rgba(${parseInt(h.slice(0, 2), 16)},${parseInt(h.slice(2, 4), 16)},${parseInt(h.slice(4, 6), 16)},${a})`;
}
/** 3D colours: lit meshes read well on both backgrounds at mid lightness. */
export const C3 = { c1: '#ef5b66', c2: '#3fbf7f', c3: '#4f8ff7', u: '#4f8ff7', v: '#f0a828', w: '#e060b8', res: '#a678ff', eig: '#b48cff', err: '#ff8a3d', pos: '#4f8ff7', neg: '#ff8a3d', white: '#d8dce6' };

// ── matrix sliders and the typed matrix ─────────────────────────────────────
/** Sliders a11 … ann (or with another letter) for an n×n matrix. */
export function matParams(init: Mat, letter = 'a', range = 4, label?: string): ParamSpec[] {
  const out: ParamSpec[] = [];
  init.forEach((r, i) => r.forEach((v, j) => out.push({ key: `${letter}${i + 1}${j + 1}`, label: `$${label ?? letter}_{${i + 1}${j + 1}}$`, value: v, min: -range, max: range, step: 0.01 })));
  return out;
}
export function readMat(ctx: DemoCtx, n: number, letter = 'a', m = n): Mat {
  return Array.from({ length: n }, (_, i) => Array.from({ length: m }, (_, j) => ctx.params[`${letter}${i + 1}${j + 1}`] ?? 0));
}
export function writeMat(ctx: DemoCtx, M: Mat, letter = 'a') {
  M.forEach((r, i) => r.forEach((v, j) => { const k = `${letter}${i + 1}${j + 1}`; if (ctx.params[k] !== v) ctx.setParam(k, v); }));
}
export const matKeys = (n: number, letter = 'a', m = n) => Array.from({ length: n * m }, (_, k) => `${letter}${Math.floor(k / m) + 1}${(k % m) + 1}`);

/** Vector sliders ux, uy(, uz). */
export function vecParams(name: string, init: Vec, range = 4, label = name): ParamSpec[] {
  const ax = ['x', 'y', 'z'];
  return init.map((v, i) => ({ key: `${name}${ax[i]}`, label: '$' + `{${label}}_${ax[i]}` + '$', value: v, min: -range, max: range, step: 0.01 }));
}
export function readVec(ctx: DemoCtx, name: string, dim: number): Vec { return ['x', 'y', 'z'].slice(0, dim).map((a) => ctx.params[`${name}${a}`] ?? 0); }
export function writeVec(ctx: DemoCtx, name: string, v: Vec) { ['x', 'y', 'z'].slice(0, v.length).forEach((a, i) => ctx.setParam(`${name}${a}`, v[i])); }

/**
 * Watches the demo's input field. When the text changes it is read as one or
 * more matrices ("A = [[…]]; B = [[…]]") and returned once; the demo then moves
 * its sliders. A reading error is kept in `warning` until the text changes.
 */
export class MatrixInput {
  private last: string;
  warning = '';
  constructor(private ctx: DemoCtx) { this.last = ctx.input; }
  poll(): Mat[] | null {
    if (this.ctx.input === this.last) return null;
    this.last = this.ctx.input;
    if (!this.ctx.input.trim()) { this.warning = ''; return null; }
    const r = parseMatrices(this.ctx.input);
    if (!r.ok) { this.warning = `Could not read the matrix: ${r.error}`; return null; }
    this.warning = '';
    return r.value.map((x) => x.M);
  }
  /** Read one square matrix of size n into the sliders (a 2×2 typed into a 3×3 demo acts on the xy-plane). */
  applySquare(n: number, letter = 'a', index = 0): boolean {
    const got = this.poll();
    if (!got) return false;
    const M = got[index] ?? got[0];
    if (M.length === n && M[0].length === n) { writeMat(this.ctx, M, letter); return true; }
    if (n === 3 && M.length === 2 && M[0].length === 2) { writeMat(this.ctx, [[M[0][0], M[0][1], 0], [M[1][0], M[1][1], 0], [0, 0, 1]], letter); this.warning = 'A 2×2 matrix was read as acting on the xy-plane (z is left alone).'; return true; }
    this.warning = `This demo needs a ${n}×${n} matrix; that one is ${M.length}×${M[0].length}.`;
    return false;
  }
}

// ── 2D drawing ─────────────────────────────────────────────────────────────
export const apply2 = (M: Mat, p: P2): P2 => [M[0][0] * p[0] + M[0][1] * p[1], M[1][0] * p[0] + M[1][1] * p[1]];

/** The integer lattice (lines x = k, y = k for |k| ≤ N) carried by M. */
export function lattice2(g: Graphics, M: Mat, N: number, color: string, width = 1, step = 1) {
  for (let k = -N; k <= N + 1e-9; k += step) {
    g.line(apply2(M, [k, -N]), apply2(M, [k, N]), { color, width: Math.abs(k) < 1e-9 ? width * 1.8 : width });
    g.line(apply2(M, [-N, k]), apply2(M, [N, k]), { color, width: Math.abs(k) < 1e-9 ? width * 1.8 : width });
  }
}

/** Shapes to transform. The letter F has no symmetry, so reflections and rotations are unmistakable. */
export const SHAPES: Record<string, P2[]> = {
  F: [[0.2, 0.1], [0.5, 0.1], [0.5, 0.75], [1.0, 0.75], [1.0, 1.0], [0.5, 1.0], [0.5, 1.25], [1.15, 1.25], [1.15, 1.5], [0.2, 1.5]].map(([x, y]) => [x, y - 0.1] as P2),
  house: [[0.15, 0], [1.05, 0], [1.05, 0.8], [1.25, 0.8], [0.6, 1.4], [-0.05, 0.8], [0.15, 0.8]],
  circle: Array.from({ length: 72 }, (_, i) => [Math.cos((i / 72) * 2 * Math.PI), Math.sin((i / 72) * 2 * Math.PI)] as P2),
};
export const shapeArea = (pts: P2[]) => { let a = 0; for (let i = 0; i < pts.length; i++) { const p = pts[i], q = pts[(i + 1) % pts.length]; a += p[0] * q[1] - q[0] * p[1]; } return a / 2; };

/** An arrow with a text label near its tip. */
export function labeledArrow(g: Graphics, from: P2, to: P2, color: string, label: string, width = 2.6) {
  g.arrow(from, to, { color, width });
  if (label) {
    const dx = to[0] - from[0], dy = to[1] - from[1], L = Math.hypot(dx, dy) || 1;
    g.text(to, label, { color, font: '600 14px Inter, system-ui, sans-serif', align: 'center', baseline: 'middle' }, (dx / L) * 18 + (-dy / L) * 9, -(dy / L) * 18 - (dx / L) * 9);
  }
}

/** An arc showing orientation from direction a to direction b (counter-clockwise if the signed angle is positive). */
export function orientationArc(g: Graphics, a: P2, b: P2, r: number, color: string) {
  const t0 = Math.atan2(a[1], a[0]);
  let d = Math.atan2(b[1], b[0]) - t0;
  while (d > Math.PI) d -= 2 * Math.PI;
  while (d < -Math.PI) d += 2 * Math.PI;
  const pts: P2[] = [];
  for (let i = 0; i <= 30; i++) { const t = t0 + (d * i) / 30 * 0.85; pts.push([r * Math.cos(t), r * Math.sin(t)]); }
  if (pts.length > 2) g.arrow(pts[pts.length - 2], pts[pts.length - 1], { color, width: 2 });
  g.path(pts, { color, width: 2 });
}

/** A small right-angle mark at corner c between unit directions d1 and d2. */
export function rightAngle2(g: Graphics, c: P2, d1: P2, d2: P2, s: number, color: string) {
  const l1 = Math.hypot(...d1) || 1, l2 = Math.hypot(...d2) || 1;
  const a: P2 = [c[0] + (d1[0] / l1) * s, c[1] + (d1[1] / l1) * s], b: P2 = [c[0] + (d2[0] / l2) * s, c[1] + (d2[1] / l2) * s];
  g.path([a, [a[0] + b[0] - c[0], a[1] + b[1] - c[1]], b], { color, width: 1.4 });
}

// ── 3D objects ─────────────────────────────────────────────────────────────
const toV = (p: V3) => new THREE.Vector3(p[0], p[1], p[2]);

/** A set of coloured line segments, rewritten in place (lattices, outlines, trails). */
export function lineSet(v: Viewport3D, max: number, opacity = 1) {
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(max * 6), col = new Float32Array(max * 6);
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  geo.setDrawRange(0, 0);
  const obj = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ vertexColors: true, transparent: opacity < 1, opacity, depthWrite: opacity >= 1 }));
  obj.frustumCulled = false;
  const h = v.addObject(obj);
  let n = 0;
  const c = new THREE.Color();
  return {
    ...h,
    begin() { n = 0; },
    seg(a: V3, b: V3, color: string) {
      if (n >= max) return;
      c.set(color);
      pos.set(a, n * 6); pos.set(b, n * 6 + 3);
      col[n * 6] = col[n * 6 + 3] = c.r; col[n * 6 + 1] = col[n * 6 + 4] = c.g; col[n * 6 + 2] = col[n * 6 + 5] = c.b;
      n++;
    },
    end() {
      geo.setDrawRange(0, n * 2);
      (geo.attributes.position as THREE.BufferAttribute).needsUpdate = true;
      (geo.attributes.color as THREE.BufferAttribute).needsUpdate = true;
      v.requestRender();
    },
    setOpacity(o: number) { const m = obj.material as THREE.LineBasicMaterial; m.opacity = o; m.transparent = o < 1; v.requestRender(); },
  };
}
export type LineSet = ReturnType<typeof lineSet>;

/** The integer lattice of the cube [−N, N]³ carried by M (lines along x red, y green, z blue). */
export function lattice3(ls: LineSet, M: Mat, N: number, colors: [string, string, string], step = 1) {
  const T = (p: V3): V3 => [M[0][0] * p[0] + M[0][1] * p[1] + M[0][2] * p[2], M[1][0] * p[0] + M[1][1] * p[1] + M[1][2] * p[2], M[2][0] * p[0] + M[2][1] * p[1] + M[2][2] * p[2]];
  ls.begin();
  for (let a = -N; a <= N + 1e-9; a += step) for (let b = -N; b <= N + 1e-9; b += step) {
    ls.seg(T([-N, a, b]), T([N, a, b]), colors[0]);
    ls.seg(T([a, -N, b]), T([a, N, b]), colors[1]);
    ls.seg(T([a, b, -N]), T([a, b, N]), colors[2]);
  }
  ls.end();
}

/** A parallelepiped spanned by a, b, c from the origin: translucent faces and edges, recoloured on demand. */
export function parallelepiped(v: Viewport3D) {
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(36 * 3);
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.MeshStandardMaterial({ color: C3.pos, transparent: true, opacity: 0.32, side: THREE.DoubleSide, depthWrite: false, roughness: 0.6 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.frustumCulled = false;
  const edges = lineSet(v, 12);
  const g = new THREE.Group(); g.add(mesh);
  const h = v.addObject(g);
  const faces = [[0, 1, 3, 2], [4, 6, 7, 5], [0, 4, 5, 1], [2, 3, 7, 6], [0, 2, 6, 4], [1, 5, 7, 3]];
  return {
    set(a: V3, b: V3, c: V3, color: string, opacity = 0.32, edgeColor = color) {
      const P: V3[] = [];
      for (let k = 0; k < 8; k++) { const i = k & 1, j = (k >> 1) & 1, l = (k >> 2) & 1; P.push([i * a[0] + j * b[0] + l * c[0], i * a[1] + j * b[1] + l * c[1], i * a[2] + j * b[2] + l * c[2]]); }
      let o = 0;
      for (const [p, q, r, s] of faces) for (const idx of [p, q, r, p, r, s]) { pos.set(P[idx], o); o += 3; }
      (geo.attributes.position as THREE.BufferAttribute).needsUpdate = true;
      geo.computeVertexNormals();
      mat.color.set(color); mat.opacity = opacity;
      edges.begin();
      for (const [p, q] of [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 4], [1, 5], [2, 6], [3, 7]]) edges.seg(P[p], P[q], edgeColor);
      edges.end();
    },
    visible(on: boolean) { h.visible(on); edges.visible(on); },
    dispose() { h.dispose(); edges.dispose(); },
  };
}

/** The polygon where the plane n·x = d meets the box [−R, R]³ (empty if they miss). */
export function clipPlaneToBox(n: V3, d: number, R: number): V3[] {
  const nl = Math.hypot(...n);
  if (nl < 1e-12) return [];
  const corners: V3[] = [];
  for (let k = 0; k < 8; k++) corners.push([k & 1 ? R : -R, k & 2 ? R : -R, k & 4 ? R : -R]);
  const f = (p: V3) => n[0] * p[0] + n[1] * p[1] + n[2] * p[2] - d;
  const pts: V3[] = [];
  for (let a = 0; a < 8; a++) for (let b = a + 1; b < 8; b++) {
    const diff = a ^ b;
    if (diff !== 1 && diff !== 2 && diff !== 4) continue;          // cube edges differ in one coordinate
    const fa = f(corners[a]), fb = f(corners[b]);
    if ((fa > 0) === (fb > 0) && fa !== 0) continue;
    const t = fa === fb ? 0 : fa / (fa - fb);
    if (t < -1e-9 || t > 1 + 1e-9) continue;
    const p: V3 = [0, 1, 2].map((i) => corners[a][i] + t * (corners[b][i] - corners[a][i])) as V3;
    if (!pts.some((q) => Math.hypot(q[0] - p[0], q[1] - p[1], q[2] - p[2]) < 1e-9)) pts.push(p);
  }
  if (pts.length < 3) return [];
  const c = pts.reduce((s, p) => [s[0] + p[0] / pts.length, s[1] + p[1] / pts.length, s[2] + p[2] / pts.length] as V3, [0, 0, 0] as V3);
  // an in-plane basis
  const nu = n.map((x) => x / nl) as V3;
  const helper: V3 = Math.abs(nu[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0];
  const e1 = cross3(nu, helper), l1 = Math.hypot(...e1);
  const u: V3 = [e1[0] / l1, e1[1] / l1, e1[2] / l1], w = cross3(nu, u);
  const ang = (p: V3) => Math.atan2(dot3(sub3(p, c), w), dot3(sub3(p, c), u));
  return pts.sort((p, q) => ang(p) - ang(q));
}

/** A flat convex polygon (a plane clipped to the view box), with an outline. */
export function planePatch(v: Viewport3D, color: string, opacity = 0.28) {
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(12 * 3);
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const idx: number[] = [];
  for (let i = 1; i < 11; i++) idx.push(0, i, i + 1);
  geo.setIndex(idx);
  const mat = new THREE.MeshStandardMaterial({ color, transparent: true, opacity, side: THREE.DoubleSide, depthWrite: false, roughness: 0.8 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.frustumCulled = false;
  const h = v.addObject(mesh);
  const outline = lineSet(v, 12, 0.85);
  let col = color;
  const api = {
    /** Show this polygon (from clipPlaneToBox); fewer than 3 points hides it. */
    set(poly: V3[]) {
      const n = Math.min(12, poly.length);
      if (n < 3) { mesh.visible = false; outline.begin(); outline.end(); v.requestRender(); return; }
      mesh.visible = true;
      for (let i = 0; i < n; i++) pos.set(poly[i], i * 3);
      (geo.attributes.position as THREE.BufferAttribute).needsUpdate = true;
      geo.setDrawRange(0, (n - 2) * 3);
      geo.computeVertexNormals();
      outline.begin();
      for (let i = 0; i < n; i++) outline.seg(poly[i], poly[(i + 1) % n], col);
      outline.end();
    },
    /** The plane through the origin spanned by a and b (or with normal nrm through point p). */
    setSpan(a: V3, b: V3, R: number) { api.set(clipPlaneToBox(cross3(a, b), 0, R)); },
    setColor(c: string, o?: number) { col = c; mat.color.set(c); if (o !== undefined) mat.opacity = o; v.requestRender(); },
    visible(on: boolean) { h.visible(on); outline.visible(on); },
    dispose() { h.dispose(); outline.dispose(); },
  };
  return api;
}
export type PlanePatch = ReturnType<typeof planePatch>;

/** A line through `p` with direction d, clipped to the box (as a thin tube via a line set). */
export function clipLineToBox(p: V3, d: V3, R: number): [V3, V3] | null {
  let t0 = -Infinity, t1 = Infinity;
  for (let i = 0; i < 3; i++) {
    if (Math.abs(d[i]) < 1e-12) { if (Math.abs(p[i]) > R) return null; continue; }
    const a = (-R - p[i]) / d[i], b = (R - p[i]) / d[i];
    t0 = Math.max(t0, Math.min(a, b)); t1 = Math.min(t1, Math.max(a, b));
  }
  if (!(t1 > t0)) return null;
  return [[p[0] + t0 * d[0], p[1] + t0 * d[1], p[2] + t0 * d[2]], [p[0] + t1 * d[0], p[1] + t1 * d[1], p[2] + t1 * d[2]]];
}

/**
 * An arrow from the origin (or any origin) whose tip is a draggable sphere.
 * `onDrag` receives the new tip; snap with `snap` (grid step, 0 for none).
 */
export function dragArrow(v: Viewport3D, color: string, label: string, onDrag: (tip: V3) => void, opts: { snap?: () => number; size?: number; draggable?: boolean } = {}) {
  let origin: V3 = [0, 0, 0];
  const arrow: ArrowHandle = v.addArrow([0, 0, 0], [1, 0, 0], { color, label });
  const snap = (p: V3): V3 => { const s = opts.snap?.() ?? 0; return s > 0 ? (p.map((x, i) => origin[i] + snapTo(x - origin[i], s)) as V3) : p; };
  const b = v.getBounds(), span = 0.75 * Math.max(b.x[1] - b.x[0], b.y[1] - b.y[0], b.z[1] - b.z[0]);
  const pt: PointHandle | null = opts.draggable === false ? null : v.addPoint([1, 0, 0], { color, size: opts.size ?? span * 0.026, drag: { constrain: snap, onDrag: (p) => onDrag(p) } });
  return {
    set(o: V3, vec: V3) { origin = o; arrow.set(o, vec); pt?.set([o[0] + vec[0], o[1] + vec[1], o[2] + vec[2]]); },
    visible(on: boolean) { arrow.visible(on); pt?.visible(on); },
    setColor(c: string) { arrow.setColor(c); },
    dispose() { arrow.dispose(); pt?.dispose(); },
  };
}

/** A right-angle marker (a small open square) in 3D. */
export function rightAngle3(ls: LineSet, c: V3, d1: V3, d2: V3, s: number, color: string) {
  const l1 = Math.hypot(...d1), l2 = Math.hypot(...d2);
  if (l1 < 1e-9 || l2 < 1e-9) return;
  const a = add3(c, mul3(d1, s / l1)), b = add3(c, mul3(d2, s / l2)), m = add3(a, mul3(d2, s / l2));
  ls.seg(a, m, color); ls.seg(m, b, color);
}

/** Dashed-looking line: a run of short segments. */
export function dashed3(ls: LineSet, a: V3, b: V3, color: string, n = 24) {
  for (let i = 0; i < n; i += 2) { const t0 = i / n, t1 = (i + 1) / n; ls.seg(lerp3(a, b, t0), lerp3(a, b, t1), color); }
}

export const add3 = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const sub3 = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const mul3 = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
export const dot3 = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross3 = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const len3 = (a: V3) => Math.hypot(a[0], a[1], a[2]);
export const lerp3 = (a: V3, b: V3, t: number): V3 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
export const mv3 = (M: Mat, p: V3): V3 => [M[0][0] * p[0] + M[0][1] * p[1] + M[0][2] * p[2], M[1][0] * p[0] + M[1][1] * p[1] + M[1][2] * p[2], M[2][0] * p[0] + M[2][1] * p[1] + M[2][2] * p[2]];
export const col3 = (M: Mat, j: number): V3 => [M[0][j], M[1][j], M[2][j]];
export { toV };

/**
 * Set a cube of bounds ±R and, if the camera is still where the viewport put it
 * (framing the default ±3 box), re-frame it for the new bounds. A camera restored
 * from a saved project is left alone.
 */
export function setCube(v: Viewport3D, R: number) {
  const cam = v.getCamera();
  const d0 = 0.75 * 6 * 2.6, dir = [1, 0.8, 1.15], l = Math.hypot(...dir);
  const def = dir.map((x) => (x / l) * d0);
  const untouched = Math.hypot(cam.position[0] - def[0], cam.position[1] - def[1], cam.position[2] - def[2]) < 1e-3 && Math.hypot(...cam.target) < 1e-6;
  v.setBounds({ x: [-R, R], y: [-R, R], z: [-R, R] });
  if (untouched) v.view('iso');
}

/** A segment as many points (the engine's tube splits at jumps longer than half the view, so long 2-point segments would vanish). */
export const segPts = (s: [V3, V3], n = 48): V3[] => Array.from({ length: n + 1 }, (_, i) => lerp3(s[0], s[1], i / n));
