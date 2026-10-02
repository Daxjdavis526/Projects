/* Hardware for the 3D test cell: pressure vessels, bottles, tubing,
   valves with their position flags, regulators, a thrust stand, an engine
   turned from its real throat and exit diameters. Units are metres; the
   engine fires along +x. */
import * as THREE from 'three';
import { label } from './textures.js';

export const MAT = {
  steel: () => new THREE.MeshStandardMaterial({ color: 0x8c9196, metalness: 0.85, roughness: 0.38 }),
  stainless: () => new THREE.MeshStandardMaterial({ color: 0xb9bec2, metalness: 0.9, roughness: 0.26 }),
  darkSteel: () => new THREE.MeshStandardMaterial({ color: 0x3a3f44, metalness: 0.7, roughness: 0.55 }),
  paintGrey: () => new THREE.MeshStandardMaterial({ color: 0x6f767b, metalness: 0.25, roughness: 0.6 }),
  paintYellow: () => new THREE.MeshStandardMaterial({ color: 0xd8a51c, metalness: 0.2, roughness: 0.55 }),
  paintBlue: () => new THREE.MeshStandardMaterial({ color: 0x2d5f8f, metalness: 0.25, roughness: 0.5 }),
  copper: () => new THREE.MeshStandardMaterial({ color: 0xc27a4a, metalness: 1.0, roughness: 0.32, emissive: 0x000000 }),
  brass: () => new THREE.MeshStandardMaterial({ color: 0xb59a4c, metalness: 0.9, roughness: 0.35 }),
  black: () => new THREE.MeshStandardMaterial({ color: 0x18191b, metalness: 0.2, roughness: 0.7 }),
  rubber: () => new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.0, roughness: 0.9 }),
  white: () => new THREE.MeshStandardMaterial({ color: 0xe9e9e4, metalness: 0.1, roughness: 0.5 }),
};

export const mesh = (geo, mat, { x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, cast = true, recv = true } = {}) => {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z); m.rotation.set(rx, ry, rz);
  m.castShadow = cast; m.receiveShadow = recv;
  return m;
};

/* A vertical pressure vessel with 2:1 heads, on a skirt. V in m³; the
   aspect ratio decides the diameter. A sight-glass level gauge on its side
   shows the liquid — as a camera would. */
export function vessel({ V, aspect = 2.6, color = 0xd9dcd8, text = null, sight = true, legs = true }) {
  const g = new THREE.Group();
  // V = π r² L + (4/3) π r³ · 0.5 (two 2:1 elliptical heads ≈ a sphere of r·r·r/2)
  const r = Math.cbrt(V / (Math.PI * (aspect * 2 - 2 + 2 / 3)));
  const L = (aspect * 2 - 2) * r;           // straight shell
  const mat = new THREE.MeshStandardMaterial({ color, metalness: 0.35, roughness: 0.45 });
  const skirt = legs ? 0.25 + r * 0.4 : 0.02;
  const shell = mesh(new THREE.CylinderGeometry(r, r, L, 40), mat, { y: skirt + r * 0.5 + L / 2 });
  const head = new THREE.SphereGeometry(r, 40, 16, 0, Math.PI * 2, 0, Math.PI / 2);
  const top = mesh(head, mat, { y: skirt + r * 0.5 + L }); top.scale.y = 0.5;
  const bot = mesh(head, mat, { y: skirt + r * 0.5, rx: Math.PI }); bot.scale.y = 0.5;
  g.add(shell, top, bot);
  if (legs) {
    const lm = MAT.paintGrey();
    for (let k = 0; k < 3; k++) {
      const a = k * Math.PI * 2 / 3 + 0.4;
      g.add(mesh(new THREE.CylinderGeometry(0.025, 0.03, skirt + r * 0.4, 8), lm, { x: Math.cos(a) * r * 0.8, z: Math.sin(a) * r * 0.8, y: (skirt + r * 0.4) / 2 }));
    }
  }
  // nozzles on the top head
  g.add(mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.12, 12), MAT.stainless(), { y: skirt + r + L + 0.04 }));
  let level = null;
  if (sight) {
    const H = L + r * 0.6, y0 = skirt + r * 0.2;
    const glass = mesh(new THREE.CylinderGeometry(0.016, 0.016, H, 10), new THREE.MeshStandardMaterial({ color: 0xcfe8f2, metalness: 0, roughness: 0.1, transparent: true, opacity: 0.35 }), { x: r + 0.05, y: y0 + H / 2, cast: false });
    const liq = mesh(new THREE.CylinderGeometry(0.012, 0.012, 1, 10), new THREE.MeshStandardMaterial({ color: 0x3fa5c4, emissive: 0x0b2a35, roughness: 0.2 }), { x: r + 0.05, y: y0, cast: false });
    g.add(glass, liq,
      mesh(new THREE.BoxGeometry(0.06, 0.02, 0.03), MAT.steel(), { x: r + 0.03, y: y0 }),
      mesh(new THREE.BoxGeometry(0.06, 0.02, 0.03), MAT.steel(), { x: r + 0.03, y: y0 + H }));
    level = f => { const hh = Math.max(0.001, f) * H; liq.scale.y = hh; liq.position.y = y0 + hh / 2; liq.visible = f > 0.002; };
  }
  if (text) {
    const lab = new THREE.Mesh(new THREE.PlaneGeometry(r * 1.5, r * 0.42), new THREE.MeshStandardMaterial({ map: label(text, { fg: '#141414' }), transparent: true, roughness: 0.7 }));
    lab.position.set(0, skirt + r * 0.5 + L * 0.62, r + 0.002);
    g.add(lab);
  }
  g.userData = { r, height: skirt + r + L, top: skirt + r + L + 0.1, level };
  return g;
}

