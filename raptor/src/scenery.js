// Airfields and cities: runways with markings and lighting, and procedural
// building fields that appear as you get close enough to see them.

import * as THREE from 'three';
import { origin, AIRPORTS, CITIES } from './world.js';
import { heightAt } from './terrain.js';
import { rand2, fbm } from './noise.js';

const D = Math.PI / 180;
const clamp = (x, a, b) => x < a ? a : x > b ? b : x;

function runwayTexture(lenM, widthM, hdg) {
  const c = document.createElement('canvas');
  c.width = 128; c.height = 1024;
  const g = c.getContext('2d');
  g.fillStyle = '#22242a'; g.fillRect(0, 0, 128, 1024);
  // aggregate speckle
  for (let i = 0; i < 4000; i++) {
    g.fillStyle = `rgba(255,255,255,${Math.random() * 0.05})`;
    g.fillRect(Math.random() * 128, Math.random() * 1024, 2, 2);
  }
  g.strokeStyle = '#e8e8e6'; g.lineWidth = 3;
  // edge lines
  g.beginPath(); g.moveTo(7, 0); g.lineTo(7, 1024); g.moveTo(121, 0); g.lineTo(121, 1024); g.stroke();
  // centreline dashes
  g.lineWidth = 4; g.setLineDash([26, 20]);
  g.beginPath(); g.moveTo(64, 40); g.lineTo(64, 984); g.stroke();
  g.setLineDash([]);
  // threshold bars at both ends
  for (const y of [10, 1024 - 34]) {
    for (let i = 0; i < 6; i++) {
      g.fillStyle = '#e8e8e6';
      g.fillRect(18 + i * 16, y, 9, 24);
    }
  }
  // touchdown zone markings
  for (const y of [70, 110, 1024 - 94, 1024 - 134]) {
    g.fillStyle = '#e8e8e6';
    g.fillRect(40, y, 8, 26); g.fillRect(80, y, 8, 26);
  }
  // runway designators
  g.save();
  g.fillStyle = '#e8e8e6';
  g.font = 'bold 46px monospace'; g.textAlign = 'center';
  const n1 = Math.round(hdg / 10) || 36;
  const n2 = ((n1 + 18 - 1) % 36) + 1;
  g.translate(64, 190); g.fillText(String(n1).padStart(2, '0'), 0, 0);
  g.restore();
  g.save();
  g.translate(64, 1024 - 160); g.rotate(Math.PI);
  g.fillStyle = '#e8e8e6'; g.font = 'bold 46px monospace'; g.textAlign = 'center';
  g.fillText(String(n2).padStart(2, '0'), 0, 0);
  g.restore();

  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 8;
  return tex;
}

