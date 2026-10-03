/* Hardware for the 3D test cell: pressure vessels, bottles, tubing,
   valves with their position flags, regulators, a thrust stand, an engine
   turned from its real throat and exit diameters. Units are metres; the
   engine fires along +x. */
import * as THREE from 'three';
import { label, braid } from './textures.js';
import { boltCircle, plate } from './structure.js';

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
const lm2 = () => MAT.paintGrey();
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
  // girth welds where the heads meet the shell, and a longitudinal seam
  const weld = MAT.steel();
  for (const yy of [skirt + r * 0.5, skirt + r * 0.5 + L]) g.add(mesh(new THREE.TorusGeometry(r * 1.002, Math.max(0.0025, r * 0.012), 6, 48), weld, { y: yy, rx: Math.PI / 2 }));
  g.add(mesh(new THREE.BoxGeometry(Math.max(0.004, r * 0.02), L, Math.max(0.004, r * 0.02)), weld, { x: -r * 0.707, z: -r * 0.707, y: skirt + r * 0.5 + L / 2 }));
  if (legs) {
    // four pipe legs on welded pads, cross-braced, each on a base plate
    const lm = MAT.paintGrey(), hl = skirt + r * 0.55, lr = Math.max(0.018, r * 0.09);
    for (let k = 0; k < 4; k++) {
      const a = k * Math.PI / 2 + Math.PI / 4, cx = Math.cos(a) * r * 0.86, cz = Math.sin(a) * r * 0.86;
      g.add(mesh(new THREE.CylinderGeometry(lr, lr, hl, 12), lm, { x: cx, z: cz, y: hl / 2 }));
      g.add(mesh(new THREE.BoxGeometry(lr * 4, 0.01, lr * 4), lm, { x: cx, z: cz, y: 0.005 }));
      g.add(mesh(new THREE.BoxGeometry(lr * 2.6, r * 0.3, 0.008), lm, { x: Math.cos(a) * r * 0.95, z: Math.sin(a) * r * 0.95, y: skirt + r * 0.45, ry: -a + Math.PI / 2 }));
      const b2 = (k + 1) * Math.PI / 2 + Math.PI / 4;
      g.add(beam([cx, hl * 0.3, cz], [Math.cos(b2) * r * 0.86, hl * 0.3, Math.sin(b2) * r * 0.86], { w: lr * 0.7, h: lr * 0.7, mat: lm }));
    }
  }
  // the outlet at the bottom head, flanged; the top head's fittings: the
  // pressurant inlet, the vent and the relief valve
  const ss = MAT.stainless();
  g.add(mesh(new THREE.CylinderGeometry(r * 0.08, r * 0.08, skirt * 0.6, 16), ss, { y: skirt * 0.7 }));
  g.add(mesh(new THREE.CylinderGeometry(r * 0.16, r * 0.16, r * 0.04, 20), ss, { y: skirt * 0.55 }));
  const yTop = skirt + r * 0.5 + L;
  for (const [dx, dz, hh, rr] of [[0, 0, r * 0.62, r * 0.07], [r * 0.38, 0.0, r * 0.55, r * 0.05], [-r * 0.3, r * 0.22, r * 0.58, r * 0.05]]) {
    g.add(mesh(new THREE.CylinderGeometry(rr, rr, hh, 14), ss, { x: dx, z: dz, y: yTop + hh / 2 - r * 0.1 }));
    g.add(mesh(new THREE.CylinderGeometry(rr * 1.8, rr * 1.8, r * 0.03, 16), ss, { x: dx, z: dz, y: yTop + hh - r * 0.1 }));
  }
  // relief valve on its fitting: a brass body, a cap
  g.add(mesh(new THREE.CylinderGeometry(r * 0.07, r * 0.09, r * 0.22, 14), MAT.brass(), { x: -r * 0.3, z: r * 0.22, y: yTop + r * 0.6 }));
  // lifting lugs
  for (const s2 of [-1, 1]) g.add(mesh(new THREE.TorusGeometry(r * 0.06, r * 0.018, 6, 14), lm2(), { x: s2 * r * 0.55, y: yTop + r * 0.12, rz: 0 }));
  let level = null;
  if (sight) {
    const H = L + r * 0.6, y0 = skirt + r * 0.2;
    const glass = mesh(new THREE.CylinderGeometry(0.016, 0.016, H, 10), new THREE.MeshStandardMaterial({ color: 0xcfe8f2, metalness: 0, roughness: 0.1, transparent: true, opacity: 0.35 }), { x: r + 0.05, y: y0 + H / 2, cast: false });
    const liq = mesh(new THREE.CylinderGeometry(0.012, 0.012, 1, 10), new THREE.MeshStandardMaterial({ color: 0x3fa5c4, emissive: 0x0b2a35, roughness: 0.2 }), { x: r + 0.05, y: y0, cast: false });
    liq.visible = false;
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
  // frost (a cryogen inside): the shell goes a pale icy blue and matte, with a
  // faint cold glow so it reads in a dim cell (rime ice over a 90 K wall)
  const base = new THREE.Color(color), rime = new THREE.Color(0xb9dcf2), glow = new THREE.Color(0x10283a);
  let fk = -1;
  const frost = k => {
    if (Math.abs(k - fk) < 0.01) return; fk = k;
    mat.color.copy(base).lerp(rime, 0.95 * k); mat.roughness = 0.45 + 0.5 * k; mat.metalness = 0.35 * (1 - k);
    mat.emissive.copy(glow).multiplyScalar(k);
  };
  g.userData = { r, height: skirt + r + L, top: skirt + r + L + r * 0.5, level, frost,
    ventAt: new THREE.Vector3(r * 0.38, yTop + r * 0.47, 0), pressAt: new THREE.Vector3(0, yTop + r * 0.52, 0) };
  return g;
}

