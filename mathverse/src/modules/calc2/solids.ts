// Three.js geometry for solids of revolution: a "frame" places a lathe (local
// y = the axis, local z = the direction at angle 0) in math coordinates, and
// helpers build revolved curves, washers/shells (annular boxes) and the flat
// cut faces a partial revolution exposes. Everything is merged into a few
// buffers per update so that 60 slices stay cheap.

import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { V3 } from '../../engine/viewport3d';

export interface Frame { origin: V3; axis: V3; radial: V3 }

/** The lathe's local frame in math coordinates. */
export function frameMatrix(fr: Frame): THREE.Matrix4 {
  const Y = new THREE.Vector3(...fr.axis).normalize(), Z = new THREE.Vector3(...fr.radial).normalize();
  const X = new THREE.Vector3().crossVectors(Y, Z);
  const m = new THREE.Matrix4().makeBasis(X, Y, Z);
  m.setPosition(new THREE.Vector3(...fr.origin));
  return m;
}

/** A point given by (radius, height along the axis, angle) in math coordinates. */
export function framePoint(fr: Frame, r: number, h: number, phi: number): V3 {
  const Y = fr.axis, Z = fr.radial;
  const X: V3 = [Y[1] * Z[2] - Y[2] * Z[1], Y[2] * Z[0] - Y[0] * Z[2], Y[0] * Z[1] - Y[1] * Z[0]];
  const s = r * Math.sin(phi), c = r * Math.cos(phi);
  return [fr.origin[0] + X[0] * s + Y[0] * h + Z[0] * c, fr.origin[1] + X[1] * s + Y[1] * h + Z[1] * c, fr.origin[2] + X[2] * s + Y[2] * h + Z[2] * c];
}

const colorize = (g: THREE.BufferGeometry, c: THREE.Color) => {
  const n = g.attributes.position.count, a = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { a[3 * i] = c.r; a[3 * i + 1] = c.g; a[3 * i + 2] = c.b; }
  g.setAttribute('color', new THREE.BufferAttribute(a, 3));
  return g;
};
const plain = (g: THREE.BufferGeometry) => { const ng = g.index ? g.toNonIndexed() : g; for (const k of Object.keys(ng.attributes)) if (k !== 'position' && k !== 'normal') ng.deleteAttribute(k); return ng; };

/** A curve (r, h) revolved through phiLen. */
export function latheCurve(pts: [number, number][], segs: number, phiLen: number): THREE.BufferGeometry | null {
  const good = pts.filter(([r, h]) => Number.isFinite(r) && Number.isFinite(h)).map(([r, h]) => new THREE.Vector2(Math.max(0, r), h));
  if (good.length < 2) return null;
  return plain(new THREE.LatheGeometry(good, segs, 0, phiLen));
}

/** A flat polygon (r, h) placed at angle phi (a cut face). Both windings are emitted so it is lit from either side. */
export function cutFace(poly: [number, number][], phi: number): THREE.BufferGeometry | null {
  const contour = poly.filter(([r, h]) => Number.isFinite(r) && Number.isFinite(h)).map(([r, h]) => new THREE.Vector2(r, h));
  if (contour.length < 3) return null;
  let tris: number[][];
  try { tris = THREE.ShapeUtils.triangulateShape(contour, []); } catch { return null; }
  const s = Math.sin(phi), c = Math.cos(phi);
  const pos: number[] = [];
  for (const t of tris) for (const i of t) { const p = contour[i]; pos.push(p.x * s, p.y, p.x * c); }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.computeVertexNormals();
  return g;
}

/** An annular box r ∈ [r0, r1], h ∈ [h0, h1] revolved through phiLen — a washer or a shell — with its cut faces. */
export function ringBox(r0: number, r1: number, h0: number, h1: number, segs: number, phiLen: number): THREE.BufferGeometry[] {
  const out: (THREE.BufferGeometry | null)[] = [
    latheCurve([[r1, h0], [r1, h1]], segs, phiLen),
    latheCurve([[r1, h1], [r0, h1]], segs, phiLen),
    latheCurve([[r0, h0], [r1, h0]], segs, phiLen),
  ];
  if (r0 > 1e-9) out.push(latheCurve([[r0, h1], [r0, h0]], segs, phiLen));
  if (phiLen < 2 * Math.PI - 1e-6) { const q: [number, number][] = [[r0, h0], [r1, h0], [r1, h1], [r0, h1]]; out.push(cutFace(q, 0), cutFace(q, phiLen)); }
  return out.filter((g): g is THREE.BufferGeometry => !!g);
}

/** Merge geometries, painting each group its own colour. Returns null when there is nothing to draw. */
export function mergeColored(groups: { geos: THREE.BufferGeometry[]; color: THREE.Color }[]): THREE.BufferGeometry | null {
  const all: THREE.BufferGeometry[] = [];
  for (const gr of groups) for (const g of gr.geos) all.push(colorize(g, gr.color));
  if (!all.length) return null;
  const m = mergeGeometries(all, false);
  all.forEach((g) => g.dispose());
  return m;
}

/** A mesh whose geometry is replaced on each update (the old one disposed). */
export class SwapMesh {
  readonly mesh: THREE.Mesh;
  readonly material: THREE.MeshStandardMaterial;
  constructor(opts: { vertexColors?: boolean; color?: string; opacity?: number; matrix?: THREE.Matrix4 }) {
    this.material = new THREE.MeshStandardMaterial({ vertexColors: !!opts.vertexColors, color: opts.color ?? '#ffffff', side: THREE.DoubleSide, roughness: 0.5, metalness: 0.05, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });
    this.mesh = new THREE.Mesh(new THREE.BufferGeometry(), this.material);
    this.mesh.matrixAutoUpdate = false;
    if (opts.matrix) this.mesh.matrix.copy(opts.matrix);
    this.setOpacity(opts.opacity ?? 1);
  }
  set(g: THREE.BufferGeometry | null) { this.mesh.geometry.dispose(); this.mesh.geometry = g ?? new THREE.BufferGeometry(); this.mesh.visible = !!g; }
  setMatrix(m: THREE.Matrix4) { this.mesh.matrix.copy(m); this.mesh.matrixWorldNeedsUpdate = true; }
  setOpacity(a: number) { this.material.opacity = a; this.material.transparent = a < 1; this.material.depthWrite = a >= 1; this.material.needsUpdate = true; }
}

/** Polyline in math coordinates (thin line). */
export function lineObject(color: string): { obj: THREE.Line; set(pts: V3[]): void } {
  const geo = new THREE.BufferGeometry();
  const obj = new THREE.Line(geo, new THREE.LineBasicMaterial({ color }));
  return { obj, set(pts) { obj.geometry.dispose(); obj.geometry = new THREE.BufferGeometry().setFromPoints(pts.filter((p) => p.every(Number.isFinite)).map((p) => new THREE.Vector3(...p))); } };
}
