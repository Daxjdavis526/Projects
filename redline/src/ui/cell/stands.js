/* The hardware on each stand, built from its definition: the engine turned
   from its real throat and exit, tanks sized from their real volumes,
   valves where the P&ID has them. Each builder returns
     { group, exit (world Vector3 of the nozzle exit centre), scale (a
       length for framing cameras), size (engine outer radius),
       update(st, dt, time), emit(st, dt, P) — particles, focus points }.
   The engine fires along +x. */
import * as THREE from 'three';
import { mesh, MAT, vessel, weighScale, bottle, gauge, tag, tube, hose, ballValve, solenoid, regulator, transducer, beam, engine, turbopumpAssembly } from './parts.js';
import { label, concrete, hazard } from './textures.js';
import { member, iSection, rhsSection, plate, gusset, bolts, boltCircle, boltGrid } from './structure.js';

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

/* Gas panel on the back wall: a painted panel on standoffs; each regulator
   with its outlet gauge, every component tagged; the header in neat
   stainless runs with clamps; the supply gauge at the inlet. */
function gasPanel(g, x0, items) {
  const pm = new THREE.MeshStandardMaterial({ color: 0x5b646b, metalness: 0.3, roughness: 0.55 });
  const pl = plate({ w: 2.3, h: 1.4, t: 0.012, mat: pm, rc: 0.03 }); pl.position.set(x0, 1.45, -4.16); g.add(pl);
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) g.add(mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.05, 10), MAT.steel(), { x: x0 + sx * 1.05, y: 1.45 + sy * 0.6, z: -4.185, rx: Math.PI / 2 }));
  const lab = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.12), new THREE.MeshStandardMaterial({ map: label('GAS PANEL · N2 4000 PSIG', { w: 1024, h: 112, fg: '#f1f1ec', bg: '#1d2328', font: 'bold 64px monospace' }), roughness: 0.6 }));
  lab.position.set(x0, 2.02, -4.152); g.add(lab);
  const out = {};
  const z = -4.1, yH = 1.35;
  const xs = items.map((it, i) => x0 - 0.85 + i * (1.7 / Math.max(1, items.length - 1)));
  items.forEach((it, i) => {
    const o = it.kind === 'reg' ? regulator({ size: 1.4 }) : it.kind === 'sol' ? solenoid({ size: 1.3 }) : ballValve({ size: 1.1, pneumatic: it.pneumatic !== false });
    o.position.set(xs[i], it.y ?? yH, z);
    g.add(o); out[it.id] = o;
    const t = tag(it.id); t.position.set(xs[i], yH - 0.13, -4.152); g.add(t);
    if (it.kind === 'reg') {
      const gg = gauge({ size: 0.075, frac: 0.25 + 0.1 * i }); gg.position.set(xs[i] + 0.09, yH + 0.2, -4.12); g.add(gg);
      g.add(tube([[xs[i] + 0.03, yH, z], [xs[i] + 0.09, yH + 0.06, z], [xs[i] + 0.09, yH + 0.16, -4.12]], { r: 0.003 }));
    }
  });
  // header and the supply gauge at its inlet
  g.add(tube([[x0 - 1.05, yH, z], [x0 + 1.05, yH, z]], { r: 0.0064 }));
  const sg = gauge({ size: 0.11, frac: 0.6 }); sg.position.set(x0 - 1.0, yH + 0.32, -4.12); g.add(sg);
  g.add(tube([[x0 - 1.0, yH, z], [x0 - 1.0, yH + 0.25, -4.12]], { r: 0.003 }));
  const st = tag('PI-SUPPLY', { w: 0.11 }); st.position.set(x0 - 1.0, yH + 0.22, -4.152); g.add(st);
  // tube clamps on the header
  for (let k = 0; k < items.length + 1; k++) {
    const x = x0 - 0.98 + k * (1.96 / items.length);
    g.add(mesh(new THREE.BoxGeometry(0.02, 0.03, 0.05), MAT.black(), { x, y: yH, z: -4.13 }));
  }
  return out;
}

/* A bottle rack against the rear wall: an angle-steel frame, the
   cylinders chained to it, a manifold pigtail to each. */
function bottles(g, n, x0 = -7.5, z0 = -3.6) {
  const out = [];
  const frame = MAT.paintYellow();
  const cols = Math.min(3, n), rows = Math.ceil(n / 3);
  const w = cols * 0.3, d = rows * 0.3;
  for (let i = 0; i < n; i++) {
    const b = bottle();
    b.position.set(x0 + (i % 3) * 0.3, 0.02, z0 + Math.floor(i / 3) * 0.3);
    b.rotation.y = i * 1.3;
    g.add(b); out.push(b);
  }
  const xa = x0 - 0.17, xb = x0 - 0.17 + w + 0.04, za = z0 - 0.17, zb2 = z0 - 0.17 + d + 0.04;
  for (const [x, zz] of [[xa, za], [xb, za], [xa, zb2], [xb, zb2]]) g.add(member(rhsSection(0.04, 0.04, 0.004), [x, 0, zz], [x, 1.2, zz], frame));
  for (const yy of [0.55, 1.05]) {
    g.add(member(rhsSection(0.035, 0.035, 0.004), [xa, yy, za], [xb, yy, za], frame));
    g.add(member(rhsSection(0.035, 0.035, 0.004), [xa, yy, zb2], [xb, yy, zb2], frame));
    // the chains: dark links across the bottles' faces
    for (const zz of [za + 0.02, zb2 - 0.02]) g.add(tube([[xa, yy - 0.05, zz], [xb, yy - 0.05, zz]], { r: 0.004, mat: MAT.darkSteel() }));
  }
  g.add(mesh(new THREE.BoxGeometry(w + 0.08, 0.02, d + 0.08), MAT.darkSteel(), { x: (xa + xb) / 2, y: 0.01, z: (za + zb2) / 2 }));
  return out;
}

/* A hand valve on the bottle: its handle turns. */
function handValve() {
  const g = new THREE.Group();
  const h = mesh(new THREE.BoxGeometry(0.16, 0.012, 0.025), new THREE.MeshStandardMaterial({ color: 0x9a7a2c, metalness: 0.5, roughness: 0.4 }));
  g.add(h);
  g.userData.set = pos => { h.rotation.y = pos * Math.PI / 2; };
  return g;
}

/* A thrust stand, as small engine stands are built: a concrete plinth with
   cast-in anchors; a welded base of wide-flange beams; a THRUST TAKEOUT — a
   heavy plate on two box columns, gusseted back to the base, that the
   thrust is reacted into; a machined CRADLE that carries the engine,
   hung on four thin stainless FLEXURE blades so it moves freely along the
   axis and not at all across it; the engine's injector flange bolted to a
   mount plate on the cradle, a saddle and strap under the chamber; and
   between the mount plate and the takeout, in line with the thrust, the
   LOAD CELL on two rod ends. x0 = injector face, y = axis height,
   len = engine length, r = its outer radius. */
