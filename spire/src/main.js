// =============================================================================
// SPIRE - the scene.
//
// Two scenes share one tower. The ink scene is the sketch on paper; the real
// scene is the building in its place, glass on a bay under a painted sky.
// They are composited at the end, and "bring it to life" washes the colour up
// over the drawing from the waterline, the way a watercolour wash goes on.
// =============================================================================

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Water } from 'three/addons/objects/Water.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

import { buildTower, cablePoint, PARAMS } from './tower.js';
import { towerGeometry, towerEdges, hash } from './build.js';
import { inkFaceMaterial, inkLines, groundStrokes, PAPER } from './ink.js';

const qs = new URLSearchParams(location.search);
const SHOT = qs.has('shot');              // tools/shots.mjs drives the page
const tower = buildTower();
const H = tower.height;
const FOCUS = new THREE.Vector3(0, H * 0.42, 0);

// ---------------------------------------------------------------- renderer --
const canvas = document.getElementById('view');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
const dpr = Math.min(window.devicePixelRatio || 1, 2);
renderer.setPixelRatio(dpr);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.55;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const camera = new THREE.PerspectiveCamera(34, 1, 1, 60000);
const controls = new OrbitControls(camera, canvas);
controls.target.copy(FOCUS);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 90;
controls.maxDistance = 2600;
controls.maxPolarAngle = Math.PI * 0.497;
controls.autoRotateSpeed = 0.35;

// The sketch's own viewpoint: standing back on the far shore, eye level.
const SKETCH_VIEW = { az: 0.62, dist: 900, height: 30 };
function setView({ az, dist, height }) {
  // stand further back on a tall narrow screen, so the title has sky to sit in
  dist *= camera.aspect < 1 ? 1.3 : 1;
  camera.position.set(Math.sin(az) * dist, height, Math.cos(az) * dist);
  controls.target.copy(FOCUS);
  camera.lookAt(FOCUS);
}
setView(SKETCH_VIEW);

// ------------------------------------------------------------------ scenes --
const real = new THREE.Scene();
const ink = new THREE.Scene();
ink.background = PAPER.clone();

// ----------------------------------------------------------------- the sky --
// Not a physical scattering model: a painted gradient, zenith to horizon,
// with a glow round the sun and a high veil of cloud. Art-directed per hour
// (see KEYS below), because a sky that is merely correct is rarely the one
// you would choose to show someone a building under.
const skyUniforms = {
  uZen: { value: new THREE.Color() }, uHor: { value: new THREE.Color() },
  uGlow: { value: new THREE.Color() }, uSun: { value: new THREE.Vector3(0, 1, 0) },
  uSunCol: { value: new THREE.Color() }, uCloud: { value: 0.6 }, uCloudLit: { value: new THREE.Color() },
  uTime: { value: 0 },
  uMoon: { value: new THREE.Vector3(0, 1, 0) }, uMoonAmt: { value: 0 },
};
function skyMaterial() {
  return new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: skyUniforms,
    vertexShader: /* glsl */`
      varying vec3 vDir;
      void main(){
        vDir = normalize((modelMatrix * vec4(position, 1.0)).xyz - (modelMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz);
        gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
        gl_Position.z = gl_Position.w * 0.99999;
      }`,
    fragmentShader: /* glsl */`
      uniform vec3 uZen, uHor, uGlow, uSunCol, uSun, uCloudLit;
      uniform float uCloud, uTime, uMoonAmt;
      uniform vec3 uMoon;
      varying vec3 vDir;
      float h(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
      float vn(vec2 p){
        vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
        return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y);
      }
      float fbm(vec2 p){ float s = 0.0, a = 0.5; for (int i = 0; i < 6; i++){ s += a * vn(p); p = p * 2.07 + 13.1; a *= 0.5; } return s; }
      void main(){
        vec3 d = normalize(vDir);
        float y = d.y;
        float up = max(y, 0.0);
        vec3 col = mix(uHor, uZen, pow(up, 0.45));
        float cs = max(dot(d, normalize(uSun)), 0.0);
        // the glow is flattened along the horizon, as it is at sunset
        float flat_ = exp(-up * 6.0);
        col += uGlow * (pow(cs, 6.0) * 0.4 * (0.3 + flat_) + pow(cs, 48.0) * 0.6 + pow(cs, 900.0) * 1.6);
        // sun disc
        col += uSunCol * smoothstep(0.99985, 0.99993, cs) * 12.0;
        // the moon, and the pale halo it draws through the haze
        float cm = max(dot(d, normalize(uMoon)), 0.0);
        col += uMoonAmt * (vec3(0.9, 0.95, 1.0) * smoothstep(0.99991, 0.99995, cm) * 6.0
                         + vec3(0.25, 0.32, 0.5) * pow(cm, 200.0) * 0.5 + vec3(0.06, 0.08, 0.14) * pow(cm, 12.0));
        // a high veil of cloud, streaked by wind
        if (y > 0.0) {
          vec2 uv = d.xz / (y + 0.06) * 0.9;
          uv = mat2(0.96, -0.28, 0.28, 0.96) * uv;
          float c = fbm(uv * vec2(0.7, 2.6) + vec2(uTime * 0.004, 0.0));
          c = smoothstep(0.5, 0.82, c) * smoothstep(0.0, 0.08, y) * (1.0 - smoothstep(0.5, 0.95, y));
          vec3 cc = mix(uHor * 1.05, uCloudLit, pow(cs, 3.0) * 0.8 + 0.2) + uMoonAmt * vec3(0.05, 0.06, 0.09) * (0.3 + pow(cm, 6.0));
          col = mix(col, cc, c * uCloud);
        }
        // haze sits low
        col = mix(col, uHor, exp(-up * 22.0) * 0.6);
        if (y < 0.0) col = uHor;
        gl_FragColor = vec4(col, 1.0);
      }`,
  });
}
const sky = new THREE.Mesh(new THREE.SphereGeometry(30000, 48, 24), skyMaterial());
sky.renderOrder = -2;
sky.frustumCulled = false;
real.add(sky);

