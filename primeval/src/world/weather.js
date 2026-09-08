// Weather, volcanoes and the things that happen whether you are there or not.

import * as THREE from 'three';
import { volcanoesNear, hotspotField, heightAt, riverField, sampleSite, BIOME } from './field.js';
import { clamp, lerp, smoothstep, hash2, rng32 } from '../math/noise.js';
import { sharedUniforms } from './shaders.js';

// ---------------------------------------------------------------------------
// rain
// ---------------------------------------------------------------------------

const RAIN_VERT = /* glsl */`
uniform float uTime;
uniform vec3 uOrigin;
uniform float uSpeed;
uniform float uBox;
uniform vec3 uWind;
attribute float aSeed;
varying float vFade;
void main() {
  vec3 p = position;
  float fall = mod(p.y - uTime * uSpeed * (0.8 + aSeed * 0.5), uBox);
  vec3 w = vec3(uOrigin.x, uOrigin.y, uOrigin.z);
  vec3 pos = vec3(p.x + w.x, fall + w.y - uBox * 0.35, p.z + w.z);
  pos.x += uWind.x * (uBox - fall) * 0.12;
  pos.z += uWind.z * (uBox - fall) * 0.12;
  vFade = smoothstep(0.0, 6.0, fall) * (1.0 - smoothstep(uBox * 0.7, uBox, fall));
  vec4 mv = viewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = clamp(90.0 / max(1.0, -mv.z), 1.0, 5.0);
}
`;

const RAIN_FRAG = /* glsl */`
precision mediump float;
uniform float uOpacity;
uniform vec3 uColor;
varying float vFade;
void main() {
  vec2 d = gl_PointCoord - 0.5;
  float a = smoothstep(0.5, 0.0, length(vec2(d.x * 3.0, d.y)));
  gl_FragColor = vec4(uColor, a * vFade * uOpacity);
}
`;

function makeRain(count, box) {
  const g = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  const seed = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (Math.random() - 0.5) * box;
    pos[i * 3 + 1] = Math.random() * box;
    pos[i * 3 + 2] = (Math.random() - 0.5) * box;
    seed[i] = Math.random();
  }
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
  g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), box * 2);
  const m = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 }, uOrigin: { value: new THREE.Vector3() },
      uSpeed: { value: 26 }, uBox: { value: box },
      uWind: { value: new THREE.Vector3(1, 0, 0.3) },
      uOpacity: { value: 0 }, uColor: { value: new THREE.Color(0.72, 0.80, 0.86) },
    },
    vertexShader: RAIN_VERT, fragmentShader: RAIN_FRAG,
    transparent: true, depthWrite: false,
  });
  const p = new THREE.Points(g, m);
  p.frustumCulled = false;
  p.renderOrder = 20;
  return p;
}

// ---------------------------------------------------------------------------
// volcanoes
// ---------------------------------------------------------------------------

