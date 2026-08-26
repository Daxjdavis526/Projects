/* ============================================================================
   render.js — shared rendering utilities
   ----------------------------------------------------------------------------
   • placeBody():   CPU-side compression placement for real meshes (planets…)
   • starMaterial(): one shader for every luminous point layer. Point size and
     alpha derive from actual flux  L / d²  using the TRUE distance in meters,
     so a star/galaxy naturally brightens as you approach and fades as you
     leave — the same physics at every rung of the scale ladder.
   • Beacons:  a small dynamic point pool for named objects (planets, bright
     stars, galaxy nuclei) so anything selectable stays visible when its mesh
     is sub-pixel. This is the "visibility-enhanced" rendering the UI reports.
   ========================================================================== */
import * as THREE from 'three';
import { R_MAX, compressLen, GLSL_COMPRESS } from './scale.js';

// ------------------------------------------------------------ textures
export function softDiscTexture(size = 64, hard = 0.12) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
  grd.addColorStop(0, 'rgba(255,255,255,1)');
  grd.addColorStop(hard, 'rgba(255,255,255,1)');
  grd.addColorStop(0.5, 'rgba(255,255,255,0.28)');
  grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd; g.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
export function glowTexture(size = 128) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
  grd.addColorStop(0, 'rgba(255,255,255,1)');
  grd.addColorStop(0.25, 'rgba(255,255,255,0.45)');
  grd.addColorStop(0.6, 'rgba(255,255,255,0.12)');
  grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd; g.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Blackbody temperature (K) -> linear-ish RGB, tuned for star rendering */
export function kelvinToRGB(k) {
  const t = Math.max(1000, Math.min(k, 40000)) / 100;
  let r, g, b;
  if (t <= 66) { r = 255; g = 99.47 * Math.log(t) - 161.12; }
  else { r = 329.7 * Math.pow(t - 60, -0.1332); g = 288.12 * Math.pow(t - 60, -0.0755); }
  if (t >= 66) b = 255;
  else if (t <= 19) b = 0;
  else b = 138.52 * Math.log(t - 10) - 305.04;
  const c = v => Math.max(0, Math.min(255, v)) / 255;
  return [c(r), c(g), c(b)];
}

/** Soft stellar PSF: gaussian core + inverse-power halo. */
export function starPSFTexture(size = 128) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const g = c.getContext('2d');
  const img = g.createImageData(size, size);
  const d = img.data;
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const dx = (x + 0.5) / size - 0.5, dy = (y + 0.5) / size - 0.5;
    const r = Math.hypot(dx, dy) * 2;               // 0..1 at edge
    let v = Math.exp(-r * r * 42) + 0.10 / (1 + Math.pow(r * 9, 2.6));
    v *= Math.max(0, 1 - r * r);                     // hard-zero the corners
    const i = (y * size + x) * 4;
    const b = Math.min(255, v * 255);
    d[i] = d[i+1] = d[i+2] = b; d[i+3] = b;
  }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Bright-star PSF: soft core + 4-point diffraction spikes. */
export function spikePSFTexture(size = 256) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const g = c.getContext('2d');
  const img = g.createImageData(size, size);
  const d = img.data;
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const dx = (x + 0.5) / size - 0.5, dy = (y + 0.5) / size - 0.5;
    const r = Math.hypot(dx, dy) * 2;
    let v = Math.exp(-r * r * 60) + 0.10 / (1 + Math.pow(r * 10, 2.6));
    const ax = Math.abs(dx), ay = Math.abs(dy);
    v += 0.42 * (Math.exp(-ax * 55) * Math.exp(-ay * 6.5)
               + Math.exp(-ay * 55) * Math.exp(-ax * 6.5));
    v *= Math.max(0, 1 - r * r * 0.96);
    const i = (y * size + x) * 4;
    const b = Math.min(255, v * 240);
    d[i] = d[i+1] = d[i+2] = b; d[i+3] = b;
  }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// ------------------------------------------------- CPU body placement