/* A weigh scale under a run tank: a checker-plate platform on four
   compression load cells, a junction box and its cable. Top at 0.12 m. */
export function weighScale(w = 0.8) {
  const g = new THREE.Group();
  const pm = new THREE.MeshStandardMaterial({ map: checker(), color: 0x9a9d9e, metalness: 0.8, roughness: 0.45 });
  g.add(mesh(new THREE.BoxGeometry(w, 0.025, w), pm, { y: 0.1075 }));
  g.add(mesh(new THREE.BoxGeometry(w - 0.04, 0.05, w - 0.04), MAT.darkSteel(), { y: 0.07 }));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    g.add(mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.045, 16), MAT.stainless(), { x: sx * (w / 2 - 0.06), z: sz * (w / 2 - 0.06), y: 0.0225 }));
    g.add(mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.006, 16), MAT.darkSteel(), { x: sx * (w / 2 - 0.06), z: sz * (w / 2 - 0.06), y: 0.003 }));
  }
  g.add(mesh(new THREE.BoxGeometry(0.12, 0.08, 0.05), new THREE.MeshStandardMaterial({ color: 0x8a9196, metalness: 0.3, roughness: 0.5 }), { x: w / 2 + 0.07, y: 0.06, z: 0 }));
  return g;
}
let checkerTex = null;
function checker() {
  if (checkerTex) return checkerTex;
  const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d');
  x.fillStyle = '#8c8f90'; x.fillRect(0, 0, 64, 64);
  x.fillStyle = '#b4b7b8';
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
    x.save(); x.translate(i * 16 + 8, j * 16 + 8); x.rotate((i + j) % 2 ? Math.PI / 4 : -Math.PI / 4); x.fillRect(-6, -1.5, 12, 3); x.restore();
  }
  checkerTex = new THREE.CanvasTexture(c); checkerTex.wrapS = checkerTex.wrapT = THREE.RepeatWrapping; checkerTex.repeat.set(6, 6); checkerTex.colorSpace = THREE.SRGBColorSpace;
  return checkerTex;
}