// The same sky alone in a scene, for baking the reflection environment.
const envScene = new THREE.Scene();
envScene.add(new THREE.Mesh(new THREE.SphereGeometry(500, 48, 24), skyMaterial()));
const pmrem = new THREE.PMREMGenerator(renderer);
let envRT = null;

const sun = new THREE.DirectionalLight(0xffffff, 3);
sun.castShadow = true;
sun.shadow.mapSize.set(4096, 4096);
sun.shadow.bias = -0.0004;
sun.shadow.normalBias = 0.6;
{
  const c = sun.shadow.camera;
  c.left = -190; c.right = 190; c.top = 260; c.bottom = -200;
  c.near = 10; c.far = 1400;
}
real.add(sun, sun.target);
sun.target.position.set(0, H * 0.35, 0);
const hemi = new THREE.HemisphereLight(0xbcd2ff, 0x334455, 0.4);
real.add(hemi);

// Stars, for after dark.
const stars = (() => {
  const n = 2600, p = new Float32Array(n * 3), c = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const u = hash(i * 3.1), v = hash(i * 7.7 + 1);
    const th = u * Math.PI * 2, ph = Math.acos(0.03 + v * 0.97);
    const r = 17000;
    p.set([Math.sin(ph) * Math.cos(th) * r, Math.cos(ph) * r, Math.sin(ph) * Math.sin(th) * r], i * 3);
    const b = 0.3 + Math.pow(hash(i * 1.3 + 5), 6) * 2.5;
    const warm = hash(i * 9.1);
    c.set([b * (0.85 + warm * 0.2), b * 0.92, b * (1.05 - warm * 0.2)], i * 3);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(p, 3));
  g.setAttribute('color', new THREE.BufferAttribute(c, 3));
  const m = new THREE.PointsMaterial({ size: 1.6, sizeAttenuation: false, vertexColors: true, transparent: true, opacity: 0, depthWrite: false, fog: false });
  const pts = new THREE.Points(g, m);
  pts.renderOrder = -1;
  real.add(pts);
  return pts;
})();

// --------------------------------------------------------------- the water --
function waterNormals() {
  // Tileable ripples: a sum of waves whose wave vectors are whole numbers of
  // cycles across the tile, turned into a normal map.
  const N = 256, h = new Float32Array(N * N);
  const waves = [];
  for (let k = 0; k < 40; k++) {
    const a = hash(k * 1.7) * 6.2832, m = 6 + hash(k * 3.3 + 2) * 30;
    const kx = Math.round(Math.cos(a) * m), ky = Math.round(Math.sin(a) * m * 0.6);
    if (!kx && !ky) continue;
    waves.push([kx, ky, 1 / Math.hypot(kx, ky), hash(k * 5.9) * 6.283]);
  }
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    let s = 0;
    for (const [kx, ky, a, ph] of waves) s += a * Math.sin(6.2832 * (kx * x + ky * y) / N + ph);
    h[y * N + x] = s;
  }
  const cv = document.createElement('canvas'); cv.width = cv.height = N;
  const cx = cv.getContext('2d'), img = cx.createImageData(N, N);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const dx = h[y * N + (x + 1) % N] - h[y * N + (x + N - 1) % N];
    const dy = h[((y + 1) % N) * N + x] - h[((y + N - 1) % N) * N + x];
    const v = new THREE.Vector3(-dx * 0.6, -dy * 0.6, 1).normalize();
    const o = (y * N + x) * 4;
    img.data[o] = (v.x * 0.5 + 0.5) * 255; img.data[o + 1] = (v.y * 0.5 + 0.5) * 255;
    img.data[o + 2] = (v.z * 0.5 + 0.5) * 255; img.data[o + 3] = 255;
  }
  cx.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(cv);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  return t;
}

const water = new Water(new THREE.PlaneGeometry(90000, 90000), {
  textureWidth: 1024, textureHeight: 1024,
  waterNormals: waterNormals(),
  sunDirection: new THREE.Vector3(),
  sunColor: 0xffffff,
  waterColor: 0x0b2733,
  distortionScale: 0.7,
  fog: true,
});
water.rotation.x = -Math.PI / 2;
// Three changes to the stock water: the grey floor it adds under reflections
// becomes the water's own colour (it greyed the bay at night); the sun's
// highlight is tightened into a glitter path; and the Fresnel term reads a
// nearly flat surface, with the ripples fading out with distance - left at
// full strength they alias at grazing angles into streaks raying out from
// the eye.
water.material.fragmentShader = water.material.fragmentShader
  .replace('vec3 surfaceNormal = normalize( noise.xzy * vec3( 1.5, 1.0, 1.5 ) );',
    'vec3 surfaceNormal = normalize( noise.xzy * vec3( 1.5, 1.0, 1.5 ) );\n' +
    'surfaceNormal = normalize( mix( surfaceNormal, vec3( 0.0, 1.0, 0.0 ), smoothstep( 200.0, 2500.0, length( eye - worldPosition.xyz ) ) * 0.85 ) );\n' +
    'vec3 flatNormal = normalize( mix( vec3( 0.0, 1.0, 0.0 ), surfaceNormal, 0.12 ) );')
  .replace('float theta = max( dot( eyeDirection, surfaceNormal ), 0.0 );', 'float theta = max( dot( eyeDirection, flatNormal ), 0.0 );')
  .replace('vec3 scatter = max( 0.0, dot( surfaceNormal, eyeDirection ) ) * waterColor;', 'vec3 scatter = max( 0.0, dot( flatNormal, eyeDirection ) ) * waterColor;')
  .replace('vec3( 0.1 ) + reflectionSample', 'waterColor * 0.5 + reflectionSample')
  .replace('sunLight( surfaceNormal, eyeDirection, 100.0, 2.0, 0.5,', 'sunLight( surfaceNormal, eyeDirection, 600.0, 4.0, 0.5,');
