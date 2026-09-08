// Sky, sun, stars and the two big things hanging in each other's sky.
//
// The dome is a single shader. Its atmosphere uniform is what sells the climb
// out of THERA: drive it from 1 to 0 and the blue drains away, the stars come
// up and you are in space, with no scene swap.

import * as THREE from 'three';
import { PLANET } from '../config.js';
import { clamp, smoothstep, lerp } from '../math/noise.js';

const SKY_VERT = /* glsl */`
varying vec3 vDir;
void main() {
  vDir = normalize( position );
  vec4 mv = modelViewMatrix * vec4( position, 1.0 );
  gl_Position = projectionMatrix * mv;
  gl_Position.z = gl_Position.w * 0.999999;   // always behind everything
}
`;

const SKY_FRAG = /* glsl */`
precision highp float;
varying vec3 vDir;
uniform vec3 uSun;
uniform float uAtmos;        // 1 = sea level, 0 = vacuum
uniform float uTime;
uniform float uStorm;
uniform vec3 uTintDay;
uniform vec3 uTintHorizon;
uniform vec3 uTintNight;
uniform float uStarFade;
uniform float uAurora;

float h11(float p){ p = fract(p * 0.1031); p *= p + 33.33; p *= p + p; return fract(p); }
float h31(vec3 p){ p = fract(p * 0.1031); p += dot(p, p.yzx + 33.33); return fract((p.x + p.y) * p.z); }
float n3(vec3 p){
  vec3 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
  float a = h31(i), b = h31(i+vec3(1,0,0)), c = h31(i+vec3(0,1,0)), d = h31(i+vec3(1,1,0));
  float e = h31(i+vec3(0,0,1)), g = h31(i+vec3(1,0,1)), k = h31(i+vec3(0,1,1)), l = h31(i+vec3(1,1,1));
  return mix(mix(mix(a,b,f.x),mix(c,d,f.x),f.y), mix(mix(e,g,f.x),mix(k,l,f.x),f.y), f.z);
}
float fbm3(vec3 p){ float v=0.0,a=0.5; for(int i=0;i<5;i++){ v+=a*n3(p); p*=2.07; a*=0.5;} return v; }

vec3 starField(vec3 d){
  vec3 col = vec3(0.0);
  // Three densities so the sky has bright anchors and a fine dust of faint ones.
  for (int L = 0; L < 3; L++) {
    float scale = 150.0 + float(L) * 190.0;
    vec3 g = d * scale;
    vec3 id = floor(g);
    vec3 f = fract(g) - 0.5;
    float r = h31(id + float(L) * 17.7);
    float thresh = 0.9955 - float(L) * 0.0016;
    if (r > thresh) {
      vec3 off = vec3(h31(id+1.3), h31(id+2.7), h31(id+3.1)) - 0.5;
      float dist = length(f - off * 0.6);
      float mag = (r - thresh) / (1.0 - thresh);
      float tw = 0.75 + 0.25 * sin(uTime * (1.5 + mag * 4.0) + r * 90.0);
      float s = smoothstep(0.09, 0.0, dist) * mag * tw;
      // Cool giants and warm dwarfs.
      vec3 tint = mix(vec3(0.66,0.78,1.0), vec3(1.0,0.82,0.62), h31(id+9.1));
      col += s * tint * (1.6 - float(L) * 0.35);
    }
  }
  // Galactic band.
  float band = exp(-pow(dot(d, normalize(vec3(0.35, 0.42, -0.84))) * 2.7, 2.0));
  float dust = fbm3(d * 7.0 + 4.0);
  col += band * (0.052 + dust * 0.10) * vec3(0.72, 0.74, 0.95);
  col += band * pow(dust, 3.0) * 0.24 * vec3(1.0, 0.85, 0.78);
  return col;
}

void main() {
  vec3 d = normalize(vDir);
  float y = d.y;
  float sunCos = dot(d, uSun);
  float sunUp = uSun.y;

  float dayT = smoothstep(-0.14, 0.16, sunUp);
  float duskT = exp(-pow((sunUp - 0.02) * 7.0, 2.0));

  // Vertical gradient. Horizon haze thickens with atmosphere.
  float hz = pow(clamp(1.0 - abs(y), 0.0, 1.0), 3.4);
  float below = smoothstep(0.0, -0.25, y);

  vec3 zen = uTintDay;
  vec3 hor = uTintHorizon;
  vec3 dayCol = mix(zen, hor, hz);

  // Mie forward scattering — the bright bloom around the sun.
  float mie = pow(max(sunCos, 0.0), 9.0) * 0.9 + pow(max(sunCos, 0.0), 200.0) * 2.2;
  vec3 mieCol = mix(vec3(1.0, 0.86, 0.66), vec3(1.0, 0.55, 0.28), duskT);
  dayCol += mie * mieCol * (0.35 + duskT * 1.4);

  // Sunset band hugging the horizon on the sun's side.
  float band = pow(clamp(1.0 - abs(y) * 2.6, 0.0, 1.0), 2.2) * pow(max(sunCos * 0.5 + 0.5, 0.0), 3.0);
  dayCol = mix(dayCol, vec3(1.05, 0.44, 0.26), band * duskT * 0.85);
  dayCol = mix(dayCol, vec3(0.62, 0.26, 0.42), band * duskT * 0.30);

  vec3 nightCol = uTintNight * (0.55 + hz * 0.7);
  vec3 stars = starField(d) * uStarFade * (1.0 - dayT * 0.97);

  // Aurora over the poles when the star is active.
  if (uAurora > 0.001) {
    float a = smoothstep(0.05, 0.5, y) * (1.0 - dayT);
    float curtain = fbm3(vec3(d.xz * 5.0, uTime * 0.05));
    float ribbon = smoothstep(0.55, 0.85, curtain) * smoothstep(0.62, 0.18, y);
    nightCol += ribbon * a * uAurora * vec3(0.18, 0.75, 0.42);
    nightCol += ribbon * ribbon * a * uAurora * vec3(0.34, 0.15, 0.62);
  }

  vec3 col = mix(nightCol, dayCol, dayT);
  col += stars * (0.35 + 0.65 * (1.0 - uAtmos));   // stars punch through in thin air

  // The sun itself.
  float disc = smoothstep(0.99965, 0.99988, sunCos);
  col += disc * vec3(9.0, 7.6, 6.0) * mix(vec3(1.0), vec3(1.2, 0.55, 0.25), duskT);

  // Thin the atmosphere out toward vacuum.
  float atmos = clamp(uAtmos, 0.0, 1.0);
  vec3 space = stars + disc * vec3(11.0, 10.0, 9.4);
  col = mix(space, col, atmos);

  // Storm cell: drain the colour, darken the ceiling.
  col = mix(col, vec3(0.055, 0.06, 0.072) * (0.5 + dayT * 0.9), uStorm * (1.0 - below * 0.5) * atmos);

  gl_FragColor = vec4(max(col, 0.0), 1.0);
}
`;

