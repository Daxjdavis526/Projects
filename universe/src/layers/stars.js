/* ============================================================================
   layers/stars.js — the solar neighborhood
   ----------------------------------------------------------------------------
   • Every named star uses its real RA/dec/distance and a luminosity derived
     from its spectral class — these are selectable objects.
   • Behind them, a statistical field of ~10⁴–10⁵ stars fills the local few
     kiloparsecs of the galactic disk (real density is far higher; the field
     is a visual sampling, weighted to the true luminosity function).
   ========================================================================== */
import * as THREE from 'three';
import { PC, LY, bandFade, mulberry32, gauss, galacticBasis } from '../scale.js';
import { STARS, starColor, starXYZ } from '../data.js';
import { starMaterial, updateStarUniforms } from '../render.js';

const L_SUN = 6e26;      // beacon-luminosity of 1 L☉ (matches the Sun entry)

/** crude spectral class -> luminosity in L☉ */
export function specLum(spec) {
  const base = { O: 5e4, B: 800, A: 22, F: 3.2, G: 1.0, K: 0.3, M: 0.03, D: 0.01 }[spec[0]] ?? 1;
  if (/I[ab]?$|Ia|Ib/.test(spec) && !/III|IV|V/.test(spec)) return base * 3e3;   // supergiant
  if (/III/.test(spec)) return base * 120;                                       // giant
  if (/IV/.test(spec)) return base * 6;
  return base;
}

export function buildStarsLayer(scene, registry, ctx0) {
  const group = new THREE.Group();
  scene.add(group);

  // ---- named stars -> registry (drawn via the shared beacon pool)
  for (const s of STARS) {
    const [name, ra, dec, ly, spec, note] = s;
    const p = starXYZ(s);
    registry.push({
      id: 'star:' + name, name, cls: spec + (spec[0] === 'D' ? ' white dwarf' : ' star'),
      blurb: note ?? `A ${spec[0] === 'M' ? 'red dwarf' : 'star'} of spectral class ${spec}, ${ly < 20 ? 'one of the Sun’s nearest neighbors, ' : ''}${ly.toFixed(ly < 100 ? 1 : 0)} light-years away.`,
      radius: 7e8, distLy: ly,
      color: new THREE.Color(starColor(spec)),
      lum: specLum(spec) * L_SUN,
      pos: () => p,
      labelBand: [14.4, 18.8], focusD: 6e11,
      kind: 'star', priority: note ? 6 : 3,
    });
  }

  // ---- statistical field: local galactic disk
  const N = Math.floor(80000 * ctx0.quality.points);
  const rnd = mulberry32(4242);
  const pos = new Float32Array(N * 3);   // parsecs, galactic frame @ Sun
  const col = new Float32Array(N * 3);
  const lum = new Float32Array(N);
  const CLASSES = [
    [0.72, 0x0,      0.03, 0xffb46b],   // M
    [0.84, 0x0,      0.3,  0xffd2a1],   // K
    [0.90, 0x0,      1.0,  0xfff4ea],   // G
    [0.94, 0x0,      3.2,  0xf8f7ff],   // F
    [0.965,0x0,      22,   0xcad7ff],   // A
    [0.98, 0x0,      800,  0xaabfff],   // B
    [1.01, 0x0,      150,  0xffcf9a],   // giants
  ];
  const C = new THREE.Color();
  for (let i = 0; i < N; i++) {
    // disk around the Sun: radial ~ uniform to 2.2 kpc, vertical exp 140 pc
    const r = 2200 * Math.sqrt(rnd());
    const th = rnd() * Math.PI * 2;
    const z = gauss(rnd) * 140 * (0.4 + 0.6 * rnd());
    pos[i*3]   = r * Math.cos(th);
    pos[i*3+1] = r * Math.sin(th);
    pos[i*3+2] = z;
    const u = rnd();
    let cls = CLASSES[CLASSES.length - 1];
    for (const c of CLASSES) if (u < c[0]) { cls = c; break; }
    C.set(cls[3]);
    const jitter = 0.85 + rnd() * 0.3;
    col[i*3] = C.r * jitter; col[i*3+1] = C.g * jitter; col[i*3+2] = C.b * jitter;
    lum[i] = cls[2] * (0.4 + rnd() * 1.4) * L_SUN;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
  geo.setAttribute('aLum', new THREE.BufferAttribute(lum, 1));
  const mat = starMaterial({ fluxScale: 2600, maxPx: 9 });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  points.renderOrder = 2;

  // orient the layer's galactic frame into the render frame
  const b = galacticBasis();
  const M = new THREE.Matrix4().makeBasis(
    new THREE.Vector3(...b.x), new THREE.Vector3(...b.y), new THREE.Vector3(...b.z));
  const quat = new THREE.Quaternion().setFromRotationMatrix(M);
  points.quaternion.copy(quat);
  const invQuat = quat.clone().invert();
  group.add(points);

  function update(ctx) {
    const f = bandFade(ctx.logS, 6.0, 19.8, 1.0);
    group.visible = f > 0.01;
    if (!group.visible) return;
    mat.uniforms.uOpacity.value = f;
    updateStarUniforms(mat, ctx, [0, 0, 0], invQuat, PC);
  }
  return { group, update };
}