class Airfield {
  constructor(a) {
    this.a = a;
    this.group = new THREE.Group();
    const { rwyLen: L, rwyWidth: W } = a;

    const tex = runwayTexture(L, W, a.rwyHdg);
    const rwy = new THREE.Mesh(
      new THREE.PlaneGeometry(W, L),
      new THREE.MeshStandardMaterial({
        map: tex, roughness: 0.92, metalness: 0.0,
        polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4,
      }));
    rwy.rotation.x = -90 * D;
    // The terrain under an airfield is flattened to exactly the field
    // elevation, so every one of these surfaces would be coplanar with it.
    // Lift them clear — a few centimetres nobody will ever notice, and no
    // z-fighting.
    rwy.position.y = 0.80;
    this.group.add(rwy);

    // overrun aprons
    const apron = new THREE.Mesh(
      new THREE.PlaneGeometry(W * 3.4, L * 0.35),
      new THREE.MeshStandardMaterial({
        color: 0x2a2c31, roughness: 0.95,
        polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3,
      }));
    apron.rotation.x = -90 * D;
    apron.position.set(W * 2.6, 0.62, 0);
    this.group.add(apron);

    // parallel taxiway
    const taxi = new THREE.Mesh(
      new THREE.PlaneGeometry(23, L * 0.92),
      new THREE.MeshStandardMaterial({
        color: 0x2e3036, roughness: 0.95,
        polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3,
      }));
    taxi.rotation.x = -90 * D;
    taxi.position.set(W * 1.5, 0.70, 0);
    this.group.add(taxi);

    // ---- lighting ----
    const edgeGeo = new THREE.BufferGeometry();
    const pts = [], cols = [];
    const white = [1, 1, 0.85], green = [0.2, 1, 0.35], red = [1, 0.2, 0.2], blue = [0.35, 0.55, 1];
    for (let i = 0; i <= 40; i++) {
      const t = i / 40, z = (t - 0.5) * L;
      for (const s of [-1, 1]) { pts.push(s * W * 0.5, 0.4, z); cols.push(...white); }
      if (i % 2 === 0) { for (const s of [-1, 1]) { pts.push(W * 1.5 + s * 11, 0.4, z); cols.push(...blue); } }
    }
    for (let i = 0; i < 9; i++) {
      const x = (i / 8 - 0.5) * W;
      pts.push(x, 0.4, -L * 0.5); cols.push(...green);
      pts.push(x, 0.4, L * 0.5); cols.push(...red);
    }
    // approach lead-in bars at both ends
    for (const end of [-1, 1]) {
      for (let i = 1; i <= 14; i++) {
        pts.push(0, 0.6, end * (L * 0.5 + i * 60)); cols.push(...white);
        if (i % 5 === 0) {
          for (const s of [-1, 1]) { pts.push(s * 14, 0.6, end * (L * 0.5 + i * 60)); cols.push(...white); }
        }
      }
    }
    edgeGeo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    edgeGeo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
    this.lightsMat = new THREE.PointsMaterial({
      size: 3.2, sizeAttenuation: true, vertexColors: true,
      transparent: true, opacity: 0.0, depthWrite: false,
    });
    this.lights = new THREE.Points(edgeGeo, this.lightsMat);
    this.group.add(this.lights);

    // hangars / control tower silhouettes
    const bmat = new THREE.MeshStandardMaterial({ color: 0x3b3f45, roughness: 0.9 });
    for (let i = 0; i < (a.mil ? 8 : 12); i++) {
      const r = rand2(a.x + i * 91, a.z + i * 37);
      const w = 28 + r * 34, d = 24 + r * 30, h = 8 + r * 8;
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), bmat);
      m.position.set(W * 3.2 + r * 300, h * 0.5, (r - 0.5) * L * 0.8 + i * 90 - L * 0.35);
      this.group.add(m);
    }
    const tower = new THREE.Mesh(new THREE.BoxGeometry(14, 34, 14), bmat);
    tower.position.set(W * 2.4, 17, L * 0.18);
    this.group.add(tower);

    this.group.position.set(a.x, a.elev, a.z);
    this.group.rotation.y = -a.hdgRad;
  }

  place(night) {
    this.group.position.set(this.a.x - origin.x, this.a.elev - origin.y, this.a.z - origin.z);
    this.lightsMat.opacity = night ? 0.95 : 0.12;
  }
}

// ---------------------------------------------------------------------------

const MAX_BUILDINGS = 14000;

class CityField {
  constructor(scene) {
    const geo = new THREE.BoxGeometry(1, 1, 1);
    geo.translate(0, 0.5, 0);
    // Per-instance colour comes from instanceColor, not vertexColors: a box
    // geometry has no per-vertex colour attribute, and asking for one gives
    // you black buildings.
    this.mat = new THREE.MeshStandardMaterial({
      color: 0xffffff, roughness: 0.82, metalness: 0.04,
    });
    this.mesh = new THREE.InstancedMesh(geo, this.mat, MAX_BUILDINGS);
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.mesh.frustumCulled = false;
    this.colors = new Float32Array(MAX_BUILDINGS * 3);
    this.mesh.instanceColor = new THREE.InstancedBufferAttribute(this.colors, 3);
    this.mesh.count = 0;
    scene.add(this.mesh);

    // night-time city glow: emissive discs on the ground, visible from altitude
    const glowGeo = new THREE.CircleGeometry(1, 40);
    glowGeo.rotateX(-Math.PI / 2);
    this.glowMat = new THREE.MeshBasicMaterial({
      color: 0xffcf8a, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false,
    });
    this.glows = [];
    for (const c of CITIES) {
      const m = new THREE.Mesh(glowGeo, this.glowMat);
      m.scale.setScalar(c.radius);
      scene.add(m);
      this.glows.push({ mesh: m, city: c });
    }

    this._anchor = null;
    this._dummy = new THREE.Object3D();
  }

