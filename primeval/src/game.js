// The game shell: owns the scene, the clock, the active locale and the mode
// the player is currently living inside.

import * as THREE from 'three';
import { PLANET, MOON, PLAYER, KEYS, SHIP } from './config.js';
import { Renderer } from './render.js';
import { Input } from './input.js';
import { Terrain, THERA_SAMPLER } from './world/terrain.js';
import { bakeTextures } from './world/textures.js';
import { MOON_LOCALE, ANVIL_SAMPLER } from './world/moon.js';
import { Sky, CelestialBody, Daylight } from './world/sky.js';
import { sharedUniforms } from './world/shaders.js';
import {
  heightAt, waterAt, sampleSite, findLandingSite, BIOME, BIOME_NAME, temperatureAt,
} from './world/field.js';
import { Player } from './player/player.js';
import { Colliders } from './player/physics.js';
import { Inventory } from './player/inventory.js';
import { Gear } from './player/gear.js';
import { Effects } from './fx.js';
import { Missions } from './missions.js';
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
    this.inventory = new Inventory();
    this.gear = null;
    this.invOpen = false;

    this.sky = new Sky(this.scene);
    this.daylight = new Daylight(this.scene, { dayLength: PLANET.dayLength });
    // Textures are baked on the GPU before anything that uses them is built.
    this.textures = bakeTextures(this.renderer.renderer);
    this.terrain = new Terrain(this.scene, quality, THERA_SAMPLER, this.textures);

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

  /**
   * Move the whole game between THERA and ANVIL: swap the terrain sampler,
   * switch the surface systems on or off, and re-light the sky.
   */
  switchLocale(id, opts = {}) {
    if (this.locale && this.locale.id === id) return;
    const to = id === 'moon' ? MOON_LOCALE : this.planetLocale();
    this.setLocale(to);
    this.terrain.setSampler(id === 'moon' ? ANVIL_SAMPLER : THERA_SAMPLER);
    // The sun's position is per-world; keep a separate clock for each.
    if (id === 'moon') {
      this._theraTime = this.daylight.time;
      // Chosen so ANVIL's sun sits about 13 degrees up and behind you: long
      // shadows across the craters, and a nearly full THERA in the window.
      this.daylight.time = this._anvilTime ?? (0.72 * MOON_LOCALE.dayLength);
    } else {
      this._anvilTime = this.daylight.time;
      this.daylight.time = this._theraTime ?? (0.30 * PLANET.dayLength);
    }
    this.surfaceLife = id === 'planet';
    this.emit('localeChanged', id, opts);
  }

  /** Build the surface systems out to full range right now. */
  flushSurface(x, z) {
    this.terrain.flush(x, z, 260);
    if (this.veg) {
      this.veg.origin.set(1e9, 0, 1e9);
      this.veg.update(0, x, z, this.camera.position.y);
      let guard = 0;
      while (this.veg.job && guard++ < 400) this.veg._stepJob();
    }
    if (this.water) {
      this.water.riverOrigin.set(1e9, 0, 1e9);
      this.water.update(0, x, z);
      let guard = 0;
      while (this.water.job && guard++ < 200) this.water._stepJob();
    }
    if (this.poi) { this.poi.origin.set(1e9, 0, 1e9); this.poi.update(0, x, z); }
  }

  // --- boot ----------------------------------------------------------------

  async load(progress) {
    const step = async (p, label, fn) => {
      progress(p, label);
      await new Promise(r => setTimeout(r, 0));
      if (fn) fn();
    };

    await step(0.05, 'surveying thera');
    // ?x=&z= drops you straight onto THERA, ?t= sets the hour (0..1). Used for
    // shooting screenshots of places that are a long walk away.
    const qp = new URLSearchParams(location.search);
    const qx = parseFloat(qp.get('x')), qz = parseFloat(qp.get('z'));
    this.debugSurface = Number.isFinite(qx) && Number.isFinite(qz);
    this.setLocale(this.planetLocale());
    this.landingSite = this.debugSurface
      ? { x: qx, z: qz, h: heightAt(qx, qz), biome: -1 }
      : findLandingSite(1180, 240, BIOME.JUNGLE);
    this.debugPhase = parseFloat(qp.get('t'));

    await step(0.14, 'starting renderer');
    this.renderer.attach(this.scene);
    this.fx = new Effects(this.scene, this.camera);
    // The sky is the only light source with any colour in it, so it is also
    // the environment map. Without one, every metal in the game — hull, mech,
    // rifle — renders as flat grey.
    this.pmrem = new THREE.PMREMGenerator(this.renderer.renderer);
    this.pmrem.compileEquirectangularShader();
    this.envScene = new THREE.Scene();
    this.envAge = 99;

    // Flashlight rides the camera and is off until you need it.
    this.flashlight = new THREE.SpotLight(0xffeecc, 0, 85, 0.46, 0.42, 1.35);
    // Mounted ahead of the viewmodel: at the camera origin it lights the bow
    // in your hands to a white blob and nothing else.
    this.flashlight.position.set(0.10, -0.10, -1.05);
    this.flashlight.target.position.set(0.10, -0.35, -14);
    this.camera.add(this.flashlight, this.flashlight.target);
    this.scene.add(this.camera);

    await step(0.26, 'raising anvil station');
    for (const sys of this.systems) if (sys.load) await sys.load(this);

    await step(0.50, 'checking equipment');
    this.gear = new Gear(this);
    this.inventory.add('arrow', 24);
    this.inventory.add('meat_cooked', 2);
    this.gear.equip(1);
    this.missions = new Missions(this);
    this.bindHud();

    await step(0.60, 'boarding');
    if (this.debugSurface) {
      // Debug entry: straight onto the planet, next to the ship.
      const s0 = this.landingSite;
      this.player.setPosition(s0.x, s0.h + 1.0, s0.z);
      this.player.yaw = 2.1;
      this.ship?.placeOn(s0.x + 26, s0.z + 8, this.locale, 1.2);
      this.surfaceLife = true;
    } else {
      // The opening: standing in the observation lounge on ANVIL.
      this.switchLocale('moon');
      const site = this.moonSite;
      const sp = this.station.spawn;
      this.player.setPosition(site.x + sp.x, site.h + 0.05, site.z + sp.z);
      this.player.yaw = Math.PI;               // facing the window and THERA
      this.player.pitch = 0.02;
      const pad = this.station.padCentres[0];
      this.ship?.placeOn(site.x + pad.x, site.z + pad.z, this.locale, 0.35);
    }

    await step(0.72, 'building terrain');
    const cam = this.player.pos;
    sharedUniforms.uCurveOrigin.value.set(cam.x, 0, cam.z);
    this.terrain.setViewDistance(9000);
    this.terrain.flush(cam.x, cam.z, 230);
    if (this.locale.id === 'planet') this.flushSurface(cam.x, cam.z);

    await step(0.88, 'lighting');
    if (Number.isFinite(this.debugPhase)) this.daylight.setPhase(this.debugPhase);
    this.daylight.update(0, this.camera, this.sky, { atmosphere: this.locale.hasAtmosphere ? 1 : 0 });
    this.player.applyCamera(0);

    await step(0.95, 'final checks');
    this.refreshEnvironment();
    this.warmup();
    await step(1.0, 'ready');
  }

  /**
   * Re-bake the environment from the current sky. Cheap enough to do every
   * few seconds, which is all the day/night cycle needs.
   */
  refreshEnvironment() {
    if (!this.pmrem) return;
    const sky = this.sky.mesh;
    const parent = sky.parent;
    const scale = sky.scale.x;
    try {
      sky.scale.setScalar(1);
      sky.position.set(0, 0, 0);
      this.envScene.add(sky);
      const rt = this.pmrem.fromScene(this.envScene, 0, 0.4, 60);
      if (this.envTarget) this.envTarget.dispose();
      this.envTarget = rt;
      this.scene.environment = rt.texture;
      this.scene.environmentIntensity = this.locale.hasAtmosphere ? 0.8 : 0.35;
    } catch (e) {
      // A driver that will not do this is not worth crashing the game over.
      this.pmrem = null;
    } finally {
      sky.scale.setScalar(scale);
      if (parent) parent.add(sky);
    }
    this.envAge = 0;
  }

  /** Compile shaders before the first visible frame so it does not hitch. */
  warmup() {
    try { this.renderer.renderer.compile(this.scene, this.camera); } catch (e) { /* non-fatal */ }
  }

  addSystem(sys) { this.systems.push(sys); return sys; }

  bindHud() {
    this.missions?.refresh();
    this.refreshInventory();
  }

  refreshInventory() {
    this.hud.inventory(this.invOpen, this.inventory.list(), (id) => {
      const line = this.inventory.consume(id, this.player);
      if (line) this.hud.log(line, 'good');
      this.refreshInventory();
      this.emit('ate', id);
    });
  }

  toggleInventory(open) {
    this.invOpen = open ?? !this.invOpen;
    this.refreshInventory();
    if (this.invOpen) this.input.exitLock();
    else this.input.requestLock();
  }

  /** Wake up at ANVIL Station, intact, with whatever you were carrying. */
  respawn() {
    const p = this.player;
    p.alive = true;
    p.health = 100; p.stamina = 100;
    p.hunger = Math.max(45, p.hunger);
    p.breath = 100;
    p.vel.set(0, 0, 0);
    p.frozen = false;
    this.dead = false;
    this.mode = MODE.ON_FOOT;
    if (this.ship) this.ship.piloted = false;
    if (this.mech) this.mech.piloted = false;
    this.hud.vehicle(null);
    this.camera.up.set(0, 1, 0);
    this.switchLocale('moon');
    const site = this.moonSite, sp = this.station.spawn;
    p.setPosition(site.x + sp.x, site.h + 0.05, site.z + sp.z);
    p.yaw = Math.PI; p.pitch = 0;
    // The ship comes home with you; it is the only one there is.
    const pad = this.station.padCentres[0];
    this.ship?.placeOn(site.x + pad.x, site.z + pad.z, this.locale, 0.35);
    this.terrain.flush(p.pos.x, p.pos.z, 200);
    this.hud.log('Recovered to ANVIL Station. The HALBERD came home on autopilot.', 'warn');
    this.emit('respawned');
  }

  /** Something made a noise at a place. Predators care. */
  makeNoise(pos, loudness, radius) {
    this.eco?.alarm(pos, radius, 'noise');
    this.emit('noise', pos, loudness, radius);
  }

  // --- frame ---------------------------------------------------------------

  update(dt) {
    const input = this.input;
    this.clock += dt;
    sharedUniforms.uTime.value = this.clock;

    const p = this.player;
    const onFoot = this.mode === MODE.ON_FOOT;

    if (onFoot) {
      p.look(input, dt);
      p.update(dt, input, this.locale, {
        survival: this.locale.id === 'planet',
        // ANVIL's gravity makes you bound; that is most of the fun of it.
        jumpMul: this.locale.id === 'moon' ? 1.35 : 1,
      });
      if (input.hit('KeyF')) {
        this.flashOn = !this.flashOn;
        this.flashlight.intensity = this.flashOn ? 900 : 0;
      }
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
    // Inside the station the sky is irrelevant; outside on ANVIL it is black.
    if (this.locale.id === 'moon') this.atmosphere = 0;

    this.daylight.update(dt * this.timeScale, this.camera, this.sky, {
      atmosphere: this.atmosphere,
      storm: this.storm,
      shadowDistance: this.quality.shadowDistance,
      starFade: 1,
      aurora: this.auroraStrength ?? 0,
    });
    // Fog thins as the air does, and clears entirely in vacuum.
    const baseDensity = this.locale.id === 'planet' ? 0.00112 : 0.0;
    this.daylight.fog.density = clamp(
      baseDensity * Math.pow(this.atmosphere, 1.6) * (1 + this.storm * 2.4) * (this.fogBoost ?? 1),
      0, 0.014);

    // Under water the whole scene turns into a green-black soup.
    const wl = this.locale.waterAt ? this.locale.waterAt(cam.x, cam.z) : null;
    this.underwater = wl !== null && cam.y < wl - 0.05;
    if (this.underwater) {
      const deep = clamp((wl - cam.y) / 12, 0, 1);
      this.daylight.fog.color.setRGB(lerp(0.045, 0.010, deep), lerp(0.115, 0.032, deep), lerp(0.125, 0.055, deep));
      this.daylight.fog.density = lerp(0.055, 0.14, deep);
    }

    this.sky.update(this.camera, this.clock);
    this.envAge += dt;
    if (this.envAge > 7 && !this.paused) this.refreshEnvironment();

    for (const sys of this.systems) if (sys.update) sys.update(dt, this);
    this.fx?.update(dt);
    this.missions?.update(dt);

    // Death and recovery.
    if (!p.alive && !this.dead) {
      this.dead = true;
      this.gear?.setHidden(true);
      this.input.exitLock();
      const cause = p.lastSource || 'THERA';
      this.hud.death(true, cause === 'fall' ? 'Impact trauma. THERA is not forgiving of altitude.'
        : cause === 'starvation' ? 'Starvation. There was food everywhere.'
          : cause === 'drowning' ? 'Drowned. The water was deeper than it looked.'
            : `Killed by ${cause}. Biometrics flatlined on THERA.`);
      this.emit('death', cause);
    }

    this.gear?.setHidden(!onFoot);
    if (this.gear && onFoot) {
      if (input.hit('Tab')) this.toggleInventory();
      this.gear.update(dt, input, {
        inventory: this.inventory,
        world: this.locale,
        eco: this.eco,
        playerPos: this.camera.position,
        makeNoise: (p, l, r) => this.makeNoise(p, l, r),
        onSplash: (p) => { this.fx?.splash(p, 0.8); this.emit('splash', p); },
        onKill: (c) => this.emit('creatureDeath', c, 'player'),
      });
    }

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
    const orbital = (this.space?.orbitT ?? 0) > 0.001 || this.space?.transit;
    if (!orbital) {
      if (this.locale.id === 'planet') {
        this.planetBody.visible = false;
        this.moonBody.visible = true;
        // ANVIL rides a slower arc than the sun, so it is sometimes up by day.
        const a = this.clock * 0.0031 + 1.9;
        this.moonBody.setDirection(new THREE.Vector3(
          Math.cos(a) * 0.8, Math.sin(a) * 0.62 + 0.18, Math.sin(a * 0.7) * 0.6));
        this.moonBody.setAngularRadius(0.0075);
      } else {
        this.moonBody.visible = false;
        this.planetBody.visible = true;
        // THERA hangs off ANVIL's northern horizon, framed by the window.
        this.planetBody.setDirection(new THREE.Vector3(-0.06, 0.225, 0.972));
        this.planetBody.setAngularRadius(0.168);
      }
    }
    this.planetBody.update(this.camera, sun, this.clock);
    this.moonBody.update(this.camera, sun, this.clock);
  }

  updateHud(dt) {
    const hud = this.hud, p = this.player;
    hud.vitals(p);

    if (this.gear && this.mode !== MODE.ON_FOOT) {
      hud.weapon({ name: '', sub: '', big: '', hidden: true });
      hud.prompt('E', '');
      hud.scan(null);
      hud.crosshair(false);
      if (this.mode === MODE.MECH && this.mech) hud.mech(this.mech.hudState());
    } else if (this.gear) {
      hud.weapon({ ...this.gear.hudState(), hidden: false });
      const it = this.gear.interaction;
      hud.prompt(it?.key ?? 'E', it?.label ?? '');
      hud.scan(this.gear.scanT > 0.02 ? (this.gear.scanResult ?? {
        name: 'ANALYSING', klass: `${Math.round(this.gear.scanT * 100)}%`, rows: [], desc: '',
      }) : null);
      // Crosshair turns hostile when something dangerous is looking back.
      const threat = this.eco?.nearest(this.camera.position, 60,
        (c) => c.isPredator && (c.state === 'CHASE' || c.state === 'ATTACK' || c.state === 'STALK'));
      hud.crosshair(this.mode === 'ON_FOOT' && !this.invOpen, !!threat);
    }
    hud.tickSubtitle(dt);
    hud.tickLogs(performance.now());

    const cam = this.camera.position;
    if (this.locale.id === 'moon') {
      hud.status({
        time: this.daylight.clockString(),
        biome: this.station && Math.hypot(cam.x - this.moonSite.x, cam.z - this.moonSite.z) < 40
          ? 'ANVIL STATION' : 'LUNAR SURFACE',
        alt: `${Math.round(cam.y - this.locale.heightAt(cam.x, cam.z))} m`,
        temp: this.daylight.dayT > 0.3 ? '+118 C' : '-164 C',
        grid: `${Math.round(cam.x / 100)}, ${Math.round(cam.z / 100)}`,
        where: 'ANVIL · LOCAL',
      });
    } else if (this.locale.id === 'planet') {
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
        where: 'THERA · LOCAL',
      });
    }

    // Compass marks: the ship, and whatever you are supposed to be doing.
    this.marks.length = 0;
    const bearing = (tx, tz) => {
      let b = Math.atan2(tx - cam.x, -(tz - cam.z)) * 180 / Math.PI;
      return b < 0 ? b + 360 : b;
    };
    if (this.ship && this.mode === 'ON_FOOT') {
      const d = Math.hypot(this.ship.pos.x - cam.x, this.ship.pos.z - cam.z);
      if (d > 12) {
        this.marks.push({
          bearing: bearing(this.ship.pos.x, this.ship.pos.z),
          label: d > 1000 ? `SHIP ${(d / 1000).toFixed(1)}km` : `SHIP ${d.toFixed(0)}m`,
        });
      }
    }
    if (this.locale.id === 'moon' && this.station && this.mode === 'ON_FOOT') {
      const d = Math.hypot(this.moonSite.x - cam.x, this.moonSite.z - cam.z);
      if (d > 40) {
        this.marks.push({
          bearing: bearing(this.moonSite.x, this.moonSite.z),
          label: `ANVIL ${d.toFixed(0)}m`, color: 'var(--cyan)',
        });
      }
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
