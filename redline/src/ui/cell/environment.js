/* The test site around every stand: a concrete bay with two blast walls
   and a half roof, open on the downrange side; a vent stack; the warning
   beacon; floodlights; the bunker; a berm downrange; desert all round.
   The sky and the sun follow the session's clock (a session starts at
   08:30 on a clear morning). */
import * as THREE from 'three';
import { concrete, ground, hazard, label } from './textures.js';
import { mesh, MAT, beam, person } from './parts.js';

const skyVert = /* glsl */`
varying vec3 vDir;
void main() { vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_Position.z = gl_Position.w; }`;
const skyFrag = /* glsl */`
varying vec3 vDir;
uniform vec3 uSun, uZenith, uHorizon, uGlow;
void main() {
  float h = max(0.0, vDir.y);
  vec3 c = mix(uHorizon, uZenith, pow(h, 0.45));
  float s = max(0.0, dot(normalize(vDir), uSun));
  c += uGlow * (pow(s, 8.0) * 0.35 + pow(s, 600.0) * 6.0);
  if (vDir.y < 0.0) c = mix(uHorizon * 0.85, vec3(0.42, 0.37, 0.3), min(1.0, -vDir.y * 6.0));
  gl_FragColor = vec4(c, 1.0);
}`;

export function sunAt(clock) {
  const h = (clock / 3600) % 24;
  const day = (h - 6.4) / (19.6 - 6.4);                    // 0 at sunrise, 1 at sunset
  const el = Math.sin(Math.PI * Math.max(-0.08, Math.min(1.08, day))) * 68 * Math.PI / 180;
  const az = Math.PI * (day - 0.5) * 1.1;                   // from the east (+z) round the south (−x) to the west (−z)
  const dir = new THREE.Vector3(-Math.sin(az) * Math.cos(el) - 0.25, Math.sin(el), Math.cos(az) * Math.cos(el) * 0.9).normalize();
  const light = Math.max(0, Math.min(1, Math.sin(el) * 3.2));
  return { dir, el, light };
}