const paintFrame = () => new THREE.MeshStandardMaterial({ color: 0x2f4b63, metalness: 0.35, roughness: 0.48 });
const paintPrimer = () => new THREE.MeshStandardMaterial({ color: 0x4a4d4f, metalness: 0.4, roughness: 0.62 });
const alu = () => new THREE.MeshStandardMaterial({ color: 0xb8bcbf, metalness: 0.8, roughness: 0.32 });
function thrustStand(g, x0, y, len, r) {
  const yel = MAT.paintYellow(), frame = paintFrame(), primer = paintPrimer(), al = alu(), ss = MAT.stainless();
  const xa = x0 - 0.62, xb = x0 + Math.max(len, 0.12) + 0.28;          // base extent along the axis
  const zb = 0.24;                                                      // base beams at ±zb
  // concrete plinth, chamfered top edge
  const yP = 0.32;
  const plinthM = new THREE.MeshStandardMaterial({ map: concrete({ seed: 41, base: [158, 155, 148], repeat: [1, 1] }), roughness: 0.92 });
  const pl = mesh(new THREE.BoxGeometry(xb - xa + 0.3, yP, 0.86), plinthM, { x: (xa + xb) / 2, y: yP / 2 });
  g.add(pl);
  g.add(mesh(new THREE.PlaneGeometry(xb - xa + 0.34, 0.06), new THREE.MeshStandardMaterial({ map: hazard({ repeat: [10, 1] }), roughness: 0.7 }), { x: (xa + xb) / 2, y: yP - 0.03, z: 0.431, cast: false }));
  // base: two W100 beams along the axis, cross beams at the ends, on base plates with anchor bolts
  const d = 0.1, yB = yP + d;                                           // top of the base steel
  for (const z of [-zb, zb]) g.add(member(iSection(d, 0.1, 0.006, 0.009), [xa, yP + d / 2, z], [xb, yP + d / 2, z], primer));
  for (const x of [xa + 0.05, xb - 0.05]) g.add(member(iSection(d, 0.1, 0.006, 0.009), [x, yP + d / 2, -zb + 0.05], [x, yP + d / 2, zb - 0.05], primer));
  const anchors = [];
  for (const x of [xa + 0.05, (xa + xb) / 2, xb - 0.05]) for (const z of [-zb, zb]) {
    const bp = plate({ w: 0.18, h: 0.18, t: 0.012, mat: primer }); bp.rotation.x = -Math.PI / 2; bp.position.set(x, yP + 0.006, z); g.add(bp);
    for (const dx of [-0.065, 0.065]) for (const dz of [-0.065, 0.065]) anchors.push([x + dx, yP + 0.012, z + dz]);
  }
  g.add(bolts(anchors, [0, 1, 0], 0.016));
  // the thrust takeout: two box columns, a 25 mm plate across them, gussets behind
  const xT = x0 - 0.46, top = y + Math.max(0.16, r + 0.1);
  for (const z of [-zb, zb]) {
    g.add(member(rhsSection(0.08, 0.08, 0.006), [xT - 0.06, yB, z], [xT - 0.06, top, z], frame));
    const gs = gusset({ a: 0.3, b: 0.32, t: 0.012, mat: frame }); gs.rotation.y = Math.PI; gs.position.set(xT - 0.1, yB, z); g.add(gs);
  }
  g.add(member(rhsSection(0.08, 0.08, 0.006), [xT - 0.06, top + 0.04, -zb - 0.04], [xT - 0.06, top + 0.04, zb + 0.04], frame));
  const tp = plate({ w: 2 * zb + 0.12, h: top - yB - 0.06, t: 0.025, mat: yel, rc: 0.012 });
  tp.rotation.y = Math.PI / 2; tp.position.set(xT, (yB + top) / 2 + 0.01, 0); g.add(tp);
  g.add(boltGrid([xT + 0.013, (yB + top) / 2 + 0.01, 0], [1, 0, 0], [0, 0, 1], [0, 1, 0], 2 * zb, top - yB - 0.16, 2, 4, 0.014));
  // flexure pedestals on the base beams, the blades, the cradle
  const yC = y - Math.max(r, 0.03) - 0.06;                              // cradle underside
  const tC = 0.02, flexL = 0.11;
  const cx0 = x0 - 0.3, cx1 = x0 + Math.max(len, 0.12) * 0.95;
  const cw = Math.max(0.26, 2 * (r + 0.09));
  const fx = [cx0 + 0.06, cx1 - 0.06], fz = [-zb, zb];
  for (const x of fx) for (const z of fz) {
    g.add(member(rhsSection(0.06, 0.06, 0.005), [x, yB, z], [x, yC - flexL - 0.03, z], frame));
    // clamp blocks top and bottom, the blade between (thin: it bends, so the cradle can move along x)
    g.add(mesh(new THREE.BoxGeometry(0.03, 0.03, 0.07), ss, { x, y: yC - flexL - 0.015, z }));
    g.add(mesh(new THREE.BoxGeometry(0.03, 0.03, 0.07), ss, { x, y: yC - 0.015, z }));
    g.add(mesh(new THREE.BoxGeometry(0.0025, flexL - 0.02, 0.055), new THREE.MeshStandardMaterial({ color: 0xd2d6d8, metalness: 0.95, roughness: 0.18 }), { x, y: yC - flexL / 2 - 0.015, z }));
    g.add(bolts([[x + 0.016, yC - 0.015, z - 0.02], [x + 0.016, yC - 0.015, z + 0.02], [x + 0.016, yC - flexL - 0.015, z - 0.02], [x + 0.016, yC - flexL - 0.015, z + 0.02]], [1, 0, 0], 0.008, { stud: false }));
  }
  const cr = plate({ w: cx1 - cx0, h: Math.max(cw, 2 * zb + 0.08), t: tC, mat: al, rc: 0.01 });
  cr.rotation.x = -Math.PI / 2; cr.position.set((cx0 + cx1) / 2, yC + tC / 2, 0); g.add(cr);
  // engine mount plate: the injector flange bolts to it
  const mh = (y + Math.max(r, 0.03) + 0.05) - (yC + tC);
  const mw = Math.max(0.18, 2 * r + 0.1);
  // a bore for the injector head: the engine's flange bolts to the plate's front face
  const mp = plate({ w: mw, h: mh, t: 0.016, mat: al, rc: 0.012, holes: [[0, (y - (yC + tC + mh / 2)), Math.max(0.012, r * 1.05)]] });
  mp.rotation.y = Math.PI / 2; mp.position.set(x0 - 0.035, yC + tC + mh / 2, 0); g.add(mp);
  for (const z of [-mw / 2 + 0.012, mw / 2 - 0.012]) {
    const gs = gusset({ a: 0.08, b: Math.min(0.1, mh * 0.6), t: 0.01, mat: al }); gs.rotation.y = Math.PI; gs.position.set(x0 - 0.045, yC + tC, z); g.add(gs);
  }
  g.add(boltGrid([x0 - 0.035, yC + tC + 0.012, 0], [0, 1, 0], [0, 0, 1], [1, 0, 0], mw - 0.05, 0, 3, 1, 0.009, { stud: false }));
  // saddle and strap under the chamber
  const xs = x0 + Math.max(len, 0.06) * 0.32, sh = y - Math.max(r, 0.012) - (yC + tC);
  if (sh > 0.01) {
    g.add(mesh(new THREE.BoxGeometry(0.03, sh, Math.max(0.05, r * 1.6)), al, { x: xs, y: yC + tC + sh / 2 }));
    g.add(mesh(new THREE.TorusGeometry(Math.max(r, 0.012) + 0.003, 0.0035, 6, 24, Math.PI), ss, { x: xs, y, ry: Math.PI / 2 }));
  }
  // the load cell, in line with the cradle just above it (the injector is
  // in the way on the axis): clevis, rod end, stinger, cell, rod end, clevis
  // on a bracket at the cradle's back edge
  const lc = new THREE.Group();
  const yL = yC + tC + 0.045, xm = cx0 + 0.012, span = xm - (xT + 0.0125);
  const bh = yL + 0.03 - (yC + tC);
  const br = plate({ w: 0.09, h: bh, t: 0.012, mat: al, rc: 0.006 }); br.rotation.y = Math.PI / 2; br.position.set(cx0 + 0.006, yC + tC + bh / 2, 0); g.add(br);
  const cl = (x, dir) => {                                              // a clevis: two lugs and a pin
    for (const dz of [-0.016, 0.016]) lc.add(mesh(new THREE.BoxGeometry(0.035, 0.04, 0.006), ss, { x: x + dir * 0.0175, y, z: dz }));
    lc.add(mesh(new THREE.CylinderGeometry(0.0045, 0.0045, 0.045, 10), MAT.steel(), { x: x + dir * 0.024, y, rx: Math.PI / 2 }));
  };
  cl(xT + 0.0125, 1); cl(xm, -1);
  const rod = (xa2, xb2, rr) => lc.add(mesh(new THREE.CylinderGeometry(rr, rr, Math.abs(xb2 - xa2), 12), ss, { x: (xa2 + xb2) / 2, y, rz: Math.PI / 2 }));
  const cellL = 0.07, cellR = 0.032, xc = xT + 0.0125 + span * 0.55;
  rod(xT + 0.04, xc - cellL / 2, 0.006);
  rod(xc + cellL / 2, xm - 0.03, 0.006);
  for (const x of [xT + 0.04, xm - 0.03]) lc.add(mesh(new THREE.SphereGeometry(0.009, 12, 8), ss, { x, y }));
  lc.add(mesh(new THREE.CylinderGeometry(cellR, cellR, cellL, 28), new THREE.MeshStandardMaterial({ color: 0xc9cdcf, metalness: 0.9, roughness: 0.22 }), { x: xc, y, rz: Math.PI / 2 }));
  for (const dx of [-cellL / 2, cellL / 2]) lc.add(mesh(new THREE.TorusGeometry(cellR, 0.0025, 6, 28), ss, { x: xc + dx, y, ry: Math.PI / 2 }));
  lc.add(mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.02, 10), MAT.black(), { x: xc, y: y + cellR + 0.008 }));
  lc.add(mesh(new THREE.PlaneGeometry(0.045, 0.02), new THREE.MeshStandardMaterial({ map: label(['LC-1', '2 kN'], { fg: '#111', bg: '#d9dcd8', font: 'bold 44px monospace' }), roughness: 0.6 }), { x: xc, y: y + 0.005, z: cellR + 0.0005 }));
  lc.position.y = yL - y;
  g.add(lc);
  g.add(tube([[xc, yL + cellR + 0.018, 0], [xc, yL + cellR + 0.05, 0.02], [xT + 0.05, yL + 0.2, zb], [xT - 0.02, top - 0.02, zb + 0.06], [xT - 0.02, yB + 0.02, zb + 0.1]], { r: 0.0032, mat: MAT.black(), bend: 0.05 }));
}