/**
 * Position a mesh for this frame. p = universe coords (doubles), ctx from main.
 * Returns { rd: true render distance (units, pre-compression), px: apparent
 * pixel diameter of `radius`, shrink } and hides the mesh if degenerate.
 */
export function placeBody(obj, p, radiusMeters, ctx) {
  const S = ctx.S, f = ctx.focus;
  const rx = (p[0]-f[0])/S, ry = (p[1]-f[1])/S, rz = (p[2]-f[2])/S;
  const L = Math.hypot(rx, ry, rz);
  const Lc = compressLen(L);
  const k = L > 0 ? Lc / L : 1;
  obj.position.set(rx*k, ry*k, rz*k);
  const s = (radiusMeters / S) * k;
  obj.scale.setScalar(Math.max(s, 1e-12));
  // pixel diameter: camera is 1 unit from focus; px per unit at distance d:
  const camDist = Math.hypot(rx*k - ctx.camRender[0], ry*k - ctx.camRender[1], rz*k - ctx.camRender[2]);
  const px = camDist > 0 ? (2 * s / camDist) * ctx.pxPerUnit : 1e9;
  return { rd: L, px, shrink: k };
}

// -------------------------------------------------- star point shader
const STAR_VERT = /* glsl */`
  attribute vec3 aColor;
  attribute float aLum;          // log2(luminosity) — log-space avoids f32 overflow
  varying vec3 vColor;
  varying float vAlpha;
  uniform vec3 uFocusLocal;      // focus position, in this layer's local units
  uniform float uL2R;            // local units -> render units (= localMeters / S)
  uniform float uS;              // meters per render unit (= camera distance)
  uniform float uPxPerUnit;      // pixels per unit at unit distance
  uniform float uFluxScale;      // layer brightness tuning
  uniform float uMaxPx;
  uniform float uOpacity;
  uniform float uMCap;           // upper bound on pseudo-magnitude (anti-bloom-clump)
  uniform float uPhysMode;       // 0: flux-sized star point · 1: aLum = radius (m)
  ${GLSL_COMPRESS}
  void main() {
    vec3 rel = (position - uFocusLocal) * uL2R;
    // true camera distance BEFORE compression — flux must be measured from
    // the camera, not the focus (they differ hugely when zoomed far out)
    vec4 mvT = modelViewMatrix * vec4(rel, 1.0);
    float trueDist = length(mvT.xyz) * uS + 1.0;  // meters
    float shrink;
    vec3 relC = compressPos(rel, shrink);
    vec4 mv = modelViewMatrix * vec4(relC, 1.0);
    gl_Position = projectionMatrix * mv;
    float px;
    if (uPhysMode > 0.5) {
      // physically-sized blob (dust clumps, HII regions, dwarf galaxies)
      float viewDist = max(length(mv.xyz), 1e-9);
      px = clamp(uPxPerUnit * 2.0 * (exp2(aLum) / uS) * shrink / viewDist, 0.75, uMaxPx);
      vAlpha = uOpacity;
    } else {
      // flux -> size & alpha, computed in log2 space (f32-safe at any distance)
      float m = min(0.5 * (aLum + log2(uFluxScale) - 2.0 * log2(trueDist)), uMCap);
      px = clamp(m * 0.8 + 7.4, 0.0, uMaxPx);
      vAlpha = clamp(m * 0.13 + 1.05, 0.0, 1.0) * uOpacity;
      if (px < 1.0) { vAlpha *= px * px; px = 1.0; }  // sub-pixel -> dim, not shrink
    }
    gl_PointSize = px;
    vColor = aColor;
    if (vAlpha < 0.004) gl_Position = vec4(0.0, 0.0, 2.0, 1.0); // cull
  }
`;
const STAR_FRAG = /* glsl */`
  varying vec3 vColor;
  varying float vAlpha;
  uniform sampler2D uMap;
  void main() {
    vec4 t = texture2D(uMap, gl_PointCoord);
    vec4 c = vec4(vColor, 1.0) * t * vAlpha;
    gl_FragColor = vec4(min(c.rgb, vec3(16.0)), min(c.a, 1.0));
  }
`;

