/* ============================================================================
   layers/stars.js — the real night sky, in 3D
   ----------------------------------------------------------------------------
   Every naked-eye star: the Yale Bright Star Catalog (9,096 stars) with real
   galactic coordinates, V magnitudes and color temperatures. Distances are
   trigonometric parallax where measured (2,922 stars) and photometric
   estimates otherwise. All 333 IAU-named stars are labeled and selectable,
   plus the historically important faint neighbors (Proxima, Barnard's, …).
   Bright stars render with a diffraction-spike PSF; every star's color comes
   from its actual blackbody temperature. Fly close to any named star and it
   resolves into a glowing stellar surface at its estimated true radius.
   ========================================================================== */
import * as THREE from 'three';
import { PC, LY, bandFade, clamp, mulberry32, gauss, galacticBasis, galToXYZ } from '../scale.js';
import { STARS as LEGACY_STARS, starColor, starXYZ } from '../data.js';
import { starMaterial, updateStarUniforms, starPSFTexture, spikePSFTexture,
         glowTexture, kelvinToRGB, placeBody } from '../render.js';
import { specLum } from './starphys.js';

const L_SUN = 6e26;
const SUN_TEMP = 5772;

/** stellar radius (m) from luminosity (L☉) and temperature (K) */
export function starRadius(Lsun, K) {
  return Math.sqrt(Math.max(Lsun, 1e-4)) * (SUN_TEMP / K) ** 2 * 6.957e8;
}