/* Flex hoses from the main valves' outlets (ox above, fuel below, beside
   the takeout) forward past it and in to the engine's inlet fittings. */
function feedHoses(g, E, x0, y, oxOut, fuOut, r) {
  const at = k => E.inlets[k].clone().add(E.group.position);
  for (const [k, o] of [['ox', oxOut], ['fu', fuOut]]) {
    const P = at(k), front = P.x > x0;                                  // a regen engine takes its fuel at the nozzle end
    const pts = front
      ? [o, [x0 - 0.2, o[1], o[2] - 0.02], [x0 + 0.02, P.y - 0.03, o[2] + 0.12], [P.x, P.y - 0.03, P.z - 0.05], [P.x, P.y, P.z]]
      : [o, [x0 - 0.22, o[1], o[2] - 0.03], [P.x - 0.1, (o[1] + P.y) / 2, P.z - 0.12], [P.x - 0.03, P.y, P.z]].concat([[P.x, P.y, P.z]]);
    g.add(hose(pts, { r }));
  }
}

/* The turbopump's skid: channel rails on the floor with cross members,
   two pedestals of box section with a machined top plate under each
   bearing foot, gusseted, bolted down. */
function tpaSkid(g, xa, xb, z, yAxis, feet) {
  const frame = paintFrame(), primer = paintPrimer(), al = alu();
  for (const dz of [-0.22, 0.22]) g.add(member(iSection(0.1, 0.1, 0.006, 0.009), [xa, 0.05, z + dz], [xb, 0.05, z + dz], primer));
  for (const x of [xa + 0.05, xb - 0.05]) g.add(member(iSection(0.1, 0.1, 0.006, 0.009), [x, 0.05, z - 0.17], [x, 0.05, z + 0.17], primer));
  const top = yAxis - 0.125;
  for (const x of feet) {
    for (const dz of [-0.13, 0.13]) g.add(member(rhsSection(0.08, 0.08, 0.006), [x, 0.1, z + dz], [x, top - 0.02, z + dz], frame));
    const tp = plate({ w: 0.2, h: 0.36, t: 0.02, mat: al, rc: 0.01 }); tp.rotation.x = -Math.PI / 2; tp.position.set(x, top - 0.01, z); g.add(tp);
    for (const dz of [-0.13, 0.13]) { const gs = gusset({ a: 0.12, b: 0.2, t: 0.01, mat: frame }); gs.rotation.y = -Math.PI / 2; gs.position.set(x, 0.1, z + dz + Math.sign(dz) * 0.04); g.add(gs); }
    g.add(boltGrid([x, top, z], [0, 1, 0], [1, 0, 0], [0, 0, 1], 0.12, 0.28, 2, 2, 0.01));
  }
  const anchors = [];
  for (const x of [xa + 0.05, xb - 0.05]) for (const dz of [-0.22, 0.22]) anchors.push([x, 0.1, z + dz]);
  g.add(bolts(anchors, [0, 1, 0], 0.014));
}

