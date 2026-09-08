// The game shell: owns the scene, the clock, the active locale and the mode
// the player is currently living inside.

import * as THREE from 'three';
import { PLANET, MOON, PLAYER, KEYS } from './config.js';
import { Renderer } from './render.js';
import { Input } from './input.js';
import { Terrain } from './world/terrain.js';
import { Sky, CelestialBody, Daylight } from './world/sky.js';
import { sharedUniforms } from './world/shaders.js';
import {
  heightAt, waterAt, sampleSite, findLandingSite, BIOME, BIOME_NAME, temperatureAt,
} from './world/field.js';
import { Player } from './player/player.js';
import { Colliders } from './player/physics.js';
import { clamp, lerp, smoothstep } from './math/noise.js';

export const MODE = {
  ON_FOOT: 'ON_FOOT',
  SHIP: 'SHIP',
  MECH: 'MECH',
};

export class Game {
  constructor(canvas, quality, hud) {
    this.quality = quality;
    this.hud = hud;
    this.renderer = new Renderer(canvas, quality);
    this.camera = this.renderer.camera;
    this.input = new Input(canvas);
    this.scene = new THREE.Scene();
    this.scene.matrixAutoUpdate = true;

    this.clock = 0;
    this.paused = false;
    this.mode = MODE.ON_FOOT;
    this.timeScale = 1;

    this.colliders = new Colliders();
    this.player = new Player(this.camera, this.colliders);

    this.sky = new Sky(this.scene);
    this.daylight = new Daylight(this.scene, { dayLength: PLANET.dayLength });
    this.terrain = new Terrain(this.scene, quality);

    // The two worlds that hang in each other's sky.
    this.planetBody = new CelestialBody(this.scene, { kind: 'planet', angularRadius: 0.012, distance: 30000 });
    this.moonBody = new CelestialBody(this.scene, { kind: 'moon', angularRadius: 0.006, distance: 30000 });

    this.systems = [];          // objects with update(dt, game)
    this.locale = null;
    this.atmosphere = 1;
    this.storm = 0;
    this.landingSite = null;
    this.flashlight = null;
    this._fpsAcc = 0; this._fpsN = 0; this._fpsT = 0;
    this.stats = {};
    this.marks = [];
    this.events = new Map();
  }

  on(name, fn) {
    if (!this.events.has(name)) this.events.set(name, []);
    this.events.get(name).push(fn);
  }
  emit(name, ...args) {
    const l = this.events.get(name);
    if (l) for (const f of l) f(...args);
  }

  // --- locales -------------------------------------------------------------

  planetLocale() {
    return {
      id: 'planet',
      name: PLANET.name,
      gravity: PLANET.gravity,
      curveRadius: PLANET.curveRadius,
      dayLength: PLANET.dayLength,
      heightAt: (x, z) => heightAt(x, z),
      waterAt: (x, z) => waterAt(x, z),
      hasAtmosphere: true,
    };
  }

  setLocale(loc) {
    this.locale = loc;
    sharedUniforms.uCurveRadius.value = loc.curveRadius;
    this.daylight.dayLength = loc.dayLength;
  }

  // --- boot ----------------------------------------------------------------

  async load(progress) {
    const step = async (p, label, fn) => {
      progress(p, label);
      await new Promise(r => setTimeout(r, 0));
      if (fn) fn();
    };

    await step(0.06, 'surveying thera');
    this.setLocale(this.planetLocale());
    this.landingSite = findLandingSite(1180, 240, BIOME.JUNGLE);

    await step(0.16, 'raising terrain');
    this.renderer.attach(this.scene);

    const s = this.landingSite;
    this.player.setPosition(s.x, s.h + 1.0, s.z);
    this.player.yaw = 2.1;

    sharedUniforms.uCurveOrigin.value.set(s.x, 0, s.z);
    this.terrain.setViewDistance(9000);
    await step(0.30, 'building terrain patches');
    this.terrain.flush(s.x, s.z, 220);

    await step(0.55, 'lighting the sky');
    this.daylight.setPhase(0.30);
    this.daylight.update(0, this.camera, this.sky, { atmosphere: 1 });

    // Flashlight lives on the camera and is off until you need it.
    this.flashlight = new THREE.SpotLight(0xffeecc, 0, 62, 0.42, 0.45, 1.1);
    this.flashlight.position.set(0, 0, 0);
    this.flashlight.target.position.set(0, 0, -1);
    this.camera.add(this.flashlight, this.flashlight.target);
    this.scene.add(this.camera);

    await step(0.75, 'seeding life');
    for (const sys of this.systems) if (sys.load) await sys.load(this);

    await step(0.95, 'final checks');
    this.warmup();
    await step(1.0, 'ready');
  }

  /** Compile shaders before the first visible frame so it does not hitch. */
  warmup() {
    try { this.renderer.renderer.compile(this.scene, this.camera); } catch (e) { /* non-fatal */ }
  }

  addSystem(sys) { this.systems.push(sys); return sys; }

  // --- frame ---------------------------------------------------------------