export class Environment {
  constructor() {
    const g = this.group = new THREE.Group();
    // sky
    this.skyU = { uSun: { value: new THREE.Vector3(0, 1, 0) }, uZenith: { value: new THREE.Color() }, uHorizon: { value: new THREE.Color() }, uGlow: { value: new THREE.Color() } };
    const sky = new THREE.Mesh(new THREE.SphereGeometry(900, 32, 16), new THREE.ShaderMaterial({ uniforms: this.skyU, vertexShader: skyVert, fragmentShader: skyFrag, side: THREE.BackSide, depthWrite: false }));
    sky.renderOrder = -1; sky.frustumCulled = false;
    g.add(sky);
    // ground and pad
    const sand = new THREE.MeshStandardMaterial({ map: ground({ repeat: [120, 120] }), roughness: 0.95, metalness: 0 });
    g.add(mesh(new THREE.PlaneGeometry(1600, 1600), sand, { rx: -Math.PI / 2, y: -0.01, cast: false }));
    const padMat = new THREE.MeshStandardMaterial({ map: concrete({ seed: 3, joints: 4, repeat: [3, 2] }), roughness: 0.9 });
    g.add(mesh(new THREE.BoxGeometry(26, 0.12, 12), padMat, { x: 3, y: -0.05, cast: false }));
    // scorched apron downrange of the nozzle
    const scorch = document.createElement('canvas'); scorch.width = scorch.height = 256;
    const sc = scorch.getContext('2d'); const gr = sc.createRadialGradient(128, 128, 10, 128, 128, 128);
    gr.addColorStop(0, 'rgba(25,22,20,0.55)'); gr.addColorStop(1, 'rgba(25,22,20,0)'); sc.fillStyle = gr; sc.fillRect(0, 0, 256, 256);
    const scT = new THREE.CanvasTexture(scorch);
    g.add(mesh(new THREE.PlaneGeometry(9, 4), new THREE.MeshBasicMaterial({ map: scT, transparent: true, depthWrite: false }), { rx: -Math.PI / 2, x: 6, y: 0.013, cast: false }));
    // walls
    const wallMat = new THREE.MeshStandardMaterial({ map: concrete({ seed: 11, repeat: [3, 1] }), roughness: 0.92 });
    g.add(mesh(new THREE.BoxGeometry(12.4, 3.6, 0.4), wallMat, { x: -2, y: 1.8, z: -4.4 }));
    g.add(mesh(new THREE.BoxGeometry(0.4, 3.6, 8.8), wallMat, { x: -8.2, y: 1.8, z: -0.2 }));
    // half roof over the panel end, on a column
    g.add(mesh(new THREE.BoxGeometry(5.6, 0.25, 8.8), wallMat, { x: -5.6, y: 3.72, z: -0.2 }));
    g.add(mesh(new THREE.BoxGeometry(0.35, 3.6, 0.35), wallMat, { x: -3.0, y: 1.8, z: 4.0 }));
    // blast-wall stencil
    const st = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.55), new THREE.MeshStandardMaterial({ map: label(['TEST STAND', 'TS-1  ·  TS-2  ·  TS-3'], { fg: '#2a2a28', font: 'bold 44px monospace', h: 128 }), transparent: true, roughness: 0.9 }));
    st.position.set(-1.2, 2.7, -4.19); g.add(st);
    this.standSign = st;
    // hazard edge along the bay
    g.add(mesh(new THREE.PlaneGeometry(14, 0.18), new THREE.MeshStandardMaterial({ map: hazard({ repeat: [28, 1] }), roughness: 0.7 }), { rx: -Math.PI / 2, x: -1, y: 0.012, z: 4.3, cast: false }));
    // the cell gate (the "door"): a chain-link panel that slides
    const gate = this.gate = new THREE.Group();
    const frameM = MAT.paintGrey();
    gate.add(beam([0, 0, 0], [0, 2.1, 0], { w: 0.05, h: 0.05, mat: frameM }), beam([2.4, 0, 0], [2.4, 2.1, 0], { w: 0.05, h: 0.05, mat: frameM }),
      beam([0, 2.1, 0], [2.4, 2.1, 0], { w: 0.05, h: 0.05, mat: frameM }), beam([0, 0.05, 0], [2.4, 0.05, 0], { w: 0.05, h: 0.05, mat: frameM }));
    const mesh2 = document.createElement('canvas'); mesh2.width = mesh2.height = 64;
    const mc = mesh2.getContext('2d'); mc.strokeStyle = 'rgba(160,165,170,0.9)'; mc.lineWidth = 2;
    for (let k = -64; k < 128; k += 16) { mc.beginPath(); mc.moveTo(k, 0); mc.lineTo(k + 64, 64); mc.moveTo(k + 64, 0); mc.lineTo(k, 64); mc.stroke(); }
    const mt = new THREE.CanvasTexture(mesh2); mt.wrapS = mt.wrapT = THREE.RepeatWrapping; mt.repeat.set(12, 10);
    gate.add(mesh(new THREE.PlaneGeometry(2.4, 2.05), new THREE.MeshStandardMaterial({ map: mt, transparent: true, alphaTest: 0.3, side: THREE.DoubleSide, metalness: 0.6, roughness: 0.5 }), { x: 1.2, y: 1.07, cast: false }));
    gate.position.set(-7.9, 0, 4.25);
    g.add(gate);
    this.gateX = { shut: -7.9, open: -10.3 };
    g.add(mesh(new THREE.BoxGeometry(0.12, 2.3, 0.12), frameM, { x: -8.0, y: 1.15, z: 4.25 }));
    // vent stack
    g.add(mesh(new THREE.CylinderGeometry(0.08, 0.08, 6.6, 16), MAT.steel(), { x: -7.6, y: 3.3, z: -3.9 }));
    g.add(mesh(new THREE.CylinderGeometry(0.12, 0.08, 0.3, 16), MAT.steel(), { x: -7.6, y: 6.6, z: -3.9 }));
    this.ventTop = new THREE.Vector3(-7.6, 6.75, -3.9);
    // beacon on the roof corner
    const pole = mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.8, 10), MAT.paintGrey(), { x: -3.2, y: 4.2, z: 3.7 });
    this.beaconLens = new THREE.MeshStandardMaterial({ color: 0x444444, emissive: 0x000000, transparent: true, opacity: 0.9, roughness: 0.2 });
    const lens = mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.22, 20), this.beaconLens, { x: -3.2, y: 4.7, z: 3.7 });
    this.beaconLight = new THREE.SpotLight(0xff0000, 0, 30, 0.5, 0.6, 2);
    this.beaconLight.position.set(-3.2, 4.7, 3.7);
    this.beaconTarget = new THREE.Object3D(); this.beaconTarget.position.set(-3.2, 4.0, 6);
    this.beaconLight.target = this.beaconTarget;
    this.beaconGlow = new THREE.PointLight(0xff0000, 0, 8, 2); this.beaconGlow.position.set(-3.2, 4.7, 3.7);
    g.add(pole, lens, this.beaconLight, this.beaconTarget, this.beaconGlow);
    // floodlights
    this.floods = [];
    for (const [x, z, tx, tz] of [[-10, 8, -1, 0], [8, -8, 0, 0]]) {
      g.add(mesh(new THREE.CylinderGeometry(0.08, 0.1, 8, 10), MAT.paintGrey(), { x, y: 4, z }));
      g.add(mesh(new THREE.BoxGeometry(0.5, 0.3, 0.3), MAT.darkSteel(), { x, y: 8.1, z }));
      const sp = new THREE.SpotLight(0xfff1d6, 0, 60, 0.6, 0.5, 1.6);
      sp.position.set(x, 8, z); sp.target.position.set(tx, 0.8, tz);
      g.add(sp, sp.target);
      this.floods.push(sp);
    }
    // the bunker, downrange berm, a few bushes
    const bunkerM = new THREE.MeshStandardMaterial({ map: concrete({ seed: 23, base: [140, 136, 128], repeat: [2, 1] }), roughness: 0.95 });
    g.add(mesh(new THREE.BoxGeometry(9, 3, 5), bunkerM, { x: -26, y: 1.5, z: 42 }));
    g.add(mesh(new THREE.BoxGeometry(5, 0.35, 0.1), new THREE.MeshStandardMaterial({ color: 0x0b1418, metalness: 0.6, roughness: 0.15 }), { x: -26, y: 2.1, z: 39.45 }));
    g.add(mesh(new THREE.BoxGeometry(10, 1.2, 6), bunkerM, { x: -26, y: 3.4, z: 42, rx: 0 }));
    const berm = new THREE.Mesh(new THREE.CylinderGeometry(4, 9, 3.2, 4, 1), new THREE.MeshStandardMaterial({ map: ground({ seed: 5, repeat: [6, 3] }), roughness: 1 }));
    berm.position.set(19, 1.5, 0); berm.rotation.y = Math.PI / 4; berm.scale.set(0.8, 1, 2.2); berm.receiveShadow = true;
    g.add(berm);
    const bushM = new THREE.MeshStandardMaterial({ color: 0x5f6b3c, roughness: 1, flatShading: true });
    let seed = 9; const r = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 70; i++) {
      const a = r() * Math.PI * 2, d = 18 + r() * 140;
      const b = mesh(new THREE.IcosahedronGeometry(0.3 + r() * 0.5, 0), bushM, { x: Math.cos(a) * d, y: 0.2, z: Math.sin(a) * d });
      b.scale.y = 0.6; g.add(b);
    }
    // distant hills
    const hillM = new THREE.MeshStandardMaterial({ color: 0x8d7c66, roughness: 1, flatShading: true });
    for (let i = 0; i < 18; i++) {
      const a = i / 18 * Math.PI * 2 + 0.2, d = 520 + (i % 3) * 60;
      const hh = 30 + ((i * 37) % 50);
      const hill = mesh(new THREE.ConeGeometry(90 + (i * 13) % 60, hh, 6, 1), hillM, { x: Math.cos(a) * d, y: hh / 2 - 2, z: Math.sin(a) * d, cast: false });
      g.add(hill);
    }
    // the sun, its sky light
    this.sun = new THREE.DirectionalLight(0xffffff, 2);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    const sc2 = this.sun.shadow.camera; sc2.left = -14; sc2.right = 14; sc2.top = 14; sc2.bottom = -14; sc2.near = 1; sc2.far = 80;
    this.sun.shadow.bias = -0.0004; this.sun.shadow.normalBias = 0.02;
    this.sun.target.position.set(-1, 0, 0);
    this.hemi = new THREE.HemisphereLight(0xbfd6ee, 0x6b5a45, 1.0);
    g.add(this.sun, this.sun.target, this.hemi);
    this.fog = new THREE.Fog(0xc9d3dc, 120, 820);
    // people
    this.people = [person(), person({ vest: 0xd8e01a })];
    for (const p of this.people) g.add(p);
    this._ppl = [new THREE.Vector3(-6, 0, 3.4), new THREE.Vector3(-5.2, 0, 3.6)];
  }

  /* clock → sun, sky, light levels. Returns the ambient level (0–1). */
  setTime(clock) {
    const { dir, light } = sunAt(clock);
    this.sun.position.copy(dir).multiplyScalar(40).add(this.sun.target.position);
    this.sun.intensity = 2.6 * light;
    this.hemi.intensity = 0.15 + 0.95 * light;
    const warm = Math.max(0, 1 - dir.y * 3.5);                // low sun: warmer, redder
    this.sun.color.setRGB(1, 0.92 - 0.25 * warm, 0.82 - 0.45 * warm);
    const z = new THREE.Color(0.22, 0.42, 0.72).multiplyScalar(0.25 + 0.75 * light);
    const hz = new THREE.Color(0.72, 0.78, 0.84).lerp(new THREE.Color(0.95, 0.66, 0.42), warm * 0.7).multiplyScalar(0.2 + 0.8 * light);
    this.skyU.uSun.value.copy(dir); this.skyU.uZenith.value.copy(z); this.skyU.uHorizon.value.copy(hz);
    this.skyU.uGlow.value.setRGB(1, 0.85 - 0.3 * warm, 0.6 - 0.35 * warm).multiplyScalar(light > 0 ? 1 : 0.1);
    this.fog.color.copy(hz);
    const night = light < 0.25;
    for (const f of this.floods) f.intensity = night ? 250 : 0;
    return light;
  }

  /* facility: the beacon, the gate, the people */
  setFacility(st, time, people) {
    const col = { GREEN: 0x2fb344, AMBER: 0xf2a91c, RED: 0xff2a1a }[st.beacon] || 0x2fb344;
    const red = st.beacon === 'RED', amber = st.beacon === 'AMBER';
    const on = red ? true : amber ? Math.floor(time * 2) % 2 === 0 : true;
    this.beaconLens.emissive.setHex(on ? col : 0x000000);
    this.beaconLens.emissiveIntensity = on ? 2.2 : 0;
    this.beaconLight.color.setHex(col); this.beaconGlow.color.setHex(col);
    this.beaconLight.intensity = red ? 30 : 0;
    this.beaconGlow.intensity = on ? (red ? 6 : 2) : 0;
    if (red) { const a = time * 4.2; this.beaconTarget.position.set(-3.2 + Math.cos(a) * 3, 4.2, 3.7 + Math.sin(a) * 3); }
    const open = st.area === 'OPEN';
    const gx = open ? this.gateX.open : this.gateX.shut;
    this.gate.position.x += (gx - this.gate.position.x) * 0.08;
    this.people.forEach((p, i) => {
      p.visible = open && i < (st.personnel || 0);
      const goal = people?.[i] || this._ppl[i];
      p.position.lerp(goal, 0.05);
      p.rotation.y = Math.atan2(goal.x - p.position.x, goal.z - p.position.z) || p.rotation.y;
    });
  }
}