/* A K-size gas cylinder (~49 L water volume), shoulder band by gas. */
export function bottle({ band = 0x161616, body = 0x5a6065 } = {}) {
  const g = new THREE.Group(), r = 0.115, L = 1.25;
  const m = new THREE.MeshStandardMaterial({ color: body, metalness: 0.5, roughness: 0.5 });
  g.add(mesh(new THREE.CylinderGeometry(r, r, L, 28), m, { y: L / 2 + 0.02 }));
  const top = mesh(new THREE.SphereGeometry(r, 28, 10, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: band, metalness: 0.4, roughness: 0.5 }), { y: L + 0.02 });
  top.scale.y = 0.7; g.add(top);
  g.add(mesh(new THREE.CylinderGeometry(0.03, 0.035, 0.12, 12), MAT.brass(), { y: L + 0.12 }));
  g.add(mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.02, 16), MAT.black(), { y: L + 0.2 }));
  g.userData = { top: L + 0.2 };
  return g;
}

/* Tubing along a polyline, with bends. r = outside radius. */
export function tube(points, { r = 0.0127, mat = MAT.stainless(), bend = 0.06 } = {}) {
  const pts = points.map(p => (p.isVector3 ? p : new THREE.Vector3(...p)));
  // straight runs, with each interior vertex replaced by a quadratic arc
  const curve = new THREE.CurvePath();
  let prev = pts[0];
  for (let i = 1; i < pts.length; i++) {
    const p = pts[i];
    if (i < pts.length - 1) {
      const n = pts[i + 1];
      const d1 = p.clone().sub(prev), d2 = n.clone().sub(p);
      const k1 = Math.min(bend, d1.length() / 2), k2 = Math.min(bend, d2.length() / 2);
      const a = p.clone().sub(d1.normalize().multiplyScalar(k1)), b = p.clone().add(d2.normalize().multiplyScalar(k2));
      if (a.distanceTo(prev) > 1e-4) curve.add(new THREE.LineCurve3(prev, a));
      curve.add(new THREE.QuadraticBezierCurve3(a, p, b));
      prev = b;
    } else if (p.distanceTo(prev) > 1e-4) curve.add(new THREE.LineCurve3(prev, p));
  }
  const len = curve.getLength();
  const geo = new THREE.TubeGeometry(curve, Math.max(8, Math.round(len / 0.04)), r, 10, false);
  const m = mesh(geo, mat);
  return m;
}

/* A ball valve with a pneumatic actuator and its yellow position flag. The
   flag is the camera's evidence: parallel to the pipe = open. */