export class Sky {
  constructor(scene) {
    this.uniforms = {
      uSun: { value: new THREE.Vector3(0, 1, 0) },
      uAtmos: { value: 1 },
      uTime: { value: 0 },
      uStorm: { value: 0 },
      uStarFade: { value: 1 },
      uAurora: { value: 0 },
      uTintDay: { value: new THREE.Color(0.075, 0.20, 0.46) },
      uTintHorizon: { value: new THREE.Color(0.56, 0.68, 0.72) },
      uTintNight: { value: new THREE.Color(0.012, 0.017, 0.036) },
    };
    const geo = new THREE.SphereGeometry(1, 40, 24);
    const mat = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: SKY_VERT,
      fragmentShader: SKY_FRAG,
      side: THREE.BackSide,
      depthWrite: false,
      depthTest: false,
      fog: false,
      toneMapped: true,
    });
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = -1000;
    this.mesh.scale.setScalar(1);
    scene.add(this.mesh);
  }

  update(camera, t) {
    this.mesh.position.copy(camera.position);
    this.uniforms.uTime.value = t;
  }

  dispose() {
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
  }
}

// --- celestial bodies ------------------------------------------------------

const BODY_VERT = /* glsl */`
varying vec3 vN; varying vec3 vP;
void main(){ vN = normalize(normal); vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
`;

