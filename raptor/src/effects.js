// Exterior visual effects: afterburner plumes, condensation, wingtip vortices,
// contrails, the transonic vapour cone and the Mach cone itself.

import * as THREE from 'three';
import { origin } from './world.js';
import { isa } from './atmosphere.js';

const D = Math.PI / 180;
const clamp = (x, a, b) => x < a ? a : x > b ? b : x;

// ---------------------------------------------------------------------------
// A ribbon trail whose points live in absolute world metres, re-emitted into
// render space every frame so the floating origin never makes it jump.
// ---------------------------------------------------------------------------
class Trail {
  constructor(scene, maxPoints, width, color, opacity) {
    this.max = maxPoints;
    this.width = width;
    this.pts = [];               // {x,y,z, life, w}
    const pos = new Float32Array(maxPoints * 2 * 3);
    const alpha = new Float32Array(maxPoints * 2);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('aAlpha', new THREE.BufferAttribute(alpha, 1));
    const idx = [];
    for (let i = 0; i < maxPoints - 1; i++) {
      const a = i * 2;
      idx.push(a, a + 1, a + 2, a + 2, a + 1, a + 3);
    }
    geo.setIndex(idx);
    geo.setDrawRange(0, 0);
    this.geo = geo;
    this.mat = new THREE.ShaderMaterial({
      uniforms: { uColor: { value: new THREE.Color(color) }, uOpacity: { value: opacity } },
      vertexShader: `attribute float aAlpha; varying float vA;
        void main(){ vA = aAlpha; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `uniform vec3 uColor; uniform float uOpacity; varying float vA;
        void main(){ gl_FragColor = vec4(uColor, vA * uOpacity); }`,
      transparent: true, depthWrite: false, side: THREE.DoubleSide,
    });
    this.mesh = new THREE.Mesh(geo, this.mat);
    this.mesh.frustumCulled = false;
    scene.add(this.mesh);
  }

  emit(worldPos, right, strength, width) {
    this.pts.push({
      x: worldPos.x, y: worldPos.y, z: worldPos.z,
      rx: right.x, ry: right.y, rz: right.z,
      life: 1, s: strength, w: width || this.width,
    });
    if (this.pts.length > this.max) this.pts.shift();
  }

  update(dt, decay = 0.28) {
    const pos = this.geo.attributes.position.array;
    const al = this.geo.attributes.aAlpha.array;
    let n = 0;
    for (let i = 0; i < this.pts.length; i++) {
      const p = this.pts[i];
      p.life -= dt * decay;
      if (p.life <= 0) continue;
      const w = p.w * (1 + (1 - p.life) * 2.2);
      const bx = p.x - origin.x, by = p.y - origin.y, bz = p.z - origin.z;
      const k = n * 6;
      pos[k] = bx - p.rx * w; pos[k + 1] = by - p.ry * w; pos[k + 2] = bz - p.rz * w;
      pos[k + 3] = bx + p.rx * w; pos[k + 4] = by + p.ry * w; pos[k + 5] = bz + p.rz * w;
      const a = p.life * p.life * p.s;
      al[n * 2] = a; al[n * 2 + 1] = a;
      n++;
    }
    if (n !== this.pts.length) this.pts = this.pts.filter(p => p.life > 0);
    this.geo.attributes.position.needsUpdate = true;
    this.geo.attributes.aAlpha.needsUpdate = true;
    this.geo.setDrawRange(0, Math.max(0, (n - 1) * 6));
  }

  clear() { this.pts.length = 0; this.geo.setDrawRange(0, 0); }
}

// ---------------------------------------------------------------------------

const PLUME_VERT = /* glsl */`
varying vec2 vUv;
varying vec3 vN;
varying vec3 vV;
uniform float uLen; uniform float uRad;
void main() {
  vUv = uv;
  vec3 p = position;
  // a necked-then-flaring plume: tight at the nozzle, spreading downstream
  float r = uRad * (1.0 - 0.45 * uv.y) * (1.0 + 1.15 * uv.y * uv.y);
  p.xy *= r * 2.0;                       // the base ring has radius 0.5
  p.z = uv.y * uLen;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vN = normalize(normalMatrix * vec3(position.xy, 0.0));
  vV = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}`;

const PLUME_FRAG = /* glsl */`
precision highp float;
varying vec2 vUv; varying vec3 vN; varying vec3 vV;
uniform float uAB;
uniform float uPower;
uniform float uTime;
void main() {
  float t = vUv.y;                       // 0 at the nozzle, 1 downstream
  // the shell is brightest where you look along it, which is what makes a
  // real exhaust plume read as hollow
  float rim = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 1.25);
  // shock diamonds: standing waves in the supersonic core
  float d = 0.5 + 0.5 * sin(t * 34.0 - uTime * 22.0);
  float diamonds = pow(d, 5.0) * uAB
                 * smoothstep(0.02, 0.22, t) * smoothstep(1.0, 0.45, t);
  float body = exp(-t * (2.9 - uAB * 1.8));
  vec3 hot = mix(vec3(0.55, 0.62, 1.0), vec3(1.0, 0.42, 0.10), smoothstep(0.0, 0.35, t));
  vec3 col = hot * (body * 0.85 + diamonds * 1.5);
  float a = (body * (0.10 + 0.62 * uAB) + diamonds * 0.55) * uPower * (0.25 + 0.75 * rim);
  gl_FragColor = vec4(col, clamp(a, 0.0, 1.0));
}`;

function plumeGeometry() {
  // a tube along +z built from rings; uv.y runs 0..1 downstream
  const seg = 16, rings = 14;
  const pos = [], uv = [], idx = [];
  for (let r = 0; r <= rings; r++) {
    for (let i = 0; i < seg; i++) {
      const th = i / seg * Math.PI * 2;
      pos.push(Math.cos(th) * 0.5, Math.sin(th) * 0.5, 0);
      uv.push(i / seg, r / rings);
    }
  }
  for (let r = 0; r < rings; r++) {
    for (let i = 0; i < seg; i++) {
      const a = r * seg + i, b = r * seg + (i + 1) % seg;
      idx.push(a, a + seg, b, b, a + seg, b + seg);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  return g;
}

export class Effects {
  constructor(scene, aircraft) {
    this.scene = scene;
    this.aircraft = aircraft;
    this.humidity = 0.55;

    // --- afterburner plumes, parented to the aircraft ---
    this.plumes = [];
    const pg = plumeGeometry();
    for (const s of [-1, 1]) {
      const mat = new THREE.ShaderMaterial({
        uniforms: {
          uAB: { value: 0 }, uPower: { value: 0 }, uTime: { value: 0 },
          uLen: { value: 6 }, uRad: { value: 0.55 },
        },
        vertexShader: PLUME_VERT, fragmentShader: PLUME_FRAG,
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      });
      const m = new THREE.Mesh(pg, mat);
      m.frustumCulled = false;
      m.position.set(s * 0.92, -0.05, 9.5);
      aircraft.group.add(m);
      this.plumes.push(m);
    }
    // exhaust glow lights so the ground lights up under a night afterburner pass
    this.abLight = new THREE.PointLight(0xff7a2a, 0, 220, 2);
    this.abLight.position.set(0, 0, 10.5);
    aircraft.group.add(this.abLight);

    // --- heat shimmer behind the nozzles ---
    const shimmerMat = new THREE.ShaderMaterial({
      uniforms: { uT: { value: 0 }, uAmt: { value: 0 } },
      vertexShader: `varying vec2 vUv; void main(){ vUv=uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `precision highp float; varying vec2 vUv; uniform float uT; uniform float uAmt;
        float h(vec2 p){ return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453); }
        void main(){
          vec2 p = vUv * vec2(6.0, 20.0);
          p.y -= uT * 6.0;
          float n = h(floor(p)) ;
          float band = smoothstep(0.35, 1.0, n) * (1.0 - vUv.y);
          float edge = smoothstep(0.0,0.25,vUv.x)*smoothstep(1.0,0.75,vUv.x);
          gl_FragColor = vec4(1.0, 0.85, 0.7, band * edge * uAmt * 0.20);
        }`,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    });
    this.shimmer = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 22), shimmerMat);
    this.shimmer.position.set(0, -0.05, 19);
    this.shimmer.rotation.y = 0;
    aircraft.group.add(this.shimmer);

    // --- vapour cone / wing-root condensation ---
    const vapMat = new THREE.ShaderMaterial({
      uniforms: { uAmt: { value: 0 }, uSpread: { value: 0.5 } },
      vertexShader: `varying vec3 vN; varying vec2 vUv;
        void main(){ vN = normalize(normalMatrix * normal); vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `precision highp float; varying vec3 vN; varying vec2 vUv;
        uniform float uAmt; uniform float uSpread;
        void main(){
          float rim = pow(1.0 - abs(vN.z), 2.0);
          float band = smoothstep(0.0, uSpread, vUv.y) * smoothstep(1.0, 1.0 - uSpread, vUv.y);
          gl_FragColor = vec4(vec3(0.92,0.95,1.0), rim * band * uAmt * 0.42);
        }`,
      transparent: true, depthWrite: false, side: THREE.DoubleSide,
      blending: THREE.NormalBlending,
    });
    this.vaporCone = new THREE.Mesh(new THREE.ConeGeometry(4.6, 9.0, 28, 6, true), vapMat);
    this.vaporCone.rotation.x = -90 * D;
    this.vaporCone.position.set(0, -0.1, 2.2);
    aircraft.group.add(this.vaporCone);

    // --- wing-root / LEX vapour puffs during hard turns ---
    this.lex = [];
    for (const s of [-1, 1]) {
      const m = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.85, 6.5, 12, 1, true),
        vapMat.clone());
      m.rotation.x = 90 * D;
      m.rotation.z = -s * 8 * D;
      m.position.set(s * 2.6, 0.15, 1.2);
      aircraft.group.add(m);
      this.lex.push(m);
    }

    // --- trails in world space ---
    this.vortexL = new Trail(scene, 90, 0.35, 0xdfeaff, 0.55);
    this.vortexR = new Trail(scene, 90, 0.35, 0xdfeaff, 0.55);
    this.contrailL = new Trail(scene, 300, 2.4, 0xffffff, 0.5);
    this.contrailR = new Trail(scene, 300, 2.4, 0xffffff, 0.5);
    this._emitAcc = 0;

    // --- Mach cone ---
    const machMat = new THREE.ShaderMaterial({
      uniforms: { uAmt: { value: 0 } },
      vertexShader: `varying vec3 vN; varying vec2 vUv;
        void main(){ vN = normalize(normalMatrix * normal); vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `precision highp float; varying vec3 vN; varying vec2 vUv; uniform float uAmt;
        void main(){
          float rim = pow(1.0 - abs(vN.z), 3.0);
          gl_FragColor = vec4(vec3(0.82,0.90,1.0), rim * uAmt * 0.10 * (1.0 - vUv.y*0.75));
        }`,
      transparent: true, depthWrite: false, side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    this.machCone = new THREE.Mesh(new THREE.ConeGeometry(1, 1, 40, 1, true), machMat);
    this.machCone.rotation.x = -90 * D;
    aircraft.group.add(this.machCone);

    this._t = 0;
    this._right = new THREE.Vector3();
    this._tmp = new THREE.Vector3();
  }

  update(dt, fm, propulsion, weather) {
    this._t += dt;
    const ab = propulsion.afterburner;
    const power = 0.15 + 0.85 * propulsion.spool;
    const air = isa(fm.position.y);
    const backPressure = clamp(1.6 - air.rho / 1.225, 0.35, 1.6);

    for (const p of this.plumes) {
      const u = p.material.uniforms;
      u.uAB.value = ab;
      u.uPower.value = power * (propulsion.spool > 0.1 ? 1 : 0.3);
      u.uTime.value = this._t;
      u.uLen.value = (2.6 + 9.5 * ab + 2.0 * propulsion.spool) * backPressure;
      u.uRad.value = 0.48 + 0.22 * ab;
    }
    this.abLight.intensity = ab * 9 + propulsion.spool * 0.6;
    this.abLight.distance = 60 + ab * 260;
    this.shimmer.material.uniforms.uT.value = this._t;
    this.shimmer.material.uniforms.uAmt.value = 0.25 * propulsion.spool + ab;

    // --- condensation: needs moist air, and either transonic flow or high g ---
    const hum = weather ? weather.humidity : this.humidity;
    const altFactor = clamp(1 - (fm.position.y - 500) / 9000, 0.05, 1);
    const transonic = Math.exp(-Math.pow((fm.mach - 0.98) / 0.10, 2));
    const gVapor = clamp((Math.abs(fm.gLoad) - 3.2) / 5.0, 0, 1);
    const coneAmt = clamp((transonic * 1.5 + gVapor * 0.9) * hum * altFactor, 0, 1);
    this.vaporCone.material.uniforms.uAmt.value = coneAmt;
    this.vaporCone.material.uniforms.uSpread.value = 0.30 + 0.35 * transonic;
    this.vaporCone.visible = coneAmt > 0.01;

    const lexAmt = clamp(gVapor * 1.4 * hum * altFactor + clamp((fm.alpha - 12 * D) / (18 * D), 0, 1) * hum * 0.9, 0, 1);
    for (const m of this.lex) {
      m.material.uniforms.uAmt.value = lexAmt;
      m.visible = lexAmt > 0.02;
    }

    // --- Mach cone geometry: mu = asin(1/M) ---
    if (fm.mach > 1.02) {
      const mu = Math.asin(1 / fm.mach);
      const len = 26;
      this.machCone.visible = true;
      this.machCone.scale.set(len * Math.tan(mu), len, len * Math.tan(mu));
      this.machCone.position.set(0, -0.1, -9.0 + len * 0.5);
      this.machCone.renderOrder = 5;
      this.machCone.material.uniforms.uAmt.value = clamp((fm.mach - 1.02) * 3, 0, 1) * altFactor;
    } else {
      this.machCone.visible = false;
    }

    // --- world-space trails ---
    this._emitAcc += dt;
    const speed = fm.tas;
    const emitInterval = clamp(12 / Math.max(speed, 20), 0.010, 0.10);
    const q = fm.quaternion;
    this._right.set(1, 0, 0).applyQuaternion(q);

    const vortexAmt = clamp((Math.abs(fm.gLoad) - 2.0) / 5.0, 0, 1) * hum * altFactor
      + clamp((fm.alpha - 8 * D) / (20 * D), 0, 1) * 0.6 * hum * altFactor;
    const contrailAmt = fm.position.y > 7500 && fm.position.y < 13500
      ? clamp((fm.position.y - 7500) / 1500, 0, 1) * clamp((13500 - fm.position.y) / 2000, 0, 1) * (0.3 + 0.7 * propulsion.spool)
      : 0;

    if (this._emitAcc >= emitInterval) {
      this._emitAcc = 0;
      for (const [tip, trail] of [[-6.8, this.vortexL], [6.8, this.vortexR]]) {
        this._tmp.set(tip, -0.1, 4.5).applyQuaternion(q).add(fm.position);
        trail.emit(this._tmp, this._right, vortexAmt, 0.30);
      }
      for (const [tip, trail] of [[-0.92, this.contrailL], [0.92, this.contrailR]]) {
        this._tmp.set(tip, -0.05, 10.5).applyQuaternion(q).add(fm.position);
        trail.emit(this._tmp, this._right, contrailAmt, 1.8);
      }
    }
    this.vortexL.update(dt, 0.55); this.vortexR.update(dt, 0.55);
    this.contrailL.update(dt, 0.022); this.contrailR.update(dt, 0.022);
  }

  clearTrails() {
    this.vortexL.clear(); this.vortexR.clear();
    this.contrailL.clear(); this.contrailR.clear();
  }
}