export function ballValve({ size = 1, pneumatic = true, axis = 'x' } = {}) {
  const g = new THREE.Group(), s = size;
  const body = mesh(new THREE.SphereGeometry(0.035 * s, 16, 12), MAT.stainless());
  const ends = mesh(new THREE.CylinderGeometry(0.022 * s, 0.022 * s, 0.13 * s, 12), MAT.stainless(), { rz: Math.PI / 2 });
  g.add(body, ends);
  const stem = mesh(new THREE.CylinderGeometry(0.008 * s, 0.008 * s, 0.05 * s, 8), MAT.steel(), { y: 0.05 * s });
  g.add(stem);
  let flag;
  if (pneumatic) {
    g.add(mesh(new THREE.BoxGeometry(0.11 * s, 0.07 * s, 0.07 * s), MAT.paintBlue(), { y: 0.11 * s }));
    g.add(mesh(new THREE.CylinderGeometry(0.03 * s, 0.03 * s, 0.03 * s, 12), MAT.black(), { y: 0.16 * s }));
    flag = mesh(new THREE.BoxGeometry(0.075 * s, 0.006 * s, 0.014 * s), new THREE.MeshStandardMaterial({ color: 0xf2c21b, emissive: 0x2a1f00, roughness: 0.4 }), { y: 0.18 * s });
  } else {
    flag = mesh(new THREE.BoxGeometry(0.12 * s, 0.008 * s, 0.018 * s), new THREE.MeshStandardMaterial({ color: 0xc2271b, roughness: 0.5 }), { y: 0.08 * s, x: 0.04 * s });
  }
  g.add(flag);
  if (axis === 'z') g.rotation.y = Math.PI / 2;
  if (axis === 'y') g.rotation.z = Math.PI / 2;
  g.userData.set = pos => { flag.rotation.y = (1 - Math.max(0, Math.min(1, pos))) * Math.PI / 2; };
  return g;
}

/* A solenoid valve: body and coil. */
export function solenoid({ size = 1 } = {}) {
  const g = new THREE.Group(), s = size;
  g.add(mesh(new THREE.BoxGeometry(0.06 * s, 0.04 * s, 0.04 * s), MAT.brass()));
  g.add(mesh(new THREE.CylinderGeometry(0.022 * s, 0.022 * s, 0.06 * s, 14), MAT.black(), { y: 0.05 * s }));
  const led = mesh(new THREE.SphereGeometry(0.006 * s, 8, 6), new THREE.MeshStandardMaterial({ color: 0x331111, emissive: 0x000000 }), { y: 0.085 * s });
  g.add(led);
  g.userData.set = pos => { led.material.emissive.setHex(pos > 0.5 ? 0xff3311 : 0x000000); };
  return g;
}

/* A dome-loaded regulator. */
export function regulator({ size = 1 } = {}) {
  const g = new THREE.Group(), s = size;
  g.add(mesh(new THREE.CylinderGeometry(0.04 * s, 0.04 * s, 0.06 * s, 18), MAT.stainless()));
  g.add(mesh(new THREE.CylinderGeometry(0.055 * s, 0.045 * s, 0.05 * s, 18), MAT.paintGrey(), { y: 0.055 * s }));
  g.add(mesh(new THREE.CylinderGeometry(0.012 * s, 0.012 * s, 0.05 * s, 8), MAT.brass(), { y: 0.1 * s }));
  return g;
}

/* A pressure transducer on a short stem, with its cable. */
export function transducer() {
  const g = new THREE.Group();
  g.add(mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.07, 10), MAT.stainless(), { y: 0.035 }));
  g.add(mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.1, 6), MAT.black(), { y: 0.11, rz: 0.4, x: -0.02 }));
  return g;
}

/* A steel beam between two points (for frames and stands). */
export function beam(a, b, { w = 0.08, h = 0.08, mat = MAT.paintYellow() } = {}) {
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b);
  const L = A.distanceTo(B);
  const m = mesh(new THREE.BoxGeometry(w, L, h), mat);
  m.position.copy(A).add(B).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize());
  return m;
}

/* A rocket engine turned on a lathe from its real throat and exit
   diameters. Returns { group, exit (local x of the exit plane), length,
   hot: { chamber, nozzle } materials whose emissive the wall temperature
   drives, inner: the nozzle's inside surface }. The engine axis is +x,
   the injector at x = 0. */
