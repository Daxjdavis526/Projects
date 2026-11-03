// The 3D viewport: three.js on the GPU, an orbit camera (left-drag rotates,
// right-drag or shift-drag pans, the wheel zooms), axes with labels, a grid,
// and mathematical objects — graph and parametric surfaces, curves, arrows,
// vector fields, points, planes, particles — that can be updated every frame
// without reallocating. Points and arrow tips can be made draggable: the drag
// follows the mouse on a plane facing the camera, or a constraint (a surface).

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { colormap, Colormap } from './colors';

export type V3 = [number, number, number];
export interface Bounds { x: [number, number]; y: [number, number]; z: [number, number] }

export interface SurfaceOpts {
  uRange: [number, number]; vRange: [number, number];
  res?: number;                         // samples per side
  colorBy?: 'height' | 'uniform' | ((p: V3, u: number, v: number) => number);   // a value mapped through the colormap
  colormap?: Colormap;
  color?: string;
  opacity?: number;
  wireframe?: boolean;
  /** a valued range for the colormap; default: the min/max of the values */
  colorRange?: [number, number];
  doubleSided?: boolean;
}

export interface Handle { object: THREE.Object3D; dispose(): void; visible(v: boolean): void }

export interface SurfaceHandle extends Handle {
  /** recompute the surface from a new function (same resolution) */
  update(f: (u: number, v: number) => V3 | null, opts?: Partial<SurfaceOpts>): void;
  mesh: THREE.Mesh;
}
export interface CurveHandle extends Handle { set(points: V3[]): void }
export interface ArrowHandle extends Handle { set(origin: V3, vec: V3): void; setColor(c: string): void; setLabel(html: string): void }
export interface PointHandle extends Handle { set(p: V3): void; get(): V3 }
export interface FieldHandle extends Handle { update(F: (p: V3) => V3 | null): void }
export interface ParticlesHandle extends Handle { set(positions: Float32Array, count: number): void }
export interface LabelHandle extends Handle { set(p: V3, html?: string): void }

export interface DragOpts {
  /** map a candidate position to an allowed one (snap to a surface, a plane, a grid) */
  constrain?: (p: V3) => V3;
  onDrag: (p: V3) => void;
  onEnd?: (p: V3) => void;
}

const tmpV = new THREE.Vector3();

export class Viewport3D {
  readonly scene = new THREE.Scene();
  readonly renderer: THREE.WebGLRenderer;
  readonly labels: CSS2DRenderer;
  camera: THREE.PerspectiveCamera | THREE.OrthographicCamera;
  readonly persp: THREE.PerspectiveCamera;
  readonly ortho: THREE.OrthographicCamera;
  controls: OrbitControls;
  private host: HTMLElement;
  private root = new THREE.Group();          // math objects (z-up math coords)
  private axesGroup = new THREE.Group();
  private gridGroup = new THREE.Group();
  private frameCbs = new Set<(dt: number) => void>();
  private raf = 0;
  private last = performance.now();
  private draggables = new Map<THREE.Object3D, DragOpts & { get: () => V3; set: (p: V3) => void }>();
  private dragging: (DragOpts & { get: () => V3; set: (p: V3) => void; plane: THREE.Plane }) | null = null;
  private ro: ResizeObserver;
  private ambient: THREE.AmbientLight;
  private key: THREE.DirectionalLight;
  private bounds: Bounds = { x: [-3, 3], y: [-3, 3], z: [-3, 3] };
  private dirty = true;
  wireframeAll = false;
  surfaceOpacity = 1;
  showAxes = true;
  showGrid = true;
  private themeDark = true;