const PLUME_VERT = /* glsl */`
uniform float uTime;
varying vec2 vUv;
varying float vH;
void main() {
  vUv = uv;
  vH = position.y;
  vec3 p = position;
  // The column leans downwind and widens as it climbs.
  float t = clamp(p.y / 900.0, 0.0, 1.0);
  p.x += sin(uTime * 0.09 + t * 3.0) * 60.0 * t * t + t * t * 150.0;
  p.z += cos(uTime * 0.07 + t * 2.4) * 50.0 * t * t;
  vec4 wp = modelMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

const PLUME_FRAG = /* glsl */`
precision mediump float;
varying vec2 vUv;
varying float vH;
uniform float uTime;
uniform float uIntensity;
uniform vec3 uAsh;
uniform vec3 uGlow;
float h12(vec2 p){ vec3 q = fract(vec3(p.xyx) * 0.1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }
float n2(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
  return mix(mix(h12(i), h12(i+vec2(1,0)), f.x), mix(h12(i+vec2(0,1)), h12(i+vec2(1,1)), f.x), f.y); }
float fbm(vec2 p){ float v=0.0,a=0.5; for(int i=0;i<5;i++){ v+=a*n2(p); p*=2.07; a*=0.5;} return v; }
void main(){
  float t = clamp(vH / 900.0, 0.0, 1.0);
  vec2 uv = vec2(vUv.x * 3.0, vUv.y * 2.2 - uTime * 0.035);
  float n = fbm(uv * 2.4);
  float body = smoothstep(0.36, 0.72, n) * (1.0 - t * 0.55);
  float edge = smoothstep(0.5, 0.0, abs(vUv.x - 0.5) * 2.0);
  float a = body * edge * uIntensity * (1.0 - smoothstep(0.75, 1.0, t));
  vec3 col = mix(uGlow, uAsh, smoothstep(0.0, 0.22, t));
  gl_FragColor = vec4(col, a * 0.85);
}
`;

class Volcano {
  constructor(site, scene, material) {
    this.site = site;
    this.group = new THREE.Group();
    this.group.position.set(site.cx, 0, site.cz);
    // Plume: a tall cone shell.
    const geo = new THREE.CylinderGeometry(site.radius * 0.34, site.radius * 0.13, 900, 14, 6, true);
    geo.translate(0, 450, 0);
    this.plume = new THREE.Mesh(geo, material.clone());
    this.plume.material.uniforms = THREE.UniformsUtils.clone(material.uniforms);
    this.plume.frustumCulled = false;
    this.plume.renderOrder = 15;
    this.group.add(this.plume);
    // Crater glow.
    const glowGeo = new THREE.CircleGeometry(site.radius * 0.13, 24);
    glowGeo.rotateX(-Math.PI / 2);
    this.glow = new THREE.Mesh(glowGeo, new THREE.MeshBasicMaterial({
      color: 0xff5a1e, transparent: true, opacity: 0.6,
      blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false,
    }));
    this.group.add(this.glow);
    this.light = new THREE.PointLight(0xff6a28, 0, site.radius * 3, 2);
    this.group.add(this.light);
    scene.add(this.group);
    this.erupting = 0;
    this.base = 0.28 + site.hot * 0.5;
  }
  setHeights(h) {
    this.group.position.y = h;
    this.glow.position.y = 2;
    this.light.position.y = 30;
  }
  update(dt, t, nightT, cameraY) {
    const u = this.plume.material.uniforms;
    u.uTime.value = t;
    const inten = this.base + this.erupting * 1.5;
    u.uIntensity.value = inten;
    this.glow.material.opacity = (0.22 + this.erupting * 0.7) * (0.4 + nightT * 0.8);
    this.light.intensity = (this.site.radius * 0.35) * (0.25 + this.erupting * 1.6) * (0.3 + nightT);
    this.erupting = Math.max(0, this.erupting - dt * 0.06);
  }
  dispose(scene) {
    scene.remove(this.group);
    this.plume.geometry.dispose();
    this.glow.geometry.dispose();
  }
}

// ---------------------------------------------------------------------------

export class Weather {
  constructor(scene, quality) {
    this.scene = scene;
    this.quality = quality;
    this.wind = 0.35;
    this.windDir = new THREE.Vector2(1, 0.3).normalize();
    this.storm = 0;
    this.rainAmount = 0;
    this.fogBoost = 1;
    this.fogBase = 1;
    this.lightning = 0;
    this.quake = 0;
    this.stormTimer = 90 + Math.random() * 240;
    this.stormPhase = 'clear';
    this.stormLen = 0;
    this.events = [];
    this.onThunder = null;
    this.onEvent = null;

    this.rain = makeRain(quality.particleScale > 0.8 ? 2600 : 1200, 90);
    this.rain.visible = false;
    scene.add(this.rain);

    this.plumeMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 }, uIntensity: { value: 0.6 },
        uAsh: { value: new THREE.Color(0.20, 0.19, 0.20) },
        uGlow: { value: new THREE.Color(1.0, 0.42, 0.10) },
      },
      vertexShader: PLUME_VERT, fragmentShader: PLUME_FRAG,
      transparent: true, depthWrite: false, side: THREE.DoubleSide, fog: false,
    });
    this.volcanoes = new Map();

    // Lightning is a directional flash, so it lights the whole landscape.
    this.flash = new THREE.DirectionalLight(0xdfe8ff, 0);
    this.flash.position.set(0, 400, 0);
    scene.add(this.flash);

    this.meteorTimer = 40 + Math.random() * 120;
    this.enabled = true;
  }

  /** Kick off a named world event. */
  trigger(kind, game) {
    if (kind === 'storm') {
      this.stormPhase = 'building';
      this.stormLen = 120 + Math.random() * 180;
      this.onEvent?.('storm', 'A pressure front is coming in from the west.');
    } else if (kind === 'eruption') {
      const list = [...this.volcanoes.values()];
      if (!list.length) return;
      const v = list[Math.floor(Math.random() * list.length)];
      v.erupting = 1;
      this.quake = 1;
      this.onEvent?.('eruption', 'Something enormous just cleared its throat.');
    } else if (kind === 'fog') {
      this.fogTarget = 3.2;
      this.fogTimer = 90 + Math.random() * 120;
      this.onEvent?.('fog', 'Fog rolling in off the low ground.');
    }
  }

  update(dt, game) {
    if (!this.enabled) return;
    const t = game.clock;
    const cam = game.camera.position;
    const onPlanet = game.locale.id === 'planet';

    // --- wind ---------------------------------------------------------------
    const target = 0.22 + Math.abs(Math.sin(t * 0.021)) * 0.4 + this.storm * 0.9;
    this.wind = lerp(this.wind, target, 1 - Math.exp(-dt * 0.4));
    const a = t * 0.006;
    this.windDir.set(Math.cos(a), Math.sin(a * 0.7)).normalize();
    sharedUniforms.uWind.value.set(this.windDir.x, this.wind, this.windDir.y);
    sharedUniforms.uWindGust.value = 0.22 + this.wind * 0.85;

    if (!onPlanet) {
      this.storm = 0; this.rainAmount = 0; this.rain.visible = false;
      this.flash.intensity = 0;
      game.storm = 0; game.fogBoost = 1;
      for (const [, v] of this.volcanoes) v.group.visible = false;
      return;
    }
    for (const [, v] of this.volcanoes) v.group.visible = true;

    // --- storms -------------------------------------------------------------
    this.stormTimer -= dt;
    if (this.stormPhase === 'clear' && this.stormTimer <= 0) {
      this.trigger(Math.random() < 0.72 ? 'storm' : 'fog', game);
      this.stormTimer = 240 + Math.random() * 420;
    }
    if (this.stormPhase === 'building') {
      this.storm = Math.min(1, this.storm + dt / 45);
      if (this.storm >= 1) this.stormPhase = 'peak';
    } else if (this.stormPhase === 'peak') {
      this.stormLen -= dt;
      if (this.stormLen <= 0) this.stormPhase = 'fading';
    } else if (this.stormPhase === 'fading') {
      this.storm = Math.max(0, this.storm - dt / 70);
      if (this.storm <= 0) { this.stormPhase = 'clear'; this.onEvent?.('clear', 'The rain stops. The jungle starts up again.'); }
    }
    this.rainAmount = lerp(this.rainAmount, this.storm > 0.25 ? this.storm : 0, 1 - Math.exp(-dt * 0.6));

    // Lightning while the storm is on top of you.
    this.lightning = Math.max(0, this.lightning - dt * 6);
    if (this.storm > 0.45 && Math.random() < dt * this.storm * 0.55) {
      this.lightning = 1;
      const dist = 120 + Math.random() * 2400;
      this.flash.position.set(
        cam.x + (Math.random() - 0.5) * dist, cam.y + 600, cam.z + (Math.random() - 0.5) * dist);
      this.onThunder?.(dist);
    }
    this.flash.intensity = this.lightning * this.lightning * 9.5;

    // --- fog banks ----------------------------------------------------------
    if (this.fogTimer > 0) {
      this.fogTimer -= dt;
      if (this.fogTimer <= 0) this.fogTarget = 1;
    }
    // Keep the slow-moving base separate from the per-frame modifiers, or the
    // multiply compounds every frame and the world turns into a white room.
    this.fogBase = lerp(this.fogBase ?? 1, (this.fogTarget ?? 1) * (1 + this.storm * 0.6),
      1 - Math.exp(-dt * 0.25));

    // Dawn mist in the low ground, every morning.
    const dawn = smoothstep(0.19, 0.26, game.daylight.phase) * (1 - smoothstep(0.29, 0.36, game.daylight.phase));
    const low = 1 - smoothstep(60, 420, cam.y);
    this.fogBoost = clamp(this.fogBase * (1 + dawn * low * 1.9), 0.5, 6);

    game.storm = this.storm;
    game.fogBoost = this.fogBoost;

    // --- rain ---------------------------------------------------------------
    this.rain.visible = this.rainAmount > 0.02;
    if (this.rain.visible) {
      const u = this.rain.material.uniforms;
      u.uTime.value = t;
      u.uOrigin.value.set(cam.x, cam.y, cam.z);
      u.uOpacity.value = this.rainAmount * 1.0;
      u.uWind.value.set(this.windDir.x * this.wind, 0, this.windDir.y * this.wind);
      u.uSpeed.value = 22 + this.wind * 26;
      u.uColor.value.setRGB(
        lerp(0.72, 0.30, game.daylight.nightT),
        lerp(0.80, 0.36, game.daylight.nightT),
        lerp(0.86, 0.44, game.daylight.nightT));
    }

    // --- volcanoes ----------------------------------------------------------
    this.updateVolcanoes(dt, t, game, cam);

    // --- rare events --------------------------------------------------------
    this.quake = Math.max(0, this.quake - dt * 0.35);
    if (this.quake > 0.02 && game.mode === 'ON_FOOT') game.player.addShake(this.quake * 0.06);

    this.meteorTimer -= dt;
    if (this.meteorTimer <= 0) {
      this.meteorTimer = 90 + Math.random() * 260;
      if (game.daylight.nightT > 0.6) this.onEvent?.('meteor', 'A streak of light crosses the sky and is gone.');
    }
    if (Math.random() < dt * 0.0022) this.trigger('eruption', game);
  }

  updateVolcanoes(dt, t, game, cam) {
    const near = volcanoesNear(cam.x, cam.z, 26000);
    const wanted = new Set();
    for (const s of near) {
      const key = `${Math.round(s.cx)},${Math.round(s.cz)}`;
      wanted.add(key);
      if (!this.volcanoes.has(key)) {
        const v = new Volcano(s, this.scene, this.plumeMaterial);
        v.setHeights(heightAt(s.cx, s.cz));
        this.volcanoes.set(key, v);
      }
    }
    for (const [key, v] of this.volcanoes) {
      if (!wanted.has(key)) { v.dispose(this.scene); this.volcanoes.delete(key); continue; }
      v.update(dt, t, game.daylight.nightT, cam.y);
    }
  }

  /** Ambience mix for the audio system. */
  audioState(game) {
    const cam = game.camera.position;
    const onPlanet = game.locale.id === 'planet';
    let river = 0, volcano = 0;
    if (onPlanet) {
      river = clamp(riverField(cam.x, cam.z) * 1.6, 0, 1);
      let best = 0;
      for (const [, v] of this.volcanoes) {
        const d = Math.hypot(v.site.cx - cam.x, v.site.cz - cam.z);
        best = Math.max(best, (1 - smoothstep(300, 6000, d)) * (0.3 + v.erupting));
      }
      volcano = best;
    }
    const night = game.daylight.nightT;
    const biome = onPlanet ? sampleSite(cam.x, cam.z).biome : -1;
    const lush = biome === BIOME.JUNGLE || biome === BIOME.SWAMP ? 1 : biome === BIOME.PLAINS ? 0.5 : 0.15;
    return {
      wind: this.wind,
      rain: this.rainAmount,
      river,
      volcano,
      quake: this.quake,
      insects: onPlanet ? lush * (1 - night) * (1 - this.rainAmount * 0.8) : 0,
      nightChorus: onPlanet ? lush * night * (1 - this.rainAmount * 0.7) : 0,
    };
  }
}
