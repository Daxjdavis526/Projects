// Sky: analytic Rayleigh + Mie scattering, sun, moon, stars, and the lights
// that drive the rest of the scene. Above ~15 km the sky darkens toward space
// because the optical depth above the camera collapses.

import * as THREE from 'three';

const VERT = /* glsl */`
varying vec3 vDir;
void main() {
  vDir = normalize(position);
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_Position.z = gl_Position.w;      // force to the far plane
}`;

const FRAG = /* glsl */`
precision highp float;
varying vec3 vDir;
uniform vec3 uSun;          // direction to the sun
uniform vec3 uMoon;
uniform float uAlt;         // camera altitude, metres
uniform float uMoonPhase;
uniform float uHaze;        // weather-driven turbidity 0..2
uniform float uOvercast;    // 0..1 grey-out
uniform float uTime;

const vec3 BETA_R = vec3(5.8e-6, 13.5e-6, 33.1e-6);
const vec3 BETA_M = vec3(21e-6);

float rayleighPhase(float c) { return 3.0 / (16.0 * 3.14159265) * (1.0 + c * c); }
float miePhase(float c, float g) {
  float g2 = g * g;
  return 3.0 / (8.0 * 3.14159265) * ((1.0 - g2) * (1.0 + c * c)) /
         ((2.0 + g2) * pow(1.0 + g2 - 2.0 * g * c, 1.5));
}

float hash13(vec3 p) {
  p = fract(p * 0.1031);
  p += dot(p, p.yzx + 33.33);
  return fract((p.x + p.y) * p.z);
}

// Star field: hashed cells on the sphere, only the brightest cells lit.
vec3 stars(vec3 d) {
  vec3 g = d * 220.0;
  vec3 c = floor(g);
  float h = hash13(c);
  if (h < 0.985) return vec3(0.0);
  vec3 off = vec3(hash13(c + 1.7), hash13(c + 3.1), hash13(c + 5.3)) - 0.5;
  float dist = length(fract(g) - 0.5 - off * 0.5);
  float mag = (h - 0.985) / 0.015;
  float i = smoothstep(0.16, 0.0, dist) * pow(mag, 2.2);
  // a little colour spread, blue-white to amber
  vec3 tint = mix(vec3(0.75, 0.83, 1.0), vec3(1.0, 0.86, 0.7), hash13(c + 9.1));
  float twinkle = 0.82 + 0.18 * sin(uTime * 2.7 + h * 90.0);
  return tint * i * 2.4 * twinkle;
}

void main() {
  vec3 dir = normalize(vDir);
  float cosSun = dot(dir, uSun);

  // Air above the camera thins out with altitude, so the whole sky fades
  // toward black as you climb.
  float scale = exp(-uAlt / 8400.0);
  float path = 1.0 / (max(dir.y, -0.04) + 0.09);

  vec3 betaR = BETA_R * (1.0 + uHaze * 0.10);
  vec3 betaM = BETA_M * (0.5 + uHaze);

  // Optical depths: Rayleigh over a scale height of 8.4 km, Mie over ~1.2 km.
  vec3 tauView = (betaR * 8400.0 + betaM * 1200.0) * path * scale;
  float sunPath = 1.0 / (max(uSun.y, 0.0) + 0.09);
  vec3 tauSun = (betaR * 8400.0 + betaM * 1200.0) * sunPath * scale;
  vec3 sunAtten = exp(-tauSun);

  vec3 scatterR = betaR * 8400.0 * path * scale * rayleighPhase(cosSun);
  vec3 scatterM = betaM * 1200.0 * path * scale * miePhase(cosSun, 0.76);
  vec3 col = (scatterR + scatterM) * sunAtten * 26.0;

  // crude multiple scattering so the horizon does not go black at dusk
  col += betaR * 8400.0 * path * scale * sunAtten * clamp(uSun.y + 0.12, 0.0, 1.0) * 3.2;

  // moonlight, same machinery, far dimmer and cooler
  float cosMoon = dot(dir, uMoon);
  float moonUp = clamp(uMoon.y + 0.05, 0.0, 1.0);
  col += betaR * 8400.0 * path * scale * rayleighPhase(cosMoon)
         * moonUp * uMoonPhase * 0.42;

  // sun and moon discs, dimmed by the same extinction
  float sunDisc = smoothstep(0.99965, 0.99992, cosSun);
  col += vec3(1.0, 0.95, 0.88) * sunDisc * 55.0 * sunAtten;
  float moonDisc = smoothstep(0.99955, 0.99988, cosMoon);
  col += vec3(0.88, 0.90, 0.95) * moonDisc * 2.4 * uMoonPhase;

  // stars: out at night, and always there in the black above the atmosphere
  float sunUp = clamp(uSun.y + 0.10, 0.0, 1.0);
  float night = clamp(1.0 - sunUp * 4.0, 0.0, 1.0);
  float thin = smoothstep(11000.0, 26000.0, uAlt);
  float starVis = max(night, thin * 0.9) * smoothstep(-0.04, 0.05, dir.y + 0.04);
  col += stars(dir) * starVis;

  // ground haze band just below the horizon
  float below = smoothstep(0.03, -0.09, dir.y);
  vec3 hazeCol = mix(vec3(0.55, 0.61, 0.70), vec3(0.03, 0.04, 0.07), night);
  col = mix(col, hazeCol * (0.30 + 0.70 * sunUp), below * 0.85 * exp(-uAlt / 9000.0));

  // overcast flattens everything toward a lit grey
  vec3 grey = vec3(0.40, 0.42, 0.46) * (0.12 + 0.88 * sunUp);
  col = mix(col, grey, uOvercast * (1.0 - thin));

  col = vec3(1.0) - exp(-col * 1.25);
  gl_FragColor = vec4(pow(col, vec3(1.0 / 2.2)), 1.0);
}`;