let _discTex = null;
export function starMaterial(opts = {}) {
  _discTex ??= softDiscTexture();
  return new THREE.ShaderMaterial({
    uniforms: {
      uFocusLocal: { value: new THREE.Vector3() },
      uL2R:        { value: 1 },
      uS:          { value: 1 },
      uPxPerUnit:  { value: 1000 },
      uFluxScale:  { value: opts.fluxScale ?? 1 },
      uMaxPx:      { value: opts.maxPx ?? 14 },
      uOpacity:    { value: 1 },
      uMCap:       { value: opts.mCap ?? 100 },
      uPhysMode:   { value: opts.physMode ? 1 : 0 },
      uMap:        { value: opts.map ?? _discTex },
    },
    vertexShader: opts.vertexShader ?? STAR_VERT,
    fragmentShader: opts.fragmentShader ?? STAR_FRAG,
    transparent: true,
    depthWrite: false,
    depthTest: opts.depthTest ?? true,
    blending: opts.blending ?? THREE.AdditiveBlending,
  });
}
export { STAR_VERT, STAR_FRAG };

/** Per-frame uniform update for a point layer.
    Vertex positions are stored in LOCAL units (localMeters each) relative to
    layerOriginUniverse; subtracting the focus in local units first keeps
    float32 subtraction well-conditioned at any zoom.
    invQuat: inverse of the object's world rotation (or null). */
const _v = new THREE.Vector3();
export function updateStarUniforms(mat, ctx, layerOriginUniverse, invQuat, localMeters = 1) {
  const f = ctx.focus, o = layerOriginUniverse;
  _v.set((f[0]-o[0])/localMeters, (f[1]-o[1])/localMeters, (f[2]-o[2])/localMeters);
  if (invQuat) _v.applyQuaternion(invQuat);
  mat.uniforms.uFocusLocal.value.copy(_v);
  mat.uniforms.uL2R.value = localMeters / ctx.S;
  mat.uniforms.uS.value = ctx.S;
  mat.uniforms.uPxPerUnit.value = ctx.pxPerUnit;
}

// -------------------------------------------------------------- beacons
export class Beacons {
  constructor(scene, max = 320) {
    this.max = max;
    const g = new THREE.BufferGeometry();
    this.pos = new Float32Array(max * 3);
    this.col = new Float32Array(max * 3);
    this.lum = new Float32Array(max);
    g.setAttribute('position', new THREE.BufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('aColor', new THREE.BufferAttribute(this.col, 3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('aLum', new THREE.BufferAttribute(this.lum, 1).setUsage(THREE.DynamicDrawUsage));
    this.geo = g;
    this.mat = starMaterial({ fluxScale: 400, maxPx: 15 });
    this.points = new THREE.Points(g, this.mat);
    this.points.frustumCulled = false;
    this.points.renderOrder = 5;
    this.n = 0;
    scene.add(this.points);
  }
  begin() { this.n = 0; }
  /** rel*: already compressed render-space position */
  add(rx, ry, rz, color, lum) {
    if (this.n >= this.max) return;
    const i = this.n++;
    this.pos[i*3] = rx; this.pos[i*3+1] = ry; this.pos[i*3+2] = rz;
    this.col[i*3] = color.r; this.col[i*3+1] = color.g; this.col[i*3+2] = color.b;
    this.lum[i] = Math.log2(lum);
  }
  commit(ctx) {
    this.geo.setDrawRange(0, this.n);
    this.geo.attributes.position.needsUpdate = true;
    this.geo.attributes.aColor.needsUpdate = true;
    this.geo.attributes.aLum.needsUpdate = true;
    // beacons receive already-relative render positions
    this.mat.uniforms.uFocusLocal.value.set(0, 0, 0);
    this.mat.uniforms.uL2R.value = 1;
    this.mat.uniforms.uS.value = ctx.S;
    this.mat.uniforms.uPxPerUnit.value = ctx.pxPerUnit;
  }
}