/* A pipe run: the tubing, and a support under every long, low horizontal
   stretch (a box-section post on a base plate with a U-clamp) — pipe does
   not float. Runs on the back wall (the panel) need none. */
const supMat = () => new THREE.MeshStandardMaterial({ color: 0x6d7276, metalness: 0.4, roughness: 0.55 });
function run(points, opts = {}) {
  const grp = new THREE.Group();
  grp.add(tube(points, opts));
  const r = opts.r ?? 0.0127, m = supMat();
  for (let i = 1; i < points.length; i++) {
    const A = new THREE.Vector3(...points[i - 1]), B = new THREE.Vector3(...points[i]);
    const L = A.distanceTo(B);
    if (L < 0.9 || Math.abs(A.y - B.y) > 0.02 || A.y > 2.4 || A.y < 0.12 || Math.max(A.z, B.z) < -3.7) continue;
    const n = Math.floor(L / 1.1);
    for (let k = 1; k <= n; k++) {
      const P = A.clone().lerp(B, k / (n + 1)), h = P.y - r - 0.006;
      grp.add(mesh(new THREE.BoxGeometry(0.04, h, 0.04), m, { x: P.x, y: h / 2, z: P.z }));
      grp.add(mesh(new THREE.BoxGeometry(0.12, 0.008, 0.12), m, { x: P.x, y: 0.004, z: P.z }));
      const dir = B.clone().sub(A).normalize();
      const clamp = mesh(new THREE.TorusGeometry(r + 0.003, 0.003, 6, 16, Math.PI), MAT.steel(), { x: P.x, y: P.y, z: P.z });
      clamp.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir); grp.add(clamp);
      grp.add(mesh(new THREE.BoxGeometry(Math.abs(dir.x) > 0.5 ? 0.03 : r * 2 + 0.03, 0.01, Math.abs(dir.z) > 0.5 ? 0.03 : r * 2 + 0.03), m, { x: P.x, y: h + 0.001, z: P.z }));
    }
  }
  return grp;
}

function makePeopleSpots(map) { return task => (map[task] || map.default).map(p => p.clone()); }

/* ---- TS-1 (and custom cold-gas stands) -------------------------------- */
export function buildColdGas(def) {
  const g = new THREE.Group();
  const nz = def.physics.elements.find(e => e.type === 'nozzle')?.nozzle || { throatDia: 0.0025, exitDia: 0.0035 };
  const Dt = nz.throatDia, De = nz.exitDia;
  const y = 1.05, exitX = 0.2;
  // the thruster: a small plenum and conical nozzle, scaled up a little around
  // its real throat so it is visible at all (the nozzle itself is to scale)
  const bodyR = Math.max(0.012, De * 3.5), bodyL = Math.max(0.06, De * 14);
  const th = new THREE.Group();
  th.add(mesh(new THREE.CylinderGeometry(bodyR, bodyR, bodyL, 24), MAT.stainless(), { x: -bodyL / 2, rz: Math.PI / 2 }));
  const cone = mesh(new THREE.CylinderGeometry(De / 2 + 0.0015, bodyR * 0.7, bodyL * 0.35, 24), MAT.stainless(), { x: bodyL * 0.175 - 0.0005, rz: Math.PI / 2 });
  cone.rotation.z = -Math.PI / 2; th.add(cone);
  th.add(mesh(new THREE.CylinderGeometry(De / 2, De / 2, 0.002, 18), MAT.black(), { x: bodyL * 0.35 + 0.0005, rz: Math.PI / 2, cast: false }));
  th.position.set(exitX - bodyL * 0.35, y, 0);
  g.add(th);
  // fire valve right behind it, the feed line from the panel
  const sv = solenoid({ size: 1.4 }); sv.position.set(exitX - bodyL * 0.35 - bodyL - 0.06, y, 0); g.add(sv);
  thrustStand(g, exitX - bodyL * 0.35 - bodyL - 0.15, y, bodyL + 0.15, Math.max(bodyR, 0.04));
  const xTO = exitX - bodyL * 0.35 - bodyL - 0.15 - 0.46;                 // the thrust takeout plate
  g.add(run([[-4.2, 1.35, -4.08], [-3.4, 1.35, -4.0], [-3.4, 1.35, -0.6], [-1.0, 1.35, -0.6], [xTO - 0.12, y + 0.25, -0.42]], { r: 0.0048 }));
  // a flex hose round the takeout and onto the cradle, into the fire valve
  g.add(hose([[xTO - 0.12, y + 0.25, -0.42], [xTO + 0.15, y + 0.22, -0.4], [sv.position.x - 0.12, y + 0.04, -0.12], [sv.position.x - 0.05, y, 0]], { r: 0.006 }));
  const pt = transducer(); pt.position.set(-1.0, 1.35, -0.6); g.add(pt);
  // bottle, its hand valve, the panel
  const [b] = bottles(g, 1, -7.4, -3.6);
  const hv = handValve(); hv.position.set(-7.4, b.userData.top + 0.03, -3.6); g.add(hv);
  g.add(run([[-7.4, b.userData.top + 0.05, -3.6], [-7.4, 1.9, -3.8], [-6.2, 1.9, -4.08], [-5.6, 1.35, -4.08]], { r: 0.0048 }));
  const P = gasPanel(g, -4.7, [{ id: 'IV-101', pneumatic: true }, { id: 'PR-101', kind: 'reg' }, { id: 'F-201', kind: 'reg' }, { id: 'VV-101', kind: 'sol' }, { id: 'VV-201', kind: 'sol' }]);
  const valves = { 'HV-100': hv, 'SV-301': sv, ...P };
  const exit = V3(exitX + 0.0005, y, 0);
  return {
    group: g, exit, scale: Math.max(0.25, bodyL * 4), size: bodyR, kind: 'coldgas', engine: null,
    people: makePeopleSpots({ openHV: [V3(-6.9, 0, -3.0), V3(-5.6, 0, 3.4)], closeHV: [V3(-6.9, 0, -3.0), V3(-5.6, 0, 3.4)], walkdown: [V3(-0.6, 0, 1.0), V3(-4.5, 0, -3.2)], inspect: [V3(0.6, 0, 0.9), V3(-5.6, 0, 3.4)], inspection: [V3(0.6, 0, 0.9), V3(-4.5, 0, -3.2)], default: [V3(-6, 0, 3.4), V3(-5.2, 0, 3.6)] }),
    update(st) { for (const [id, o] of Object.entries(valves)) if (o.userData.set && st.valves[id] != null) o.userData.set(st.valves[id]); },
  };
}