const BODY_FRAG = /* glsl */`
precision highp float;
varying vec3 vN; varying vec3 vP;
uniform vec3 uSunLocal;      // sun direction in the body's local space
uniform float uKind;         // 0 = planet, 1 = moon
uniform float uTime;
uniform vec3 uLand; uniform vec3 uSea; uniform vec3 uAtmoCol;
uniform float uAtmoStrength;

float h31(vec3 p){ p = fract(p * 0.1031); p += dot(p, p.yzx + 33.33); return fract((p.x + p.y) * p.z); }
float n3(vec3 p){
  vec3 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
  float a = h31(i), b = h31(i+vec3(1,0,0)), c = h31(i+vec3(0,1,0)), d = h31(i+vec3(1,1,0));
  float e = h31(i+vec3(0,0,1)), g = h31(i+vec3(1,0,1)), k = h31(i+vec3(0,1,1)), l = h31(i+vec3(1,1,1));
  return mix(mix(mix(a,b,f.x),mix(c,d,f.x),f.y), mix(mix(e,g,f.x),mix(k,l,f.x),f.y), f.z);
}
float fbm3(vec3 p, int oct){ float v=0.0,a=0.5; for(int i=0;i<7;i++){ if(i>=oct) break; v+=a*n3(p); p*=2.11; a*=0.5;} return v; }

void main(){
  vec3 n = normalize(vN);
  float lambert = max(dot(n, uSunLocal), 0.0);
  vec3 col;
  if (uKind < 0.5) {
    // THERA from orbit: continents, shelf seas, ice at the poles, weather.
    float c = fbm3(n * 2.3 + 11.0, 6);
    float land = smoothstep(0.47, 0.56, c);
    float shelf = smoothstep(0.40, 0.50, c);
    vec3 sea = mix(uSea * 0.55, uSea, shelf);
    vec3 ground = mix(uLand * 0.72, uLand * 1.25, fbm3(n * 7.0, 4));
    // Arid belts and a volcanic scar or two.
    ground = mix(ground, vec3(0.42, 0.33, 0.17), smoothstep(0.55, 0.75, fbm3(n * 3.1 + 40.0, 4)) * 0.55);
    col = mix(sea, ground, land);
    float ice = smoothstep(0.80, 0.95, abs(n.y));
    col = mix(col, vec3(0.92, 0.95, 0.99), ice);
    float cloud = fbm3(n * 3.4 + vec3(uTime * 0.004, 0.0, uTime * 0.002), 6);
    float ct = smoothstep(0.50, 0.72, cloud);
    col = mix(col, vec3(0.96, 0.97, 1.0), ct * 0.86);
    col *= 0.06 + lambert * 1.05;
    // Night side keeps a faint reflected glow rather than going pure black.
    col += (1.0 - lambert) * vec3(0.012, 0.016, 0.03);
  } else {
    // ANVIL: basalt regolith, craters, bright ray systems.
    float r = fbm3(n * 9.0, 5);
    float craters = 0.0;
    for (int i = 0; i < 3; i++) {
      float s = 6.0 + float(i) * 11.0;
      vec3 g = n * s;
      vec3 id = floor(g);
      float rr = h31(id + float(i) * 5.1);
      if (rr > 0.72) {
        float d = length(fract(g) - 0.5);
        craters += smoothstep(0.42, 0.16, d) * (rr - 0.72) * 2.2;
      }
    }
    col = mix(vec3(0.20, 0.195, 0.20), vec3(0.40, 0.395, 0.385), r);
    col *= 1.0 - craters * 0.42;
    col += smoothstep(0.75, 0.95, fbm3(n * 16.0, 3)) * 0.10;
    col *= 0.03 + lambert * 1.15;
  }
  // Limb: atmosphere on the planet, a hard edge on the moon.
  float rim = pow(1.0 - abs(dot(n, normalize(vec3(0.0, 0.0, 1.0)))), 3.0);
  gl_FragColor = vec4(col, 1.0);
}
`;

/**
 * A world hanging in the sky. Positioned on a fixed unit direction and scaled
 * to subtend `angularRadius` radians, so it reads at the right size no matter
 * what the camera's field of view is doing.
 */
