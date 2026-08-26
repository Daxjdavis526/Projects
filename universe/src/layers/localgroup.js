/* ============================================================================
   layers/localgroup.js — the Local Group
   ----------------------------------------------------------------------------
   Real members at real (galactic-coordinate) positions and distances.
   Andromeda and Triangulum get miniature structural point-clouds; dwarfs are
   soft physically-sized glows at their true diameters. Disk orientations are
   representative, not measured position angles (documented approximation).
   ========================================================================== */
import * as THREE from 'three';
import { LY, bandFade, mulberry32, gauss } from '../scale.js';
import { LOCALGROUP, LOCALGROUP_INFO, lgXYZ } from '../data.js';
import { starMaterial, updateStarUniforms, glowTexture } from '../render.js';

export function buildLocalGroupLayer(scene, registry, ctx0) {
  const group = new THREE.Group();
  scene.add(group);

  const galaxies = LOCALGROUP.map(g => ({
    name: g[0], p: lgXYZ(g), distLy: g[3], type: g[4], diam: g[5], note: g[6],
  }));

  // one merged buffer: structural sprinkle (flux) + one core glow each (phys)
  const nQ = Math.max(ctx0.quality.points, 0.4);
  const est = galaxies.reduce((a, g) => a + Math.min(5000, Math.ceil(g.diam / 25)) , 0);
  const N = Math.ceil(est * nQ) + galaxies.length * 2 + 16;
  const sp = new Float32Array(N * 3), sc = new Float32Array(N * 3), sl = new Float32Array(N);
  const gp = [], gc = [], gl = [];
  let i = 0;
  const rnd = mulberry32(31337);
  const C = new THREE.Color();
  for (const g of galaxies) {
    const big = g.diam > 40e3;
    const n = Math.ceil(Math.min(5000, g.diam / 25) * nQ);
    const R = g.diam / 2;                       // ly
    // representative orientation (seeded, stable)
    const tilt = new THREE.Quaternion().setFromEuler(new THREE.Euler(
      rnd() * Math.PI, rnd() * Math.PI * 2, 0));
    const v = new THREE.Vector3();
    for (let k = 0; k < n && i < N; k++) {
      let x, y, z;
      if (big) {                                // disk w/ bulge
        const r = R * Math.sqrt(rnd()) * (0.25 + 0.75 * rnd());
        const th = rnd() * Math.PI * 2;
        x = r * Math.cos(th); y = r * Math.sin(th); z = gauss(rnd) * R * 0.045;
        if (rnd() < 0.18) {                     // bulge
          const rr = Math.abs(gauss(rnd)) * R * 0.12;
          const u = rnd() * 2 - 1, t2 = rnd() * Math.PI * 2, s = Math.sqrt(1 - u * u);
          x = rr * s * Math.cos(t2); y = rr * s * Math.sin(t2); z = rr * u * 0.7;
        }
      } else {                                  // irregular / spheroidal
        const rr = Math.abs(gauss(rnd)) * R * 0.5;
        const u = rnd() * 2 - 1, t2 = rnd() * Math.PI * 2, s = Math.sqrt(1 - u * u);
        x = rr * s * Math.cos(t2); y = rr * s * Math.sin(t2); z = rr * u * (0.4 + 0.5 * rnd());
      }
      v.set(x, y, z).applyQuaternion(tilt);
      sp[i*3] = g.p[0] / LY + v.x; sp[i*3+1] = g.p[1] / LY + v.y; sp[i*3+2] = g.p[2] / LY + v.z;
      const warm = rnd();
      C.setRGB(0.95, 0.86 + warm * 0.08, 0.72 + warm * 0.2);
      if (big && Math.hypot(x, y) > R * 0.45 && rnd() < 0.35) C.setRGB(0.75, 0.82, 1.0);
      sc[i*3] = C.r; sc[i*3+1] = C.g; sc[i*3+2] = C.b;
      sl[i] = Math.log2(6e32 * (0.5 + rnd() * 2) * (big ? 3 : 1));
      i++;
    }
    // core glow, physically sized
    gp.push(g.p[0] / LY, g.p[1] / LY, g.p[2] / LY);
    C.setRGB(1.0, 0.93, 0.8);
    gc.push(C.r, C.g, C.b);
    gl.push(Math.log2(g.diam * 0.33 * LY));
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(sp.slice(0, i * 3), 3));
  geo.setAttribute('aColor', new THREE.BufferAttribute(sc.slice(0, i * 3), 3));
  geo.setAttribute('aLum', new THREE.BufferAttribute(sl.slice(0, i), 1));
  const mat = starMaterial({ fluxScale: 3e7, maxPx: 4.5 });
  const pts = new THREE.Points(geo, mat);
  pts.frustumCulled = false; pts.renderOrder = 2;
  group.add(pts);

  const cgeo = new THREE.BufferGeometry();
  cgeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(gp), 3));
  cgeo.setAttribute('aColor', new THREE.BufferAttribute(new Float32Array(gc), 3));
  cgeo.setAttribute('aLum', new THREE.BufferAttribute(new Float32Array(gl), 1));
  const cmat = starMaterial({ physMode: true, maxPx: 22, map: glowTexture() });
  cmat.uniforms.uOpacity.value = 0.2;
  const cores = new THREE.Points(cgeo, cmat);
  cores.frustumCulled = false; cores.renderOrder = 2;
  group.add(cores);

  // registry
  for (const g of galaxies) {
    registry.push({
      id: 'lg:' + g.name, name: g.name, cls: g.type,
      blurb: g.note ?? `A ${g.type} galaxy of the Local Group, ${(g.distLy / 1e6).toPrecision(2)} million light-years away, roughly ${Math.round(g.diam / 1e3)},000 light-years across.`,
      radius: g.diam / 2 * LY, distLy: g.distLy,
      color: new THREE.Color(0xf2e2c4), lum: 0,
      pos: () => g.p,
      labelBand: g.diam > 30e3 ? [20.6, 24.2] : [22.0, 23.4],
      focusD: g.diam * LY * 1.6, kind: 'galaxy',
      priority: g.diam > 30e3 ? 8 : 3,
    });
  }
  const lgCenter = galaxies[0].p.map(x => x * 0.45);   // toward M31, between giants
  registry.push({
    id: 'localgroup', name: LOCALGROUP_INFO.name, cls: LOCALGROUP_INFO.cls,
    blurb: LOCALGROUP_INFO.blurb, radius: LOCALGROUP_INFO.radius,
    color: new THREE.Color(0xd8e0f0), lum: 0,
    pos: () => lgCenter, labelBand: [23.2, 24.4], focusD: 4.5e23,
    kind: 'region', priority: 7,
  });

  function update(ctx) {
    const f = bandFade(ctx.logS, 20.6, 24.6, 0.8);
    group.visible = f > 0.01;
    if (!group.visible) return;
    mat.uniforms.uOpacity.value = f;
    cmat.uniforms.uOpacity.value = 0.2 * f;
    updateStarUniforms(mat, ctx, [0, 0, 0], null, LY);
    updateStarUniforms(cmat, ctx, [0, 0, 0], null, LY);
  }
  return { group, update };
}
