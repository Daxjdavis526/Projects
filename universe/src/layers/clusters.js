/* ============================================================================
   layers/clusters.js — groups, clusters, superclusters
   ----------------------------------------------------------------------------
   Named structures at their real sky positions and mean distances. Each is
   drawn as a statistical swarm of galaxy-points around its center (real
   cluster shapes are irregular; the swarms are schematic). The Laniakea
   envelope is an intentionally soft, approximate boundary — the real one is
   a watershed of galaxy flows, not a surface.
   ========================================================================== */
import * as THREE from 'three';
import { MPC, bandFade, smoothstep, lerp, mulberry32, gauss } from '../scale.js';
import { CLUSTERS, LANIAKEA, clusterXYZ } from '../data.js';
import { starMaterial, updateStarUniforms } from '../render.js';

export function buildClustersLayer(scene, registry, ctx0) {
  const group = new THREE.Group();
  scene.add(group);

  const items = CLUSTERS.map(c => ({
    name: c[0], p: clusterXYZ(c), distMpc: c[3], kind: c[4], radius: c[5], note: c[6],
  }));

  const nQ = Math.max(ctx0.quality.points, 0.4);
  const counts = items.map(it => it.kind.includes('void') ? 0
    : Math.ceil((60 + it.radius * 55) * nQ));
  const N = counts.reduce((a, b) => a + b, 0);
  const sp = new Float32Array(N * 3), sc = new Float32Array(N * 3), sl = new Float32Array(N);
  const rnd = mulberry32(2718);
  const C = new THREE.Color();
  let i = 0;
  items.forEach((it, idx) => {
    const flat = it.kind.includes('filament') || it.kind.includes('wall') ? 0.25 : 0.8;
    for (let k = 0; k < counts[idx]; k++) {
      const cx = it.p[0] / MPC + gauss(rnd) * it.radius * 0.55;
      const cy = it.p[1] / MPC + gauss(rnd) * it.radius * 0.55 * flat;
      const cz = it.p[2] / MPC + gauss(rnd) * it.radius * 0.55;
      sp[i*3] = cx; sp[i*3+1] = cy; sp[i*3+2] = cz;
      const w = rnd();
      if (w < 0.6) C.setRGB(0.98, 0.92, 0.78);       // ellipticals: old & gold
      else if (w < 0.85) C.setRGB(0.9, 0.9, 0.95);
      else C.setRGB(0.72, 0.8, 1.0);                 // spirals: blue
      sc[i*3] = C.r; sc[i*3+1] = C.g; sc[i*3+2] = C.b;
      sl[i] = 6e36 * (0.3 + rnd() * 2.4);            // ~1e10 L☉ galaxies
      i++;
    }
  });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(sp, 3));
  geo.setAttribute('aColor', new THREE.BufferAttribute(sc, 3));
  geo.setAttribute('aLum', new THREE.BufferAttribute(sl, 1));
  const mat = starMaterial({ fluxScale: 1.2e3, maxPx: 4 });
  const pts = new THREE.Points(geo, mat);
  pts.frustumCulled = false; pts.renderOrder = 2;
  group.add(pts);

  // ---- Laniakea: soft approximate envelope centered near the Great Attractor
  const norma = items.find(x => x.name.startsWith('Norma'));
  const laniaCenter = norma.p.map((v, ax) => v * 0.55);  // basin spans us to beyond Norma
  const lgeo = new THREE.IcosahedronGeometry(1, 4);
  {
    const pos = lgeo.attributes.position;
    const r3 = mulberry32(99);
    const bumps = [];
    for (let b = 0; b < 10; b++) bumps.push([gauss(r3), gauss(r3), gauss(r3), 0.5 + r3() * 1.6]);
    const v = new THREE.Vector3();
    for (let k = 0; k < pos.count; k++) {
      v.set(pos.getX(k), pos.getY(k), pos.getZ(k)).normalize();
      let d = 1;
      for (const [bx, by, bz, s] of bumps) {
        const dot = (v.x * bx + v.y * by + v.z * bz) / Math.hypot(bx, by, bz);
        d += 0.16 * Math.exp((dot - 1) * s * 2.2);
      }
      v.multiplyScalar(d);
      pos.setXYZ(k, v.x, v.y, v.z);
    }
    lgeo.computeVertexNormals();
  }
  const lmat = new THREE.ShaderMaterial({
    uniforms: { uOp: { value: 0.16 } },
    vertexShader: `varying vec3 vN; varying vec3 vP;
      void main(){ vN = normalize(mat3(modelMatrix)*normal);
      vec4 w = modelMatrix*vec4(position,1.0); vP = w.xyz;
      gl_Position = projectionMatrix*viewMatrix*w; }`,
    fragmentShader: `varying vec3 vN; varying vec3 vP; uniform float uOp;
      void main(){ vec3 V = normalize(cameraPosition - vP);
      float rim = pow(1.0 - abs(dot(normalize(vN), V)), 2.4);
      gl_FragColor = vec4(vec3(0.55,0.7,1.0)*rim, rim*uOp); }`,
    transparent: true, blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide, depthWrite: false,
  });
  const lania = new THREE.Mesh(lgeo, lmat);
  group.add(lania);

  // ---- registry
  for (const it of items) {
    registry.push({
      id: 'cl:' + it.name, name: it.name, cls: it.kind,
      blurb: it.note ?? `${it.kind} at ~${it.distMpc.toFixed(0)} Mpc (${(it.distMpc * 3.26).toFixed(0)} million light-years). Rendered as a schematic swarm at its real position.`,
      radius: it.radius * MPC, distMpc: it.distMpc,
      color: new THREE.Color(it.kind.includes('void') ? 0x6a7898 : 0xf0e2c0), lum: 0,
      pos: () => it.p,
      labelBand: it.kind.includes('Super') || it.kind.includes('super') || it.radius > 10
        ? [24.2, 26.0] : [23.2, 25.2],
      focusD: Math.max(it.radius * MPC * 3.2, 2e24), kind: 'cluster',
      priority: it.note ? 7 : 4,
    });
  }
  registry.push({
    id: 'laniakea', name: LANIAKEA.name, cls: LANIAKEA.cls, blurb: LANIAKEA.blurb,
    radius: LANIAKEA.radius, color: new THREE.Color(0x9ab8e8), lum: 0,
    pos: () => laniaCenter, labelBand: [24.4, 25.8], focusD: 6.5e24,
    kind: 'region', priority: 8,
  });

  function update(ctx) {
    const f = bandFade(ctx.logS, 22.4, 26.4, 0.8);
    group.visible = f > 0.01;
    if (!group.visible) return;
    const t = smoothstep(23.0, 25.0, ctx.logS);
    mat.uniforms.uFluxScale.value = lerp(1.2e3, 4e4, t);
    mat.uniforms.uOpacity.value = f * (ctx.timeMode ? 1 - ctx.timeEarly : 1);
    updateStarUniforms(mat, ctx, [0, 0, 0], null, MPC);
    const lf = bandFade(ctx.logS, 24.0, 25.6, 0.5);
    lania.visible = lf > 0.01 && !ctx.timeMode;
    if (lania.visible) {
      const S = ctx.S, fc = ctx.focus;
      lania.position.set((laniaCenter[0]-fc[0])/S, (laniaCenter[1]-fc[1])/S, (laniaCenter[2]-fc[2])/S);
      lania.scale.setScalar(LANIAKEA.radius / S);
      lmat.uniforms.uOp.value = 0.16 * lf;
    }
  }
  return { group, update };
}