export class CelestialBody {
  constructor(scene, { kind = 'planet', angularRadius = 0.02, distance = 30000 } = {}) {
    this.distance = distance;
    this.angularRadius = angularRadius;
    this.direction = new THREE.Vector3(0, 0.4, -1).normalize();
    this.uniforms = {
      uSunLocal: { value: new THREE.Vector3(1, 0, 0) },
      uKind: { value: kind === 'moon' ? 1 : 0 },
      uTime: { value: 0 },
      uLand: { value: new THREE.Color(0.11, 0.26, 0.10) },
      uSea: { value: new THREE.Color(0.035, 0.10, 0.21) },
      uAtmoCol: { value: new THREE.Color(0.35, 0.6, 1.0) },
      uAtmoStrength: { value: kind === 'moon' ? 0 : 1 },
    };
    const mat = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: BODY_VERT,
      fragmentShader: BODY_FRAG,
      depthWrite: false, depthTest: false, fog: false,
    });
    this.mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 40), mat);
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = -900;
    this.group = new THREE.Group();
    this.group.add(this.mesh);
    // Atmospheric halo for the planet.
    if (kind !== 'moon') {
      const haloMat = new THREE.ShaderMaterial({
        uniforms: { uCol: { value: new THREE.Color(0.35, 0.62, 1.0) }, uSunLocal: this.uniforms.uSunLocal },
        vertexShader: `varying vec3 vN; varying vec3 vV;
          void main(){ vN = normalize(normalMatrix * normal); vec4 mv = modelViewMatrix*vec4(position,1.0); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }`,
        fragmentShader: `varying vec3 vN; varying vec3 vV; uniform vec3 uCol; uniform vec3 uSunLocal;
          void main(){ float rim = pow(1.0 - max(dot(vN, vV), 0.0), 2.6);
            gl_FragColor = vec4(uCol * rim * 1.5, rim); }`,
        transparent: true, depthWrite: false, depthTest: false,
        blending: THREE.AdditiveBlending, side: THREE.BackSide, fog: false,
      });
      this.halo = new THREE.Mesh(new THREE.SphereGeometry(1.055, 48, 32), haloMat);
      this.halo.frustumCulled = false;
      this.halo.renderOrder = -899;
      this.group.add(this.halo);
    }
    this.visible = true;
    scene.add(this.group);
  }

  setDirection(v) { this.direction.copy(v).normalize(); }
  setAngularRadius(r) { this.angularRadius = r; }

  update(camera, sunDir, t) {
    this.group.visible = this.visible;
    if (!this.visible) return;
    this.uniforms.uTime.value = t;
    const d = this.distance;
    this.group.position.copy(camera.position).addScaledVector(this.direction, d);
    const s = Math.tan(this.angularRadius) * d;
    this.group.scale.setScalar(s);
    this.group.quaternion.identity();
    this.group.rotateY(t * 0.004);
    // Sun direction expressed in the body's local frame.
    const inv = this.group.quaternion.clone().invert();
    this.uniforms.uSunLocal.value.copy(sunDir).applyQuaternion(inv).normalize();
  }
}

// --- daylight --------------------------------------------------------------

/**
 * Owns the clock, the sun's arc, light colours and fog. Everything that needs
 * to know what time it is asks this.
 */
export class Daylight {
  constructor(scene, { dayLength = PLANET.dayLength, axialTilt = 0.32 } = {}) {
    this.dayLength = dayLength;
    this.axialTilt = axialTilt;
    this.time = 0.34 * dayLength;        // start mid-morning
    this.sunDir = new THREE.Vector3(0, 1, 0);

    this.sun = new THREE.DirectionalLight(0xffffff, 3.0);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    this.sun.shadow.bias = -0.0006;
    this.sun.shadow.normalBias = 0.35;
    this.sun.shadow.camera.near = 0.5;
    this.sun.shadow.camera.far = 620;
    this.sunTarget = new THREE.Object3D();
    scene.add(this.sun, this.sunTarget);
    this.sun.target = this.sunTarget;

    this.hemi = new THREE.HemisphereLight(0x93b6d8, 0x38341f, 0.9);
    scene.add(this.hemi);

    this.fog = new THREE.FogExp2(0x9fb4c0, 0.0016);
    scene.fog = this.fog;
    this.scene = scene;

    this.dayT = 1;
    this.nightT = 0;
    this.horizonColor = new THREE.Color();
  }

  /** 0 at midnight, 0.5 at noon. */
  get phase() { return (this.time / this.dayLength) % 1; }

  setPhase(p) { this.time = p * this.dayLength; }