/* A K-size gas cylinder (~49 L water volume): a drawn shell with its
   shoulder, the colour band, a brass valve with a handwheel, a collar. */
export function bottle({ band = 0x161616, body = 0x5a6065 } = {}) {
  const g = new THREE.Group(), r = 0.115, L = 1.25;
  const pts = [new THREE.Vector2(0.0001, 0), new THREE.Vector2(r * 0.92, 0), new THREE.Vector2(r, r * 0.12), new THREE.Vector2(r, L - r * 0.9)];
  for (let i = 1; i <= 8; i++) { const a = i / 8 * Math.PI / 2; pts.push(new THREE.Vector2(Math.max(0.028, r * Math.cos(a)), L - r * 0.9 + r * 0.75 * Math.sin(a))); }
  pts.push(new THREE.Vector2(0.028, L + 0.04), new THREE.Vector2(0.0001, L + 0.04));
  const m = new THREE.MeshStandardMaterial({ color: body, metalness: 0.45, roughness: 0.5 });
  g.add(mesh(new THREE.LatheGeometry(pts, 32), m));
  g.add(mesh(new THREE.CylinderGeometry(r * 0.985, r * 0.985, 0.16, 32, 1, true), new THREE.MeshStandardMaterial({ color: band, metalness: 0.35, roughness: 0.5 }), { y: L - r * 0.9 - 0.06 }));
  g.add(mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.02, 16), MAT.steel(), { y: L + 0.05 }));
  const vb = MAT.brass();
  g.add(mesh(new THREE.BoxGeometry(0.05, 0.07, 0.05), vb, { y: L + 0.095 }));
  g.add(mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.07, 10), vb, { y: L + 0.09, x: 0.05, rz: Math.PI / 2 }));       // outlet (CGA)
  g.add(mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.05, 8), MAT.steel(), { y: L + 0.15 }));
  g.add(mesh(new THREE.TorusGeometry(0.03, 0.006, 6, 16), MAT.black(), { y: L + 0.175, rx: Math.PI / 2 }));             // handwheel
  for (let k = 0; k < 3; k++) g.add(mesh(new THREE.BoxGeometry(0.06, 0.006, 0.006), MAT.black(), { y: L + 0.175, ry: k * Math.PI / 3 }));
  g.userData = { top: L + 0.2 };
  return g;
}

/* A dial pressure gauge, its face painted: ticks, a red band, a needle. */
let gaugeFace = null;
export function gauge({ size = 0.05, frac = 0.55 } = {}) {
  if (!gaugeFace) {
    const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
    x.fillStyle = '#f2f1ec'; x.beginPath(); x.arc(64, 64, 62, 0, Math.PI * 2); x.fill();
    x.strokeStyle = '#c0281d'; x.lineWidth = 7; x.beginPath(); x.arc(64, 64, 48, Math.PI * 0.25, Math.PI * 0.45); x.stroke();
    x.strokeStyle = '#111'; x.lineWidth = 2;
    for (let i = 0; i <= 20; i++) {
      const a = Math.PI * (0.75 + 1.5 * i / 20), l = i % 5 ? 6 : 12;
      x.beginPath(); x.moveTo(64 + Math.cos(a) * 54, 64 + Math.sin(a) * 54); x.lineTo(64 + Math.cos(a) * (54 - l), 64 + Math.sin(a) * (54 - l)); x.stroke();
    }
    x.fillStyle = '#111'; x.font = 'bold 13px monospace'; x.textAlign = 'center'; x.fillText('PSI', 64, 92);
    gaugeFace = new THREE.CanvasTexture(c); gaugeFace.colorSpace = THREE.SRGBColorSpace;
  }
  const g = new THREE.Group(), R = size / 2;
  g.add(mesh(new THREE.CylinderGeometry(R * 1.12, R * 1.12, R * 0.6, 28), MAT.stainless(), { rx: Math.PI / 2, z: -R * 0.3 }));
  g.add(mesh(new THREE.CircleGeometry(R, 28), new THREE.MeshStandardMaterial({ map: gaugeFace, roughness: 0.35 }), { z: 0.0005, cast: false }));
  const nd = mesh(new THREE.BoxGeometry(R * 0.85, R * 0.07, 0.001), new THREE.MeshStandardMaterial({ color: 0x111111 }), { z: 0.0015, cast: false });
  nd.geometry.translate(R * 0.42, 0, 0);
  const setN = f => { nd.rotation.z = -(Math.PI * (0.75 + 1.5 * Math.max(0, Math.min(1, f)))); };
  setN(frac); g.add(nd);
  g.add(mesh(new THREE.CircleGeometry(R * 1.02, 28), new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.12, roughness: 0.05, metalness: 0 }), { z: 0.003, cast: false }));
  g.userData.set = setN;
  return g;
}