water.material.uniforms.size.value = 0.7;
real.add(water);

// ---------------------------------------------------------- the glass skin --
// One material for the whole tower. The facade attribute lays out a curtain
// wall: 3 m mullions, 4.2 m floors with an opaque spandrel at each slab,
// panels that each sit a hair out of true (which is what makes real glass
// towers break reflections into a patchwork), and rooms lit at night.
const facadeU = { uNight: { value: 0 }, uTime: { value: 0 } };
function facadeMaterial() {
  const m = new THREE.MeshPhysicalMaterial({
    color: 0x8fa3b3, metalness: 0.0, roughness: 0.06,
    specularIntensity: 1, ior: 1.9, envMapIntensity: 1.25,
    clearcoat: 0.0,
  });
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uNight = facadeU.uNight;
    sh.uniforms.uTime = facadeU.uTime;
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', `#include <common>
        attribute vec2 facade; attribute float kind; attribute float seed;
        varying vec2 vFacade; varying float vKind; varying float vSeed; varying vec3 vWN; varying float vWY;`)
      .replace('#include <begin_vertex>', `#include <begin_vertex>
        vFacade = facade; vKind = kind; vSeed = seed;
        vWN = normalize(mat3(modelMatrix) * normal);
        vWY = (modelMatrix * vec4(position, 1.0)).y;`);
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', `#include <common>
        uniform float uNight, uTime;
        varying vec2 vFacade; varying float vKind; varying float vSeed; varying vec3 vWN; varying float vWY;
        float fh(vec2 p){ p = fract(p*vec2(233.34, 851.73)); p += dot(p, p+23.45); return fract(p.x*p.y); }
        float fline(float g, float halfw){
          float d = abs(fract(g + 0.5) - 0.5);
          float w = fwidth(g);
          return 1.0 - smoothstep(halfw - w, halfw + w, d);
        }
        vec3 gEmit; float gFrame; float gPanel; vec2 gCell;`)
      .replace('#include <metalnessmap_fragment>', `#include <metalnessmap_fragment>
        {
          bool roof = vWN.y > 0.7, soffit = vWN.y < -0.7;
          bool core = vKind < 0.5, leg = vKind > 2.5;
          float mw = core ? 1.6 : 3.0;            // the core gets tighter vertical fins
          float fl = 4.2;
          vec2 g = vec2(vFacade.x / mw, vFacade.y / fl);
          if (roof || soffit) g = vFacade / vec2(3.0, 3.0);
          gCell = floor(g) + vec2(vSeed * 97.0);
          float h = fh(gCell);
          float mull = fline(g.x, core ? 0.1 : 0.05);
          float slab = (roof || soffit) ? fline(g.y, 0.04) : 1.0 - smoothstep(0.0, 0.2 + fwidth(g.y), fract(g.y) - 0.0) ;
          // spandrel: the bottom fifth of every floor is opaque
          if (!(roof || soffit)) slab = 1.0 - smoothstep(0.17, 0.17 + fwidth(g.y) * 1.5, fract(g.y));
          gFrame = clamp(max(mull, slab), 0.0, 1.0);
          // each pane a slightly different tint, as real glass batches are
          // coated glass: a tinted mirror, slightly different pane to pane
          vec3 glass = mix(vec3(0.34, 0.42, 0.5), vec3(0.42, 0.5, 0.56), h);
          if (core) glass *= vec3(0.62, 0.66, 0.7);
          // champagne aluminium frames and spandrels: they take the sun
          vec3 frame = core ? vec3(0.36, 0.345, 0.32) : vec3(0.7, 0.67, 0.61);
          if (leg) { glass = vec3(0.11, 0.105, 0.10); frame = vec3(0.24, 0.22, 0.2); }
          if (soffit) { glass = vec3(0.55, 0.53, 0.5); frame = vec3(0.4); }
          if (leg || soffit) metalnessFactor = 0.2;
          diffuseColor.rgb = mix(glass, frame, gFrame);
          roughnessFactor = mix(0.03 + h * 0.03, 0.5, gFrame);
          if (soffit) roughnessFactor = 0.6;
          metalnessFactor = mix(0.72, 0.35, gFrame);
          gPanel = (1.0 - gFrame) * ((roof || soffit || leg) ? 0.0 : 1.0);

          // after dark: some rooms lit, warm or cool, a few flickering screens
          float lit = step(0.42, fh(gCell + 3.1)) * uNight * uNight;
          float floorLit = step(0.25, fh(vec2(floor(g.y), vSeed)));   // whole floors dark
          vec3 warm = mix(vec3(1.0, 0.72, 0.42), vec3(0.85, 0.9, 1.0), step(0.7, fh(gCell + 7.0)));
          float inten = (0.25 + 0.9 * fh(gCell + 11.0)) * lit * floorLit;
          gEmit = warm * inten * gPanel;
          // the undersides of the wings carry a line of downlights
          // and the frames are washed by uplights from the plinth
          gEmit += vec3(1.0, 0.86, 0.68) * gFrame * uNight * 0.07 * (1.0 - 0.7 * smoothstep(20.0, 260.0, vWY));
          if (soffit) gEmit = vec3(1.0, 0.78, 0.5) * uNight * 0.5 * (0.6 + 0.4 * fline(g.x * 0.5, 0.12));
        }`)
      .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
        {
          // panels a fraction of a degree out of plane
          vec3 j = vec3(fh(gCell + 1.3), fh(gCell + 2.7), fh(gCell + 4.1)) - 0.5;
          normal = normalize(normal + j * 0.02 * gPanel);
        }`)
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        totalEmissiveRadiance += gEmit;`);
  };
  return m;
}

const towerGeo = towerGeometry(tower);
const glassMat = facadeMaterial();
// "Model": the same building as a white massing model, the way the 3D print
// shows it - form only, no glass.
const clayMat = new THREE.MeshStandardMaterial({ color: 0xf1efe9, roughness: 0.85 });
const towerMesh = new THREE.Mesh(towerGeo, glassMat);
towerMesh.castShadow = towerMesh.receiveShadow = true;
real.add(towerMesh);

// Mast, cables, anchors.
const steel = new THREE.MeshStandardMaterial({ color: 0x3a3e44, metalness: 0.9, roughness: 0.35 });
{
  const m = tower.mast;
  const len = m.to[1] - m.from[1];
  const g = new THREE.CylinderGeometry(m.radius * 0.35, m.radius, len, 12);
  const mesh = new THREE.Mesh(g, steel);
  mesh.position.set(m.from[0], m.from[1] + len / 2, m.from[2]);
  mesh.castShadow = true;
  real.add(mesh);
}
const concrete = new THREE.MeshStandardMaterial({ color: 0x9c968c, roughness: 0.85 });
for (const c of tower.cables) {
  const pts = [];
  for (let i = 0; i <= 40; i++) pts.push(new THREE.Vector3(...cablePoint(c, i / 40)));
  const tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 80, 0.45, 8), steel);
  tube.castShadow = true;
  real.add(tube);
  const anchor = new THREE.Mesh(new THREE.BoxGeometry(7, 3, 7), concrete);
  anchor.position.set(c.to[0], c.to[1] + 1.2, c.to[2]);
  anchor.lookAt(c.from[0], anchor.position.y, c.from[2]);
  anchor.castShadow = anchor.receiveShadow = true;
  real.add(anchor);
}

// Aviation lights: mast head and wing tips, red, blinking after dark.
const beacons = [];
{
  const g = new THREE.SphereGeometry(1, 10, 8);
  const add = (p, s) => {
    const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: 0xff2a1a, toneMapped: false }));
    m.position.set(...p); m.scale.setScalar(s);
    real.add(m); beacons.push(m);
  };
  add(tower.mast.to, 1.4);
  for (const s of tower.solids) if (s.kind === 'wing') add(s.verts[5], 0.9);
}

// ---------------------------------------------------- the plinth and park --
const PLINTH_R = 92;
const stone = (() => {
  // pale paving: concentric courses and radial joints, drawn once to a canvas
  const N = 1024, cv = document.createElement('canvas'); cv.width = cv.height = N;
  const cx = cv.getContext('2d');
  cx.fillStyle = '#b9b2a6'; cx.fillRect(0, 0, N, N);
  for (let i = 0; i < 9000; i++) {
    const x = hash(i) * N, y = hash(i + 0.5) * N, l = 150 + hash(i + 0.25) * 60;
    cx.fillStyle = `rgba(${l},${l - 6},${l - 14},0.18)`;
    cx.fillRect(x, y, 2 + hash(i * 2) * 6, 2 + hash(i * 3) * 6);
  }
  cx.strokeStyle = 'rgba(70,64,56,0.35)'; cx.lineWidth = 1.2;
  for (let r = 24; r < N / 2; r += 18) { cx.beginPath(); cx.arc(N / 2, N / 2, r, 0, 6.2832); cx.stroke(); }
  for (let a = 0; a < 96; a++) {
    const t = a / 96 * 6.2832;
    cx.beginPath(); cx.moveTo(N / 2 + Math.cos(t) * 24, N / 2 + Math.sin(t) * 24);
    cx.lineTo(N / 2 + Math.cos(t) * N / 2, N / 2 + Math.sin(t) * N / 2); cx.stroke();
  }
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return new THREE.MeshStandardMaterial({ map: t, roughness: 0.82 });
})();
const plinthGroup = new THREE.Group();
{
  // three shallow steps down to the water
  const steps = [[PLINTH_R, PARAMS.plaza], [PLINTH_R + 4, PARAMS.plaza - 0.55], [PLINTH_R + 8, PARAMS.plaza - 1.1]];
  steps.forEach(([r, top], i) => {
    const g = new THREE.CylinderGeometry(r, r + 0.4, top + 3, 128, 1);
    const m = new THREE.Mesh(g, i === 0 ? stone : concrete);
    m.position.y = (top + 3) / 2 - 3;
    m.receiveShadow = true;
    plinthGroup.add(m);
  });
  // the top face uses the paving texture across its disc
  const top = plinthGroup.children[0];
  const uv = top.geometry.attributes.uv, pos = top.geometry.attributes.position;
  for (let i = 0; i < uv.count; i++) {
    uv.setXY(i, pos.getX(i) / (2 * PLINTH_R) + 0.5, pos.getZ(i) / (2 * PLINTH_R) + 0.5);
  }
}
real.add(plinthGroup);

// Trees: a loose ring of planes and limes on the plinth, avoiding the cables.
{
  const trunks = [], crowns = [];
  const cableAngles = tower.cables.map(c => Math.atan2(c.to[2], c.to[0]));
  for (let i = 0; i < 400 && crowns.length < 40; i++) {
    const a = hash(i * 1.37) * 6.2832, r = 46 + hash(i * 2.11) * 38;
    if (cableAngles.some(ca => Math.abs(Math.atan2(Math.sin(a - ca), Math.cos(a - ca))) < 0.09)) continue;
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    if (crowns.some(([cx, , cz]) => Math.hypot(cx - x, cz - z) < 9)) continue;
    const s = 0.8 + hash(i * 5.3) * 0.6;
    trunks.push([x, z, s]);
    crowns.push([x, PARAMS.plaza + 7 * s, z, s]);
  }
  const tg = new THREE.CylinderGeometry(0.3, 0.45, 6, 6); tg.translate(0, 3, 0);
  const cg = new THREE.IcosahedronGeometry(4.2, 1);
  const tm = new THREE.InstancedMesh(tg, new THREE.MeshStandardMaterial({ color: 0x3b2f25, roughness: 1 }), trunks.length);
  const cm = new THREE.InstancedMesh(cg, new THREE.MeshStandardMaterial({ color: 0x4a6a3a, roughness: 0.95, flatShading: true }), crowns.length);
  const mtx = new THREE.Matrix4(), q = new THREE.Quaternion(), col = new THREE.Color();
  trunks.forEach(([x, z, s], i) => { mtx.compose(new THREE.Vector3(x, PARAMS.plaza, z), q, new THREE.Vector3(s, s, s)); tm.setMatrixAt(i, mtx); });
  crowns.forEach(([x, y, z, s], i) => {
    q.setFromEuler(new THREE.Euler(hash(i) * 3, hash(i + 1) * 3, 0));
    mtx.compose(new THREE.Vector3(x, y, z), q, new THREE.Vector3(s, s * (0.85 + hash(i * 7) * 0.3), s));
    cm.setMatrixAt(i, mtx);
    cm.setColorAt(i, col.setHSL(0.2 + hash(i * 3) * 0.1, 0.32, 0.3 + hash(i * 4) * 0.14));
  });
  for (const m of [tm, cm]) { m.castShadow = m.receiveShadow = true; real.add(m); }
}

real.fog = new THREE.Fog(0x9fb4c8, 2500, 15000);

// ------------------------------------------------------------ the drawing --
const inkFaces = inkFaceMaterial();
const inkMesh = new THREE.Mesh(towerGeo, inkFaces);
ink.add(inkMesh);
const edgeSegs = towerEdges(tower);
// draw from the ground up, the way the sketch was built
edgeSegs.order = edgeSegs.map(([a, b]) => Math.min(1, Math.max(0, Math.min(a[1], b[1]) / H)) * 0.9 + hash(a[0] + b[2]) * 0.1);
const inkEdges = inkLines(edgeSegs, { width: 1.7, overshoot: 10 });
ink.add(inkEdges);

// the plinth drawn as two ellipses, and the water's strokes
let rs = 7;
const rnd = () => (rs = (rs * 16807) % 2147483647) / 2147483647;
const circ = (r, y, n = 72) => [...Array(n).keys()].map(i => {
  const a0 = i / n * 6.2832, a1 = (i + 1) / n * 6.2832;
  return [[Math.cos(a0) * r, y, Math.sin(a0) * r], [Math.cos(a1) * r, y, Math.sin(a1) * r]];
});
const groundSegs = [...circ(PLINTH_R, PARAMS.plaza), ...circ(PLINTH_R + 8, 0.2)];
groundSegs.order = groundSegs.map(() => 0.02 + rnd() * 0.04);
const inkGround = inkLines(groundSegs, { width: 1.5, overshoot: 0 });
ink.add(inkGround);
const strokes = groundStrokes(rnd);
strokes.order = strokes.map(() => 0.9 + rnd() * 0.1);
const inkWater = inkLines(strokes, { width: 1.1, overshoot: 0 });
const waterGroup = new THREE.Group();
waterGroup.add(inkWater);
ink.add(waterGroup);
// the reflection in the water, faint and broken
const mirrorGroup = new THREE.Group();
mirrorGroup.scale.y = -1;
const inkMirrorFaces = inkFaceMaterial({ mirror: true });
mirrorGroup.add(new THREE.Mesh(towerGeo, inkMirrorFaces));
const inkMirrorEdges = inkLines(edgeSegs, { width: 1.3, overshoot: 6, mirror: true });
mirrorGroup.add(inkMirrorEdges);
ink.add(mirrorGroup);
const inkLineMats = [inkEdges, inkGround, inkWater, inkMirrorEdges].map(m => m.material);

// ------------------------------------------------------------- post / mix --
const size = new THREE.Vector2();
const rtReal = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 4 });
const composer = new EffectComposer(renderer, rtReal);
const renderPass = new RenderPass(real, camera);
const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.0, 0.55, 0.85);
const outputPass = new OutputPass();
const rtInk = new THREE.WebGLRenderTarget(1, 1, { samples: 4 });
rtInk.texture.colorSpace = THREE.NoColorSpace;

const mix = new ShaderPass({
  uniforms: {
    tDiffuse: { value: null },
    tInk: { value: null },
    uProgress: { value: 0 },
    uTime: { value: 0 },
    uAspect: { value: 1 },
  },
  vertexShader: /* glsl */`
    varying vec2 vUv;
    void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
  fragmentShader: /* glsl */`
    uniform sampler2D tDiffuse, tInk;
    uniform float uProgress, uTime, uAspect;
    varying vec2 vUv;
    float h(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
    float vn(vec2 p){
      vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
      return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y);
    }
    float fbm(vec2 p){ float s = 0.0, a = 0.5; for (int i = 0; i < 5; i++){ s += a * vn(p); p *= 2.03; a *= 0.5; } return s; }
    vec3 toSRGB(vec3 c){ return mix(c * 12.92, 1.055 * pow(c, vec3(1.0/2.4)) - 0.055, step(0.0031308, c)); }
    void main(){
      vec2 p = vec2(vUv.x * uAspect, vUv.y);
      vec3 inkc = texture2D(tInk, vUv).rgb;
      // paper: fibres and tooth, and a little vignette from the lamp
      float tooth = fbm(p * 340.0) * 0.06 + fbm(p * vec2(30.0, 90.0)) * 0.04;
      inkc *= 1.0 - tooth + 0.04;
      float vig = smoothstep(1.25, 0.35, length((vUv - 0.5) * vec2(uAspect, 1.0)));
      inkc *= mix(0.86, 1.0, vig);
      inkc = toSRGB(inkc);
      vec3 realc = texture2D(tDiffuse, vUv).rgb;
      if (uProgress <= 0.0) { gl_FragColor = vec4(inkc, 1.0); return; }
      if (uProgress >= 1.0) { gl_FragColor = vec4(realc, 1.0); return; }
      // the wash: rises from the bottom with a ragged, blooming edge
      float n = fbm(p * 3.2 + vec2(0.0, uTime * 0.05)) - 0.5;
      float n2 = fbm(p * 14.0) - 0.5;
      float front = uProgress * 1.55 - 0.25;
      float y = vUv.y + n * 0.32 + n2 * 0.05;
      float m = smoothstep(front + 0.03, front - 0.03, y);
      // pigment gathers at a drying edge
      float edge = exp(-pow((y - front) / 0.018, 2.0));
      vec3 c = mix(inkc, realc, m);
      c = mix(c, c * vec3(0.78, 0.74, 0.7), edge * 0.6 * (1.0 - smoothstep(0.85, 1.0, uProgress)));
      // and the paper's texture lingers a moment in the new colour
      c *= 1.0 - tooth * 0.6 * (1.0 - uProgress);
      gl_FragColor = vec4(c, 1.0);
    }`,
});
// ShaderPass clones its uniforms, and render-target textures cannot be
// cloned: hand the drawing over after.
mix.uniforms.tInk.value = rtInk.texture;
composer.addPass(renderPass);
composer.addPass(bloom);
composer.addPass(outputPass);
composer.addPass(mix);