  constructor(host: HTMLElement) {
    this.host = host;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, alpha: false });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.localClippingEnabled = true;
    host.appendChild(this.renderer.domElement);
    this.renderer.domElement.style.display = 'block';
    this.labels = new CSS2DRenderer();
    Object.assign(this.labels.domElement.style, { position: 'absolute', inset: '0', pointerEvents: 'none' });
    host.appendChild(this.labels.domElement);
    // math is z-up; three is y-up: rotate the world so +z points up on screen
    this.root.rotation.x = -Math.PI / 2;
    this.axesGroup.rotation.x = -Math.PI / 2;
    this.gridGroup.rotation.x = -Math.PI / 2;
    this.scene.add(this.root, this.axesGroup, this.gridGroup);
    this.persp = new THREE.PerspectiveCamera(45, 1, 0.01, 1000);
    this.ortho = new THREE.OrthographicCamera(-5, 5, 5, -5, -1000, 1000);
    this.camera = this.persp;
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.12;
    this.controls.addEventListener('change', () => { this.dirty = true; });
    this.ambient = new THREE.AmbientLight(0xffffff, 0.55);
    this.key = new THREE.DirectionalLight(0xffffff, 1.6);
    this.key.position.set(5, 9, 6);
    const fill = new THREE.DirectionalLight(0x9fb8ff, 0.5);
    fill.position.set(-6, -3, -5);
    this.scene.add(this.ambient, this.key, fill);
    this.setTheme(true);
    this.resetCamera();
    this.buildAxes();
    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(host);
    this.resize();
    this.wireDrag();
    this.loop();
  }

  // ── frame loop ────────────────────────────────────────────────────────────
  onFrame(cb: (dt: number) => void): () => void { this.frameCbs.add(cb); return () => this.frameCbs.delete(cb); }
  requestRender() { this.dirty = true; }
  private loop = () => {
    this.raf = requestAnimationFrame(this.loop);
    const now = performance.now();
    const dt = Math.min(0.1, (now - this.last) / 1000);
    this.last = now;
    for (const cb of this.frameCbs) cb(dt);
    const moved = this.controls.update();
    if (this.dirty || moved || this.frameCbs.size) {
      this.renderer.render(this.scene, this.camera);
      this.labels.render(this.scene, this.camera);
      this.dirty = false;
    }
  };

  private resize() {
    const w = this.host.clientWidth || 1, h = this.host.clientHeight || 1;
    this.renderer.setSize(w, h, false);
    this.renderer.domElement.style.width = `${w}px`;
    this.renderer.domElement.style.height = `${h}px`;
    this.labels.setSize(w, h);
    this.persp.aspect = w / h;
    this.persp.updateProjectionMatrix();
    const span = this.span();
    this.ortho.left = -span * w / h; this.ortho.right = span * w / h; this.ortho.top = span; this.ortho.bottom = -span;
    this.ortho.updateProjectionMatrix();
    this.dirty = true;
  }

  private span() {
    const b = this.bounds;
    return 0.75 * Math.max(b.x[1] - b.x[0], b.y[1] - b.y[0], b.z[1] - b.z[0]);
  }

  // ── camera ────────────────────────────────────────────────────────────────
  /** Set the region the axes cover and the camera frames. */
  /** Set the region the axes cover. With { frame: true } the camera also re-frames it (keeping its direction). */
  setBounds(b: Bounds, opts: { frame?: boolean } = {}) {
    this.bounds = b; this.buildAxes(); this.resize();
    if (opts.frame) {
      const c = this.center(), dir = this.camera.position.clone().sub(this.controls.target).normalize();
      this.controls.target.copy(c);
      this.camera.position.copy(c).addScaledVector(dir, this.span() * 2.6);
      if (this.camera === this.ortho) { this.ortho.zoom = 1; this.ortho.updateProjectionMatrix(); }
      this.controls.update();
    }
    this.dirty = true;
  }
  getBounds(): Bounds { return this.bounds; }

  private center(): THREE.Vector3 {
    const b = this.bounds;
    return mathToWorld([(b.x[0] + b.x[1]) / 2, (b.y[0] + b.y[1]) / 2, (b.z[0] + b.z[1]) / 2]);
  }

  resetCamera() { this.view('iso'); }

  view(which: 'iso' | 'top' | 'front' | 'side') {
    const c = this.center(), d = this.span() * 2.6;
    const dir = { iso: [1, 0.8, 1.15], top: [0, 1, 0.0001], front: [0, 0, 1], side: [1, 0, 0] }[which];
    const v = new THREE.Vector3(dir[0], dir[1], dir[2]).normalize().multiplyScalar(d);
    // world: x → x, math y → −world z, math z → world y
    this.camera.position.set(c.x + v.x, c.y + v.y, c.z + v.z);
    this.camera.up.set(0, 1, 0);
    this.controls.target.copy(c);
    this.camera.lookAt(c);
    if (this.camera === this.ortho) { this.ortho.zoom = 1; this.ortho.updateProjectionMatrix(); }
    this.controls.update();
    this.dirty = true;
  }

  setProjection(p: 'perspective' | 'orthographic') {
    const from = this.camera, to = p === 'perspective' ? this.persp : this.ortho;
    if (from === to) return;
    to.position.copy(from.position); to.quaternion.copy(from.quaternion);
    this.camera = to;
    this.controls.object = to;
    this.resize();
    this.controls.update();
  }

  getCamera(): { position: V3; target: V3; projection: 'perspective' | 'orthographic'; zoom: number } {
    const p = this.camera.position, t = this.controls.target;
    return { position: [p.x, p.y, p.z], target: [t.x, t.y, t.z], projection: this.camera === this.persp ? 'perspective' : 'orthographic', zoom: this.camera.zoom };
  }
  setCamera(c: { position: V3; target: V3; projection: 'perspective' | 'orthographic'; zoom?: number }) {
    this.setProjection(c.projection);
    this.camera.position.set(...c.position);
    this.controls.target.set(...c.target);
    if (c.zoom) { this.camera.zoom = c.zoom; this.camera.updateProjectionMatrix(); }
    this.controls.update();
    this.dirty = true;
  }

  // ── appearance ────────────────────────────────────────────────────────────
  setTheme(dark: boolean) {
    this.themeDark = dark;
    this.scene.background = new THREE.Color(dark ? 0x0d1017 : 0xf4f5f8);
    this.buildAxes();
    this.dirty = true;
  }
  setLighting(intensity: number) { this.key.intensity = 1.6 * intensity; this.ambient.intensity = 0.25 + 0.3 * intensity; this.dirty = true; }
  setAxesVisible(v: boolean) { this.showAxes = v; this.axesGroup.visible = v; this.dirty = true; }
  setGridVisible(v: boolean) { this.showGrid = v; this.gridGroup.visible = v; this.dirty = true; }
  setWireframe(on: boolean) {
    this.wireframeAll = on;
    this.root.traverse((o) => { if ((o as THREE.Mesh).isMesh && o.userData.surface) ((o as THREE.Mesh).material as THREE.MeshStandardMaterial).wireframe = on || !!o.userData.wireframe; });
    this.dirty = true;
  }
  setSurfaceOpacity(a: number) {
    this.surfaceOpacity = a;
    this.root.traverse((o) => {
      if ((o as THREE.Mesh).isMesh && o.userData.surface) {
        const m = (o as THREE.Mesh).material as THREE.MeshStandardMaterial;
        m.opacity = a * (o.userData.opacity ?? 1); m.transparent = m.opacity < 1; m.depthWrite = m.opacity >= 1;
      }
    });
    this.dirty = true;
  }

  private buildAxes() {
    for (const g of [this.axesGroup, this.gridGroup]) {
      for (const c of [...g.children]) { g.remove(c); disposeObject(c); }
    }
    const b = this.bounds;
    const ink = this.themeDark ? 0x8b93a7 : 0x5b6375;
    const cols: Record<string, number> = { x: 0xef6b73, y: 0x6fcf97, z: 0x6aa9ff };
    const axis = (from: V3, to: V3, color: number) => {
      const g = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...from), new THREE.Vector3(...to)]);
      return new THREE.Line(g, new THREE.LineBasicMaterial({ color }));
    };
    const ox = clamp(0, b.x), oy = clamp(0, b.y), oz = clamp(0, b.z);
    this.axesGroup.add(axis([b.x[0], oy, oz], [b.x[1], oy, oz], cols.x), axis([ox, b.y[0], oz], [ox, b.y[1], oz], cols.y), axis([ox, oy, b.z[0]], [ox, oy, b.z[1]], cols.z));
    const lab = (text: string, p: V3, color: string, cls = 'v3-axis-label') => {
      const el = document.createElement('div');
      el.className = cls; el.textContent = text; el.style.color = color;
      const o = new CSS2DObject(el); o.position.set(...p); return o;
    };
    this.axesGroup.add(lab('x', [b.x[1] * 1.04, oy, oz], '#ef6b73'), lab('y', [ox, b.y[1] * 1.04, oz], '#6fcf97'), lab('z', [ox, oy, b.z[1] * 1.04], '#6aa9ff'));
    // ticks: about 5 per axis
    const ticks = (lo: number, hi: number) => { const step = niceStep((hi - lo) / 5); const out: number[] = []; for (let v = Math.ceil(lo / step) * step; v <= hi + 1e-9; v += step) if (Math.abs(v) > 1e-9) out.push(+v.toFixed(6)); return out; };
    const tcol = this.themeDark ? '#7d8597' : '#666e80';
    for (const v of ticks(b.x[0], b.x[1])) this.axesGroup.add(lab(fmtTick(v), [v, oy, oz], tcol, 'v3-tick'));
    for (const v of ticks(b.y[0], b.y[1])) this.axesGroup.add(lab(fmtTick(v), [ox, v, oz], tcol, 'v3-tick'));
    for (const v of ticks(b.z[0], b.z[1])) this.axesGroup.add(lab(fmtTick(v), [ox, oy, v], tcol, 'v3-tick'));
    // the grid in the z = 0 plane (or the bottom of the box)
    const step = niceStep((b.x[1] - b.x[0]) / 10);
    const pts: THREE.Vector3[] = [];
    const gz = oz;
    for (let x = Math.ceil(b.x[0] / step) * step; x <= b.x[1] + 1e-9; x += step) pts.push(new THREE.Vector3(x, b.y[0], gz), new THREE.Vector3(x, b.y[1], gz));
    for (let y = Math.ceil(b.y[0] / step) * step; y <= b.y[1] + 1e-9; y += step) pts.push(new THREE.Vector3(b.x[0], y, gz), new THREE.Vector3(b.x[1], y, gz));
    const grid = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: ink, transparent: true, opacity: this.themeDark ? 0.18 : 0.25 }));
    this.gridGroup.add(grid);
    this.axesGroup.visible = this.showAxes; this.gridGroup.visible = this.showGrid;
    this.dirty = true;
  }

  // ── objects ───────────────────────────────────────────────────────────────
  private track<T extends Handle>(obj: THREE.Object3D, extra: Omit<T, keyof Handle>): T {
    this.root.add(obj);
    this.dirty = true;
    return {
      object: obj,
      dispose: () => { this.root.remove(obj); disposeObject(obj); this.draggables.delete(obj); this.dirty = true; },
      visible: (v: boolean) => { obj.visible = v; this.dirty = true; },
      ...extra,
    } as T;
  }

  /** A parametric surface (u, v) ↦ (x, y, z). Returning null leaves a hole (outside a domain). */
  addSurface(f: (u: number, v: number) => V3 | null, opts: SurfaceOpts): SurfaceHandle {
    const res = opts.res ?? 80;
    const geo = new THREE.PlaneGeometry(1, 1, res, res);
    const mat = new THREE.MeshStandardMaterial({ vertexColors: true, side: THREE.DoubleSide, roughness: 0.55, metalness: 0.05, flatShading: false });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.userData.surface = true;
    let o = { ...opts };
    const fill = (fn: typeof f, oo: SurfaceOpts) => {
      const pos = geo.attributes.position as THREE.BufferAttribute;
      const n = res + 1;
      const vals = new Float32Array(n * n);
      const valid = new Uint8Array(n * n);
      const colorFn = oo.colorBy ?? 'height';
      for (let j = 0; j <= res; j++) for (let i = 0; i <= res; i++) {
        const u = oo.uRange[0] + ((oo.uRange[1] - oo.uRange[0]) * i) / res;
        const v = oo.vRange[0] + ((oo.vRange[1] - oo.vRange[0]) * j) / res;
        const k = j * n + i;
        const p = fn(u, v);
        if (!p || !p.every(Number.isFinite)) { pos.setXYZ(k, NaN, NaN, NaN); valid[k] = 0; continue; }
        pos.setXYZ(k, p[0], p[1], p[2]);
        valid[k] = 1;
        vals[k] = colorFn === 'height' ? p[2] : colorFn === 'uniform' ? 0 : colorFn(p, u, v);
      }
      // drop triangles touching invalid vertices (holes, singularities)
      const index: number[] = [];
      for (let j = 0; j < res; j++) for (let i = 0; i < res; i++) {
        const a = j * n + i, b = a + 1, c = a + n, d = c + 1;
        if (valid[a] && valid[b] && valid[c]) index.push(a, c, b);
        if (valid[b] && valid[c] && valid[d]) index.push(b, c, d);
      }
      for (let k = 0; k < n * n; k++) if (!valid[k]) pos.setXYZ(k, 0, 0, 0);
      geo.setIndex(index);
      pos.needsUpdate = true;
      geo.computeVertexNormals();
      geo.computeBoundingSphere();
      let lo = Infinity, hi = -Infinity;
      for (let k = 0; k < n * n; k++) if (valid[k]) { lo = Math.min(lo, vals[k]); hi = Math.max(hi, vals[k]); }
      if (oo.colorRange) [lo, hi] = oo.colorRange;
      const cols = new Float32Array(n * n * 3);
      const base = new THREE.Color(oo.color ?? '#6aa9ff');
      for (let k = 0; k < n * n; k++) {
        const c = colorFn === 'uniform' ? base : colormap(oo.colormap ?? 'turbo', hi > lo ? (vals[k] - lo) / (hi - lo) : 0.5);
        cols[3 * k] = c.r; cols[3 * k + 1] = c.g; cols[3 * k + 2] = c.b;
      }
      geo.setAttribute('color', new THREE.BufferAttribute(cols, 3));
      mesh.userData.opacity = oo.opacity ?? 1;
      mesh.userData.wireframe = !!oo.wireframe;
      mat.wireframe = this.wireframeAll || !!oo.wireframe;
      mat.opacity = (oo.opacity ?? 1) * this.surfaceOpacity;
      mat.transparent = mat.opacity < 1; mat.depthWrite = mat.opacity >= 1;
      this.dirty = true;
    };
    fill(f, o);
    let cur = f;
    return this.track<SurfaceHandle>(mesh, {
      mesh,
      update: (g, more) => { if (g) cur = g; if (more) o = { ...o, ...more }; fill(cur, o); },
    });
  }

  /** A graph z = f(x, y) over a rectangle. */
  addGraph(f: (x: number, y: number) => number, xr: [number, number], yr: [number, number], opts: Partial<SurfaceOpts> = {}): SurfaceHandle {
    return this.addSurface((u, v) => { const z = f(u, v); return Number.isFinite(z) ? [u, v, z] : null; }, { uRange: xr, vRange: yr, ...opts });
  }

  /** A curve through points, drawn as a tube (radius in world units) or a thin line. */
  addCurve(points: V3[], opts: { color?: string; radius?: number; opacity?: number } = {}): CurveHandle {
    const group = new THREE.Group();
    const color = new THREE.Color(opts.color ?? '#f2c14e');
    const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.4, transparent: (opts.opacity ?? 1) < 1, opacity: opts.opacity ?? 1 });
    const lineMat = new THREE.LineBasicMaterial({ color });
    const build = (pts: V3[]) => {
      for (const c of [...group.children]) { group.remove(c); (c as THREE.Mesh).geometry?.dispose(); }
      const good = pts.filter((p) => p.every(Number.isFinite));
      if (good.length < 2) return;
      if (opts.radius === 0) {
        group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(good.map((p) => new THREE.Vector3(...p))), lineMat));
      } else {
        // split at large jumps (asymptotes) so the tube does not bridge them
        let run: THREE.Vector3[] = [];
        const span = this.span();
        const flush = () => { if (run.length >= 2) group.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(run), Math.min(1200, run.length * 2), opts.radius ?? span * 0.008, 8, false), mat)); run = []; };
        for (let i = 0; i < good.length; i++) {
          const p = new THREE.Vector3(...good[i]);
          if (run.length && good.length > 8 && p.distanceTo(run[run.length - 1]) > span * 0.5) flush();
          run.push(p);
        }
        flush();
      }
      this.dirty = true;
    };
    build(points);
    return this.track<CurveHandle>(group, { set: build });
  }

  /** An arrow from origin along vec. Shaft and head scale with the length. */
  addArrow(origin: V3, vec: V3, opts: { color?: string; radius?: number; label?: string } = {}): ArrowHandle {
    const color = new THREE.Color(opts.color ?? '#f2c14e');
    const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.35, metalness: 0.1 });
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 14), mat);
    const head = new THREE.Mesh(new THREE.ConeGeometry(1, 1, 18), mat);
    const g = new THREE.Group();
    g.add(shaft, head);
    let label: CSS2DObject | null = null;
    const makeLabel = (html: string) => {
      const el = document.createElement('div'); el.className = 'v3-label'; el.innerHTML = html; el.style.color = `#${color.getHexString()}`;
      label = new CSS2DObject(el); g.add(label);
    };
    if (opts.label) makeLabel(opts.label);
    const r0 = opts.radius ?? this.span() * 0.012;
    const set = (o: V3, v: V3) => {
      const len = Math.hypot(...v);
      g.position.set(...o);
      if (len < 1e-9) { g.visible = false; this.dirty = true; return; }
      g.visible = true;
      const dir = new THREE.Vector3(...v).normalize();
      g.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
      const headLen = Math.min(len * 0.35, r0 * 7), shaftLen = len - headLen;
      shaft.scale.set(r0, shaftLen, r0); shaft.position.set(0, shaftLen / 2, 0);
      head.scale.set(r0 * 2.6, headLen, r0 * 2.6); head.position.set(0, shaftLen + headLen / 2, 0);
      if (label) label.position.set(0, len * 1.08 + r0 * 3, 0);
      this.dirty = true;
    };
    set(origin, vec);
    let last: [V3, V3] = [origin, vec];
    return this.track<ArrowHandle>(g, {
      set: (o: V3, v: V3) => { last = [o, v]; set(o, v); },
      setColor: (c: string) => { mat.color.set(c); this.dirty = true; },
      setLabel: (html: string) => { if (label) (label as CSS2DObject).element.innerHTML = html; else { makeLabel(html); set(...last); } this.dirty = true; },
    });
  }

  /** A sphere marker; draggable when drag options are given. */
  addPoint(p: V3, opts: { color?: string; size?: number; drag?: DragOpts; label?: string } = {}): PointHandle {
    const r = opts.size ?? this.span() * 0.025;
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 16), new THREE.MeshStandardMaterial({ color: opts.color ?? '#ffffff', roughness: 0.3, emissive: new THREE.Color(opts.color ?? '#ffffff'), emissiveIntensity: 0.25 }));
    mesh.position.set(...p);
    if (opts.label) {
      const el = document.createElement('div'); el.className = 'v3-label'; el.innerHTML = opts.label;
      const l = new CSS2DObject(el); l.position.set(0, 0, r * 2.2); mesh.add(l);
    }
    const handle = this.track<PointHandle>(mesh, {
      set: (q: V3) => { mesh.position.set(...q); this.dirty = true; },
      get: () => [mesh.position.x, mesh.position.y, mesh.position.z],
    });
    if (opts.drag) {
      // a larger invisible hit target makes small points easy to grab
      mesh.userData.draggable = true;
      this.draggables.set(mesh, { ...opts.drag, get: handle.get, set: handle.set });
    }
    return handle;
  }

  /** A square patch of plane through `point` with normal `normal`. */
  addPlane(point: V3, normal: V3, size: number, opts: { color?: string; opacity?: number } = {}): Handle & { set(point: V3, normal: V3): void } {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(size, size, 8, 8), new THREE.MeshStandardMaterial({ color: opts.color ?? '#9b8cff', transparent: true, opacity: opts.opacity ?? 0.45, side: THREE.DoubleSide, depthWrite: false }));
    const set = (pt: V3, n: V3) => {
      mesh.position.set(...pt);
      const nn = new THREE.Vector3(...n);
      if (nn.lengthSq() < 1e-18) { mesh.visible = false; return; }
      mesh.visible = true;
      mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), nn.normalize());
      this.dirty = true;
    };
    set(point, normal);
    return this.track(mesh, { set });
  }

  /** Arrows of a vector field on a grid; lengths normalized to the spacing, colour by magnitude. */
  addVectorField(F: (p: V3) => V3 | null, opts: { n?: number; bounds?: Bounds; planar?: boolean; colormap?: Colormap; scale?: number } = {}): FieldHandle {
    const b = opts.bounds ?? this.bounds;
    const n = opts.n ?? (opts.planar ? 15 : 7);
    const nz = opts.planar ? 1 : n;
    const count = n * n * nz;
    const cone = new THREE.ConeGeometry(0.5, 1, 8); cone.translate(0, 0.5, 0);
    const mesh = new THREE.InstancedMesh(cone, new THREE.MeshStandardMaterial({ roughness: 0.5 }), count);
    const step = Math.min((b.x[1] - b.x[0]) / n, (b.y[1] - b.y[0]) / n);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);
    const update = (G: (p: V3) => V3 | null) => {
      const pts: V3[] = [], vecs: (V3 | null)[] = [];
      for (let k = 0; k < nz; k++) for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
        const p: V3 = [b.x[0] + ((i + 0.5) * (b.x[1] - b.x[0])) / n, b.y[0] + ((j + 0.5) * (b.y[1] - b.y[0])) / n, opts.planar ? 0 : b.z[0] + ((k + 0.5) * (b.z[1] - b.z[0])) / nz];
        pts.push(p);
        const v = G(p);
        vecs.push(v && v.every(Number.isFinite) ? v : null);
      }
      const mags = vecs.map((v) => (v ? Math.hypot(...v) : 0));
      const maxM = Math.max(1e-12, ...mags);
      for (let k = 0; k < count; k++) {
        const v = vecs[k], m = mags[k];
        if (!v || m < 1e-12) { m4.makeScale(0, 0, 0); mesh.setMatrixAt(k, m4); continue; }
        q.setFromUnitVectors(up, tmpV.set(v[0] / m, v[1] / m, v[2] / m));
        const len = step * 0.85 * (opts.scale ?? 1) * (0.35 + 0.65 * Math.sqrt(m / maxM));
        s.set(step * 0.16, len, step * 0.16);
        m4.compose(new THREE.Vector3(...pts[k]).addScaledVector(tmpV, -len / 2), q, s);
        mesh.setMatrixAt(k, m4);
        mesh.setColorAt(k, colormap(opts.colormap ?? 'plasma', m / maxM));
      }
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      this.dirty = true;
    };
    update(F);
    return this.track<FieldHandle>(mesh, { update });
  }

  /** Many small particles (flow tracers), positions updated per frame. */
  addParticles(max: number, opts: { color?: string; size?: number } = {}): ParticlesHandle {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(max * 3);
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const pts = new THREE.Points(geo, new THREE.PointsMaterial({ color: opts.color ?? '#ffe08a', size: opts.size ?? this.span() * 0.018, sizeAttenuation: true }));
    return this.track<ParticlesHandle>(pts, {
      set: (p: Float32Array, count: number) => {
        (geo.attributes.position as THREE.BufferAttribute).array.set(p.subarray(0, count * 3));
        geo.setDrawRange(0, count);
        geo.attributes.position.needsUpdate = true;
        geo.computeBoundingSphere();
        this.dirty = true;
      },
    });
  }

  /** An HTML label (may contain KaTeX HTML) pinned to a point. */
  addLabel(p: V3, html: string, cls = 'v3-label'): LabelHandle {
    const el = document.createElement('div'); el.className = cls; el.innerHTML = html;
    const o = new CSS2DObject(el); o.position.set(...p);
    return this.track<LabelHandle>(o, { set: (q: V3, h?: string) => { o.position.set(...q); if (h !== undefined) el.innerHTML = h; this.dirty = true; } });
  }

  /** Add any three.js object in math coordinates (advanced demos). */
  addObject(o: THREE.Object3D): Handle { return this.track<Handle>(o, {}); }

  /** Remove every math object (keeps axes and grid). */
  clear() {
    for (const c of [...this.root.children]) { this.root.remove(c); disposeObject(c); }
    this.draggables.clear();
    this.dirty = true;
  }

  // ── dragging ──────────────────────────────────────────────────────────────
  private wireDrag() {
    const el = this.renderer.domElement;
    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const toNdc = (e: PointerEvent) => { const r = el.getBoundingClientRect(); ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); };
    el.addEventListener('pointerdown', (e) => {
      if (e.button !== 0 || !this.draggables.size) return;
      toNdc(e);
      ray.setFromCamera(ndc, this.camera);
      ray.params.Points = { threshold: 0.1 };
      const hits = ray.intersectObjects([...this.draggables.keys()], false);
      if (!hits.length) return;
      const d = this.draggables.get(hits[0].object)!;
      const p = hits[0].object.getWorldPosition(new THREE.Vector3());
      const n = new THREE.Vector3(); this.camera.getWorldDirection(n);
      this.dragging = { ...d, plane: new THREE.Plane().setFromNormalAndCoplanarPoint(n, p) };
      this.controls.enabled = false;
      el.setPointerCapture(e.pointerId);
      el.style.cursor = 'grabbing';
      e.preventDefault();
    });
    el.addEventListener('pointermove', (e) => {
      toNdc(e);
      if (!this.dragging) {
        if (!this.draggables.size) return;
        ray.setFromCamera(ndc, this.camera);
        el.style.cursor = ray.intersectObjects([...this.draggables.keys()], false).length ? 'grab' : '';
        return;
      }
      ray.setFromCamera(ndc, this.camera);
      const hit = new THREE.Vector3();
      if (!ray.ray.intersectPlane(this.dragging.plane, hit)) return;
      this.root.worldToLocal(hit);
      let p: V3 = [hit.x, hit.y, hit.z];
      if (this.dragging.constrain) p = this.dragging.constrain(p);
      this.dragging.set(p);
      this.dragging.onDrag(p);
    });
    const end = () => {
      if (!this.dragging) return;
      this.dragging.onEnd?.(this.dragging.get());
      this.dragging = null;
      this.controls.enabled = true;
      el.style.cursor = '';
    };
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);
  }

  /** PNG of the current view. */
  screenshot(): string {
    this.renderer.render(this.scene, this.camera);
    return this.renderer.domElement.toDataURL('image/png');
  }

  dispose() {
    cancelAnimationFrame(this.raf);
    this.ro.disconnect();
    this.clear();
    this.controls.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
    this.labels.domElement.remove();
  }
}

/** Math coordinates (z up) to three.js world coordinates (y up). */
export function mathToWorld(p: V3): THREE.Vector3 { return new THREE.Vector3(p[0], p[2], -p[1]); }

const clamp = (v: number, r: [number, number]) => Math.min(r[1], Math.max(r[0], v));
export function niceStep(raw: number): number {
  const p = Math.pow(10, Math.floor(Math.log10(raw)));
  const m = raw / p;
  return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p;
}
export const fmtTick = (v: number) => String(+v.toPrecision(4));

function disposeObject(o: THREE.Object3D) {
  o.traverse((c) => {
    const m = c as THREE.Mesh;
    m.geometry?.dispose?.();
    const mat = m.material as THREE.Material | THREE.Material[] | undefined;
    if (Array.isArray(mat)) mat.forEach((x) => x.dispose()); else mat?.dispose?.();
    if (c instanceof CSS2DObject) c.element.remove();
  });
}