/* A small engraved tag plate (component tag), facing +z. */
export function tag(text, { w = 0.09, h = 0.026 } = {}) {
  return mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: label(text, { fg: '#f2f2ee', bg: '#1d2328', font: 'bold 60px monospace', border: '#9aa3a8' }), roughness: 0.6 }), { cast: false });
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

/* A braided stainless flex hose along a polyline, with a hex fitting at
   each end — how the feed lines reach an engine on a moving cradle. */
let braidTex = null;
export function hose(points, { r = 0.008 } = {}) {
  braidTex ||= braid();
  const len = points.reduce((a, p, i) => (i ? a + new THREE.Vector3(...p).distanceTo(new THREE.Vector3(...points[i - 1])) : 0), 0);
  const t = braidTex.clone(); t.needsUpdate = true; t.repeat.set(1, Math.max(4, Math.round(len / (r * 2.2))));
  const g = new THREE.Group();
  g.add(tube(points, { r, mat: new THREE.MeshStandardMaterial({ map: t, metalness: 0.85, roughness: 0.42 }), bend: Math.max(0.05, r * 8) }));
  for (const [i, j] of [[0, 1], [points.length - 1, points.length - 2]]) {
    const A = new THREE.Vector3(...points[i]), B = new THREE.Vector3(...points[j]);
    const f = mesh(new THREE.CylinderGeometry(r * 1.55, r * 1.55, r * 2.6, 6), MAT.stainless());
    f.position.copy(A).addScaledVector(B.clone().sub(A).normalize(), r * 1.3);
    f.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize());
    g.add(f);
  }
  return g;
}

/* A ball valve with a pneumatic actuator and its yellow position flag. The
   flag is the camera's evidence: parallel to the pipe = open. The body
   has hex tube connectors; the rack-and-pinion actuator sits on a bracket
   with its end caps, the limit-switch box and the indicator on top. */