function resize() {
  const w = window.innerWidth, h = window.innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  composer.setSize(w, h);
  renderer.getDrawingBufferSize(size);
  rtInk.setSize(size.x, size.y);
  bloom.resolution.set(w, h);
  for (const m of inkLineMats) m.uniforms.uRes.value.copy(size);
  for (const m of [inkFaces, inkMirrorFaces]) m.uniforms.uDpr.value = dpr;
  for (const m of inkLineMats) m.uniforms.uWidth.value = m.uniforms.uWidth.value; // dpr handled below
  mix.uniforms.uAspect.value = w / h;
}
// line widths and overshoot are authored in CSS pixels
for (const m of inkLineMats) { m.uniforms.uWidth.value *= dpr; m.uniforms.uOver.value *= dpr; }
window.addEventListener('resize', resize);
resize();
setView(SKETCH_VIEW);

// --------------------------------------------------------- time of day ----
// Keyframes: t, sun elevation and azimuth (deg), exposure, sky zenith /
// horizon / sun-glow colours, lit cloud colour, cloud amount, water colour,
// sunlight colour. The fog takes the horizon colour.
const KEYS = [
  { t: 0.00, el: 1.5, az: 300, ex: 0.7, zen: 0x37527c, hor: 0xe9b08c, glow: 0xff9a5a, cl: 0xffc6a0, cv: 0.7, wa: 0x10222e, sc: 0xffa070 },
  { t: 0.15, el: 18, az: 250, ex: 0.8, zen: 0x3f6aa6, hor: 0xc9d8e6, glow: 0xffe8c8, cl: 0xffffff, cv: 0.55, wa: 0x0d2634, sc: 0xffe6c8 },
  { t: 0.35, el: 52, az: 165, ex: 0.75, zen: 0x2a5ea8, hor: 0xbcd3ea, glow: 0xfff6e8, cl: 0xffffff, cv: 0.5, wa: 0x0b2836, sc: 0xffffff },
  { t: 0.62, el: 6, az: 72, ex: 0.62, zen: 0x31588f, hor: 0xeab894, glow: 0xffa848, cl: 0xffd2a8, cv: 0.5, wa: 0x14283a, sc: 0xffc080 },
  { t: 0.72, el: 0.6, az: 64, ex: 0.7, zen: 0x283c6c, hor: 0xee8a58, glow: 0xff6a2a, cl: 0xff9a6a, cv: 0.8, wa: 0x162234, sc: 0xff8040 },
  { t: 0.84, el: -4, az: 56, ex: 1.0, zen: 0x101a38, hor: 0x5f5f8c, glow: 0xc85a50, cl: 0x9a6a88, cv: 0.6, wa: 0x0a1420, sc: 0xff7040 },
  { t: 1.00, el: -14, az: 48, ex: 1.0, zen: 0x02040b, hor: 0x18213a, glow: 0x0a0c18, cl: 0x141a2a, cv: 0.35, wa: 0x03070d, sc: 0x4060a0 },
];
const cA = new THREE.Color(), cB = new THREE.Color();
function key(t) {
  let i = 0;
  while (i < KEYS.length - 2 && t > KEYS[i + 1].t) i++;
  const a = KEYS[i], b = KEYS[i + 1];
  const f = THREE.MathUtils.smoothstep(t, a.t, b.t);
  const L = (k) => a[k] + (b[k] - a[k]) * f;
  const C = (k) => cA.set(a[k]).lerp(cB.set(b[k]), f).clone();
  return { el: L('el'), az: L('az'), ex: L('ex'), cv: L('cv'), zen: C('zen'), hor: C('hor'), glow: C('glow'), cl: C('cl'), wa: C('wa'), sc: C('sc') };
}

