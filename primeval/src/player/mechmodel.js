// BASTION: a four-metre powered exosuit.
//
// Rigid armour plate, so this is a parented hierarchy rather than a skin —
// every joint is a Group the controller can rotate directly.

import * as THREE from 'three';
import { injectPanels } from '../world/shaders.js';
import { Hull } from '../ship/model.js';

const ARM = [0.115, 0.120, 0.128];
const ARM_LIT = [0.195, 0.202, 0.212];
const ARM_DARK = [0.055, 0.058, 0.064];
const STEEL = [0.30, 0.315, 0.33];
const TRIM = [0.72, 0.34, 0.06];
const HOT = [1.0, 0.52, 0.10];
const GLOW = [0.35, 0.88, 1.0];
const VISOR = [0.10, 0.85, 1.0];

function part(h) {
  const g = h.geometry ? h.geometry() : h.build();
  return g;
}

/** Chamfered box: a box with its top and bottom faces inset. Reads as armour. */
function plate(h, x0, y0, z0, x1, y1, z1, col, chamfer = 0.09, emis = 0) {
  // Small chamfers only. Armour should read as faceted slabs, not pillows.
  const cx = Math.min(chamfer * (x1 - x0), 0.09), cz = Math.min(chamfer * (z1 - z0), 0.09);
  const b = [
    h.vert(x0 + cx, y0, z0 + cz, col, emis), h.vert(x1 - cx, y0, z0 + cz, col, emis),
    h.vert(x1 - cx, y0, z1 - cz, col, emis), h.vert(x0 + cx, y0, z1 - cz, col, emis),
  ];
  const m0 = [
    h.vert(x0, y0 + (y1 - y0) * 0.14, z0, col, emis), h.vert(x1, y0 + (y1 - y0) * 0.14, z0, col, emis),
    h.vert(x1, y0 + (y1 - y0) * 0.14, z1, col, emis), h.vert(x0, y0 + (y1 - y0) * 0.14, z1, col, emis),
  ];
  const m1 = [
    h.vert(x0, y1 - (y1 - y0) * 0.10, z0, col, emis), h.vert(x1, y1 - (y1 - y0) * 0.10, z0, col, emis),
    h.vert(x1, y1 - (y1 - y0) * 0.10, z1, col, emis), h.vert(x0, y1 - (y1 - y0) * 0.10, z1, col, emis),
  ];
  const t = [
    h.vert(x0 + cx, y1, z0 + cz, col, emis), h.vert(x1 - cx, y1, z0 + cz, col, emis),
    h.vert(x1 - cx, y1, z1 - cz, col, emis), h.vert(x0 + cx, y1, z1 - cz, col, emis),
  ];
  h.quad(b[0], b[3], b[2], b[1]);
  h.quad(t[0], t[1], t[2], t[3]);
  for (const [a, c] of [[b, m0], [m0, m1], [m1, t]]) {
    for (let i = 0; i < 4; i++) {
      const j = (i + 1) % 4;
      h.quad(a[i], a[j], c[j], c[i]);
    }
  }
}

function mat(name, detail = null) {
  const m = injectPanels(new THREE.MeshStandardMaterial({
    vertexColors: true, roughness: 0.48, metalness: 0.62,
    side: THREE.DoubleSide, dithering: true,
  }), detail, { scale: 1.15, bump: 0.6 });
  const emisU = { value: 1 };
  m.userData.emis = emisU;
  const prevCompile = m.onBeforeCompile;
  m.onBeforeCompile = (sh, rend) => {
    if (prevCompile) prevCompile(sh, rend);
    sh.uniforms.uEmis = emisU;
    sh.vertexShader = 'attribute float aEmis;\nvarying float vEmis;\n' + sh.vertexShader;
    sh.vertexShader = sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n vEmis = aEmis;');
    sh.fragmentShader = 'uniform float uEmis;\nvarying float vEmis;\n' + sh.fragmentShader;
    sh.fragmentShader = sh.fragmentShader.replace('#include <emissivemap_fragment>',
      '#include <emissivemap_fragment>\n totalEmissiveRadiance += diffuseColor.rgb * vEmis * uEmis * 4.0;');
  };
  m.customProgramCacheKey = () => 'primeval-mech-' + name + (detail ? '-plate' : '');
  return m;
}

/**
 * @returns {{group, rig, material, emisU, thrusters, cannonMuzzle}}
 * Local space: -Z forward, origin at the feet, ~4.1 m tall.
 */
