/* ============================================================================
   layers/cosmicweb.js — large-scale structure & the observable horizon
   ----------------------------------------------------------------------------
   Beyond the mapped neighborhood the app switches to an honest statistical
   model: a seeded node/filament network with the right qualitative topology
   (dense nodes, bridging filaments, empty voids), filling the observable
   volume out to the comoving horizon at ~46.5 Gly.
   Each point also carries a "primordial" position for the cosmic-time mode:
   Zel'dovich-style, structure un-forms into a near-uniform field as the
   slider runs back toward the CMB.
   The horizon shell is the cosmic microwave background: the true edge of
   what can be seen.
   ========================================================================== */
import * as THREE from 'three';
import { MPC, GPC, R_UNIVERSE, GLSL_COMPRESS, bandFade, smoothstep, lerp,
         mulberry32, gauss } from '../scale.js';
import { COSMIC_WEB_INFO, OBSERVABLE } from '../data.js';
import { starMaterial, updateStarUniforms, STAR_FRAG } from '../render.js';

const WEB_VERT = /* glsl */`
  attribute vec3 aColor;
  attribute float aLum;
  attribute vec3 aPrim;          // primordial (pre-structure) position
  varying vec3 vColor;
  varying float vAlpha;
  uniform vec3 uFocusLocal;
  uniform float uL2R;
  uniform float uS;
  uniform float uPxPerUnit;
  uniform float uFluxScale;
  uniform float uMaxPx;
  uniform float uOpacity;
  uniform float uEarly;          // 0 = today · 1 = primordial smoothness
  uniform float uScaleA;         // conceptual cosmic scale factor
  uniform vec3 uHot;             // early-universe tint
  ${GLSL_COMPRESS}
  void main() {
    vec3 p = mix(position, aPrim, uEarly) * uScaleA;
    vec3 rel = (p - uFocusLocal) * uL2R;
    vec4 mvT = modelViewMatrix * vec4(rel, 1.0);
    float trueDist = length(mvT.xyz) * uS + 1.0;  // camera distance, pre-compression
    float shrink;
    vec3 relC = compressPos(rel, shrink);
    vec4 mv = modelViewMatrix * vec4(relC, 1.0);
    gl_Position = projectionMatrix * mv;
    float m = min(0.5 * (aLum + log2(uFluxScale) - 2.0 * log2(trueDist)), -3.4);
    float px = clamp(m * 0.9 + 8.0, 0.0, uMaxPx);
    vAlpha = clamp(m * 0.13 + 1.05, 0.0, 1.0) * uOpacity;
    if (px < 1.0) { vAlpha *= px * px; px = 1.0; }
    gl_PointSize = px;
    vColor = mix(aColor, uHot, uEarly * 0.85);
    if (vAlpha < 0.004) gl_Position = vec4(0.0, 0.0, 2.0, 1.0);
  }
`;