let tod = qs.has('t') ? parseFloat(qs.get('t')) : 0.64;
let envDirty = true;
const sunDir = new THREE.Vector3();
function applyTime() {
  const k = key(tod);
  const phi = THREE.MathUtils.degToRad(90 - k.el), th = THREE.MathUtils.degToRad(k.az);
  sunDir.setFromSphericalCoords(1, phi, th);
  skyUniforms.uSun.value.copy(sunDir);
  skyUniforms.uZen.value.copy(k.zen);
  skyUniforms.uHor.value.copy(k.hor);
  skyUniforms.uGlow.value.copy(k.glow);
  skyUniforms.uCloudLit.value.copy(k.cl);
  skyUniforms.uCloud.value = k.cv;
  skyUniforms.uSunCol.value.copy(k.sc).multiplyScalar(THREE.MathUtils.smoothstep(k.el, -1.5, 1));
  const night = THREE.MathUtils.smoothstep(-k.el, -3, 7);   // 0 by day, 1 when the sun is 7 deg down
  const dusk = THREE.MathUtils.smoothstep(-k.el, -10, 3);
  facadeU.uNight.value = Math.max(night, dusk * 0.55);
  const elevF = THREE.MathUtils.smoothstep(k.el, -2, 12);
  sun.color.copy(k.sc);
  sun.intensity = 3.2 * elevF;
  sun.position.copy(sunDir).multiplyScalar(900).add(sun.target.position);
  hemi.intensity = 0.15 + 0.35 * elevF + night * 0.25;
  hemi.color.set(night > 0.5 ? 0x5a6a9a : 0xbcd2ff);
  real.fog.color.copy(k.hor);
  // after dark the moon takes over the sun's glitter path on the water
  const MOON = new THREE.Vector3().setFromSphericalCoords(1, THREE.MathUtils.degToRad(90 - 16), THREE.MathUtils.degToRad(222));
  skyUniforms.uMoon.value.copy(MOON);
  skyUniforms.uMoonAmt.value = night;
  water.material.uniforms.sunDirection.value.copy(night > 0.5 ? MOON : sunDir).normalize();
  water.material.uniforms.waterColor.value.copy(k.wa);
  water.material.uniforms.sunColor.value.copy(k.sc).multiplyScalar(elevF);
  if (night > 0.5) water.material.uniforms.sunColor.value.setRGB(0.55, 0.62, 0.8).multiplyScalar((night - 0.5) * 2 * 0.7);
  renderer.toneMappingExposure = k.ex;
  stars.material.opacity = night;
  bloom.strength = 0.15 + night * 0.35;
  bloom.threshold = night > 0.3 ? 0.75 : 0.92;
  // ink light comes from the same side the sun does, as it did on the page
  inkFaces.uniforms.uLight.value.set(-0.55, 0.45, 0.7).normalize();
  envDirty = true;
}
applyTime();