/* ---- TS-2: pressure-fed biprop (BPE-1 heat sink, BPE-2 regen) -------- */
export function buildBiprop(def) {
  const g = new THREE.Group();
  const p = def.physics, ch = p.chamber;
  const regen = !!ch.regen || !!p.regen;
  const y = 1.1, exitX = 0.6;
  const E = engine({ Dt: ch.throatDia, De: ch.exitDia, regen, heatSink: !regen, name: (def.article || 'BPE-1').split(' ')[0] });
  E.group.position.set(exitX - E.exit, y, 0);
  g.add(E.group);
  const x0 = exitX - E.exit;
  thrustStand(g, x0, y, E.exit, E.rOut);
  // run tanks along the back wall, on weigh scales
  const lines = p.lines;
  const tanks = {};
  [['ox', -3.3, 'T-710', 0xdfe4e0], ['fu', -1.9, 'T-720', 0xe2ddd2]].forEach(([id, x, tag, col]) => {
    const L = lines.find(l => l.id === id);
    const v = vessel({ V: L.Vtank, aspect: 2.4, color: col, text: [tag, id === 'ox' ? 'LOX' : 'ETHANOL'] });
    v.position.set(x, 0.12, -3.0);
    { const sc = weighScale(Math.max(0.6, v.userData.r * 2.6)); sc.position.set(x, 0, -3.0); g.add(sc); }
    g.add(v); tanks[id] = v;
    // vent valve on top
    const vv = solenoid({ size: 1.1 }); vv.position.copy(v.userData.ventAt).add(v.position); g.add(vv); tanks[id + 'V'] = vv;
  });
  // feed lines to the main valves and the injector
  const mov = ballValve({ size: 1.2 }), mfv = ballValve({ size: 1.2 });
  mov.position.set(x0 - 0.65, y + 0.18, -0.35); mfv.position.set(x0 - 0.65, y - 0.18, -0.35);
  g.add(mov, mfv);
  g.add(run([[-3.3, 0.35, -2.75], [-3.3, 0.35, -1.2], [x0 - 1.2, 0.35, -1.2], [x0 - 1.2, y + 0.18, -0.35], [x0 - 0.72, y + 0.18, -0.35]], { r: 0.0095 }));
  feedHoses(g, E, x0, y, [x0 - 0.58, y + 0.18, -0.35], [x0 - 0.58, y - 0.18, -0.35], 0.0095);
  g.add(run([[-1.9, 0.35, -2.75], [-1.9, 0.25, -1.0], [x0 - 1.0, 0.25, -1.0], [x0 - 1.0, y - 0.18, -0.35], [x0 - 0.72, y - 0.18, -0.35]], { r: 0.0095 }));
  // purge valves and their lines
  const pv1 = solenoid(), pv2 = solenoid();
  pv1.position.set(x0 - 0.4, y + 0.36, -0.2); pv2.position.set(x0 - 0.4, y - 0.36, -0.2); g.add(pv1, pv2);
  // bottle and panel
  const [b] = bottles(g, 1, -7.4, -3.6);
  const hv = handValve(); hv.position.set(-7.4, b.userData.top + 0.03, -3.6); g.add(hv);
  g.add(run([[-7.4, b.userData.top + 0.05, -3.6], [-7.4, 1.9, -3.8], [-6.2, 1.9, -4.08], [-5.6, 1.35, -4.08]], { r: 0.0063 }));
  const P = gasPanel(g, -4.7, [{ id: 'IV-601' }, { id: 'PR-610', kind: 'reg' }, { id: 'PR-620', kind: 'reg' }, { id: 'PR-630', kind: 'reg' }, { id: 'VV-601', kind: 'sol' }]);
  g.add(run([[-3.7, 1.35, -4.08], [-3.3, 1.35, -3.6], [-3.3, 0.12 + tanks.ox.userData.pressAt.y, -3.0]], { r: 0.0063 }));
  g.add(run([[-3.7, 1.25, -4.08], [-1.9, 1.25, -3.6], [-1.9, 0.12 + tanks.fu.userData.pressAt.y, -3.0]], { r: 0.0063 }));
  const valves = { 'HV-600': hv, 'MOV-713': mov, 'MFV-723': mfv, 'PV-631': pv1, 'PV-632': pv2, 'VV-711': tanks.oxV, 'VV-721': tanks.fuV, ...P };
  const exit = V3(exitX, y, 0);
  const hotC = new THREE.Color();
  return {
    group: g, exit, scale: Math.max(0.6, E.length * 4), size: E.rOut, kind: 'biprop', engine: E,
    people: makePeopleSpots({ openHV: [V3(-6.9, 0, -3.0), V3(-5.6, 0, 3.4)], closeHV: [V3(-6.9, 0, -3.0), V3(-5.6, 0, 3.4)],
      fillTanks: [V3(-2.6, 0, -2.1), V3(-3.6, 0, -1.9)], drainTanks: [V3(-2.6, 0, -2.1), V3(-3.6, 0, -1.9)], loadPropellants: [V3(-2.6, 0, -2.1), V3(-3.6, 0, -1.9)],
      walkdown: [V3(0.3, 0, 1.0), V3(-4.5, 0, -3.2)], inspect: [V3(0.9, 0, 0.8), V3(-0.4, 0, 1.0)], inspection: [V3(0.9, 0, 0.8), V3(-0.4, 0, 1.0)], default: [V3(-6, 0, 3.4), V3(-5.2, 0, 3.6)] }),
    update(st, dt, time) {
      for (const [id, o] of Object.entries(valves)) if (o.userData.set && st.valves[id] != null) o.userData.set(st.valves[id]);
      for (const t of st.tanks) { tanks[t.line]?.userData.level?.(t.fill); tanks[t.line]?.userData.frost?.(t.frost || 0); }
      // the wall: a heat-sink chamber glows after a long burn; inside the
      // nozzle, the flame lights the wall
      const w = st.walls, j = st.jet;
      if (w) {
        const k = 0.75 * w.glowTh + 0.25 * w.glowCh;
        hotC.setRGB(...w.colorTh).multiplyScalar(k * 0.9);
        E.body.emissive.copy(hotC);
        E.body.emissiveIntensity = 1;
      }
      if (j?.lit && j.look) { E.inner.emissive.setRGB(...j.look.core).multiplyScalar(1.5 * j.look.lum); }
      else E.inner.emissive.copy(hotC).multiplyScalar(1.3);
      // the thrust pushes the engine back against the load cell; roughness shakes it
      const sh = j?.lit ? (j.chug * 0.004 + j.hf * 0.002 + 0.0002) : 0;
      E.group.position.y = y + (Math.random() - 0.5) * sh;
      E.group.position.z = (Math.random() - 0.5) * sh;
    },
  };
}