// tinted star-surface shader (granulation + limb darkening), shared w/ hero
export function starSurfaceMaterial(tint = [1.9, 1.55, 1.05]) {
  return new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uTint: { value: new THREE.Vector3(...tint) } },
    vertexShader: /* glsl */`
      varying vec3 vN; varying vec3 vV; varying vec2 vUv;
      void main() {
        vN = normalize(normalMatrix * normal);
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vV = normalize(-mv.xyz); vUv = uv;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */`
      varying vec3 vN; varying vec3 vV; varying vec2 vUv;
      uniform float uTime; uniform vec3 uTint;
      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float noise(vec2 p) {
        vec2 i = floor(p), f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x),
                   mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
      }
      void main() {
        float mu = clamp(dot(normalize(vN), normalize(vV)), 0.0, 1.0);
        float limb = 0.32 + 0.68 * pow(mu, 0.55);
        float g = noise(vUv * 46.0 + uTime * 0.013)
                + 0.5 * noise(vUv * 96.0 - uTime * 0.021);
        float gran = 0.90 + 0.10 * g;
        gl_FragColor = vec4(min(uTint * limb * gran * 2.1, vec3(16.0)), 1.0);
      }`,
  });
}

export async function buildStarsLayer(scene, registry, ctx0) {
  const group = new THREE.Group();
  scene.add(group);

  const data = await (await fetch('src/data/stars.json')).json();
  const { names, stars } = data;

  // legacy blurbs, transferrable to IAU-named stars by position
  const legacyByPos = LEGACY_STARS.map(s => ({
    name: s[0], p: starXYZ(s), ly: s[3], spec: s[4], note: s[5],
  }));

  // ---- build buffers: bright (spiked PSF) + normal
  const nB = [], nN = [];
  const catalog = [];                       // per star: {p, Lsun, K, V, ni}
  for (const [glon, glat, dPc, V, K, ni] of stars) {
    const p = galToXYZ(glon, glat, dPc * PC);
    const Mv = V - 5 * Math.log10(dPc / 10);
    const Lsun = 10 ** ((4.83 - Mv) / 2.5);
    const st = { p, Lsun, K, V, ni, dPc };
    catalog.push(st);
    (V <= 2.0 ? nB : nN).push(st);
  }
  function buildPoints(list, tex, maxPx, boost = 1) {
    const n = list.length;
    const pos = new Float32Array(n * 3), col = new Float32Array(n * 3), lum = new Float32Array(n);
    list.forEach((st, i) => {
      pos[i*3] = st.p[0] / PC; pos[i*3+1] = st.p[1] / PC; pos[i*3+2] = st.p[2] / PC;
      const [r, g, b] = kelvinToRGB(st.K);
      col[i*3] = r; col[i*3+1] = g; col[i*3+2] = b;
      lum[i] = Math.log2(st.Lsun * L_SUN * boost);
    });
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
    geo.setAttribute('aLum', new THREE.BufferAttribute(lum, 1));
    const mat = starMaterial({ fluxScale: 1.3e6, maxPx, map: tex });
    const pts = new THREE.Points(geo, mat);
    pts.frustumCulled = false; pts.renderOrder = 2;
    group.add(pts);
    return { pts, mat };
  }
  const normal = buildPoints(nN, starPSFTexture(), 12);
  const bright = buildPoints(nB, spikePSFTexture(), 30, 1.6);

  // ---- deep statistical background (below naked-eye, for depth)
  const NF = Math.floor(36000 * ctx0.quality.points);
  {
    const rnd = mulberry32(4242);
    const pos = new Float32Array(NF * 3), col = new Float32Array(NF * 3), lum = new Float32Array(NF);
    const C = new THREE.Color();
    for (let i = 0; i < NF; i++) {
      const r = 250 + 2400 * Math.pow(rnd(), 1.6);
      const th = rnd() * Math.PI * 2;
      const z = gauss(rnd) * 160;
      // galactic frame local
      pos[i*3] = r * Math.cos(th); pos[i*3+1] = r * Math.sin(th); pos[i*3+2] = z;
      const K = 3000 + rnd() * rnd() * 6500;
      const [cr, cg, cb] = kelvinToRGB(K);
      const j = 0.8 + rnd() * 0.3;
      col[i*3] = cr * j; col[i*3+1] = cg * j; col[i*3+2] = cb * j;
      lum[i] = Math.log2((0.05 + rnd() * rnd() * 8) * L_SUN);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
    geo.setAttribute('aLum', new THREE.BufferAttribute(lum, 1));
    const mat = starMaterial({ fluxScale: 6e5, maxPx: 6, map: starPSFTexture() });
    const pts = new THREE.Points(geo, mat);
    pts.frustumCulled = false; pts.renderOrder = 2;
    const b = galacticBasis();
    const M = new THREE.Matrix4().makeBasis(
      new THREE.Vector3(...b.x), new THREE.Vector3(...b.y), new THREE.Vector3(...b.z));
    pts.quaternion.setFromRotationMatrix(M);
    pts.userData.invQuat = pts.quaternion.clone().invert();
    group.add(pts);
    group.userData.deep = { pts, mat };
  }

  // ---- registry: every IAU-named star, with real physics
  const namedObjs = [];
  for (const st of catalog) {
    if (st.ni < 0) continue;
    const [name, spec, distLy] = names[st.ni];
    // transfer a legacy blurb when we already wrote one for this star
    let blurb = null;
    for (const lg of legacyByPos) {
      const d = Math.hypot(st.p[0]-lg.p[0], st.p[1]-lg.p[1], st.p[2]-lg.p[2]);
      if (d < Math.max(st.p.length ? 0 : 0, 0.12 * Math.hypot(...st.p)) || d < 2 * LY) { blurb = lg.note; break; }
    }
    const radius = starRadius(st.Lsun, st.K);
    const obj = {
      id: 'star:' + name, name, cls: (spec || 'star') + ' · ' + st.K.toLocaleString() + ' K',
      blurb: blurb ?? `${name}: a ${spec || ''} star ${distLy < 100 ? distLy.toFixed(1) : Math.round(distLy)} light-years away, shining with ${st.Lsun < 10 ? st.Lsun.toFixed(1) : Math.round(st.Lsun).toLocaleString()} times the Sun's light.`,
      radius, distLy, tempK: st.K, lumSun: st.Lsun,
      color: new THREE.Color(...kelvinToRGB(st.K)),
      lum: 0,                                        // the Yale point cloud draws it
      pos: () => st.p,
      labelBand: [12.6, 18.8], focusD: Math.max(radius * 30, 3e10),
      kind: 'star', priority: st.V < 1.5 ? 7 : (blurb ? 6 : 4),
    };
    registry.push(obj);
    namedObjs.push(obj);
  }
  // faint historical neighbors not in the naked-eye catalog
  for (const lg of legacyByPos) {
    if (lg.ly > 20) continue;                        // bright ones came from Yale
    let dup = false;
    for (const o of namedObjs) {
      const q = o.pos();
      if (Math.hypot(q[0]-lg.p[0], q[1]-lg.p[1], q[2]-lg.p[2]) < 1.5 * LY) { dup = true; break; }
    }
    if (dup) continue;
    const Lsun = specLum(lg.spec);
    const K = { O: 30000, B: 15000, A: 8500, F: 6800, G: 5700, K: 4500, M: 3100, D: 12000 }[lg.spec[0]] ?? 5000;
    const radius = starRadius(Lsun, K);
    const obj = {
      id: 'star:' + lg.name, name: lg.name, cls: lg.spec + ' · ' + K.toLocaleString() + ' K',
      blurb: lg.note ?? `A dim ${lg.spec} red dwarf ${lg.ly.toFixed(1)} light-years away — one of the Sun's nearest neighbors, invisible without a telescope.`,
      radius, distLy: lg.ly, tempK: K, lumSun: Lsun,
      color: new THREE.Color(starColor(lg.spec)),
      lum: Lsun * L_SUN,
      pos: () => lg.p,
      labelBand: [12.6, 17.8], focusD: Math.max(radius * 30, 3e10),
      kind: 'star', priority: lg.note ? 6 : 3,
    };
    registry.push(obj);
    namedObjs.push(obj);
  }

  // ---- hero star: resolves into a surface when you get close
  const heroMat = starSurfaceMaterial();
  const hero = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 48), heroMat);
  hero.visible = false;
  group.add(hero);
  const corona = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTexture(), color: 0xffffff, transparent: true,
    blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.55,
  }));
  corona.visible = false;
  group.add(corona);

  const b = galacticBasis();
  const M = new THREE.Matrix4().makeBasis(
    new THREE.Vector3(...b.x), new THREE.Vector3(...b.y), new THREE.Vector3(...b.z));
  const quatIdentity = null;

  function update(ctx) {
    const f = bandFade(ctx.logS, 6.0, 19.8, 1.0);
    group.visible = f > 0.01;
    if (!group.visible) return;
    normal.mat.uniforms.uOpacity.value = f;
    bright.mat.uniforms.uOpacity.value = f;
    updateStarUniforms(normal.mat, ctx, [0, 0, 0], quatIdentity, PC);
    updateStarUniforms(bright.mat, ctx, [0, 0, 0], quatIdentity, PC);
    const deep = group.userData.deep;
    deep.mat.uniforms.uOpacity.value = f * 0.85;
    updateStarUniforms(deep.mat, ctx, [0, 0, 0], deep.pts.userData.invQuat, PC);

    // hero star: nearest named star to the camera, by apparent size
    const cp = ctx.camPos;
    let best = null, bestD = Infinity, bestRatio = Infinity;
    for (const o of namedObjs) {
      const q = o.pos();
      const d = Math.hypot(q[0]-cp[0], q[1]-cp[1], q[2]-cp[2]);
      const ratio = d / o.radius;
      if (ratio < bestRatio) { bestRatio = ratio; best = o; bestD = d; }
    }
    const showHero = best && bestRatio < 3.5e4;      // ~>0.5 px apparent
    hero.visible = corona.visible = !!showHero;
    if (showHero) {
      const r = placeBody(hero, best.pos(), best.radius, ctx);
      heroMat.uniforms.uTime.value = ctx.time;
      const [cr, cg, cb] = kelvinToRGB(best.tempK);
      // hotter = brighter surface
      const boost = 1.6 + clamp(best.tempK / 6000, 0.6, 2.2);
      heroMat.uniforms.uTint.value.set(cr * boost, cg * boost, cb * boost);
      corona.position.copy(hero.position);
      corona.scale.setScalar(hero.scale.x * 7);
      corona.material.color.setRGB(cr, cg, cb);
      corona.material.opacity = 0.5 * clamp(6e3 / bestRatio, 0.05, 1);
      hero.visible = r.px > 0.5;
      corona.visible = r.px > 0.3;
    }
  }
  return { group, update, namedObjs };
}
