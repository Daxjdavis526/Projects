// Small helpers shared by the playgrounds: sound (only when the user turned it
// on), number formatting, a frame loop for 2D views, keyboard input, and a few
// custom three.js objects (translucent polygons, line sets) the viewport does
// not provide.

import * as THREE from 'three';
import type { Viewport3D, V3, Handle } from '../engine/viewport3d';
import { blip } from '../ui/sound';

/** the user's sound preference, read fresh (they can toggle it at any time) */
export function soundOn(): boolean {
  try { return JSON.parse(localStorage.getItem('mathverse:settings') || '{}').sound === true; } catch { return false; }
}

let lastPing = 0;
/** a soft pitched click, throttled, only when sounds are on */
export function ping(pitch: number, gain = 0.035) {
  const now = performance.now();
  if (now - lastPing < 45 || !soundOn()) return;
  lastPing = now;
  blip(Math.max(0, Math.min(1, pitch)), gain);
}

/** a number for display: up to `d` significant digits, real minus sign, no −0 */
export const fmt = (v: number, d = 4): string => {
  if (!Number.isFinite(v)) return Number.isNaN(v) ? 'undefined' : v > 0 ? '∞' : '−∞';
  const r = +v.toPrecision(d);
  const s = Math.abs(r) >= 1e5 || (Math.abs(r) < 1e-4 && r !== 0) ? r.toExponential(Math.max(0, d - 2)) : String(r === 0 ? 0 : r);
  return s.replace('-', '−');
};
/** a number for TeX */
export const tx = (v: number, d = 4): string => fmt(v, d).replace('−', '-').replace(/e([+-]?)(\d+)/, (_m, s, e) => `\\times 10^{${s === '-' ? '-' : ''}${e}}`);
export const vecStr = (v: ArrayLike<number>, d = 3) => `(${Array.from(v, (x) => fmt(x, d)).join(', ')})`;

/** run cb(dt) every animation frame until the returned stop() is called */
export function frameLoop(cb: (dt: number) => void): () => void {
  let raf = 0, last = performance.now(), live = true;
  const loop = () => {
    if (!live) return;
    raf = requestAnimationFrame(loop);
    const now = performance.now(), dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    cb(dt);
  };
  raf = requestAnimationFrame(loop);
  return () => { live = false; cancelAnimationFrame(raf); };
}

/** which keys are held (ignores typing in fields); stop() removes the listeners */
export function keyboard(keys: string[], onPress?: (key: string) => void): { held: Set<string>; stop(): void } {
  const held = new Set<string>();
  const want = new Set(keys);
  const typing = (e: KeyboardEvent) => { const t = e.target as HTMLElement | null; return !!t && (/INPUT|TEXTAREA|SELECT/.test(t.tagName) || t.isContentEditable); };
  const down = (e: KeyboardEvent) => {
    if (typing(e) || e.ctrlKey || e.metaKey || e.altKey) return;
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (!want.has(k)) return;
    if (k.startsWith('Arrow')) e.preventDefault();
    if (!e.repeat) onPress?.(k);
    held.add(k);
  };
  const up = (e: KeyboardEvent) => { const k = e.key.length === 1 ? e.key.toLowerCase() : e.key; held.delete(k); };
  const blur = () => held.clear();
  window.addEventListener('keydown', down);
  window.addEventListener('keyup', up);
  window.addEventListener('blur', blur);
  return { held, stop() { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); window.removeEventListener('blur', blur); } };
}

/** a translucent set of triangles in math coordinates (parallelograms, parallelepipeds, swept areas) */
export function addTriangles(v: Viewport3D, maxTris: number, opts: { color: string; opacity?: number }): Handle & { set(tris: V3[]): void; setColor(c: string): void } {
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(maxTris * 9);
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.MeshStandardMaterial({ color: opts.color, transparent: true, opacity: opts.opacity ?? 0.35, side: THREE.DoubleSide, depthWrite: false, roughness: 0.6 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.renderOrder = 2;
  const h = v.addObject(mesh);
  return {
    ...h,
    set(tris: V3[]) {
      const n = Math.min(tris.length, maxTris * 3);
      for (let i = 0; i < n; i++) { pos[3 * i] = tris[i][0]; pos[3 * i + 1] = tris[i][1]; pos[3 * i + 2] = tris[i][2]; }
      geo.setDrawRange(0, n);
      geo.attributes.position.needsUpdate = true;
      geo.computeVertexNormals();
      geo.computeBoundingSphere();
      v.requestRender();
    },
    setColor(c: string) { mat.color.set(c); v.requestRender(); },
  };
}

/** thin line segments (pairs of points) in math coordinates */
export function addSegments(v: Viewport3D, maxSegs: number, opts: { color: string; opacity?: number }): Handle & { set(pts: V3[]): void; setColor(c: string): void } {
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(maxSegs * 6);
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.LineBasicMaterial({ color: opts.color, transparent: (opts.opacity ?? 1) < 1, opacity: opts.opacity ?? 1 });
  const lines = new THREE.LineSegments(geo, mat);
  const h = v.addObject(lines);
  return {
    ...h,
    set(pts: V3[]) {
      const n = Math.min(pts.length, maxSegs * 2);
      for (let i = 0; i < n; i++) { pos[3 * i] = pts[i][0]; pos[3 * i + 1] = pts[i][1]; pos[3 * i + 2] = pts[i][2]; }
      geo.setDrawRange(0, n);
      geo.attributes.position.needsUpdate = true;
      geo.computeBoundingSphere();
      v.requestRender();
    },
    setColor(c: string) { mat.color.set(c); v.requestRender(); },
  };
}

/** dashed line from a to b as segments */
export function dashes(a: V3, b: V3, dash = 0.12): V3[] {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
  const n = Math.max(1, Math.floor(L / dash / 2));
  const out: V3[] = [];
  for (let i = 0; i < n; i++) {
    const t0 = (2 * i) / (2 * n), t1 = (2 * i + 1) / (2 * n);
    out.push([a[0] + (b[0] - a[0]) * t0, a[1] + (b[1] - a[1]) * t0, a[2] + (b[2] - a[2]) * t0], [a[0] + (b[0] - a[0]) * t1, a[1] + (b[1] - a[1]) * t1, a[2] + (b[2] - a[2]) * t1]);
  }
  return out;
}

/** parse "f(x) = …", "y = …" or a bare expression: the right-hand side */
export function rhs(src: string): string {
  const i = src.indexOf('=');
  return i >= 0 ? src.slice(i + 1) : src;
}