/* ---- TS-3: turbopump component stand ---------------------------------- */
export function buildTurbopump(def) {
  const g = new THREE.Group();
  const p = def.physics;
  const y = 0.95;
  // nitrogen bank: six K-bottles
  bottles(g, 6, -7.5, -3.65);
  const hv = handValve(); hv.position.set(-7.2, 1.5, -3.5); g.add(hv);
  g.add(run([[-7.2, 1.5, -3.5], [-7.0, 1.9, -3.9], [-6.2, 1.9, -4.08], [-5.6, 1.35, -4.08]], { r: 0.0095 }));
  const P = gasPanel(g, -4.7, [{ id: 'IV-301' }, { id: 'PR-410', kind: 'reg' }, { id: 'PR-420', kind: 'reg' }, { id: 'PR-330', kind: 'reg' }, { id: 'VV-301', kind: 'sol' }]);
  // run tanks
  const tanks = {};
  [['ox', -3.4, 'T-410'], ['fu', -2.0, 'T-420']].forEach(([id, x, tag]) => {
    const L = p.lines.find(l => l.id === id);
    const v = vessel({ V: L.Vtank, aspect: 2.2, color: 0xdfe3e2, text: [tag, 'WATER'] });
    v.position.set(x, 0.12, -3.0);
    { const sc = weighScale(Math.max(0.6, v.userData.r * 2.6)); sc.position.set(x, 0, -3.0); g.add(sc); }
    g.add(v); tanks[id] = v;
    const vv = solenoid({ size: 1.1 }); vv.position.copy(v.userData.ventAt).add(v.position); g.add(vv); tanks[id + 'V'] = vv;
  });
  g.add(run([[-3.7, 1.35, -4.08], [-3.4, 1.35, -3.6], [-3.4, 0.12 + tanks.ox.userData.pressAt.y, -3.0]], { r: 0.0063 }));
  g.add(run([[-3.7, 1.25, -4.08], [-2.0, 1.25, -3.6], [-2.0, 0.12 + tanks.fu.userData.pressAt.y, -3.0]], { r: 0.0063 }));
  // TPA-1 on its skid: ox pump, fuel pump, turbine on one shaft (as on the P&ID)
  const XO = -0.7, XF = -0.15, XT = 0.45;
  tpaSkid(g, XO - 0.3, XT + 0.35, -0.4, y, [XO + 0.17, (XF + XT) / 2 + 0.02]);
  const { group: tpa, wheel } = turbopumpAssembly({ XO, XF, XT });
  tpa.position.set(0, y, -0.4);
  g.add(tpa);
  // suction lines from the tank bottoms into the pump inlets
  g.add(run([[-3.4, 0.3, -2.75], [-3.4, 0.3, -0.4], [XO - 0.4, 0.3, -0.4], [XO - 0.4, y, -0.4], [XO - 0.16, y, -0.4]], { r: 0.022 }));
  g.add(run([[-2.0, 0.22, -2.75], [-2.0, 0.22, -1.2], [XF - 0.35, 0.22, -1.2], [XF - 0.35, y, -0.4], [XF - 0.16, y, -0.4]], { r: 0.022 }));
  // discharge: valves and throttles, then down into the catch tank
  const dv = { ox: ballValve({ size: 1.3 }), fu: ballValve({ size: 1.3 }) };
  const fcv = { ox: ballValve({ size: 1.1 }), fu: ballValve({ size: 1.1 }) };
  const CT = V3(2.6, 0, 2.0);
  [['ox', XO, 1.55], ['fu', XF, 1.4]].forEach(([id, x, yy]) => {
    dv[id].position.set(x + 0.4, yy, 0.6); fcv[id].position.set(x + 1.6, yy, 0.6);
    g.add(dv[id], fcv[id]);
    g.add(run([[x, y + 0.13, -0.33], [x, yy, -0.2], [x, yy, 0.6], [x + 0.33, yy, 0.6]], { r: 0.016 }));
    g.add(run([[x + 0.47, yy, 0.6], [x + 1.53, yy, 0.6]], { r: 0.016 }));
    g.add(run([[x + 1.67, yy, 0.6], [CT.x - 0.2 + (id === 'ox' ? -0.1 : 0.1), yy, CT.z - 0.1], [CT.x - 0.2 + (id === 'ox' ? -0.1 : 0.1), 1.2, CT.z - 0.1]], { r: 0.016 }));
  });
  // catch tank
  const ct = new THREE.Group();
  ct.add(mesh(new THREE.CylinderGeometry(0.65, 0.65, 1.0, 36, 1, true), new THREE.MeshStandardMaterial({ color: 0x5e6a70, metalness: 0.5, roughness: 0.6, side: THREE.DoubleSide }), { y: 0.5 }));
  const water = mesh(new THREE.CircleGeometry(0.64, 36), new THREE.MeshStandardMaterial({ color: 0x2c5a68, metalness: 0.2, roughness: 0.15 }), { rx: -Math.PI / 2, y: 0.7, cast: false });
  ct.add(water);
  ct.position.copy(CT); g.add(ct);
  // turbine drive line and exhaust stack
  const tsv = ballValve({ size: 1.3 }); tsv.position.set(XT + 0.1, 2.1, -1.8); g.add(tsv);
  const vv338 = solenoid(); vv338.position.set(XT - 0.5, 2.1, -2.4); g.add(vv338);
  g.add(run([[-3.7, 1.15, -4.08], [-1.0, 1.15, -3.6], [-1.0, 2.1, -2.4], [XT + 0.03, 2.1, -1.8]], { r: 0.0095 }));
  g.add(run([[XT + 0.17, 2.1, -1.8], [XT + 0.3, 2.1, -1.8], [XT + 0.3, y + 0.05, -0.62], [XT - 0.03, y, -0.58]], { r: 0.0127 }));
  const stackX = 1.6, stackZ = -2.4;
  g.add(run([[XT + 0.05, y - 0.05, -0.42], [XT + 0.5, y - 0.05, -0.42], [stackX, y - 0.05, stackZ], [stackX, 4.6, stackZ]], { r: 0.045, mat: MAT.steel() }));
  const stackTop = V3(stackX, 4.65, stackZ);
  const valves = { 'HV-300': hv, 'DV-414': dv.ox, 'DV-424': dv.fu, 'FCV-418': fcv.ox, 'FCV-428': fcv.fu, 'TSV-332': tsv, 'VV-338': vv338, 'VV-413': tanks.oxV, 'VV-423': tanks.fuV, ...P };
  let ang = 0;
  return {
    group: g, exit: V3(XT, y, -0.4), scale: 2.2, size: 0.2, kind: 'turbopump', engine: null, tpa, stackTop,
    catchTop: V3(CT.x, 1.0, CT.z),
    people: makePeopleSpots({ openHV: [V3(-6.8, 0, -2.9), V3(-5.6, 0, 3.4)], closeHV: [V3(-6.8, 0, -2.9), V3(-5.6, 0, 3.4)],
      fillTanks: [V3(-2.7, 0, -2.1), V3(-3.8, 0, -1.9)], drainTanks: [V3(-2.7, 0, -2.1), V3(-3.8, 0, -1.9)],
      turnRotor: [V3(-0.2, 0, 0.4), V3(0.6, 0, 0.6)], walkdown: [V3(0.2, 0, 0.6), V3(-4.5, 0, -3.2)],
      inspect: [V3(-0.2, 0, 0.4), V3(0.6, 0, 0.6)], inspection: [V3(-0.2, 0, 0.4), V3(0.6, 0, 0.6)], default: [V3(-6, 0, 3.4), V3(-5.2, 0, 3.6)] }),
    update(st, dt) {
      for (const [id, o] of Object.entries(valves)) if (o.userData.set && st.valves[id] != null) o.userData.set(st.valves[id]);
      for (const t of st.tanks) { tanks[t.line]?.userData.level?.(t.fill); tanks[t.line]?.userData.frost?.(t.frost || 0); }
      const tp = st.tp;
      if (tp) {
        // the camera samples the wheel 60 times a second: above 30 rev/s it
        // aliases, and the stripe crawls or stands still — as it would on video
        ang = (ang + tp.rpm / 60 * Math.PI * 2 * dt) % (Math.PI * 2);
        wheel.rotation.x = ang;
        const v = Math.min(0.004, tp.vib * 0.0006);
        tpa.position.set((Math.random() - 0.5) * v, y + (Math.random() - 0.5) * v, -0.4 + (Math.random() - 0.5) * v);
      }
    },
  };
}