export function engine({ Dt, De, regen = false, heatSink = true, name = '' }) {
  const g = new THREE.Group();
  const rt = Dt / 2, re = De / 2;
  const rc = rt * 2.2;                                       // contraction ratio ≈ 4.8
  const Lc = rt * 7.5;                                       // cylindrical chamber
  const Lcv = (rc - rt) / Math.tan(30 * Math.PI / 180);      // 30° convergence
  const Ldv = (re - rt) / Math.tan(15 * Math.PI / 180);      // 15° cone
  const wall = heatSink ? rt * 1.6 : rt * 0.35;              // a copper heat sink is THICK
  const xT = Lc + Lcv, xE = xT + Ldv;
  // outside profile (Vector2(radius, x)), lathe revolves about y → rotate later
  const outer = [];
  const ro = rc + wall;
  outer.push(new THREE.Vector2(0.0001, 0), new THREE.Vector2(ro * 1.08, 0), new THREE.Vector2(ro * 1.08, rt * 1.2));
  outer.push(new THREE.Vector2(ro, rt * 1.2), new THREE.Vector2(ro, Lc));
  if (heatSink) { outer.push(new THREE.Vector2(ro, xT + rt * 0.5)); outer.push(new THREE.Vector2(re + rt * 0.25, xE - rt * 0.2)); }
  else { outer.push(new THREE.Vector2(rt + wall * 2.2, xT)); outer.push(new THREE.Vector2(re + wall, xE)); }
  outer.push(new THREE.Vector2(re + rt * 0.08, xE), new THREE.Vector2(re, xE));
  const inner = [];
  for (let i = 0; i <= 24; i++) {
    const x = xT + Ldv * i / 24;
    inner.push(new THREE.Vector2(rt + (re - rt) * i / 24, x));
  }
  const matBody = regen ? new THREE.MeshStandardMaterial({ color: 0x9aa0a2, metalness: 0.85, roughness: 0.42, emissive: 0x000000 }) : MAT.copper();
  const body = new THREE.Mesh(new THREE.LatheGeometry(outer, 48), matBody);
  body.castShadow = body.receiveShadow = true;
  // the nozzle's inside: what the downrange camera looks into
  const innerMat = new THREE.MeshStandardMaterial({ color: regen ? 0x6b6f71 : 0x8a5a3c, metalness: 0.6, roughness: 0.5, side: THREE.BackSide, emissive: 0x000000 });
  const innerMesh = new THREE.Mesh(new THREE.LatheGeometry(inner.map(v => new THREE.Vector2(v.x * 0.999, v.y)), 48), innerMat);
  const lathe = new THREE.Group();
  lathe.add(body, innerMesh);
  lathe.rotation.z = -Math.PI / 2;                           // lathe axis y → engine axis +x
  g.add(lathe);
  // injector manifolds and the igniter
  const man = MAT.stainless();
  g.add(mesh(new THREE.CylinderGeometry(rt * 0.45, rt * 0.45, rt * 3.2, 12), man, { x: -rt * 0.6, y: ro * 0.75, rz: Math.PI / 2.6 }));
  g.add(mesh(new THREE.CylinderGeometry(rt * 0.45, rt * 0.45, rt * 3.2, 12), man, { x: -rt * 0.6, y: -ro * 0.75, rz: -Math.PI / 2.6 }));
  g.add(mesh(new THREE.CylinderGeometry(rt * 0.3, rt * 0.3, rt * 2.5, 10), MAT.white(), { x: rt * 1.2, z: ro * 1.05, rx: Math.PI / 2 }));
  if (regen) {
    // coolant inlet manifold near the exit, outlet at the injector end
    g.add(mesh(new THREE.TorusGeometry(re + wall * 1.4, rt * 0.3, 10, 40), man, { x: xE - rt * 0.8, ry: Math.PI / 2 }));
    g.add(mesh(new THREE.TorusGeometry(ro * 1.04, rt * 0.3, 10, 40), man, { x: rt * 1.6, ry: Math.PI / 2 }));
  }
  if (heatSink) {
    // embedded thermocouples along the wall
    for (const x of [Lc * 0.5, xT]) g.add(mesh(new THREE.CylinderGeometry(rt * 0.12, rt * 0.12, rt * 1.6, 6), MAT.stainless(), { x, y: ro + rt * 0.5 }));
  }
  if (name) {
    const lab = new THREE.Mesh(new THREE.PlaneGeometry(ro * 2.2, ro * 0.6), new THREE.MeshStandardMaterial({ map: label(name, { fg: '#1a1a1a', font: 'bold 64px monospace' }), transparent: true, roughness: 0.6 }));
    lab.position.set(Lc * 0.45, 0, ro + 0.001); g.add(lab);
  }
  return { group: g, exit: xE, throat: xT, length: xE, rOut: ro * 1.08, body: matBody, inner: innerMat };
}

/* Simple people: hard hat, hi-vis vest. */
export function person({ vest = 0xf26b1d } = {}) {
  const g = new THREE.Group();
  const skin = new THREE.MeshStandardMaterial({ color: 0x9c7458, roughness: 0.8 });
  const cloth = new THREE.MeshStandardMaterial({ color: 0x2f3a46, roughness: 0.85 });
  g.add(mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.82, 10), cloth, { y: 0.41, x: 0 }));      // legs
  g.add(mesh(new THREE.CapsuleGeometry(0.17, 0.42, 4, 12), new THREE.MeshStandardMaterial({ color: vest, roughness: 0.6, emissive: 0x150500 }), { y: 1.12 }));
  g.add(mesh(new THREE.SphereGeometry(0.11, 14, 10), skin, { y: 1.58 }));
  const hat = mesh(new THREE.SphereGeometry(0.125, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xf1f1ea, roughness: 0.4 }), { y: 1.62 });
  g.add(hat);
  return g;
}