export function buildMech(detail = null) {
  const material = mat('body', detail);
  const emisU = material.userData.emis;
  const group = new THREE.Group();
  group.name = 'BASTION';

  const mesh = (h, parent, pos = [0, 0, 0]) => {
    const m = new THREE.Mesh(h.build(), material);
    m.castShadow = true; m.receiveShadow = true;
    m.position.set(...pos);
    parent.add(m);
    return m;
  };

  // --- pelvis and torso ----------------------------------------------------
  const root = new THREE.Group();          // whole suit, for bob and lean
  group.add(root);
  const hips = new THREE.Group();
  hips.position.y = 2.28;
  root.add(hips);

  let h = new Hull();
  plate(h, -0.52, -0.30, -0.34, 0.52, 0.26, 0.34, ARM);
  plate(h, -0.30, -0.42, -0.24, 0.30, -0.26, 0.24, ARM_DARK, 0.2);
  // Hip actuators.
  for (const s of [-1, 1]) {
    h.tube(-0.22, 0.22, 0.14, 0.14, 8, STEEL, 0, s * 0.52, -0.02);
    plate(h, s * 0.44, -0.16, -0.20, s * 0.72, 0.14, 0.20, ARM_LIT, 0.15);
  }
  mesh(h, hips);

  const torso = new THREE.Group();
  torso.position.y = 0.30;
  hips.add(torso);
  h = new Hull();
  // Chest: wide at the shoulders, narrow at the waist.
  plate(h, -0.46, 0.0, -0.30, 0.46, 0.34, 0.30, ARM);
  plate(h, -0.62, 0.30, -0.36, 0.62, 0.92, 0.38, ARM);
  plate(h, -0.50, 0.88, -0.30, 0.50, 1.06, 0.32, ARM_LIT, 0.2);
  // Cockpit hatch, front and centre, with a lit seam.
  plate(h, -0.34, 0.40, -0.42, 0.34, 0.86, -0.30, ARM_DARK, 0.16);
  h.slab([[-0.30, 0.44, -0.425], [0.30, 0.44, -0.425], [0.30, 0.46, -0.425], [-0.30, 0.46, -0.425]], 0.02, GLOW, 1);
  h.slab([[-0.30, 0.82, -0.425], [0.30, 0.82, -0.425], [0.30, 0.84, -0.425], [-0.30, 0.84, -0.425]], 0.02, GLOW, 1);
  // Back: reactor and heat stacks.
  plate(h, -0.40, 0.34, 0.30, 0.40, 0.86, 0.56, ARM_DARK, 0.18);
  for (const s of [-1, 1]) {
    h.tube(0.36, 0.62, 0.13, 0.16, 8, STEEL, 0, s * 0.26, 0.66);
    h.tube(0.62, 0.70, 0.16, 0.12, 8, HOT, 0.7, s * 0.26, 0.66);
  }
  // Shoulder yokes, with hazard trim so the silhouette reads at range.
  for (const s of [-1, 1]) {
    plate(h, s * 0.58, 0.52, -0.26, s * 0.86, 0.92, 0.26, ARM_LIT, 0.10);
    h.slab([[s * 0.58, 0.86, -0.24], [s * 0.86, 0.86, -0.24],
      [s * 0.86, 0.86, 0.24], [s * 0.58, 0.86, 0.24]], 0.05, TRIM);
  }
  h.slab([[-0.44, 1.05, -0.24], [0.44, 1.05, -0.24], [0.44, 1.05, 0.24], [-0.44, 1.05, 0.24]], 0.04, TRIM);
  mesh(h, torso);

  // Sensor head.
  const head = new THREE.Group();
  head.position.set(0, 1.06, -0.04);
  torso.add(head);
  h = new Hull();
  plate(h, -0.24, 0.0, -0.26, 0.24, 0.30, 0.22, ARM_LIT, 0.18);
  h.slab([[-0.20, 0.10, -0.27], [0.20, 0.10, -0.27], [0.20, 0.22, -0.27], [-0.20, 0.22, -0.27]], 0.03, VISOR, 1);
  plate(h, -0.06, 0.26, -0.20, 0.06, 0.44, -0.10, STEEL, 0.2);
  mesh(h, head);

  // --- arms ----------------------------------------------------------------
  const arms = [];
  for (const s of [-1, 1]) {
    const shoulder = new THREE.Group();
    shoulder.position.set(s * 0.72, 0.74, 0);
    torso.add(shoulder);
    h = new Hull();
    plate(h, -0.20, -0.34, -0.22, 0.20, 0.10, 0.22, ARM_LIT, 0.2);
    plate(h, -0.16, -0.86, -0.18, 0.16, -0.30, 0.18, ARM, 0.16);
    h.tube(-0.18, 0.18, 0.10, 0.10, 8, STEEL, 0, 0, -0.86);
    mesh(h, shoulder);

    const elbow = new THREE.Group();
    elbow.position.set(0, -0.90, 0);
    shoulder.add(elbow);
    h = new Hull();
    if (s > 0) {
      // Right arm: the cannon.
      plate(h, -0.20, -0.62, -0.24, 0.20, -0.02, 0.24, ARM, 0.16);
      h.tube(-1.30, -0.50, 0.17, 0.19, 10, ARM_LIT, 0, 0, -0.30);
      h.tube(-1.42, -1.28, 0.20, 0.15, 10, ARM_DARK, 0, 0, -0.30);
      h.tube(-1.44, -1.38, 0.12, 0.12, 10, HOT, 1, 0, -0.30);
      for (let i = 0; i < 4; i++) {
        h.tube(-1.18 + i * 0.17, -1.13 + i * 0.17, 0.22, 0.22, 10, STEEL, 0, 0, -0.30);
      }
      // Capacitor bank on top.
      plate(h, -0.16, -0.20, -0.44, 0.16, -0.05, 0.16, ARM_DARK, 0.2);
      h.slab([[-0.12, -0.10, -0.42], [0.12, -0.10, -0.42], [0.12, -0.08, 0.10], [-0.12, -0.08, 0.10]], 0.03, GLOW, 1);
    } else {
      // Left arm: a fist, for when the cannon is too hot.
      plate(h, -0.20, -0.66, -0.24, 0.20, -0.02, 0.24, ARM, 0.16);
      plate(h, -0.26, -1.04, -0.28, 0.26, -0.60, 0.28, ARM_LIT, 0.2);
      for (let f = -1; f <= 1; f++) {
        plate(h, f * 0.16 - 0.07, -1.22, -0.26, f * 0.16 + 0.07, -1.00, 0.06, STEEL, 0.2);
      }
      plate(h, 0.18, -1.12, -0.10, 0.30, -0.90, 0.16, STEEL, 0.2);
    }
    mesh(h, elbow);
    arms.push({ shoulder, elbow, side: s });
  }

  // --- legs ----------------------------------------------------------------
  const legs = [];
  for (const s of [-1, 1]) {
    const hip = new THREE.Group();
    hip.position.set(s * 0.52, -0.16, 0);
    hips.add(hip);
    h = new Hull();
    plate(h, -0.24, -0.92, -0.26, 0.24, -0.04, 0.30, ARM, 0.16);
    plate(h, -0.28, -0.66, -0.30, 0.28, -0.34, 0.34, ARM_LIT, 0.2);
    h.tube(-0.20, 0.20, 0.13, 0.13, 8, STEEL, 0, 0, -0.96);
    mesh(h, hip);

    const knee = new THREE.Group();
    knee.position.set(0, -0.96, 0);
    hip.add(knee);
    h = new Hull();
    // Reverse-jointed shin, angled back.
    plate(h, -0.20, -0.86, -0.22, 0.20, -0.02, 0.26, ARM, 0.16);
    plate(h, -0.14, -0.62, 0.20, 0.14, -0.20, 0.40, ARM_DARK, 0.2);
    h.slab([[-0.10, -0.55, 0.41], [0.10, -0.55, 0.41], [0.10, -0.30, 0.41], [-0.10, -0.30, 0.41]], 0.03, HOT, 0.85);
    h.tube(-0.16, 0.16, 0.11, 0.11, 8, STEEL, 0, 0, -0.90);
    h.slab([[-0.19, -0.24, -0.23], [0.19, -0.24, -0.23], [0.19, -0.24, 0.10], [-0.19, -0.24, 0.10]], 0.05, TRIM);
    mesh(h, knee);

    const ankle = new THREE.Group();
    ankle.position.set(0, -0.90, 0);
    knee.add(ankle);
    h = new Hull();
    plate(h, -0.26, -0.30, -0.46, 0.26, -0.02, 0.30, ARM_LIT, 0.16);
    // Toe claws.
    for (let t = -1; t <= 1; t++) {
      plate(h, t * 0.17 - 0.08, -0.34, -0.62, t * 0.17 + 0.08, -0.14, -0.40, STEEL, 0.2);
    }
    plate(h, -0.12, -0.32, 0.28, 0.12, -0.10, 0.44, STEEL, 0.2);
    mesh(h, ankle);
    legs.push({ hip, knee, ankle, side: s });
  }

  // --- boosters -------------------------------------------------------------
  const thrusters = [];
  const flameMat = new THREE.MeshBasicMaterial({
    color: 0x9fe4ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending,
    depthWrite: false, side: THREE.DoubleSide,
  });
  for (const s of [-1, 1]) {
    const cone = new THREE.ConeGeometry(0.16, 1.5, 10, 1, true);
    cone.rotateX(Math.PI);
    cone.translate(s * 0.26, -0.85, 0.66);
    const f = new THREE.Mesh(cone, flameMat);
    f.frustumCulled = false;
    torso.add(f);
    thrusters.push(f);
  }

  // Muzzle marker, in the cannon arm's frame.
  const cannonMuzzle = new THREE.Object3D();
  cannonMuzzle.position.set(0, -0.30, -1.5);
  arms[1].elbow.add(cannonMuzzle);

  const light = new THREE.PointLight(0x8fd8ff, 0, 14, 2);
  light.position.set(0, 2.9, -0.4);
  group.add(light);

  return {
    group, root, hips, torso, head, arms, legs, thrusters, flameMat,
    cannonMuzzle, material, emisU, light,
    height: 4.1,
  };
}
