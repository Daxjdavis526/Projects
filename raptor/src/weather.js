// Dynamic weather: presets, precipitation, lightning, and the handling
// consequences (turbulence, wind, reduced visibility).

import * as THREE from 'three';
import { origin } from './world.js';

const clamp = (x, a, b) => x < a ? a : x > b ? b : x;

export const PRESETS = {
  clear:    { name: 'Clear',        cloudCover: 0.10, stormCells: 0, haze: 0.35, humidity: 0.30, rain: 0, snow: 0, turbulence: 0.10, windSpeed: 4,  jetSpeed: 32, overcast: 0.0, visibility: 140000 },
  few:      { name: 'Few clouds',   cloudCover: 0.38, stormCells: 0, haze: 0.55, humidity: 0.55, rain: 0, snow: 0, turbulence: 0.20, windSpeed: 7,  jetSpeed: 42, overcast: 0.05, visibility: 95000 },
  broken:   { name: 'Broken',       cloudCover: 0.66, stormCells: 0.10, haze: 0.75, humidity: 0.72, rain: 0, snow: 0, turbulence: 0.32, windSpeed: 10, jetSpeed: 48, overcast: 0.18, visibility: 55000 },
  overcast: { name: 'Overcast',     cloudCover: 0.92, stormCells: 0.05, haze: 0.95, humidity: 0.85, rain: 0.08, snow: 0, turbulence: 0.30, windSpeed: 12, jetSpeed: 52, overcast: 0.55, visibility: 22000 },
  rain:     { name: 'Rain',         cloudCover: 0.95, stormCells: 0.25, haze: 1.30, humidity: 0.96, rain: 0.65, snow: 0, turbulence: 0.45, windSpeed: 15, jetSpeed: 55, overcast: 0.72, visibility: 9000 },
  storm:    { name: 'Thunderstorm', cloudCover: 0.98, stormCells: 0.85, haze: 1.60, humidity: 1.00, rain: 1.00, snow: 0, turbulence: 0.90, windSpeed: 22, jetSpeed: 62, overcast: 0.85, visibility: 4500 },
  snow:     { name: 'Snow',         cloudCover: 0.90, stormCells: 0.10, haze: 1.20, humidity: 0.90, rain: 0, snow: 0.75, turbulence: 0.35, windSpeed: 9,  jetSpeed: 45, overcast: 0.70, visibility: 6000 },
};

const RAIN_COUNT = 2600;