function bakeEnv() {
  if (envRT) envRT.dispose();
  envRT = pmrem.fromScene(envScene, 0, 1, 2000);
  real.environment = envRT.texture;
  // after dark the sky gives nothing back; let the city glow do a little
  real.environmentIntensity = 1;
  envDirty = false;
}

// ------------------------------------------------------------------ the UI --
const ui = {
  root: document.body,
  life: document.getElementById('life'),
  sketchBtn: document.getElementById('mode-sketch'),
  builtBtn: document.getElementById('mode-built'),
  modelBtn: document.getElementById('mode-model'),
  time: document.getElementById('time'),
  timeLabel: document.getElementById('time-label'),
  orbit: document.getElementById('orbit'),
  snap: document.getElementById('snap'),
};
// ?by=Jane%20Doe, or #by-Jane-Doe where a query string cannot be passed
const hashBy = /^#by-([\w.~-]+)$/.exec(location.hash);
const by = qs.get('by') || (hashBy && hashBy[1].replace(/-/g, ' '));
if (by) document.getElementById('by').textContent = `Designed by ${by}`;
if (qs.get('title')) document.getElementById('title').textContent = qs.get('title');

let progress = 0;         // 0 = the drawing, 1 = the building
let target = 0;
let draw = SHOT ? 1 : 0;  // the drawing being put down, 0..1
const DRAW_SECONDS = 8;