/* ---- TS-3G: BPE-3, a gas-generator cycle engine on TPA-1 --------------- */
export function buildGG(def) {
  const g = new THREE.Group();
  const p = def.physics, ch = p.chamber;
  const y = 1.1, exitX = 1.2;
  // the engine on its thrust stand, firing down the cell
  const E = engine({ Dt: ch.throatDia, De: ch.exitDia, ablative: true, heatSink: false, name: 'BPE-3' });
  E.group.position.set(exitX - E.exit, y, 0);
  g.add(E.group);
  const x0 = exitX - E.exit;
  thrustStand(g, x0, y, E.exit, E.rOut);
  // the bank and the gas panel
  bottles(g, 6, -7.5, -3.65);
  const hv = handValve(); hv.position.set(-7.2, 1.5, -3.5); g.add(hv);
  g.add(run([[-7.2, 1.5, -3.5], [-7.0, 1.9, -3.9], [-6.2, 1.9, -4.08], [-5.6, 1.35, -4.08]], { r: 0.0095 }));
  const P = gasPanel(g, -4.7, [{ id: 'IV-301' }, { id: 'PR-410', kind: 'reg' }, { id: 'PR-420', kind: 'reg' }, { id: 'PR-330', kind: 'reg' }, { id: 'PR-630', kind: 'reg' }]);
  // run tanks on their scales
  const tanks = {};
  [['ox', -3.4, 'T-410', 0xdfe4e0, 'LOX'], ['fu', -2.0, 'T-420', 0xe2ddd2, 'ETHANOL']].forEach(([id, x, tag, col, fl]) => {
    const L = p.lines.find(l => l.id === id);
    const v = vessel({ V: L.Vtank, aspect: 2.2, color: col, text: [tag, fl] });
    v.position.set(x, 0.12, -3.0);
    { const sc = weighScale(Math.max(0.6, v.userData.r * 2.6)); sc.position.set(x, 0, -3.0); g.add(sc); }
    g.add(v); tanks[id] = v;
    const vv = solenoid({ size: 1.1 }); vv.position.copy(v.userData.ventAt).add(v.position); g.add(vv); tanks[id + 'V'] = vv;
  });
  g.add(run([[-3.7, 1.35, -4.08], [-3.4, 1.35, -3.6], [-3.4, 0.12 + tanks.ox.userData.pressAt.y, -3.0]], { r: 0.0063 }));
  g.add(run([[-3.7, 1.25, -4.08], [-2.0, 1.25, -3.6], [-2.0, 0.12 + tanks.fu.userData.pressAt.y, -3.0]], { r: 0.0063 }));
  // TPA-1 on its skid behind the engine: ox pump, fuel pump, turbine
  const yT = 0.95, zT = -1.3, XO = -1.9, XF = -1.35, XT = -0.75;
  tpaSkid(g, XO - 0.3, XT + 0.35, zT, yT, [XO + 0.17, (XF + XT) / 2 + 0.02]);
  const { group: tpa, wheel } = turbopumpAssembly({ XO, XF, XT });
  // the gas generator: a small can on the turbine's inlet manifold; its
  // steel goes dull red when it has been burning a while
  const ggMat = new THREE.MeshStandardMaterial({ color: 0x8c9296, metalness: 0.75, roughness: 0.4, emissive: 0x000000 });
  const ggCan = new THREE.Group();
  ggCan.add(mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.2, 24), ggMat, {}));
  ggCan.add(mesh(new THREE.SphereGeometry(0.055, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), ggMat, { y: 0.1 }));
  ggCan.add(mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.12, 14), ggMat, { y: -0.14 }));
  ggCan.add(mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.06, 8), MAT.white(), { y: 0.03, z: 0.06, rx: Math.PI / 2 }));   // its igniter
  ggCan.position.set(XT + 0.02, 0.3, 0);
  tpa.add(ggCan);
  tpa.position.set(0, yT, zT);
  g.add(tpa);
  // suction lines from the tank bottoms
  g.add(run([[-3.4, 0.3, -2.75], [-3.4, 0.3, zT], [XO - 0.4, 0.3, zT], [XO - 0.4, yT, zT], [XO - 0.16, yT, zT]], { r: 0.022 }));
  g.add(run([[-2.0, 0.22, -2.75], [-2.0, 0.22, -2.0], [XF - 0.35, 0.22, -2.0], [XF - 0.35, yT, zT], [XF - 0.16, yT, zT]], { r: 0.022 }));
  // the main lines: pump discharges → main valves → the injector
  const mov = ballValve({ size: 1.2 }), mfv = ballValve({ size: 1.2 });
  mov.position.set(x0 - 0.55, y + 0.2, -0.32); mfv.position.set(x0 - 0.55, y - 0.2, -0.32);
  g.add(mov, mfv);
  g.add(run([[XO, yT + 0.13, zT + 0.07], [XO, y + 0.2, zT + 0.3], [XO, y + 0.2, -0.32], [x0 - 0.62, y + 0.2, -0.32]], { r: 0.0127 }));
  feedHoses(g, E, x0, y, [x0 - 0.48, y + 0.2, -0.32], [x0 - 0.48, y - 0.2, -0.32], 0.0127);
  g.add(run([[XF, yT + 0.12, zT + 0.07], [XF, y - 0.2, zT + 0.3], [XF, y - 0.2, -0.32], [x0 - 0.62, y - 0.2, -0.32]], { r: 0.0127 }));
  // the gas generator's taps: thin lines from the discharges to the can
  const gov = ballValve({ size: 0.8 }), gfv = ballValve({ size: 0.8 });
  const ggX = XT + 0.02, ggY = yT + 0.3;
  gov.position.set(ggX - 0.25, ggY - 0.1, zT + 0.18); gfv.position.set(ggX - 0.25, ggY - 0.22, zT + 0.18);
  g.add(gov, gfv);
  g.add(run([[XO, y + 0.2, zT + 0.3], [ggX - 0.45, ggY - 0.1, zT + 0.18], [ggX - 0.3, ggY - 0.1, zT + 0.18]], { r: 0.004 }));
  g.add(run([[ggX - 0.2, ggY - 0.1, zT + 0.18], [ggX - 0.04, ggY - 0.05, zT + 0.04]], { r: 0.004 }));
  g.add(run([[XF, y - 0.2, zT + 0.3], [ggX - 0.45, ggY - 0.22, zT + 0.18], [ggX - 0.3, ggY - 0.22, zT + 0.18]], { r: 0.004 }));
  g.add(run([[ggX - 0.2, ggY - 0.22, zT + 0.18], [ggX - 0.04, ggY - 0.1, zT + 0.04]], { r: 0.004 }));
  // purge valves at the engine and at the gas generator
  const pv1 = solenoid(), pv2 = solenoid(), pv5 = solenoid();
  pv1.position.set(x0 - 0.35, y + 0.38, -0.2); pv2.position.set(x0 - 0.35, y - 0.38, -0.2); pv5.position.set(ggX + 0.12, ggY + 0.22, zT);
  g.add(pv1, pv2, pv5);
  // start gas: from the panel through TSV-332 into the top of the gas generator
  const tsv = ballValve({ size: 1.3 }); tsv.position.set(ggX - 0.1, 2.1, -1.9); g.add(tsv);
  const vv338 = solenoid(); vv338.position.set(ggX - 0.7, 2.1, -2.4); g.add(vv338);
  g.add(run([[-3.7, 1.15, -4.08], [-1.6, 1.15, -3.6], [-1.6, 2.1, -2.4], [ggX - 0.17, 2.1, -1.9]], { r: 0.0095 }));
  g.add(run([[ggX - 0.03, 2.1, -1.9], [ggX, 2.1, -1.9], [ggX, ggY + 0.2, zT], [ggX, ggY + 0.15, zT]], { r: 0.0127 }));
  // the turbine exhaust duct, up the back wall to the berm side of the roof
  const stackX = 0.35, stackZ = -2.6;
  g.add(run([[XT + 0.05, yT - 0.05, zT - 0.02], [XT + 0.5, yT - 0.05, zT - 0.02], [stackX, yT - 0.05, stackZ], [stackX, 3.4, stackZ]], { r: 0.05, mat: MAT.steel() }));
  const stackTop = V3(stackX, 3.45, stackZ);
  const valves = { 'HV-300': hv, 'MOV-414': mov, 'MFV-424': mfv, 'GOV-416': gov, 'GFV-426': gfv, 'TSV-332': tsv, 'VV-338': vv338,
    'PV-631': pv1, 'PV-632': pv2, 'PV-635': pv5, 'VV-413': tanks.oxV, 'VV-423': tanks.fuV, ...P };
  let ang = 0;
  const hotC = new THREE.Color();
  return {
    group: g, exit: V3(exitX, y, 0), scale: Math.max(0.6, E.length * 4), size: E.rOut, kind: 'gg', engine: E, tpa, stackTop,
    people: makePeopleSpots({ openHV: [V3(-6.8, 0, -2.9), V3(-5.6, 0, 3.4)], closeHV: [V3(-6.8, 0, -2.9), V3(-5.6, 0, 3.4)],
      fillTanks: [V3(-2.7, 0, -2.1), V3(-3.8, 0, -1.9)], drainTanks: [V3(-2.7, 0, -2.1), V3(-3.8, 0, -1.9)], loadPropellants: [V3(-2.7, 0, -2.1), V3(-3.8, 0, -1.9)],
      turnRotor: [V3(-1.3, 0, -0.6), V3(-0.4, 0, -0.5)], walkdown: [V3(0.4, 0, 1.0), V3(-4.5, 0, -3.2)],
      inspect: [V3(1.4, 0, 0.8), V3(-0.2, 0, 1.0)], inspection: [V3(1.4, 0, 0.8), V3(-1.2, 0, -0.6)], default: [V3(-6, 0, 3.4), V3(-5.2, 0, 3.6)] }),
    update(st, dt) {
      for (const [id, o] of Object.entries(valves)) if (o.userData.set && st.valves[id] != null) o.userData.set(st.valves[id]);
      for (const t of st.tanks) { tanks[t.line]?.userData.level?.(t.fill); tanks[t.line]?.userData.frost?.(t.frost || 0); }
      const tp = st.tp;
      if (tp) {
        ang = (ang + tp.rpm / 60 * Math.PI * 2 * dt) % (Math.PI * 2);
        wheel.rotation.x = ang;
        const v = Math.min(0.004, tp.vib * 0.0006);
        tpa.position.set((Math.random() - 0.5) * v, yT + (Math.random() - 0.5) * v, zT + (Math.random() - 0.5) * v);
      }
      if (st.gg) { hotC.setRGB(1.0, 0.32, 0.08).multiplyScalar(0.9 * st.gg.glow); ggMat.emissive.copy(hotC); }
      // inside the nozzle, the flame lights the charred liner; an ablative's
      // case stays dark on a camera
      const j = st.jet;
      if (j?.lit && j.look) E.inner.emissive.setRGB(...j.look.core).multiplyScalar(1.5 * j.look.lum);
      else E.inner.emissive.setRGB(0, 0, 0);
      const sh = j?.lit ? (j.chug * 0.004 + j.hf * 0.002 + 0.0002) : 0;
      E.group.position.y = y + (Math.random() - 0.5) * sh;
      E.group.position.z = (Math.random() - 0.5) * sh;
    },
  };
}

export function buildStand(def) {
  if (def.physics.gg) return buildGG(def);
  if (def.physics.turbopump) return buildTurbopump(def);
  if (def.physics.model === 'biprop') return buildBiprop(def);
  return buildColdGas(def);
}
