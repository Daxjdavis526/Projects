/* ============================================================================
   layers/galaxy.js — the Milky Way
   ----------------------------------------------------------------------------
   A stylized-but-serious structural model, built from published parameters:
   exponential thin disk (scale length 2.6 kpc, height 300 pc), boxy bulge,
   central bar (~25° to our sightline), four log-spiral arms at 12.5° pitch,
   dust lanes along the inner arm edges, sparse halo + globular clusters.
   The Sun sits 8,178 pc from Sagittarius A*, in the Orion Arm.
   Each point stands in for ~a million stars; the shader compensates surface
   brightness as you zoom so the galaxy reads correctly inside and out.
   ========================================================================== */
import * as THREE from 'three';
import { PC, KPC, bandFade, smoothstep, lerp, mulberry32, gauss, galacticBasis, galToXYZ } from '../scale.js';
import { MILKYWAY, SGRA } from '../data.js';
import { starMaterial, updateStarUniforms, glowTexture } from '../render.js';

const R_SUN = 8178;               // pc, Sun -> galactic center
const PITCH = Math.tan(12.5 * Math.PI / 180);

export function buildGalaxyLayer(scene, registry, ctx0) {
  const group = new THREE.Group();
  scene.add(group);

  // galactic-center universe position & frame orientation
  const GC = galToXYZ(0, 0, R_SUN * PC);
  const b = galacticBasis();
  const M = new THREE.Matrix4().makeBasis(
    new THREE.Vector3(...b.x), new THREE.Vector3(...b.y), new THREE.Vector3(...b.z));
  const quat = new THREE.Quaternion().setFromRotationMatrix(M);
  const invQuat = quat.clone().invert();

  // arm proximity weight for galactocentric (r pc, theta)
  const armW = (r, th) => {
    if (r < 3000) return 0.4;
    let best = 1e9;
    const thArm = Math.log(r / 3000) / PITCH;
    for (let k = 0; k < 4; k++) {
      let d = (th - thArm - k * Math.PI / 2) % (Math.PI * 2);
      if (d > Math.PI) d -= Math.PI * 2;
      if (d < -Math.PI) d += Math.PI * 2;
      best = Math.min(best, Math.abs(d) * r);      // arc distance, pc
    }
    return Math.exp(-(best * best) / (2 * 550 * 550));
  };

  const nQ = ctx0.quality.points;
  const N = Math.floor(220000 * nQ);
  const rnd = mulberry32(9001);
  const pos = new Float32Array(N * 3), col = new Float32Array(N * 3), lum = new Float32Array(N);
  const C = new THREE.Color();
  let i = 0;
  const put = (x, y, z, color, jit, L) => {
    if (i >= N) return;
    C.set(color);
    const j = 0.8 + rnd() * jit;
    pos[i*3] = x; pos[i*3+1] = y; pos[i*3+2] = z;
    col[i*3] = C.r * j; col[i*3+1] = C.g * j; col[i*3+2] = C.b * j;
    lum[i] = Math.log2(L * (0.4 + rnd() * 1.3));
    i++;
  };
  const L0 = 6e32;                                  // ~1e6 L☉ per point
  while (i < N * 0.62) {                            // disk + arms
    const r = -2600 * Math.log(1 - rnd() * 0.9995);
    if (r > 21000) continue;
    const th = rnd() * Math.PI * 2;
    const w = armW(r, th);
    if (rnd() > 0.30 + 0.70 * w) continue;          // rejection -> arm contrast
    const z = gauss(rnd) * (300 + r * 0.012) * 0.5;
    const young = w > 0.45 && rnd() < 0.5;
    const color = young
      ? (rnd() < 0.25 ? 0xbdd0ff : 0xdfe8ff)        // OB associations
      : (rnd() < 0.5 ? 0xfff2dc : 0xffe3b8);        // older disk
    put(r * Math.cos(th), r * Math.sin(th), z, color, 0.4, young ? L0 * 2 : L0);
  }
  while (i < N * 0.78) {                            // bar (~25° to Sun line)
    const a = 25 * Math.PI / 180;
    const x0 = gauss(rnd) * 1900, y0 = gauss(rnd) * 620, z = gauss(rnd) * 420;
    if (Math.abs(x0) > 4600) continue;
    put(x0 * Math.cos(a) - y0 * Math.sin(a), x0 * Math.sin(a) + y0 * Math.cos(a), z,
        0xffe0ae, 0.35, L0 * 0.9);
  }
  while (i < N * 0.92) {                            // bulge
    const r = Math.abs(gauss(rnd)) * 900 + 60;
    if (r > 3200) continue;
    const u = rnd() * 2 - 1, th = rnd() * Math.PI * 2, s = Math.sqrt(1 - u * u);
    put(r * s * Math.cos(th), r * s * Math.sin(th), r * u * 0.72, 0xffd9a0, 0.3, L0 * 1.0);
  }
  while (i < N - 160) {                             // halo
    const r = 4000 * Math.pow(60000 / 4000, rnd() * rnd());
    const u = rnd() * 2 - 1, th = rnd() * Math.PI * 2, s = Math.sqrt(1 - u * u);
    put(r * s * Math.cos(th), r * s * Math.sin(th), r * u, 0xffd8b0, 0.3, L0 * 0.2);
  }
  while (i < N) {                                   // globular clusters
    const r = 2000 * Math.pow(20, rnd());
    const u = rnd() * 2 - 1, th = rnd() * Math.PI * 2, s = Math.sqrt(1 - u * u);
    put(r * s * Math.cos(th), r * s * Math.sin(th), r * u, 0xfff0d8, 0.2, L0 * 30);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
  geo.setAttribute('aLum', new THREE.BufferAttribute(lum, 1));
  const mat = starMaterial({ fluxScale: 500, maxPx: 6, mCap: -2.8 });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  points.renderOrder = 2;
  points.quaternion.copy(quat);
  group.add(points);

  // ---- dust lanes: dark physical blobs hugging the inner arm edges
  const ND = Math.floor(15000 * nQ);
  const dpos = new Float32Array(ND * 3), dcol = new Float32Array(ND * 3), dlum = new Float32Array(ND);
  let k = 0;
  const rnd2 = mulberry32(555);
  while (k < ND) {
    const r = 3200 + (20000 - 3200) * Math.pow(rnd2(), 0.8);
    const th = rnd2() * Math.PI * 2;
    const w = armW(r, th + 0.10);                    // offset: inner edge
    if (rnd2() > w * 0.9) continue;
    const z = gauss(rnd2) * 110;
    dpos[k*3] = r * Math.cos(th); dpos[k*3+1] = r * Math.sin(th); dpos[k*3+2] = z;
    const t = rnd2() * 0.35;
    dcol[k*3] = 0.10 + t * 0.09; dcol[k*3+1] = 0.07 + t * 0.05; dcol[k*3+2] = 0.055 + t * 0.03;
    dlum[k] = Math.log2((90 + rnd2() * 200) * PC);   // log2 physical radius
    k++;
  }
  const dgeo = new THREE.BufferGeometry();
  dgeo.setAttribute('position', new THREE.BufferAttribute(dpos, 3));
  dgeo.setAttribute('aColor', new THREE.BufferAttribute(dcol, 3));
  dgeo.setAttribute('aLum', new THREE.BufferAttribute(dlum, 1));
  const dmat = starMaterial({ physMode: true, maxPx: 26, blending: THREE.NormalBlending,
                              map: glowTexture() });
  const dust = new THREE.Points(dgeo, dmat);
  dust.frustumCulled = false;
  dust.renderOrder = 3;
  dust.quaternion.copy(quat);
  group.add(dust);

  // ---- HII regions: soft pink star-forming glows on the arms
  const NH = 420;
  const hpos = new Float32Array(NH * 3), hcol = new Float32Array(NH * 3), hlum = new Float32Array(NH);
  let h = 0;
  const rnd3 = mulberry32(717);
  while (h < NH) {
    const r = 3500 + (18000 - 3500) * rnd3();
    const th = rnd3() * Math.PI * 2;
    if (rnd3() > armW(r, th)) continue;
    hpos[h*3] = r * Math.cos(th); hpos[h*3+1] = r * Math.sin(th); hpos[h*3+2] = gauss(rnd3) * 80;
    const warm = rnd3();
    hcol[h*3] = 0.9; hcol[h*3+1] = 0.35 + warm * 0.2; hcol[h*3+2] = 0.5 + warm * 0.25;
    hlum[h] = Math.log2((120 + rnd3() * 260) * PC);
    h++;
  }
  const hgeo = new THREE.BufferGeometry();
  hgeo.setAttribute('position', new THREE.BufferAttribute(hpos, 3));
  hgeo.setAttribute('aColor', new THREE.BufferAttribute(hcol, 3));
  hgeo.setAttribute('aLum', new THREE.BufferAttribute(hlum, 1));
  const hmat = starMaterial({ physMode: true, maxPx: 18, map: glowTexture() });
  const hii = new THREE.Points(hgeo, hmat);
  hii.frustumCulled = false;
  hii.renderOrder = 2;
  hii.quaternion.copy(quat);
  group.add(hii);

  // ---- painted underlay: a photographic smooth-light image computed from
  //      the same structural model the points sample, drawn as a plane under
  //      the point cloud. Points give texture and parallax; the painting
  //      gives the continuous glow a real galaxy photo has.
  function paintGalaxy(size, opts) {
    const { Rmax = 21000, coreR = 900, barA = 25 * Math.PI / 180,
            warm = [1.0, 0.86, 0.62], cool = [0.62, 0.72, 1.0], armGlow = 1.0 } = opts ?? {};
    const c = document.createElement('canvas'); c.width = c.height = size;
    const g = c.getContext('2d');
    const img = g.createImageData(size, size);
    const d = img.data;
    const rnd2 = mulberry32(808);
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      const u = (x + 0.5) / size * 2 - 1, v = (y + 0.5) / size * 2 - 1;
      const r = Math.hypot(u, v) * Rmax;
      const i = (y * size + x) * 4;
      if (r > Rmax) { d[i+3] = 0; continue; }
      const th = Math.atan2(v, u);
      const w = armW(r, th);
      const wDust = armW(r, th + 0.10);
      let disk = Math.exp(-r / 2600) * (0.26 + 0.74 * w * armGlow);
      disk *= 1 - 0.52 * Math.exp(-((wDust - 1) * (wDust - 1)) * 2.2) * smoothstep(2600, 4200, r);
      const bulge = 1.35 * Math.exp(-((r / coreR) ** 1.4));
      // bar
      const bx = Math.cos(-barA) * u * Rmax - Math.sin(-barA) * v * Rmax;
      const by = Math.sin(-barA) * u * Rmax + Math.cos(-barA) * v * Rmax;
      const bar = 0.75 * Math.exp(-((bx / 2100) ** 2 + (by / 750) ** 2));
      const heat = Math.min(1, bulge * 0.9 + bar * 0.8 + 0.30);   // warm core -> cool rim
      let L = disk + bulge + bar;
      L *= 0.92 + 0.16 * rnd2();
      const rr = warm[0] * heat + cool[0] * (1 - heat);
      const gg = warm[1] * heat + cool[1] * (1 - heat);
      const bb = warm[2] * heat + cool[2] * (1 - heat);
      const A = Math.sqrt(Math.min(1, L));
      d[i]   = Math.min(255, 255 * rr * L);
      d[i+1] = Math.min(255, 255 * gg * L);
      d[i+2] = Math.min(255, 255 * bb * L);
      d[i+3] = Math.min(255, 255 * A);
    }
    g.putImageData(img, 0, 0);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }
  const paintTex = paintGalaxy(768, {});
  const paint = new THREE.Mesh(new THREE.PlaneGeometry(2, 2),
    new THREE.MeshBasicMaterial({ map: paintTex, transparent: true,
      blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
      opacity: 0.0 }));
  paint.renderOrder = 1;                       // beneath the points
  // plane lies in galactic XY: rotate plane's local Z to galactic Z, then into render frame
  paint.quaternion.copy(quat);
  group.add(paint);

  // ---- registry: the galaxy itself, its heart, and our place in it
  registry.push({
    id: 'milkyway', name: MILKYWAY.name, cls: MILKYWAY.cls, blurb: MILKYWAY.blurb,
    radius: MILKYWAY.radius, color: new THREE.Color(0xffeecc), lum: 0,
    pos: () => GC, labelBand: [21.2, 23.2], focusD: 1.6e21,
    kind: 'galaxy', priority: 9,
  });
  registry.push({
    id: 'sgra', name: SGRA.name, cls: SGRA.cls, blurb: SGRA.blurb,
    radius: SGRA.radius, color: new THREE.Color(0xffc890), lum: 1e34,
    pos: () => GC, labelBand: [17.5, 21.2], focusD: 5e17,
    kind: 'blackhole', priority: 8,
  });

  function update(ctx) {
    const f = bandFade(ctx.logS, 6.0, 23.4, 1.2);
    group.visible = f > 0.01;
    if (!group.visible) return;
    // surface-brightness compensation: each point = many stars; boost the
    // flux scale as real stars become unresolvable so the ensemble keeps
    // the correct integrated brightness.
    const t = smoothstep(18.0, 21.5, ctx.logS);
    mat.uniforms.uFluxScale.value = lerp(400, 2.4e6, t * t);
    mat.uniforms.uOpacity.value = f;
    dmat.uniforms.uOpacity.value = f * (0.16 + 0.22 * t);
    hmat.uniforms.uOpacity.value = f * 0.5;
    updateStarUniforms(mat, ctx, GC, invQuat, PC);
    updateStarUniforms(dmat, ctx, GC, invQuat, PC);
    updateStarUniforms(hmat, ctx, GC, invQuat, PC);

    // painted underlay: photographic from outside, gone from inside
    const pf = smoothstep(20.3, 21.5, ctx.logS) * f;
    paint.visible = pf > 0.01;
    if (paint.visible) {
      const S = ctx.S, fc = ctx.focus;
      const rx = (GC[0]-fc[0])/S, ry = (GC[1]-fc[1])/S, rz = (GC[2]-fc[2])/S;
      const L = Math.hypot(rx, ry, rz);
      const k = L > 1e4 ? (1e4 * (1 + Math.log10(L / 1e4))) / L : 1;
      paint.position.set(rx*k, ry*k, rz*k);
      paint.scale.setScalar(21000 * PC / S * k);
      paint.material.opacity = 0.62 * pf;
    }
  }
  return { group, update, GC };
}