export function buildCosmicWebLayer(scene, registry, ctx0) {
  const group = new THREE.Group();
  scene.add(group);

  const nQ = ctx0.quality.points;
  const R = R_UNIVERSE / MPC;                       // ~14,300 Mpc
  const rnd = mulberry32(1234567);

  // ---- seed nodes, uniform in the ball
  const NODES = Math.floor(1500 * Math.max(nQ, 0.5));
  const nodes = [];
  while (nodes.length < NODES) {
    const x = (rnd() * 2 - 1) * R, y = (rnd() * 2 - 1) * R, z = (rnd() * 2 - 1) * R;
    if (x * x + y * y + z * z < R * R) nodes.push([x, y, z]);
  }
  // ---- k-nearest edges (brute force is fine at this N, done once)
  const edges = [];
  const seen = new Set();
  for (let a = 0; a < nodes.length; a++) {
    const d = [];
    for (let b2 = 0; b2 < nodes.length; b2++) {
      if (a === b2) continue;
      const dx = nodes[a][0]-nodes[b2][0], dy = nodes[a][1]-nodes[b2][1], dz = nodes[a][2]-nodes[b2][2];
      d.push([dx*dx + dy*dy + dz*dz, b2]);
    }
    d.sort((p, q) => p[0] - q[0]);
    const k = 2 + (rnd() < 0.4 ? 1 : 0);
    for (let j = 0; j < k; j++) {
      const key = a < d[j][1] ? a * 100000 + d[j][1] : d[j][1] * 100000 + a;
      if (!seen.has(key)) { seen.add(key); edges.push([a, d[j][1]]); }
    }
  }

  const PER_NODE = Math.floor(60 * nQ) + 8;
  const PER_EDGE = Math.floor(95 * nQ) + 10;
  const N = NODES * PER_NODE + edges.length * PER_EDGE;
  const pos = new Float32Array(N * 3), col = new Float32Array(N * 3), lum = new Float32Array(N);
  const prim = new Float32Array(N * 3);
  const C = new THREE.Color();
  const meanSpacing = R / Math.cbrt(NODES);
  let i = 0;
  const put = (x, y, z, warm, L) => {
    pos[i*3] = x; pos[i*3+1] = y; pos[i*3+2] = z;
    // primordial: drift back to a nearby quasi-uniform position
    prim[i*3]   = x + gauss(rnd) * meanSpacing * 0.55;
    prim[i*3+1] = y + gauss(rnd) * meanSpacing * 0.55;
    prim[i*3+2] = z + gauss(rnd) * meanSpacing * 0.55;
    if (warm) C.setRGB(1.0, 0.88 + rnd() * 0.08, 0.66 + rnd() * 0.12);
    else {
      const t = rnd();
      C.setRGB(0.62 + t * 0.2, 0.70 + t * 0.16, 0.95);
    }
    col[i*3] = C.r; col[i*3+1] = C.g; col[i*3+2] = C.b;
    lum[i] = Math.log2(L * (0.3 + rnd() * 2.2));
    i++;
  };
  for (const n of nodes) {
    const s = meanSpacing * 0.10;
    for (let k = 0; k < PER_NODE && i < N; k++)
      put(n[0] + gauss(rnd) * s, n[1] + gauss(rnd) * s, n[2] + gauss(rnd) * s, true, 1.4e38);
  }
  for (const [a, b2] of edges) {
    const A = nodes[a], B = nodes[b2];
    const len = Math.hypot(A[0]-B[0], A[1]-B[1], A[2]-B[2]);
    const s = Math.min(len * 0.06, meanSpacing * 0.14);
    for (let k = 0; k < PER_EDGE && i < N; k++) {
      const t = rnd();
      put(A[0] + (B[0]-A[0]) * t + gauss(rnd) * s,
          A[1] + (B[1]-A[1]) * t + gauss(rnd) * s,
          A[2] + (B[2]-A[2]) * t + gauss(rnd) * s, false, 4.5e37);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
  geo.setAttribute('aLum', new THREE.BufferAttribute(lum, 1));
  geo.setAttribute('aPrim', new THREE.BufferAttribute(prim, 3));
  const mat = starMaterial({ fluxScale: 1, maxPx: 4, vertexShader: WEB_VERT });
  mat.uniforms.uEarly = { value: 0 };
  mat.uniforms.uScaleA = { value: 1 };
  mat.uniforms.uHot = { value: new THREE.Color(1.0, 0.62, 0.32) };
  const pts = new THREE.Points(geo, mat);
  pts.frustumCulled = false; pts.renderOrder = 2;
  group.add(pts);

  // ---- horizon shell (CMB)
  const hmat = new THREE.ShaderMaterial({
    uniforms: { uOp: { value: 0 }, uEarly: { value: 0 }, uTime: { value: 0 } },
    vertexShader: `varying vec3 vN; varying vec3 vP; varying vec3 vLocal;
      void main(){ vN = normalize(mat3(modelMatrix)*normal); vLocal = normalize(position);
      vec4 w = modelMatrix*vec4(position,1.0); vP = w.xyz;
      gl_Position = projectionMatrix*viewMatrix*w; }`,
    fragmentShader: /* glsl */`
      varying vec3 vN; varying vec3 vP; varying vec3 vLocal;
      uniform float uOp; uniform float uEarly; uniform float uTime;
      float hash(vec3 p){ return fract(sin(dot(p, vec3(12.9898,78.233,45.164)))*43758.5453); }
      float noise(vec3 p){
        vec3 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
        return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),
                       mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
                   mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),
                       mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);
      }
      void main(){
        float n = noise(vLocal*9.0)*0.6 + noise(vLocal*23.0)*0.3 + noise(vLocal*55.0)*0.1;
        vec3 V = normalize(cameraPosition - vP);
        float rim = 0.35 + 0.65*pow(1.0 - abs(dot(normalize(vN), V)), 1.4);
        vec3 cold = vec3(0.32, 0.10, 0.05);
        vec3 hot  = vec3(1.0, 0.55, 0.28);
        vec3 c = mix(cold, hot, uEarly) * (0.55 + 0.9*n) * rim;
        gl_FragColor = vec4(c * (1.0 + uEarly*2.2), uOp * (0.5 + 0.5*n));
      }`,
    transparent: true, blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide, depthWrite: false,
  });
  const shell = new THREE.Mesh(new THREE.SphereGeometry(1, 96, 64), hmat);
  group.add(shell);

  // ---- registry
  const webAnchor = [nodes[3][0] * MPC * 0.3, nodes[3][1] * MPC * 0.3, nodes[3][2] * MPC * 0.3];
  registry.push({
    id: 'cosmicweb', name: COSMIC_WEB_INFO.name, cls: COSMIC_WEB_INFO.cls,
    blurb: COSMIC_WEB_INFO.blurb, radius: 2e25,
    color: new THREE.Color(0xaebfe8), lum: 0,
    pos: () => webAnchor, labelBand: [25.4, 26.6], focusD: 2.2e25,
    kind: 'region', priority: 6,
  });
  registry.push({
    id: 'observable', name: OBSERVABLE.name, cls: OBSERVABLE.cls,
    blurb: OBSERVABLE.blurb, radius: OBSERVABLE.radius,
    color: new THREE.Color(0xffb090), lum: 0,
    pos: () => [0, 0, 0], labelBand: [26.5, 27.3], focusD: 1.05e27,
    kind: 'region', priority: 10,
  });

  function update(ctx) {
    const early = ctx.timeMode ? ctx.timeEarly : 0;
    const a = ctx.timeMode ? ctx.timeScaleA : 1;
    const f = bandFade(ctx.logS, 24.7, 27.4, 0.9);
    group.visible = f > 0.01;
    if (!group.visible) return;
    const t = smoothstep(24.5, 26.6, ctx.logS);
    mat.uniforms.uFluxScale.value = lerp(8e9, 1.6e12, t * t);
    mat.uniforms.uOpacity.value = f;
    mat.uniforms.uEarly.value = early;
    mat.uniforms.uScaleA.value = a;
    updateStarUniforms(mat, ctx, [0, 0, 0], null, MPC);

    // horizon shell — from outside it is the surface of the observable ball
    const hf = bandFade(ctx.logS, 25.2, 27.4, 0.8);
    shell.visible = hf > 0.005;
    if (shell.visible) {
      const S = ctx.S, fc = ctx.focus;
      shell.position.set(-fc[0]/S, -fc[1]/S, -fc[2]/S);
      shell.scale.setScalar(R_UNIVERSE * a / S);
      // whisper-faint from inside; the ball's surface from outside
      const cp = ctx.camPos;
      const inside = Math.hypot(cp[0], cp[1], cp[2]) < R_UNIVERSE * a;
      hmat.uniforms.uOp.value = (0.10 + 0.5 * early) * hf * (inside ? 0.28 : 1);
      hmat.uniforms.uEarly.value = early;
      hmat.uniforms.uTime.value = ctx.time;
    }
  }
  return { group, update };
}