export function ballValve({ size = 1, pneumatic = true, axis = 'x' } = {}) {
  const g = new THREE.Group(), s = size;
  const ss = MAT.stainless();
  g.add(mesh(new THREE.SphereGeometry(0.032 * s, 18, 12), ss));
  g.add(mesh(new THREE.CylinderGeometry(0.026 * s, 0.026 * s, 0.07 * s, 16), ss, { rz: Math.PI / 2 }));
  for (const sx of [-1, 1]) g.add(mesh(new THREE.CylinderGeometry(0.02 * s, 0.02 * s, 0.025 * s, 6), ss, { x: sx * 0.05 * s, rz: Math.PI / 2 }));
  g.add(mesh(new THREE.CylinderGeometry(0.008 * s, 0.008 * s, 0.05 * s, 8), MAT.steel(), { y: 0.05 * s }));
  let flag;
  if (pneumatic) {
    g.add(mesh(new THREE.BoxGeometry(0.05 * s, 0.006 * s, 0.05 * s), MAT.steel(), { y: 0.06 * s }));                       // bracket
    const act = plate({ w: 0.12 * s, h: 0.062 * s, t: 0.062 * s, rc: 0.018 * s, mat: MAT.paintBlue() }); act.position.y = 0.1 * s; g.add(act);
    for (const sx of [-1, 1]) g.add(mesh(new THREE.CylinderGeometry(0.03 * s, 0.03 * s, 0.012 * s, 20), MAT.black(), { x: sx * 0.064 * s, y: 0.1 * s, rz: Math.PI / 2 }));
    g.add(mesh(new THREE.BoxGeometry(0.05 * s, 0.03 * s, 0.04 * s), new THREE.MeshStandardMaterial({ color: 0x2b2d2f, metalness: 0.3, roughness: 0.5 }), { y: 0.146 * s }));   // limit-switch box
    g.add(mesh(new THREE.CylinderGeometry(0.006 * s, 0.006 * s, 0.02 * s, 8), MAT.brass(), { x: 0.045 * s, y: 0.1 * s, z: 0.034 * s, rx: Math.PI / 2 }));   // air port
    flag = mesh(new THREE.BoxGeometry(0.075 * s, 0.008 * s, 0.016 * s), new THREE.MeshStandardMaterial({ color: 0xf2c21b, emissive: 0x2a1f00, roughness: 0.4 }), { y: 0.166 * s });
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

/* A dome-loaded regulator: a stainless body with its ports, a black
   bonnet with the dome, the dome's loading port on top. */
export function regulator({ size = 1 } = {}) {
  const g = new THREE.Group(), s = size;
  const ss = MAT.stainless(), blk = new THREE.MeshStandardMaterial({ color: 0x1c1e20, metalness: 0.4, roughness: 0.45 });
  g.add(mesh(new THREE.BoxGeometry(0.06 * s, 0.045 * s, 0.05 * s), ss));
  for (const sx of [-1, 1]) g.add(mesh(new THREE.CylinderGeometry(0.011 * s, 0.011 * s, 0.022 * s, 6), ss, { x: sx * 0.04 * s, rz: Math.PI / 2 }));
  g.add(mesh(new THREE.CylinderGeometry(0.036 * s, 0.033 * s, 0.035 * s, 24), blk, { y: 0.04 * s }));
  const dome = mesh(new THREE.SphereGeometry(0.036 * s, 24, 10, 0, Math.PI * 2, 0, Math.PI / 2), blk, { y: 0.0575 * s }); dome.scale.y = 0.45; g.add(dome);
  g.add(mesh(new THREE.CylinderGeometry(0.006 * s, 0.006 * s, 0.025 * s, 6), MAT.brass(), { y: 0.08 * s }));
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
export function engine({ Dt, De, regen = false, heatSink = true, ablative = false, name = '' }) {
  const g = new THREE.Group();
  const rt = Dt / 2, re = De / 2;
  const rc = rt * 2.2;                                       // contraction ratio ≈ 4.8
  const Lc = rt * 7.5;                                       // cylindrical chamber
  const Lcv = (rc - rt) / Math.tan(30 * Math.PI / 180);      // 30° convergence
  const Ldv = (re - rt) / Math.tan(15 * Math.PI / 180);      // 15° cone
  const wall = heatSink ? rt * 1.6 : ablative ? rt * 1.1 : rt * 0.35;   // a copper heat sink is THICK; an ablative liner in its case nearly so
  const xT = Lc + Lcv, xE = xT + Ldv;
  // outside profile (Vector2(radius, x)), lathe revolves about y → rotate later
  const outer = [];
  const ro = rc + wall;
  outer.push(new THREE.Vector2(0.0001, 0), new THREE.Vector2(ro, 0));
  outer.push(new THREE.Vector2(ro, rt * 1.2), new THREE.Vector2(ro, Lc));
  if (heatSink || ablative) { outer.push(new THREE.Vector2(ro, xT + rt * 0.5)); outer.push(new THREE.Vector2(re + rt * 0.25, xE - rt * 0.2)); }
  else { outer.push(new THREE.Vector2(rt + wall * 2.2, xT)); outer.push(new THREE.Vector2(re + wall, xE)); }
  outer.push(new THREE.Vector2(re + rt * 0.08, xE), new THREE.Vector2(re, xE));
  const inner = [];
  for (let i = 0; i <= 24; i++) {
    const x = xT + Ldv * i / 24;
    inner.push(new THREE.Vector2(rt + (re - rt) * i / 24, x));
  }
  const matBody = regen ? new THREE.MeshStandardMaterial({ color: 0x9aa0a2, metalness: 0.85, roughness: 0.42, emissive: 0x000000 })
    : ablative ? new THREE.MeshStandardMaterial({ color: 0x4d5257, metalness: 0.55, roughness: 0.55, emissive: 0x000000 }) : MAT.copper();
  const body = new THREE.Mesh(new THREE.LatheGeometry(outer, 48), matBody);
  body.castShadow = body.receiveShadow = true;
  // the nozzle's inside: what the downrange camera looks into
  // an ablative's inside is charred phenolic: black, matte
  const innerMat = new THREE.MeshStandardMaterial({ color: regen ? 0x6b6f71 : ablative ? 0x1d1a18 : 0x8a5a3c, metalness: ablative ? 0.05 : 0.6, roughness: ablative ? 0.95 : 0.5, side: THREE.BackSide, emissive: 0x000000 });
  const innerMesh = new THREE.Mesh(new THREE.LatheGeometry(inner.map(v => new THREE.Vector2(v.x * 0.999, v.y)), 48), innerMat);
  const lathe = new THREE.Group();
  lathe.add(body, innerMesh);
  lathe.rotation.z = -Math.PI / 2;                           // lathe axis y → engine axis +x
  g.add(lathe);
  // the injector head behind the face: a stainless body, a bolted flange
  // joining it to the chamber, a domed back with the propellant inlets
  const man = MAT.stainless(), rh = ro * 1.02, hL = Math.max(rt * 2.4, 0.012), rf = ro * 1.32, tf = Math.max(rt * 0.55, 0.004);
  g.add(mesh(new THREE.CylinderGeometry(rh, rh, hL, 40), man, { x: -hL / 2, rz: Math.PI / 2 }));
  g.add(mesh(new THREE.CylinderGeometry(rf, rf, tf, 48), man, { x: -tf / 2, rz: Math.PI / 2 }));
  g.add(mesh(new THREE.CylinderGeometry(rf, rf, tf, 48), heatSink ? MAT.copper() : man, { x: tf / 2 + 0.0002, rz: Math.PI / 2 }));
  g.add(boltCircle([tf + 0.0004, 0, 0], [1, 0, 0], (ro + rf) / 2 + rt * 0.05, 8, Math.max(0.0035, rt * 0.42), { stud: true }));
  const dome = mesh(new THREE.SphereGeometry(rh * 0.92, 32, 12, 0, Math.PI * 2, 0, Math.PI / 2), man, { x: -hL, rz: Math.PI / 2 }); dome.scale.y = 0.35; g.add(dome);
  // inlets: oxidiser and fuel stubs out of the back, each with a hex fitting
  const inL = Math.max(0.025, rt * 3), inR = Math.max(0.0032, rt * 0.36), zIn = rh * 0.45, xBack = -hL - rh * 0.3;
  const inlets = {};
  for (const [k, z] of [['ox', zIn], ['fu', -zIn]]) {
    g.add(mesh(new THREE.CylinderGeometry(inR, inR, inL, 14), man, { x: xBack - inL / 2 + rh * 0.12, z, rz: Math.PI / 2 }));
    g.add(mesh(new THREE.CylinderGeometry(inR * 1.7, inR * 1.7, inR * 2.2, 6), MAT.steel(), { x: xBack - inL + rh * 0.12, z, rz: Math.PI / 2 }));
    inlets[k] = new THREE.Vector3(xBack - inL + rh * 0.1 - inR * 1.1, 0, z);
  }
  // the spark igniter: a plug in the side of the head, its HT lead
  const ig = new THREE.Group();
  ig.add(mesh(new THREE.CylinderGeometry(Math.max(0.004, rt * 0.5), Math.max(0.004, rt * 0.5), Math.max(0.006, rt * 0.7), 6), MAT.steel(), { y: 0 }));
  ig.add(mesh(new THREE.CylinderGeometry(Math.max(0.003, rt * 0.33), Math.max(0.0035, rt * 0.38), Math.max(0.014, rt * 1.8), 14), MAT.white(), { y: Math.max(0.01, rt * 1.2) }));
  ig.add(mesh(new THREE.CylinderGeometry(Math.max(0.0035, rt * 0.4), Math.max(0.0035, rt * 0.4), Math.max(0.008, rt), 12), MAT.black(), { y: Math.max(0.022, rt * 2.6) }));
  ig.position.set(-hL * 0.45, 0, 0); ig.rotation.x = Math.PI * 0.25;
  g.add(ig);
  if (regen) {
    // coolant inlet manifold near the exit (the fuel comes in here), outlet at the injector end
    g.add(mesh(new THREE.TorusGeometry(re + wall * 1.4, rt * 0.3, 10, 40), man, { x: xE - rt * 0.8, ry: Math.PI / 2 }));
    g.add(mesh(new THREE.TorusGeometry(ro * 1.04, rt * 0.3, 10, 40), man, { x: rt * 1.6, ry: Math.PI / 2 }));
    g.add(mesh(new THREE.CylinderGeometry(inR, inR, rt * 3, 12), man, { x: xE - rt * 0.8, y: -(re + wall * 1.4) - rt * 1.4 }));
    inlets.fu = new THREE.Vector3(xE - rt * 0.8, -(re + wall * 1.4) - rt * 2.9, 0);
    // weld lines where the jacket closes out
    for (const x of [Lc * 0.3, Lc * 0.75]) g.add(mesh(new THREE.TorusGeometry(ro * 1.002, rt * 0.06, 6, 48), MAT.steel(), { x, ry: Math.PI / 2 }));
  }
  if (ablative) {
    // the phenolic exit lip, the steel case's own flange and bolts, the case thermocouple at the throat plane
    g.add(mesh(new THREE.TorusGeometry(re + rt * 0.16, rt * 0.12, 8, 40), new THREE.MeshStandardMaterial({ color: 0x2a221c, roughness: 0.95 }), { x: xE - rt * 0.05, ry: Math.PI / 2 }));
    g.add(mesh(new THREE.CylinderGeometry(ro * 1.18, ro * 1.18, rt * 0.6, 40), matBody, { x: xT - rt * 1.2, rz: Math.PI / 2 }));
    g.add(boltCircle([xT - rt * 0.9, 0, 0], [1, 0, 0], ro * 1.1, 10, Math.max(0.004, rt * 0.3), { stud: true }));
    g.add(mesh(new THREE.CylinderGeometry(rt * 0.12, rt * 0.12, rt * 1.6, 6), MAT.stainless(), { x: xT, y: ro + rt * 0.5 }));
  }
  if (heatSink) {
    // embedded thermocouples along the wall, each in a compression fitting
    for (const x of [Lc * 0.5, xT]) {
      g.add(mesh(new THREE.CylinderGeometry(rt * 0.12, rt * 0.12, rt * 1.8, 6), MAT.stainless(), { x, y: ro + rt * 0.6 }));
      g.add(mesh(new THREE.CylinderGeometry(rt * 0.3, rt * 0.3, rt * 0.4, 6), MAT.brass(), { x, y: ro + rt * 0.1 }));
    }
    // a couple of machined grooves on the copper
    for (const x of [Lc * 0.2, Lc * 0.85]) g.add(mesh(new THREE.TorusGeometry(ro * 1.0, rt * 0.05, 6, 48), MAT.darkSteel(), { x, ry: Math.PI / 2 }));
  }
  if (name) {
    // a small engraved nameplate on top of the chamber
    const np = mesh(new THREE.PlaneGeometry(Math.min(Lc * 0.6, ro * 1.6), Math.min(Lc * 0.6, ro * 1.6) * 0.32), new THREE.MeshStandardMaterial({ map: label(name, { fg: '#1a1a1a', bg: '#c9ccc8', font: 'bold 64px monospace', border: '#555' }), metalness: 0.6, roughness: 0.4 }), { x: Lc * 0.5, y: ro + 0.0006, rx: -Math.PI / 2 });
    g.add(np);
  }
  return { group: g, exit: xE, throat: xT, length: xE, rOut: ro * 1.08, rFlange: rf, back: xBack - inL, body: matBody, inner: innerMat, inlets };
}

/* People: coveralls, a hi-vis vest, boots, a hard hat with its brim. */
export function person({ vest = 0xf26b1d } = {}) {
  const g = new THREE.Group();
  const skin = new THREE.MeshStandardMaterial({ color: 0x9c7458, roughness: 0.8 });
  const cloth = new THREE.MeshStandardMaterial({ color: 0x2f3a46, roughness: 0.85 });
  const boot = new THREE.MeshStandardMaterial({ color: 0x2a2018, roughness: 0.7 });
  const hv = new THREE.MeshStandardMaterial({ color: vest, roughness: 0.6, emissive: vest, emissiveIntensity: 0.06 });
  const strip = new THREE.MeshStandardMaterial({ color: 0xdfe3e6, metalness: 0.6, roughness: 0.25 });
  for (const sx of [-1, 1]) {
    g.add(mesh(new THREE.CapsuleGeometry(0.065, 0.66, 4, 10), cloth, { x: sx * 0.09, y: 0.46 }));
    g.add(mesh(new THREE.BoxGeometry(0.11, 0.08, 0.24), boot, { x: sx * 0.09, y: 0.04, z: 0.04 }));
    g.add(mesh(new THREE.SphereGeometry(0.06, 10, 8), hv, { x: sx * 0.17, y: 1.33 }));
    g.add(mesh(new THREE.CapsuleGeometry(0.045, 0.44, 4, 10), cloth, { x: sx * 0.2, y: 1.08, rz: sx * 0.07 }));
    g.add(mesh(new THREE.SphereGeometry(0.045, 10, 8), skin, { x: sx * 0.215, y: 0.8 }));
  }
  g.add(mesh(new THREE.CapsuleGeometry(0.075, 0.12, 4, 10), cloth, { y: 0.88 }));
  const torso = mesh(new THREE.CapsuleGeometry(0.15, 0.32, 4, 14), hv, { y: 1.16 }); torso.scale.z = 0.68; g.add(torso);
  for (const yy of [1.04, 1.22]) { const st = mesh(new THREE.TorusGeometry(0.152, 0.011, 4, 24), strip, { y: yy, rx: Math.PI / 2 }); st.scale.y = 0.68; g.add(st); }
  g.add(mesh(new THREE.CylinderGeometry(0.05, 0.055, 0.08, 10), skin, { y: 1.47 }));
  g.add(mesh(new THREE.SphereGeometry(0.105, 16, 12), skin, { y: 1.6 }));
  const hat = mesh(new THREE.SphereGeometry(0.12, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xf1f1ea, roughness: 0.35 }), { y: 1.63 });
  g.add(hat);
  g.add(mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.01, 20), new THREE.MeshStandardMaterial({ color: 0xf1f1ea, roughness: 0.35 }), { y: 1.635, z: 0.02 }));
  return g;
}