function setMode(m) {
  target = m === 'sketch' ? 0 : 1;
  ui.sketchBtn.classList.toggle('on', m === 'sketch');
  ui.modelBtn.classList.toggle('on', m === 'model');
  ui.builtBtn.classList.toggle('on', m === 'built');
  towerMesh.material = m === 'model' ? clayMat : glassMat;
  if (m !== 'sketch') ui.life.classList.add('gone');
}
ui.life.addEventListener('click', () => { setMode('built'); orbiting = true; ui.orbit.classList.add('on'); });
ui.sketchBtn.addEventListener('click', () => setMode('sketch'));
ui.builtBtn.addEventListener('click', () => setMode('built'));
ui.modelBtn.addEventListener('click', () => setMode('model'));

const NAMES = [[0, 'Dawn'], [0.15, 'Morning'], [0.35, 'Midday'], [0.55, 'Afternoon'], [0.66, 'Golden hour'], [0.76, 'Dusk'], [0.88, 'Night']];
function label() {
  let n = NAMES[0][1];
  for (const [t, s] of NAMES) if (tod >= t - 0.02) n = s;
  ui.timeLabel.textContent = n;
}
ui.time.value = tod;
label();
ui.time.addEventListener('input', () => { tod = parseFloat(ui.time.value); applyTime(); label(); });