  rebuild(camWorld) {
    const dummy = this._dummy;
    let n = 0;
    for (const c of CITIES) {
      const dist = Math.hypot(c.x - camWorld.x, c.z - camWorld.z);
      if (dist > c.radius + 45000) continue;
      // building count scales down with distance so the near city stays dense
      const budget = Math.floor(clamp(4200 * (1 - dist / (c.radius + 45000)), 120, 4200) * c.density);
      for (let i = 0; i < budget && n < MAX_BUILDINGS; i++) {
        const r1 = rand2(c.x + i * 7919, c.z + i * 104729);
        const r2 = rand2(c.x + i * 31337, c.z + i * 15485863);
        const r3 = rand2(c.x + i * 6151, c.z + i * 2654435761);
        // cluster toward the centre: r^0.6 packs the core
        const ang = r1 * Math.PI * 2;
        const rad = Math.pow(r2, 0.62) * c.radius;
        const bx = c.x + Math.cos(ang) * rad;
        const bz = c.z + Math.sin(ang) * rad;
        // grid streets: snap to a block lattice and leave the roads empty
        const block = 190;
        const gx = Math.round(bx / block) * block, gz = Math.round(bz / block) * block;
        const jitterX = (rand2(gx, gz) - 0.5) * 70;
        const jitterZ = (rand2(gz, gx) - 0.5) * 70;
        const px = gx + jitterX, pz = gz + jitterZ;
        const dc = Math.hypot(px - c.x, pz - c.z) / c.radius;
        const tallness = Math.pow(clamp(1 - dc, 0, 1), 2.4);
        const h = 10 + tallness * c.tall * (0.35 + r3 * 1.2) + r3 * 18;
        const w = 26 + r1 * 40 + tallness * 34;
        const d = 26 + r2 * 40 + tallness * 34;
        const y = heightAt(px, pz);

        dummy.position.set(px - origin.x, y - origin.y, pz - origin.z);
        dummy.rotation.y = Math.round(r3 * 4) * Math.PI / 2;
        dummy.scale.set(w, h, d);
        dummy.updateMatrix();
        this.mesh.setMatrixAt(n, dummy.matrix);
        // desert cities read pale and dusty from the air, not dark
        const shade = 0.46 + r3 * 0.34;
        this.colors[n * 3] = shade * 1.04;
        this.colors[n * 3 + 1] = shade * 0.99;
        this.colors[n * 3 + 2] = shade * 0.92;
        n++;
      }
    }
    this.mesh.count = n;
    this.mesh.instanceMatrix.needsUpdate = true;
    this.mesh.instanceColor.needsUpdate = true;
    this._anchor = { x: camWorld.x, z: camWorld.z };
  }

  update(camWorld, night) {
    if (!this._anchor || Math.hypot(camWorld.x - this._anchor.x, camWorld.z - this._anchor.z) > 2500) {
      this.rebuild(camWorld);
    }
    this.mat.emissive = this.mat.emissive || new THREE.Color();
    this.mat.emissive.setRGB(night ? 0.06 : 0, night ? 0.05 : 0, night ? 0.03 : 0);
    this.glowMat.opacity = night ? 0.30 : 0.0;
    for (const g of this.glows) {
      g.mesh.position.set(
        g.city.x - origin.x,
        heightAt(g.city.x, g.city.z) + 4 - origin.y,
        g.city.z - origin.z);
      g.mesh.visible = night;
    }
  }
}

// ---------------------------------------------------------------------------

export class Scenery {
  constructor(scene) {
    this.scene = scene;
    this.fields = new Map();
    this.city = new CityField(scene);
    this.group = new THREE.Group();
    scene.add(this.group);
  }

  update(camWorld, night) {
    for (const a of AIRPORTS) {
      const d = Math.hypot(a.x - camWorld.x, a.z - camWorld.z);
      const want = d < 32000;
      const have = this.fields.has(a.icao);
      if (want && !have) {
        const f = new Airfield(a);
        this.group.add(f.group);
        this.fields.set(a.icao, f);
      } else if (!want && have) {
        const f = this.fields.get(a.icao);
        this.group.remove(f.group);
        this.fields.delete(a.icao);
      }
      if (this.fields.has(a.icao)) this.fields.get(a.icao).place(night);
    }
    this.city.update(camWorld, night);
  }
}
