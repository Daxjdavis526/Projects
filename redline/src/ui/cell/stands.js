/* The hardware on each stand, built from its definition: the engine turned
   from its real throat and exit, tanks sized from their real volumes,
   valves where the P&ID has them. Each builder returns
     { group, exit (world Vector3 of the nozzle exit centre), scale (a
       length for framing cameras), size (engine outer radius),
       update(st, dt, time), emit(st, dt, P) — particles, focus points }.
   The engine fires along +x. */
import * as THREE from 'three';
import { mesh, MAT, vessel, bottle, tube, ballValve, solenoid, regulator, transducer, beam, engine } from './parts.js';
import { label } from './textures.js';

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

/* Gas panel on the back wall: a steel plate with regulators and valves. */
function gasPanel(g, x0, items) {
  const plate = mesh(new THREE.BoxGeometry(2.2, 1.5, 0.04), MAT.paintGrey(), { x: x0, y: 1.45, z: -4.17 });
  g.add(plate);
  const lab = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.16), new THREE.MeshStandardMaterial({ map: label('GAS PANEL', { fg: '#ddd', bg: '#2b3238', font: 'bold 60px monospace' }), roughness: 0.6 }));
  lab.position.set(x0, 2.1, -4.145); g.add(lab);
  const out = {};
  items.forEach((it, i) => {
    const o = it.kind === 'reg' ? regulator({ size: 1.4 }) : it.kind === 'sol' ? solenoid({ size: 1.3 }) : ballValve({ size: 1.1, pneumatic: it.pneumatic !== false });
    o.position.set(x0 - 0.85 + i * (1.7 / Math.max(1, items.length - 1)), it.y ?? 1.35, -4.08);
    g.add(o); out[it.id] = o;
  });
  g.add(tube([[x0 - 1.0, 1.35, -4.08], [x0 + 1.0, 1.35, -4.08]], { r: 0.008 }));
  return out;
}

/* A bottle rack against the rear wall. */
function bottles(g, n, x0 = -7.5, z0 = -3.6) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const b = bottle();
    b.position.set(x0 + (i % 3) * 0.3, 0, z0 + Math.floor(i / 3) * 0.3);
    g.add(b); out.push(b);
  }
  g.add(beam([x0 - 0.2, 0.9, z0 - 0.2], [x0 + 0.8, 0.9, z0 - 0.2], { w: 0.04, h: 0.04, mat: MAT.paintYellow() }));
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

/* A thrust stand: base, uprights, a cradle and a load cell behind the
   injector. x0 = injector face, y = axis height. */