export class Weather {
  constructor(scene, wind) {
    this.wind = wind;
    this.preset = 'few';
    this.target = { ...PRESETS.few };
    Object.assign(this, PRESETS.few);
    this.flash = 0;
    this.dynamic = true;
    this._nextChange = 240 + Math.random() * 360;
    this._nextStrike = 4;
    this.lastStrike = null;
    this.temperatureOffset = 0;

    // --- precipitation: instanced streaks that live around the camera ---
    const geo = new THREE.InstancedBufferGeometry();
    const q = new THREE.PlaneGeometry(1, 1);
    geo.index = q.index;
    geo.attributes.position = q.attributes.position;
    geo.attributes.uv = q.attributes.uv;
    this.rainPos = new Float32Array(RAIN_COUNT * 3);
    for (let i = 0; i < RAIN_COUNT; i++) {
      this.rainPos[i * 3] = (Math.random() - 0.5) * 140;
      this.rainPos[i * 3 + 1] = (Math.random() - 0.5) * 120;
      this.rainPos[i * 3 + 2] = (Math.random() - 0.5) * 140;
    }
    geo.setAttribute('iPos', new THREE.InstancedBufferAttribute(this.rainPos, 3));
    geo.instanceCount = 0;
    this.rainMat = new THREE.ShaderMaterial({
      uniforms: {
        uStreak: { value: new THREE.Vector3(0, -1, 0) },
        uLen: { value: 3.0 },
        uOpacity: { value: 0 },
        uColor: { value: new THREE.Color(0.72, 0.78, 0.88) },
        uSnow: { value: 0 },
      },
      vertexShader: `
        attribute vec3 iPos;
        varying vec2 vUv; varying float vD;
        uniform vec3 uStreak; uniform float uLen; uniform float uSnow;
        void main(){
          vUv = uv;
          vec3 wp = iPos;
          vec4 mv = modelViewMatrix * vec4(wp, 1.0);
          vec3 sv = (modelViewMatrix * vec4(uStreak, 0.0)).xyz;
          vec3 dir = normalize(sv);
          vec3 side = normalize(cross(dir, vec3(0.0,0.0,1.0)));
          float w = mix(0.035, 0.13, uSnow);
          mv.xyz += dir * (uv.y - 0.5) * uLen + side * (uv.x - 0.5) * w;
          vD = -mv.z;
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: `
        precision highp float;
        varying vec2 vUv; varying float vD;
        uniform float uOpacity; uniform vec3 uColor; uniform float uSnow;
        void main(){
          float a = smoothstep(0.0,0.25,vUv.y) * smoothstep(1.0,0.75,vUv.y);
          a *= mix(1.0, smoothstep(0.5, 0.0, length(vUv - 0.5)), uSnow);
          a *= uOpacity * smoothstep(120.0, 12.0, vD);
          gl_FragColor = vec4(uColor, a);
        }`,
      transparent: true, depthWrite: false,
    });
    this.rain = new THREE.Mesh(geo, this.rainMat);
    this.rain.frustumCulled = false;
    this.rain.renderOrder = 20;
    scene.add(this.rain);
    this.rainGeo = geo;

    // --- lightning flash light ---
    this.flashLight = new THREE.PointLight(0xdfe8ff, 0, 20000, 1.6);
    scene.add(this.flashLight);
    this._flashDecay = 0;
  }

  set(presetName) {
    if (!PRESETS[presetName]) return;
    this.preset = presetName;
    this.target = { ...PRESETS[presetName] };
  }

  update(dt, camWorld, aircraftAlt, audio) {
    // drift toward the target preset so weather changes are never a hard cut
    const k = clamp(dt * 0.25, 0, 1);
    for (const key of ['cloudCover', 'stormCells', 'haze', 'humidity', 'rain', 'snow',
      'turbulence', 'windSpeed', 'jetSpeed', 'overcast', 'visibility']) {
      this[key] += (this.target[key] - this[key]) * k;
    }
    this.wind.surfaceSpeed = this.windSpeed;
    this.wind.jetSpeed = this.jetSpeed;
    this.wind.turbulence = this.turbulence;

    if (this.dynamic) {
      this._nextChange -= dt;
      if (this._nextChange <= 0) {
        this._nextChange = 300 + Math.random() * 600;
        const keys = Object.keys(PRESETS);
        this.set(keys[Math.floor(Math.random() * keys.length)]);
      }
    }

    // --- lightning ---
    this._flashDecay = Math.max(0, this._flashDecay - dt * 6.5);
    this.flash = this._flashDecay * this._flashDecay;
    this.flashLight.intensity = this.flash * 9000;
    if (this.stormCells > 0.3) {
      this._nextStrike -= dt;
      if (this._nextStrike <= 0) {
        this._nextStrike = 2.5 + Math.random() * 14 * (1.1 - this.stormCells);
        const ang = Math.random() * Math.PI * 2;
        const d = 1200 + Math.random() * 22000;
        const p = new THREE.Vector3(camWorld.x + Math.cos(ang) * d, 3800, camWorld.z + Math.sin(ang) * d);
        this.strike(p, camWorld, audio);
      }
    }

    // --- precipitation particles ---
    const amount = Math.max(this.rain, this.snow);
    const active = amount > 0.03 && aircraftAlt < 7000;
    this.rainGeo.instanceCount = active ? Math.floor(RAIN_COUNT * amount) : 0;
    if (active) {
      this.rain.position.set(camWorld.x - origin.x, camWorld.y - origin.y, camWorld.z - origin.z);
      this.rainMat.uniforms.uOpacity.value = amount * 0.55;
      this.rainMat.uniforms.uSnow.value = this.snow > this.rain ? 1 : 0;
      this.rainMat.uniforms.uLen.value = this.snow > this.rain ? 0.5 : 3.0;
    }
  }

  /** Streak direction depends on how fast you are moving through the rain. */
  setStreak(velocity) {
    const fall = this.snow > this.rain ? 1.4 : 9.0;
    const v = new THREE.Vector3(-velocity.x, -velocity.y - fall, -velocity.z);
    const len = v.length();
    this.rainMat.uniforms.uStreak.value.copy(v).normalize();
    this.rainMat.uniforms.uLen.value = clamp(len * 0.045, 0.4, 14) * (this.snow > this.rain ? 0.3 : 1);
  }

  strike(pos, listener, audio) {
    this._flashDecay = 1.0;
    this.flashLight.position.set(pos.x - origin.x, pos.y - origin.y, pos.z - origin.z);
    this.lastStrike = { pos: pos.clone(), t: 0 };
    if (audio && audio.ready) {
      const d = pos.distanceTo(listener);
      const delay = d / 340.29;
      setTimeout(() => {
        audio.thump(clamp(1.6 - d / 16000, 0.06, 1));
        if (d < 5000) audio.playBoom(clamp(0.8 - d / 7000, 0.05, 0.8));
      }, Math.min(delay * 1000, 30000));
    }
  }

  /** Fog colour and density for the current conditions. */
  fogParams(sky) {
    const vis = this.visibility;
    return { near: vis * 0.12, far: vis };
  }
}