  update(dt) {
    const input = this.input;
    this.clock += dt;
    sharedUniforms.uTime.value = this.clock;

    const p = this.player;
    const onFoot = this.mode === MODE.ON_FOOT;

    p.look(input, dt);
    if (onFoot) {
      p.update(dt, input, this.locale, { survival: this.locale.id === 'planet' });
    }

    // Curvature pivots on the camera, so the ground under your feet is flat and
    // everything far away bends away from you.
    const cam = this.camera.position;
    sharedUniforms.uCurveOrigin.value.set(cam.x, 0, cam.z);

    // Atmosphere thins with altitude; drives sky, fog and engine behaviour.
    const alt = cam.y;
    this.atmosphere = this.locale.hasAtmosphere
      ? clamp(1 - smoothstep(1500, PLANET.atmosphereTop, alt), 0, 1)
      : 0;

    this.daylight.update(dt * this.timeScale, this.camera, this.sky, {
      atmosphere: this.atmosphere,
      storm: this.storm,
      shadowDistance: this.quality.shadowDistance,
      starFade: 1,
      aurora: this.auroraStrength ?? 0,
    });
    // Fog thins as the air does, and clears entirely in vacuum.
    const baseDensity = this.locale.id === 'planet' ? 0.00088 : 0.0;
    this.daylight.fog.density = baseDensity * Math.pow(this.atmosphere, 1.6) * (1 + this.storm * 2.4)
      * (this.fogBoost ?? 1);

    this.sky.update(this.camera, this.clock);

    for (const sys of this.systems) if (sys.update) sys.update(dt, this);

    this.terrain.setViewDistance(this.viewDistanceFor(alt));
    this.terrain.update(cam.x, cam.z, dt);

    this.updateCelestials();
    this.updateHud(dt);

    input.endFrame();
  }

  viewDistanceFor(alt) {
    if (this.locale.id !== 'planet' && this.locale.id !== 'moon') return 9000;
    const base = 4200 * this.quality.terrainRange;
    return clamp(base + alt * 12, base, 130000);
  }

  updateCelestials() {
    const sun = this.daylight.sunDir;
    if (this.locale.id === 'planet') {
      this.planetBody.visible = false;
      this.moonBody.visible = true;
      // ANVIL rides a slower arc than the sun, so it is sometimes up in daylight.
      const a = this.clock * 0.0031 + 1.9;
      this.moonBody.setDirection(new THREE.Vector3(Math.cos(a) * 0.8, Math.sin(a) * 0.62 + 0.18, Math.sin(a * 0.7) * 0.6));
      this.moonBody.setAngularRadius(0.0075);
    } else {
      this.moonBody.visible = false;
      this.planetBody.visible = true;
    }
    this.planetBody.update(this.camera, sun, this.clock);
    this.moonBody.update(this.camera, sun, this.clock);
  }

  updateHud(dt) {
    const hud = this.hud, p = this.player;
    hud.vitals(p);
    hud.tickSubtitle(dt);
    hud.tickLogs(performance.now());

    const cam = this.camera.position;
    if (this.locale.id === 'planet') {
      const site = this._siteCache && this._siteAge < 0.35
        ? this._siteCache
        : (this._siteCache = sampleSite(cam.x, cam.z), this._siteAge = 0, this._siteCache);
      this._siteAge = (this._siteAge ?? 0) + dt;
      const tC = Math.round(-8 + temperatureAt(cam.x, cam.z, site.h) * 46 - this.daylight.nightT * 9);
      hud.status({
        time: this.daylight.clockString(),
        biome: BIOME_NAME[site.biome],
        alt: `${Math.round(cam.y)} m`,
        temp: `${tC} C`,
        grid: `${Math.round(cam.x / 100)}, ${Math.round(cam.z / 100)}`,
      });
    }

    let yawDeg = (-this.player.yaw * 180 / Math.PI) % 360;
    if (this.mode === MODE.SHIP && this.ship) yawDeg = this.ship.headingDeg;
    if (yawDeg < 0) yawDeg += 360;
    hud.compass(yawDeg, this.marks);

    this._fpsAcc += dt; this._fpsN++;
    if (this._fpsAcc > 0.5) {
      const fps = this._fpsN / this._fpsAcc;
      const info = this.renderer.info;
      hud.fps(`${fps.toFixed(0)} fps · ${info.render.calls} calls · ${(info.render.triangles / 1000).toFixed(0)}k tris · ${this.terrain.stats.built} patches`);
      this._fpsAcc = 0; this._fpsN = 0;
    }

    // Post-grade responds to what is happening to the player.
    const g = this.renderer.grade.uniforms;
    g.uDamage.value = lerp(g.uDamage.value, p.damageFlash, 0.4);
    g.uHeat.value = lerp(g.uHeat.value, this.heatShimmer ?? 0, 0.12);
    g.uDesat.value = lerp(g.uDesat.value, p.alive ? (p.health < 30 ? 0.35 : 0) : 0.85, 0.06);
    g.uVignette.value = lerp(g.uVignette.value, 0.86 + (1 - clamp(p.health / 100, 0, 1)) * 0.5, 0.1);
  }

  render() {
    this.renderer.render(this.clock);
  }
}