function thrustStand(g, x0, y, len, r) {
  const yel = MAT.paintYellow();
  g.add(mesh(new THREE.BoxGeometry(len + 0.7, 0.05, 0.9), MAT.darkSteel(), { x: x0 + len / 2 - 0.15, y: 0.03 }));
  for (const dz of [-0.32, 0.32]) {
    g.add(beam([x0 - 0.25, 0.05, dz], [x0 - 0.25, y + r + 0.12, dz], { w: 0.07, h: 0.07, mat: yel }));
    g.add(beam([x0 + len * 0.55, 0.05, dz], [x0 + len * 0.55, y - r - 0.02, dz], { w: 0.05, h: 0.05, mat: yel }));
  }
  g.add(beam([x0 - 0.25, y + r + 0.12, -0.32], [x0 - 0.25, y + r + 0.12, 0.32], { w: 0.07, h: 0.07, mat: yel }));
  g.add(mesh(new THREE.BoxGeometry(0.05, r * 2 + 0.2, 0.7), yel, { x: x0 - 0.25, y }));
  // load cell between the thrust block and the engine mount
  g.add(mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.09, 18), MAT.stainless(), { x: x0 - 0.17, y, rz: Math.PI / 2 }));
  g.add(mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.3, 6), MAT.black(), { x: x0 - 0.17, y: y + 0.15, z: 0.03 }));
  // flexures under the cradle
  for (const dx of [0.05, len * 0.6]) for (const dz of [-0.2, 0.2]) g.add(mesh(new THREE.BoxGeometry(0.004, y - r - 0.06, 0.06), MAT.stainless(), { x: x0 + dx, y: (y - r) / 2 + 0.02, z: dz }));
  g.add(mesh(new THREE.BoxGeometry(len * 0.75, 0.03, 0.5), MAT.darkSteel(), { x: x0 + len * 0.35, y: y - r - 0.03 }));
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
  g.add(tube([[-4.2, 1.35, -4.08], [-3.4, 1.35, -4.0], [-3.4, 1.35, -0.6], [-1.0, 1.35, -0.6], [-1.0, y, -0.2], [sv.position.x - 0.05, y, 0]], { r: 0.0048 }));
  const pt = transducer(); pt.position.set(-1.0, 1.35, -0.6); g.add(pt);
  // bottle, its hand valve, the panel
  const [b] = bottles(g, 1, -7.4, -3.6);
  const hv = handValve(); hv.position.set(-7.4, b.userData.top + 0.03, -3.6); g.add(hv);
  g.add(tube([[-7.4, b.userData.top + 0.05, -3.6], [-7.4, 1.9, -3.8], [-6.2, 1.9, -4.08], [-5.6, 1.35, -4.08]], { r: 0.0048 }));
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
    const v = vessel({ V: L.Vtank, aspect: 2.4, color: col, text: [tag, id === 'ox' ? (def.oxidiser || 'OX-1') : (def.fuel || 'FU-1')] });
    v.position.set(x, 0.12, -3.0);
    g.add(mesh(new THREE.BoxGeometry(0.7, 0.1, 0.7), MAT.darkSteel(), { x, y: 0.06, z: -3.0 }));
    g.add(v); tanks[id] = v;
    // vent valve on top
    const vv = solenoid({ size: 1.1 }); vv.position.set(x + 0.08, 0.12 + v.userData.top + 0.05, -3.0); g.add(vv); tanks[id + 'V'] = vv;
  });
  // feed lines to the main valves and the injector
  const mov = ballValve({ size: 1.2 }), mfv = ballValve({ size: 1.2 });
  mov.position.set(x0 - 0.65, y + 0.18, -0.35); mfv.position.set(x0 - 0.65, y - 0.18, -0.35);
  g.add(mov, mfv);
  g.add(tube([[-3.3, 0.35, -2.75], [-3.3, 0.35, -1.2], [x0 - 1.2, 0.35, -1.2], [x0 - 1.2, y + 0.18, -0.35], [x0 - 0.72, y + 0.18, -0.35]], { r: 0.0095 }));
  g.add(tube([[x0 - 0.58, y + 0.18, -0.35], [x0 - 0.3, y + 0.18, -0.35], [x0 - 0.1, y + E.rOut * 0.8, -0.05]], { r: 0.0095 }));
  g.add(tube([[-1.9, 0.35, -2.75], [-1.9, 0.25, -1.0], [x0 - 1.0, 0.25, -1.0], [x0 - 1.0, y - 0.18, -0.35], [x0 - 0.72, y - 0.18, -0.35]], { r: 0.0095 }));
  g.add(tube([[x0 - 0.58, y - 0.18, -0.35], [x0 - 0.3, y - 0.18, -0.35], [x0 - 0.1, y - E.rOut * 0.8, -0.05]], { r: 0.0095 }));
  // purge valves and their lines
  const pv1 = solenoid(), pv2 = solenoid();
  pv1.position.set(x0 - 0.4, y + 0.36, -0.2); pv2.position.set(x0 - 0.4, y - 0.36, -0.2); g.add(pv1, pv2);
  // bottle and panel
  const [b] = bottles(g, 1, -7.4, -3.6);
  const hv = handValve(); hv.position.set(-7.4, b.userData.top + 0.03, -3.6); g.add(hv);
  g.add(tube([[-7.4, b.userData.top + 0.05, -3.6], [-7.4, 1.9, -3.8], [-6.2, 1.9, -4.08], [-5.6, 1.35, -4.08]], { r: 0.0063 }));
  const P = gasPanel(g, -4.7, [{ id: 'IV-601' }, { id: 'PR-610', kind: 'reg' }, { id: 'PR-620', kind: 'reg' }, { id: 'PR-630', kind: 'reg' }, { id: 'VV-601', kind: 'sol' }]);
  g.add(tube([[-3.7, 1.35, -4.08], [-3.3, 1.35, -3.6], [-3.3, 0.12 + tanks.ox.userData.top, -3.0]], { r: 0.0063 }));
  g.add(tube([[-3.7, 1.25, -4.08], [-1.9, 1.25, -3.6], [-1.9, 0.12 + tanks.fu.userData.top, -3.0]], { r: 0.0063 }));
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
      for (const t of st.tanks) tanks[t.line]?.userData.level?.(t.fill);
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
  g.add(tube([[-7.2, 1.5, -3.5], [-7.0, 1.9, -3.9], [-6.2, 1.9, -4.08], [-5.6, 1.35, -4.08]], { r: 0.0095 }));
  const P = gasPanel(g, -4.7, [{ id: 'IV-301' }, { id: 'PR-410', kind: 'reg' }, { id: 'PR-420', kind: 'reg' }, { id: 'PR-330', kind: 'reg' }, { id: 'VV-301', kind: 'sol' }]);
  // run tanks
  const tanks = {};
  [['ox', -3.4, 'T-410'], ['fu', -2.0, 'T-420']].forEach(([id, x, tag]) => {
    const L = p.lines.find(l => l.id === id);
    const v = vessel({ V: L.Vtank, aspect: 2.2, color: 0xdfe3e2, text: [tag, 'WATER'] });
    v.position.set(x, 0.12, -3.0);
    g.add(mesh(new THREE.BoxGeometry(0.8, 0.1, 0.8), MAT.darkSteel(), { x, y: 0.06, z: -3.0 }));
    g.add(v); tanks[id] = v;
    const vv = solenoid({ size: 1.1 }); vv.position.set(x + 0.08, 0.12 + v.userData.top + 0.05, -3.0); g.add(vv); tanks[id + 'V'] = vv;
  });
  g.add(tube([[-3.7, 1.35, -4.08], [-3.4, 1.35, -3.6], [-3.4, 0.12 + tanks.ox.userData.top, -3.0]], { r: 0.0063 }));
  g.add(tube([[-3.7, 1.25, -4.08], [-2.0, 1.25, -3.6], [-2.0, 0.12 + tanks.fu.userData.top, -3.0]], { r: 0.0063 }));
  // TPA-1 on its pedestal: ox pump, fuel pump, turbine on one shaft (as on the P&ID)
  const tpa = new THREE.Group();
  const XO = -0.7, XF = -0.15, XT = 0.45;
  g.add(mesh(new THREE.BoxGeometry(1.8, y - 0.16, 0.6), new THREE.MeshStandardMaterial({ map: null, color: 0x7d7f7c, roughness: 0.9 }), { x: -0.1, y: (y - 0.16) / 2, z: -0.4 }));
  const volute = (x, r, col) => {
    const v = new THREE.Group();
    v.add(mesh(new THREE.CylinderGeometry(r, r, 0.08, 32), new THREE.MeshStandardMaterial({ color: col, metalness: 0.6, roughness: 0.4 }), { rz: Math.PI / 2 }));
    v.add(mesh(new THREE.TorusGeometry(r * 0.95, r * 0.22, 12, 32, Math.PI * 1.6), new THREE.MeshStandardMaterial({ color: col, metalness: 0.6, roughness: 0.4 }), { ry: Math.PI / 2 }));
    v.add(mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.14, 14), MAT.stainless(), { x: -0.09, rz: Math.PI / 2 }));       // inlet
    v.add(mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.16, 12), MAT.stainless(), { y: r * 0.9, z: 0.06, rx: 0.3 }));  // discharge
    v.position.set(x, 0, 0);
    return v;
  };
  tpa.add(volute(XO, 0.12, 0x9fa8ad), volute(XF, 0.11, 0xa8a49a));
  // turbine: a bigger disc housing with its inlet manifold
  tpa.add(mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.1, 36), MAT.steel(), { x: XT, rz: Math.PI / 2 }));
  tpa.add(mesh(new THREE.TorusGeometry(0.17, 0.03, 10, 36), MAT.stainless(), { x: XT - 0.03, ry: Math.PI / 2 }));
  // shaft, bearings, coupling guard
  tpa.add(mesh(new THREE.CylinderGeometry(0.03, 0.03, XT - XO + 0.2, 18), MAT.stainless(), { x: (XO + XT) / 2, rz: Math.PI / 2 }));
  for (const x of [XO + 0.17, XT - 0.15]) tpa.add(mesh(new THREE.BoxGeometry(0.1, 0.12, 0.14), MAT.darkSteel(), { x, y: -0.02 }));
  // the speed-pickup wheel: a disc with a white stripe the camera sees turning
  const wheel = new THREE.Group();
  wheel.add(mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.02, 30), MAT.darkSteel(), { rz: Math.PI / 2 }));
  wheel.add(mesh(new THREE.BoxGeometry(0.022, 0.06, 0.012), MAT.white(), { y: 0.035, x: 0.006 }));
  wheel.position.set(XT - 0.24, 0, 0);
  tpa.add(wheel);
  tpa.position.set(0, y, -0.4);
  g.add(tpa);
  // suction lines from the tank bottoms into the pump inlets
  g.add(tube([[-3.4, 0.3, -2.75], [-3.4, 0.3, -0.4], [XO - 0.4, 0.3, -0.4], [XO - 0.4, y, -0.4], [XO - 0.16, y, -0.4]], { r: 0.022 }));
  g.add(tube([[-2.0, 0.22, -2.75], [-2.0, 0.22, -1.2], [XF - 0.35, 0.22, -1.2], [XF - 0.35, y, -0.4], [XF - 0.16, y, -0.4]], { r: 0.022 }));
  // discharge: valves and throttles, then down into the catch tank
  const dv = { ox: ballValve({ size: 1.3 }), fu: ballValve({ size: 1.3 }) };
  const fcv = { ox: ballValve({ size: 1.1 }), fu: ballValve({ size: 1.1 }) };
  const CT = V3(2.6, 0, 2.0);
  [['ox', XO, 1.55], ['fu', XF, 1.4]].forEach(([id, x, yy]) => {
    dv[id].position.set(x + 0.4, yy, 0.6); fcv[id].position.set(x + 1.6, yy, 0.6);
    g.add(dv[id], fcv[id]);
    g.add(tube([[x, y + 0.13, -0.33], [x, yy, -0.2], [x, yy, 0.6], [x + 0.33, yy, 0.6]], { r: 0.016 }));
    g.add(tube([[x + 0.47, yy, 0.6], [x + 1.53, yy, 0.6]], { r: 0.016 }));
    g.add(tube([[x + 1.67, yy, 0.6], [CT.x - 0.2 + (id === 'ox' ? -0.1 : 0.1), yy, CT.z - 0.1], [CT.x - 0.2 + (id === 'ox' ? -0.1 : 0.1), 1.2, CT.z - 0.1]], { r: 0.016 }));
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
  g.add(tube([[-3.7, 1.15, -4.08], [-1.0, 1.15, -3.6], [-1.0, 2.1, -2.4], [XT + 0.03, 2.1, -1.8]], { r: 0.0095 }));
  g.add(tube([[XT + 0.17, 2.1, -1.8], [XT + 0.3, 2.1, -1.8], [XT + 0.3, y + 0.05, -0.62], [XT - 0.03, y, -0.58]], { r: 0.0127 }));
  const stackX = 1.6, stackZ = -2.4;
  g.add(tube([[XT + 0.05, y - 0.05, -0.42], [XT + 0.5, y - 0.05, -0.42], [stackX, y - 0.05, stackZ], [stackX, 4.6, stackZ]], { r: 0.045, mat: MAT.steel() }));
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
      for (const t of st.tanks) tanks[t.line]?.userData.level?.(t.fill);
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

export function buildStand(def) {
  if (def.physics.turbopump) return buildTurbopump(def);
  if (def.physics.model === 'biprop') return buildBiprop(def);
  return buildColdGas(def);
}