let orbiting = false;
ui.orbit.addEventListener('click', () => { orbiting = !orbiting; ui.orbit.classList.toggle('on', orbiting); });
controls.addEventListener('start', () => { orbiting = false; ui.orbit.classList.remove('on'); });

let snapNext = false;
ui.snap?.addEventListener('click', () => { snapNext = true; });

window.addEventListener('keydown', (e) => {
  if (e.key === ' ') { setMode(target ? 'sketch' : 'built'); e.preventDefault(); }
  if (e.key === 'm') setMode('model');
  if (e.key === 'o') ui.orbit.click();
});

// ---------------------------------------------------------------- the loop --
const clock = new THREE.Clock();
let elapsed = 0;
function frame() {
  const dt = Math.min(clock.getDelta(), 0.05);
  elapsed += dt;

  if (!SHOT) draw = Math.min(1, draw + dt / DRAW_SECONDS);
  if (draw >= 1 && !ui.life.classList.contains('shown')) ui.life.classList.add('shown');
  const speed = target > progress ? 1 / 5.5 : 1 / 2.2;
  progress = target > progress ? Math.min(target, progress + dt * speed) : Math.max(target, progress - dt * speed);

  if (orbiting) {
    // slow orbit, held at the height the viewer chose
    const off = camera.position.clone().sub(controls.target);
    off.applyAxisAngle(new THREE.Vector3(0, 1, 0), dt * 0.035);
    camera.position.copy(controls.target).add(off);
  }
  controls.update();

  // the ground strokes always run across the view, as on the page
  const az = Math.atan2(camera.position.x - controls.target.x, camera.position.z - controls.target.z);
  waterGroup.rotation.y = az;

  for (const m of inkLineMats) m.uniforms.uDraw.value = draw;
  const hatch = THREE.MathUtils.smoothstep(draw, 0.3, 0.8);
  const reveal = draw >= 1 ? 1e6 : (draw - 0.1) / 0.85 * H;
  for (const m of [inkFaces, inkMirrorFaces]) { m.uniforms.uFade.value = hatch; m.uniforms.uReveal.value = reveal; }

  facadeU.uTime.value = elapsed;
  sky.position.copy(camera.position);
  skyUniforms.uTime.value = elapsed;
  water.material.uniforms.time.value = elapsed * 0.35;
  const blink = (Math.sin(elapsed * 3.2) > 0.2 ? 1 : 0.05) * Math.max(0.15, facadeU.uNight.value);
  for (const b of beacons) b.material.color.setRGB(1 * blink, 0.16 * blink, 0.1 * blink);

  // the page's own colours follow the wash, not the button
  const chrome = progress > 0.55 ? 'built' : 'sketch';
  if (document.body.dataset.mode !== chrome) document.body.dataset.mode = chrome;
  const ease = progress * progress * (3 - 2 * progress);
  mix.uniforms.uProgress.value = progress <= 0 ? 0 : progress >= 1 ? 1 : ease;
  mix.uniforms.uTime.value = elapsed;

  if (progress < 1) {
    renderer.setRenderTarget(rtInk);
    renderer.render(ink, camera);
    renderer.setRenderTarget(null);
  }
  const showReal = progress > 0;
  renderPass.enabled = bloom.enabled = outputPass.enabled = showReal;
  if (showReal && envDirty) bakeEnv();
  composer.render(dt);

  if (snapNext) {
    snapNext = false;
    canvas.toBlob((b) => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(b);
      a.download = 'spire.png';
      a.click();
    });
  }
  requestAnimationFrame(frame);
}

// for tools/shots.mjs
window.__spire = {
  set(o) {
    if (o.t !== undefined) { tod = o.t; ui.time.value = tod; applyTime(); label(); }
    if (o.mode) { setMode(o.mode); progress = target; }
    if (o.progress !== undefined) { progress = target = o.progress; }
    if (o.view) setView({ ...SKETCH_VIEW, ...o.view });
    if (o.draw !== undefined) draw = o.draw;
    if (o.clay !== undefined) towerMesh.material = o.clay ? clayMat : glassMat;
    if (o.pos) { camera.position.set(...o.pos); controls.target.set(...(o.target || FOCUS.toArray())); }
  },
  debug: { inkMesh, inkEdges, mirrorGroup },
  ready: true,
};
if (qs.get('mode')) setMode(qs.get('mode')), progress = target;
requestAnimationFrame(frame);