export class Sky {
  constructor(scene) {
    this.uniforms = {
      uSun: { value: new THREE.Vector3(0.4, 0.5, 0.6).normalize() },
      uMoon: { value: new THREE.Vector3(-0.4, 0.3, -0.6).normalize() },
      uAlt: { value: 0 },
      uMoonPhase: { value: 0.7 },
      uHaze: { value: 0.5 },
      uOvercast: { value: 0 },
      uTime: { value: 0 },
    };
    const geo = new THREE.SphereGeometry(1, 48, 32);
    const mat = new THREE.ShaderMaterial({
      vertexShader: VERT, fragmentShader: FRAG, uniforms: this.uniforms,
      side: THREE.BackSide, depthWrite: false, depthTest: false, fog: false,
    });
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.renderOrder = -1000;
    this.mesh.frustumCulled = false;
    scene.add(this.mesh);

    this.sunLight = new THREE.DirectionalLight(0xfff3e2, 3.0);
    this.sunLight.position.set(0, 1, 0);
    scene.add(this.sunLight);
    scene.add(this.sunLight.target);

    this.moonLight = new THREE.DirectionalLight(0x9fb6e0, 0.0);
    scene.add(this.moonLight);

    this.ambient = new THREE.HemisphereLight(0x8fb4e8, 0x4a4238, 0.75);
    scene.add(this.ambient);

    this.sunDir = this.uniforms.uSun.value;
    this.moonDir = this.uniforms.uMoon.value;
  }

  /**
   * @param timeOfDay hours 0..24
   * @param latitude  degrees, for the solar declination
   * @param dayOfYear 1..365
   */
  update(timeOfDay, latitude, dayOfYear, altitude, weather, t) {
    const decl = 23.44 * Math.PI / 180 * Math.sin(2 * Math.PI * (dayOfYear - 81) / 365);
    const lat = latitude * Math.PI / 180;
    const H = (timeOfDay - 12) * 15 * Math.PI / 180;   // hour angle
    const sinAlt = Math.sin(lat) * Math.sin(decl) + Math.cos(lat) * Math.cos(decl) * Math.cos(H);
    const alt = Math.asin(Math.max(-1, Math.min(1, sinAlt)));
    const az = Math.atan2(-Math.sin(H) * Math.cos(decl),
      Math.cos(lat) * Math.sin(decl) - Math.sin(lat) * Math.cos(decl) * Math.cos(H));
    // world axes: x east, y up, z south -> north is -z
    this.sunDir.set(Math.sin(az + Math.PI) * Math.cos(alt), Math.sin(alt),
      -Math.cos(az + Math.PI) * Math.cos(alt)).normalize();

    // moon: a simple retrograde offset from the sun, good enough to look right
    const mAng = (timeOfDay - 12 + 11.5) * 15 * Math.PI / 180;
    const mAlt = Math.asin(Math.max(-1, Math.min(1,
      Math.sin(lat) * Math.sin(-decl * 0.6) + Math.cos(lat) * Math.cos(-decl * 0.6) * Math.cos(mAng))));
    this.moonDir.set(Math.sin(mAng + Math.PI) * Math.cos(mAlt), Math.sin(mAlt),
      -Math.cos(mAng + Math.PI) * Math.cos(mAlt)).normalize();

    this.uniforms.uAlt.value = altitude;
    this.uniforms.uHaze.value = weather ? weather.haze : 0.5;
    this.uniforms.uOvercast.value = weather ? weather.overcast : 0;
    this.uniforms.uTime.value = t;

    const up = Math.max(0, this.sunDir.y);
    const civil = Math.max(0, Math.min(1, (this.sunDir.y + 0.10) / 0.20));
    this.sunLight.position.copy(this.sunDir).multiplyScalar(1000);
    this.sunLight.intensity = 3.4 * Math.pow(up, 0.45) * (1 - 0.55 * (weather ? weather.overcast : 0));
    // warm the sunlight as it drops toward the horizon
    const warm = Math.pow(1 - Math.min(1, up * 3), 2);
    this.sunLight.color.setRGB(1, 0.96 - warm * 0.30, 0.90 - warm * 0.62);

    this.moonLight.position.copy(this.moonDir).multiplyScalar(1000);
    this.moonLight.intensity = 0.22 * Math.max(0, this.moonDir.y) * (1 - civil);

    const ambDay = 0.10 + 0.85 * Math.pow(up, 0.5);
    this.ambient.intensity = ambDay + 0.05;
    this.ambient.color.setRGB(0.45 + 0.35 * civil, 0.58 + 0.28 * civil, 0.80 + 0.15 * civil);
    this.ambient.groundColor.setRGB(0.20 + 0.20 * civil, 0.18 + 0.18 * civil, 0.15 + 0.14 * civil);

    this.isNight = this.sunDir.y < -0.06;
    this.sunElevation = alt;
  }

  /** Keep the dome locked to the camera. */
  follow(camera) {
    this.mesh.position.copy(camera.position);
    const scale = camera.far * 0.9;
    this.mesh.scale.setScalar(scale);
  }
}