  update(dt, camera, sky, opts = {}) {
    this.time += dt * (opts.timeScale ?? 1);
    const p = this.phase;
    const a = (p - 0.25) * Math.PI * 2;
    // Sun rises in the east, arcs over, sets in the west, tilted off vertical.
    this.sunDir.set(
      Math.cos(a) * Math.cos(this.axialTilt) * 0.42 + Math.sin(this.axialTilt) * 0.9,
      Math.sin(a),
      Math.cos(a) * 0.86
    ).normalize();

    const up = this.sunDir.y;
    const dayT = smoothstep(-0.13, 0.17, up);
    const duskT = Math.exp(-Math.pow((up - 0.03) * 6.5, 2));
    this.dayT = dayT;
    this.nightT = 1 - dayT;

    const atmos = opts.atmosphere ?? 1;
    const storm = opts.storm ?? 0;

    // Sun colour and strength.
    const warm = new THREE.Color().setRGB(1.0, 0.52, 0.26);
    const white = new THREE.Color().setRGB(1.0, 0.965, 0.90);
    this.sun.color.copy(white).lerp(warm, duskT * 0.9);
    this.sun.intensity = lerp(0.02, 3.4, dayT) * (1 - storm * 0.72) * lerp(1, 1.35, 1 - atmos);
    this.sun.visible = this.sun.intensity > 0.02;

    // Ambient: blue sky bounce by day, near-black at night, ash-grey in storms.
    const skyAmb = new THREE.Color().setRGB(0.30, 0.44, 0.66).lerp(new THREE.Color(0.02, 0.028, 0.05), 1 - dayT);
    const groundAmb = new THREE.Color().setRGB(0.14, 0.13, 0.075).lerp(new THREE.Color(0.012, 0.014, 0.018), 1 - dayT);
    this.hemi.color.copy(skyAmb);
    this.hemi.groundColor.copy(groundAmb);
    this.hemi.intensity = (lerp(0.10, 1.05, dayT) * (1 - storm * 0.45)) * lerp(1, 0.25, 1 - atmos);

    if (sky) {
      sky.uniforms.uSun.value.copy(this.sunDir);
      sky.uniforms.uAtmos.value = atmos;
      sky.uniforms.uStorm.value = storm;
      sky.uniforms.uStarFade.value = opts.starFade ?? 1;
      sky.uniforms.uAurora.value = opts.aurora ?? 0;
    }

    // Fog tracks the horizon so distance melts into sky instead of a grey wall.
    const dayFog = new THREE.Color(0.60, 0.70, 0.76);
    const duskFog = new THREE.Color(0.52, 0.33, 0.30);
    const nightFog = new THREE.Color(0.020, 0.028, 0.048);
    const c = new THREE.Color().copy(nightFog).lerp(dayFog, dayT).lerp(duskFog, duskT * 0.65);
    if (storm > 0) c.lerp(new THREE.Color(0.13, 0.145, 0.16), storm * 0.8);
    c.multiplyScalar(lerp(1, 0.06, 1 - atmos));
    this.horizonColor.copy(c);
    this.fog.color.copy(c);

    if (sky) {
      sky.uniforms.uTintHorizon.value.copy(c).multiplyScalar(1.15).lerp(new THREE.Color(0.85, 0.88, 0.92), dayT * 0.25);
      const zen = new THREE.Color(0.045, 0.145, 0.40).lerp(new THREE.Color(0.008, 0.012, 0.03), 1 - dayT);
      sky.uniforms.uTintDay.value.copy(zen);
    }

    // Shadow camera follows the camera, tight enough to stay sharp.
    if (camera && this.sun.visible) {
      const d = opts.shadowDistance ?? 140;
      const cam = this.sun.shadow.camera;
      if (cam.right !== d) {
        cam.left = -d; cam.right = d; cam.top = d; cam.bottom = -d;
        cam.far = d * 4.5;
        cam.updateProjectionMatrix();
      }
      const cx = camera.position.x, cy = camera.position.y, cz = camera.position.z;
      this.sunTarget.position.set(cx, cy, cz);
      this.sun.position.set(cx, cy, cz).addScaledVector(this.sunDir, d * 2.2);
      this.sunTarget.updateMatrixWorld();
    }
  }

  /** Human-readable clock, for the HUD. */
  clockString() {
    const p = this.phase;
    const h = Math.floor(p * 24), m = Math.floor((p * 24 - h) * 60);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }
}
