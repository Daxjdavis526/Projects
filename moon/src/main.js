/* =============================================================================
   MAIN — bootstrap and the frame loop
   -----------------------------------------------------------------------------
   Order every frame: clock, ephemeris, physics, snapshot, render. Nothing in the
   renderer reaches back into the simulation.

   URL parameters (used by the screenshot harness and handy for exploring):
     ?site=apollo11        a site id from data/sites.json, or lat,lon
     ?t=1969-07-20T20:17Z  simulation start time
     ?alt=800              starting altitude in metres
     ?view=orbit|ground    camera framing
     ?quality=high         performance | balanced | high | ultra | science
     ?rate=600             time acceleration
     ?offline=1            do not stream anything from NASA
   ========================================================================== */

import * as THREE from 'three';
import { QUALITY, DEFAULT_QUALITY, R_MOON, TERRAIN, OPTICS, TIME, STREAM } from './config.js';
import { Stage } from './render/stage.js';
import { TerrainSystem } from './render/terrain.js';
import { Sky } from './render/sky.js';
import { DustField } from './render/dust.js';
import { Exposure } from './render/exposure.js';
import { ephemerisAt, skyAt, jdFromUnixMs, localSolarTime } from './physics/ephemeris.js';
import { llhToXyz, xyzToLlh, enuBasis, llToUnit, horizonDistance,
         offsetLatLon, surfaceDistance, bearing } from './physics/frames.js';
import { loadVendoredHeightfield, readJson, readBinary } from './terrain/loader.js';
import { Detail } from './terrain/detail.js';
import { decodePng8 } from './terrain/png16.js';
import { Streams } from './data/streams.js';
import { Cache } from './data/cache.js';
import { SurfaceStreamer } from './data/surface.js';
import { TemperatureMap } from './data/temperature.js';
import { EVA } from './game/eva.js';
import { Descent } from './game/descent.js';
import { Base } from './game/base.js';
import { Vehicle } from './game/vehicle.js';
import { HistoricSites } from './game/historic.js';
import { Shelter, hoursUntilSunElevation } from './game/shelter.js';
import { Moment } from './game/moment.js';
import { clearLanding, standClearOf, explain as explainKeepOut } from './game/keepout.js';
import { SuitHud } from './ui/suithud.js';
import { OrbitPicker } from './ui/orbit.js';
import { Sound } from './audio/audio.js';
import { Save } from './game/save.js';
import { Photo } from './ui/photo.js';
import { Settings } from './ui/settings.js';
import { Nav } from './ui/nav.js';

/* Absolute, because the terrain workers resolve it against their own URL. */
const DATA = new URL('../data/', import.meta.url).href;
const params = new URLSearchParams(location.search);
const el = (id) => document.getElementById(id);

const state = {
  quality: QUALITY[params.get('quality')] || QUALITY[DEFAULT_QUALITY],
  qualityName: QUALITY[params.get('quality')] ? params.get('quality') : DEFAULT_QUALITY,
  offline: params.get('offline') === '1',
  timeRate: Number(params.get('rate') ?? TIME.defaultRate),
  simMs: params.get('t') ? Date.parse(params.get('t')) : Date.now(),
  showScience: false,
  showHelp: false,
};

function progress(stage, fraction) {
  el('boot-stage').textContent = stage;
  el('boot-bar').style.width = Math.round(Math.max(0, Math.min(1, fraction)) * 100) + '%';
}

/* --- geology: roughness and colour tint per unit ---------------------------- */
/* Young mare is smooth and dark; ancient highlands are saturated with craters
   and bright. The USGS unit map is what stops every kilometre looking alike. */
function roughnessTable(legend) {
  const rough = new Float32Array(256).fill(0.5);
  const albedo = new Float32Array(256).fill(OPTICS.albedoMare);
  for (const [dn, u] of Object.entries(legend.units || {})) {
    const code = (u.code || '').toLowerCase();
    const age = (u.age || '').toLowerCase();
    let r = 0.5, a = OPTICS.albedoMare;
    if (code.startsWith('c')) { r = 0.85; a = 0.13; }            // Copernican: fresh, bright
    else if (code.startsWith('e')) { r = 0.6; a = 0.10; }        // Eratosthenian
    else if (code.includes('m')) { r = 0.32; a = OPTICS.albedoMare; }  // mare units
    else if (code.startsWith('n') || code.startsWith('pn')) { r = 0.95; a = OPTICS.albedoHighland; }
    else if (code.startsWith('i')) { r = 0.45; a = 0.095; }      // Imbrian
    if (age.includes('pre-nectarian') || age.includes('nectarian')) r = Math.max(r, 0.9);
    rough[Number(dn)] = r;
    albedo[Number(dn)] = a;
  }
  return { rough, albedo };
}

async function loadGeology() {
  try {
    const [legend, png] = await Promise.all([
      readJson(DATA, 'geology.json'),
      readBinary(DATA, 'geology8.png'),
    ]);
    const img = await decodePng8(png);
    const { rough, albedo } = roughnessTable(legend);
    return { width: img.width, height: img.height, data: img.data, rough, albedo, legend };
  } catch (e) {
    console.warn('geology layer unavailable:', e.message);
    return null;
  }
}

/* --- startup ---------------------------------------------------------------- */

async function start() {
  progress('reading the manifest', 0.02);
  const manifest = await readJson(DATA, 'manifest.json');
  const sites = await readJson(DATA, 'sites.json');

  progress('lunar topography', 0.05);
  const geology = await loadGeology();
  const { heightfield } = await loadVendoredHeightfield(DATA, {
    level: 3,
    onProgress: (s, f) => progress(s === 'topography' ? 'lunar topography' : s, 0.05 + f * 0.5),
  });
  const detail = new Detail({
    enabled: !state.quality.noProcedural,
    roughness: geology ? (lat, lon) => {
      const x = Math.min(geology.width - 1, Math.max(0, ((lon + 180) / 360 * geology.width) | 0));
      const y = Math.min(geology.height - 1, Math.max(0, ((90 - lat) / 180 * geology.height) | 0));
      return geology.rough[geology.data[y * geology.width + x]];
    } : undefined,
  });
  heightfield.attachDetail(detail);

  progress('surface imagery', 0.6);
  const loader = new THREE.TextureLoader();
  const texture = (url, srgb = true) => new Promise((res) => loader.load(url, (t) => {
    t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    t.wrapS = THREE.RepeatWrapping;
    t.anisotropy = 8;
    res(t);
  }, undefined, () => res(null)));

  const colourTier = state.quality.maxLevel >= 18 ? 8192 : 4096;
  const colourMap = await texture(DATA + `color/moon_${colourTier}.jpg`);

  progress('the sky', 0.75);
  const canvas = el('view');
  const stage = new Stage(canvas, {
    pixelRatio: state.quality.pixelRatio,
    shadowMap: state.quality.shadow,
    /* A narrower field of view is a longer lens: the photography mode uses it,
       and so does anyone who wants a proper look at the Earth. */
    fov: Number(params.get('fov') ?? 55),
  });
  if (params.get('shadows') === '0') stage.renderer.shadowMap.enabled = false;
  const sky = new Sky(stage);
  try {
    sky.setStars(await readBinary(DATA, 'stars.bin'));
  } catch (e) { console.warn('star catalogue unavailable', e); }
  const [day, night, clouds] = await Promise.all([
    texture(DATA + 'earth/day_4k.jpg'),
    texture(DATA + 'earth/night_2k.jpg'),
    texture(DATA + 'earth/clouds_2k.jpg'),
  ]);
  if (day) sky.setEarth({ day, night, clouds });

  /* NASA Trek: finer measured elevation and imagery, fetched as you go. The
     page works without it; the overlay says which you are looking at. */
  let streams = null, surface = null, registry = null;
  try {
    registry = await readJson(DATA, 'streams.json');
  } catch (e) { console.warn('stream registry unavailable', e.message); }

  /* Diviner's temperature maps, vendored, so the ground has a real temperature
     with no network at all. */
  let temperature = null;
  if (manifest.temperature) {
    try { temperature = await new TemperatureMap(manifest.temperature).load(DATA); }
    catch (e) { console.warn('temperature maps unavailable:', e.message); }
  }

  progress('building terrain', 0.85);
  const terrain = new TerrainSystem(stage, {
    base: DATA,
    quality: state.quality,
    manifest,
    geology: geology ? { width: geology.width, height: geology.height,
                         data: geology.data, rough: geology.rough } : null,
    colourMap,
    workers: 2,
    onProgress: (s, f) => progress(s === 'topography' ? 'building terrain' : s, 0.85 + f * 0.14),
  });

  if (registry) {
    const cache = new Cache(Number(params.get('cache') ?? STREAM.cacheBytesDefault));
    streams = new Streams(registry, {
      enabled: !state.offline, cache,
      /* The screenshot harness passes a local relay here, because the sandbox
         it runs in reaches the internet only through a proxy. */
      origin: params.get('trek') || undefined,
    });
    surface = new SurfaceStreamer(streams, { heightfield, terrain });
    window.SELENE_CACHE = cache;
  }

  /* --- where are we? ------------------------------------------------------ */
  let site = sites.sites.find(s => s.id === (params.get('site') || 'apollo11'));
  if (!site && params.get('site') && params.get('site').includes(',')) {
    const [lat, lon] = params.get('site').split(',').map(Number);
    site = { id: 'custom', name: 'custom', lat, lon };
  }
  if (!site) site = sites.sites[0];

  /* The astronaut is only needed in third person, and the page must still run
     if the module is missing, so it is imported on the side. */
  /* Declared before the dynamic imports below, because those resolve on their
     own schedule and one of them will land before this line otherwise. */
  let base = null, vehicle = null;
  let astronaut = null, shipModel = null, roverModel = null;
  const modelQuality = state.qualityName === 'science' ? 'balanced' : state.qualityName;
  import('./models/astronaut.js')
    .then((m) => {
      astronaut = m.buildAstronaut({ quality: modelQuality });
      if (eva) eva.setModel(astronaut);
    })
    .catch((e) => console.warn('astronaut model unavailable:', e.message));
  import('./models/ship.js')
    .then((m) => {
      shipModel = m.buildShip({ quality: modelQuality });
      if (base) base.setModel(shipModel);
    })
    .catch((e) => console.warn('ship model unavailable:', e.message));
  import('./models/rover.js')
    .then((m) => {
      roverModel = m.buildRover({ quality: modelQuality });
      if (vehicle) vehicle.setModel(roverModel);
    })
    .catch((e) => console.warn('rover model unavailable:', e.message));

  const view = params.get('view') || 'ground';
  /* `alt` is height above the local surface, which is what anyone actually
     means by it; the surface at Tranquility Base is 1.9 km below the datum. */
  const startAgl = Number(params.get('alt') ?? (view === 'orbit' ? 900000 : 2.2));
  const siteGround = heightfield.heightAt(site.lat, site.lon);

  const cam = {
    lat: site.lat, lon: site.lon, alt: siteGround + startAgl,
    yaw: Number(params.get('yaw') ?? 90) * Math.PI / 180,
    pitch: params.get('pitch') !== null
      ? Number(params.get('pitch')) * Math.PI / 180
      : (view === 'orbit' ? -0.9 : -0.06),
    speed: view === 'orbit' ? 40000 : 6,
  };
  /* `look=earth` or `look=sun` aims the camera at something specific, which is
     how the screenshot harness checks the sky without driving the controls. */
  const lookAt = params.get('look');

  /* Regolith goes where it is thrown and then it lands. See render/dust.js. */
  const dust = new DustField(stage, { max: state.quality.rocks > 0.5 ? 1600 : 700 });

  const suitHud = new SuitHud();
  const photo = new Photo();
  const moment = new Moment();
  const nav = new Nav({ waypoints: [] });
  /* Eating, sleeping, and waiting for the Sun, which on a body with a
     29 and a half day rotation is a real thing to want to do. */
  const shelter = new Shelter({
    el: el('shelter'),
    onRest: (hours, what) => {
      if (what === 'eat') { shelter.needs.eat(); return; }
      if (what === 'resupply' && vehicle) { vehicle.rover.restock(); vehicle.dust = 0; return; }
      if (what === 'recharge' && eva) { eva.suit.recharge(); return; }
      let h = hours;
      if (what && what.startsWith('sun:')) {
        h = hoursUntilSunElevation(skyAt, ephemerisAt, jdFromUnixMs,
          state.simMs, cam.lat, cam.lon, Number(what.slice(4)), true);
        if (h === null) return;
      }
      if (!h) return;
      state.simMs += h * 3600 * 1000;
      shelter.needs.sleep(h);
      if (eva) eva.suit.recharge();
      if (vehicle && vehicle.rover.pressure > 0.9) vehicle.rover.consume(h, 1);
      save.write(game, 'slept');
    },
  });
  const save = new Save();
  /* Audio cannot start without a gesture, so it waits for the first key or
     click and is a safe no-op until then. */
  const sound = new Sound();
  const wake = () => { sound.start(); removeEventListener('keydown', wake); removeEventListener('pointerdown', wake); };
  addEventListener('keydown', wake);
  addEventListener('pointerdown', wake);
  const exposure = new Exposure();
  const world = { x: 0, y: 0, z: 0 };
  const frustum = new THREE.Frustum();
  const projScreen = new THREE.Matrix4();
  /* Reused every frame: building a Matrix4 and four Vector3s sixty times a
     second is free in isolation and expensive next to a streaming terrain. */
  const tmpM = new THREE.Matrix4();
  const tmpX = new THREE.Vector3(), tmpY = new THREE.Vector3();
  const tmpZ = new THREE.Vector3(), tmpUp = new THREE.Vector3();
  /* Mouse movement accumulates between frames and is consumed by whichever
     controller is driving, so a fast mouse is not quantised to the frame rate. */
  const look = { yaw: 0, pitch: 0 };
  const clampPitch = (p) => Math.max(-1.55, Math.min(1.55, p));

  /* On foot. Created only when the player steps outside; until then the free
     camera flies and `eva` is null. */
  let eva = null, driving = false, canopyPress = false;
  const startEva = (lat, lon) => {
    /* Standing on the exact published coordinates of a landing site puts you
       inside the spacecraft. Step out of the hardware and turn to look at it,
       which is what you would do anyway. */
    const clear = standClearOf(sites.sites, lat ?? cam.lat, lon ?? cam.lon);
    eva = new EVA({
      stage, heightfield, quality: state.quality,
      lat: clear.lat, lon: clear.lon,
      yaw: clear.yaw ?? cam.yaw * 180 / Math.PI,
      suitMode: params.get('suit') || undefined,
    });
    if (astronaut) eva.setModel(astronaut);
    return eva;
  };

  /* --- the opening: orbit ---------------------------------------------------
     The game starts by looking at the real Moon from a few hundred kilometres
     up and choosing somewhere to go. `?view=ground` and `?mode=eva` skip
     straight past it, which is what the screenshot harness wants. */
  let names = { features: [] };
  try { names = await readJson(DATA, 'names.json'); }
  catch (e) { console.warn('nomenclature unavailable', e.message); }

  /* Reconstructions of the places people have already been. They are built
     only when you are close enough to see them and they carry no markers
     unless you ask for them. */
  const historic = new HistoricSites({ stage, heightfield, quality: modelQuality });
  import('./models/apollo11.js')
    .then((m) => historic.register({
      id: 'apollo11', lat: m.APOLLO11_SITE.lat, lon: m.APOLLO11_SITE.lon,
      heading: 0, build: (o) => m.buildApollo11(o),
    }))
    .catch((e) => console.warn('Apollo 11 site unavailable:', e.message));

  const orbit = new OrbitPicker({
    heightfield, names, sites, geology, cam,
    getSky: (lat, lon) => skyAt(ephemerisAt(jdFromUnixMs(state.simMs)), lat, lon, 0),
    onLand: (pick) => land(pick),
    onOverlay: (v) => terrain.setOverlay(v),
  });
  terrain.setOverlayMaps(geology, temperature);

  let mode = params.get('view') === 'orbit' || (!params.get('view') && !params.get('mode'))
    ? 'orbit' : 'surface';
  orbit.show(mode === 'orbit');
  if (mode === 'orbit') {
    cam.alt = Number(params.get('alt') ?? 1200000);
    cam.pitch = -89 * Math.PI / 180;
    cam.yaw = 0;
    orbit.setPick(site.lat, site.lon, site);
  }

  /* Going down. The ship stays wherever it is put, so this is the one moment
     that decides where the rest of the game happens. The last minute of the
     approach is flown rather than animated: see game/descent.js. */
  let descent = null;
  let keepOut = null;
  function land(pick) {
    mode = 'descent';
    orbit.show(false);
    terrain.setOverlay(0);
    /* Not on top of somebody else's spacecraft: see game/keepout.js. */
    keepOut = clearLanding(sites.sites, pick.lat, pick.lon);
    if (keepOut.site) console.info('keep-out:', explainKeepOut(keepOut));
    el('hint').textContent = 'landing · press space to skip';
    descent = new Descent({
      heightfield, target: { lat: keepOut.lat, lon: keepOut.lon },
      onDone: (at) => {
        descent = null;
        mode = 'surface';
        el('hint').textContent = 'H for controls';
        settle(at.lat, at.lon, at.heading);
      },
    });
    /* Ask for the ground under the landing site straight away rather than
       waiting for the camera to arrive. */
    if (surface) surface.update(keepOut.lat, keepOut.lon, 400);
  }

  /* Arriving: the ship is now here, the rover unloads beside it, and you step
     out onto ground nobody has stood on. */
  function settle(lat, lon, heading = 0) {
    /* The guarantee, not just the picker's good manners: nothing that calls
       this can put the ship down on hardware, restores and debug URLs
       included. Already-cleared points come back unchanged. */
    const clear = clearLanding(sites.sites, lat, lon);
    if (clear.site) { keepOut = clear; lat = clear.lat; lon = clear.lon; }
    base = new Base({ stage, heightfield, terrain, quality: state.quality, lat, lon, heading });
    if (shipModel) base.setModel(shipModel);
    /* The rover parks off the ship's port side, clear of the engines. */
    const park = offsetLatLon(lat, lon, (heading + 250) % 360, 11);
    vehicle = new Vehicle({
      stage, heightfield, lat: park.lat, lon: park.lon, heading: (heading + 90) % 360,
    });
    if (roverModel) vehicle.setModel(roverModel);
    /* Step out onto the surface beside the ladder rather than inside the hull. */
    const out = offsetLatLon(lat, lon, (heading + 180) % 360, 7.5);
    startEva(out.lat, out.lon);
    eva.player.yaw = heading * Math.PI / 180;
    save.write(game, 'landed');
  }

  /* One object holding the live game, so the save system has something to read
     and write without reaching into closures. */
  const game = {
    state, settle, visited: [],
    get waypoints() { return nav.waypoints; },
    set waypoints(v) { nav.waypoints.length = 0; nav.waypoints.push(...(v || [])); },
    get base() { return base; },
    get vehicle() { return vehicle; },
    get eva() { return eva; },
    historic,
    get driving() { return driving; },
    set driving(v) { driving = v; },
  };

  /* Continuing: a lunar day is twenty nine and a half Earth days long, so a
     session ending is normal and coming back to the same place matters. */
  const saved = save.read();
  if (saved && saved.base) {
    const b = el('orbit-continue');
    if (b) {
      b.style.display = 'flex';
      b.querySelector('span').textContent =
        `${new Date(saved.savedAt).toLocaleString()} · ${saved.base.lat.toFixed(3)}, ${saved.base.lon.toFixed(3)}`;
      b.addEventListener('click', () => {
        mode = 'surface';
        orbit.show(false);
        el('hint').textContent = 'H for controls';
        Save.restore(game, saved);
      });
    }
  }

  /* `?mode=eva` starts on foot, which is what the screenshot harness wants when
     it is checking the suit, the lamps or the third-person camera. */
  if (params.get('mode') === 'eva') {
    if (params.get('ship') === '1') settle(site.lat, site.lon, 0);
    else startEva(site.lat, site.lon);
    /* On foot the body owns the view, so `?yaw` and `?pitch` have to be set on
       the player rather than on the camera or they are read back over. */
    if (params.get('yaw') !== null) eva.player.yaw = Number(params.get('yaw')) * Math.PI / 180;
    if (params.get('pitch') !== null) eva.player.pitch = Number(params.get('pitch')) * Math.PI / 180;
    if (params.get('view3') === '1') eva.toggleView();
    if (params.get('lamps')) eva.lampMode = Number(params.get('lamps'));
  }

  /* --- input --------------------------------------------------------------- */
  const keys = new Set();
  addEventListener('keydown', (e) => {
    keys.add(e.code);
    if (e.code === 'KeyH') { state.showHelp = !state.showHelp; el('help').style.display = state.showHelp ? 'block' : 'none'; }
    if (e.code === 'KeyV') { state.showScience = !state.showScience; el('science').style.display = state.showScience ? 'block' : 'none'; }
    if (e.code === 'KeyT') {
      const rates = [0, 1, 60, 600, 3600, 21600, 86400];
      state.timeRate = rates[(rates.indexOf(state.timeRate) + 1) % rates.length];
    }
    /* G steps outside and back: on foot you are a person with a suit and a
       clock, in the free camera you are nobody and nothing runs out. */
    if (e.code === 'KeyG') {
      if (eva) { eva.group.removeFromParent(); eva = null; cam.speed = 6; }
      else startEva();
    }
    if (e.code === 'Space' && descent) descent.skip();
    /* R gets on and off the rover. You have to be next to it, and getting off
       puts you on the ground beside it rather than inside the wheel. */
    /* Recovery. This is a game convention and it says so on the screen: the
       drone brings you back, the suit is replaced, and nothing about what
       happened is dramatised. */
    if (e.code === 'KeyR' && eva && eva.suit.unconscious) {
      const home = base ? { lat: base.lat, lon: base.lon } : { lat: cam.lat, lon: cam.lon };
      eva.suit.reset();
      eva.place(home.lat, home.lon, 0.1);
      driving = false;
      el('blackout-why').textContent = 'The suit could no longer hold pressure.';
      save.write(game, 'recovered');
      return;
    }
    if (e.code === 'KeyR' && vehicle && eva) {
      if (driving) {
        driving = false;
        const out = vehicle.dismountPoint();
        eva.place(out.lat, out.lon, 0.1);
      } else if (vehicle.canBoard(eva.player.llh.lat, eva.player.llh.lon)) {
        driving = true;
        /* Face the way the vehicle is pointing rather than the way you happened
           to be walking, or the first thing you see is its own bodywork. */
        cam.yaw = vehicle.rover.heading * Math.PI / 180;
        cam.pitch = -0.05;
      }
    }
    if (e.code === 'KeyC' && vehicle) canopyPress = true;
    if (e.code === 'KeyP') photo.toggle();
    /* Markers stay off unless you ask. Walking up to Tranquility Base and
       recognising it should not require a floating label. */
    if (e.code === 'KeyM') {
      state.markers = !state.markers;
      settings.set('markers', state.markers ? 'on' : 'off');
    }
    if (e.code === 'KeyO') settings.toggle();
    if (photo.active) {
      if (e.code === 'BracketLeft') photo.zoom(-1);
      if (e.code === 'BracketRight') photo.zoom(1);
      if (e.code === 'Minus' || e.code === 'NumpadSubtract') photo.expose(-0.5);
      if (e.code === 'Equal' || e.code === 'NumpadAdd') photo.expose(0.5);
    }
    /* F5 would reload the page, so saving is on F2, and it autosaves anyway. */
    if (e.code === 'F2') {
      const w = save.write(game, 'manual');
      el('hint').textContent = w ? 'saved' : 'could not save';
      setTimeout(() => { el('hint').textContent = 'H for controls'; }, 2500);
      e.preventDefault();
    }
    if (e.code === 'KeyF' && eva) eva.toggleView();
    if (e.code === 'KeyL' && eva) eva.cycleLamps();
  });
  addEventListener('keyup', (e) => keys.delete(e.code));
  let dragging = false;
  let dragged = 0;
  canvas.addEventListener('pointerdown', (e) => {
    dragging = true; dragged = 0; canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointerup', (e) => {
    dragging = false;
    canvas.releasePointerCapture(e.pointerId);
    if (mode !== 'orbit' || dragged > 6) return;
    /* A click, not a drag: shoot a ray through the pointer and see where it
       lands on the real surface. */
    const r = canvas.getBoundingClientRect();
    const ndc = new THREE.Vector2(
      ((e.clientX - r.left) / r.width) * 2 - 1,
      -((e.clientY - r.top) / r.height) * 2 + 1);
    const ray = new THREE.Raycaster();
    ray.setFromCamera(ndc, stage.camera);
    const o = stage.origin.origin;
    const hit = orbit.rayToGround(
      { x: ray.ray.origin.x + o.x, y: ray.ray.origin.y + o.y, z: ray.ray.origin.z + o.z },
      ray.ray.direction);
    if (hit) orbit.setPick(hit.lat, hit.lon);
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    dragged += Math.abs(e.movementX) + Math.abs(e.movementY);
    look.yaw += e.movementX * 0.0022;
    look.pitch += e.movementY * 0.0022;
  });
  canvas.addEventListener('wheel', (e) => {
    if (mode === 'orbit') {
      const ground = heightfield.heightAt(cam.lat, cam.lon);
      const agl = Math.max(2000, cam.alt - ground);
      cam.alt = ground + Math.max(2000, Math.min(6e6, agl * Math.exp(e.deltaY * 0.0012)));
    } else {
      cam.speed = Math.max(0.4, Math.min(400000, cam.speed * Math.exp(-e.deltaY * 0.0015)));
    }
    e.preventDefault();
  }, { passive: false });

  const settings = new Settings({
    state,
    get: {
      eva: () => eva, streams: () => streams, historic: () => historic,
      cache: () => window.SELENE_CACHE || null,
    },
    onQuality: (q) => {
      const u = new URL(location.href);
      u.searchParams.set('quality', q);
      location.href = u.toString();
    },
  });
  state.markers = settings.values.markers;

  /* --- the loop ------------------------------------------------------------ */
  let last = performance.now(), fpsAcc = 0, fpsN = 0, fps = 0, ready = false;
  const probeCache = { t: 0, value: null };
  let shelterAt = 0;
  const startedAt = performance.now();
  let lastSteps = 0;

  function frame(now) {
    requestAnimationFrame(frame);
    const dtWall = Math.min(0.5, (now - last) / 1000);
    /* Physics is clamped so a long stall cannot tunnel anybody through the
       ground. The landing is not: it is a fixed length of theatre, and letting
       a slow machine stretch it to five minutes would be worse than letting it
       take bigger steps. */
    const dt = Math.min(0.1, dtWall);
    last = now;
    fpsAcc += dt; fpsN++;
    if (fpsAcc > 0.5) { fps = fpsN / fpsAcc; fpsAcc = 0; fpsN = 0; }

    state.simMs += dt * 1000 * state.timeRate;
    const eph = ephemerisAt(jdFromUnixMs(state.simMs));

    /* --- sky and light ---------------------------------------------------- */
    const local = skyAt(eph, cam.lat, cam.lon, cam.alt);
    if (lookAt === 'earth' || lookAt === 'sun') {
      const az = lookAt === 'earth' ? local.earthAz : local.sunAz;
      const el2 = lookAt === 'earth' ? local.earthEl : local.sunEl;
      cam.yaw = az * Math.PI / 180;
      cam.pitch = el2 * Math.PI / 180;
      /* On foot the body owns the view: the camera is read back off the player
         further down the frame, so aiming the camera alone is silently undone
         and `?look=earth` came out staring at the ground. */
      if (eva) { eva.player.yaw = cam.yaw; eva.player.pitch = cam.pitch; }
    }
    stage.setSun(local.sunDir, Math.max(0, local.sunEl > -0.3 ? 1 : 0), local.sunEl);
    /* What the landscape is throwing back at everything standing on it. The
       terrain works its own out per vertex from the horizon map; this is the
       version for the astronaut, the ship and the rover, which have no horizon
       map and were coming out as black silhouettes with the Sun behind them. */
    {
      const u = llToUnit(cam.lat, cam.lon);
      const litGround = Math.max(0, Math.sin(local.sunEl * Math.PI / 180)) *
        (local.sunEl > 0 ? 1 : 0);
      /* A flat Lambertian plane filling half an object's hemisphere would put
         the shadowed side at the ground's albedo times the sine of the Sun's
         elevation, which is two per cent of the lit side over mare. Apollo
         photographs of a figure in shadow are plainly brighter than that, for
         two reasons the flat estimate leaves out: a body standing on rough
         ground sees ground over well more than half its hemisphere, and
         regolith is a backscatterer rather than a diffuser. The factor here is
         calibrated against those photographs and is an approximation, not a
         derivation; it lands the shadowed side of a white suit around a tenth
         of its sunlit side over mare and a sixth over highland. */
      stage.setBounce(u, albedoAt(geology, cam.lat, cam.lon) * litGround * 2.5);
    }
    const earthshineScale = 1.5e-4 * eph.earthIllum * Math.max(0, Math.sin(local.earthEl * Math.PI / 180));
    terrain.updateSky({
      sunDir: local.sunDir,
      earthDir: local.earthDir,
      earthshine: {
        x: OPTICS.earthshineTint[0] * earthshineScale,
        y: OPTICS.earthshineTint[1] * earthshineScale,
        z: OPTICS.earthshineTint[2] * earthshineScale,
      },
      sunAngularRadius: eph.sunAngularRadius * Math.PI / 180,
      /* How much light the ground around you bounces into its own shadows.
         Highland anorthosite is nearly twice as bright as mare basalt, so the
         shadows in Taurus-Littrow are genuinely less black than the ones at
         Tranquility Base. */
      bounceAlbedo: albedoAt(geology, cam.lat, cam.lon),
    });

    const ev = exposure.update({
      sunElevation: local.sunEl,
      sunVisible: local.sunEl > 0 ? 1 : 0,
      /* What the eye is actually adapting to: mare is half as bright as
         highlands, and standing on one or the other is a two-thirds of a stop
         difference in how dark the shadows look. */
      albedo: albedoAt(geology, cam.lat, cam.lon),
      /* Measured, not assumed. A hundred metres is the baseline the ten-degree
         global figure was quoted at, so this is the same quantity read locally
         rather than off a table. */
      slopeSpreadDeg: heightfield.slopeAt(cam.lat, cam.lon, 100),
      /* Looking down at your boots and looking out at the horizon are two very
         different exposures, and the difference is most of a stop. */
      viewMu: Math.max(0.06, Math.sin(Math.max(0.05, -cam.pitch))),
      /* Phase angle: how far the Sun is from behind your head. Zero is the
         full-Moon direction, where the surface is at its brightest.

         Both directions are measured from the ground looking outwards, so the
         viewer's is the camera's reversed: a camera pitched ninety degrees down
         is a viewer ninety degrees up. Getting that backwards puts the phase
         near a hundred and eighty, makes the model think the ground is almost
         unlit, and opens the exposure by four stops. */
      phaseDeg: phaseAngle(-cam.pitch * 180 / Math.PI,
                           cam.yaw * 180 / Math.PI + 180, local.sunEl, local.sunAz),
      groundFraction: groundFraction(cam, heightfield, stage.camera.fov),
      earthIllum: eph.earthIllum,
      earthElevation: local.earthEl,
      /* What you are carrying. A helmet lamp two metres from the ground is
         brighter than the Sun is at a polar dawn, so leaving it out of the
         metering is not a rounding error: it opened the camera eleven stops
         for the dark and then washed the picture out the moment the lamps
         came on. */
      lampLuminance: eva && !driving
        ? albedoAt(geology, cam.lat, cam.lon) * eva.lampIrradiance() / Math.PI : 0,
    }, ready ? dt : 1e6);
    exposure.bias = photo.bias;
    stage.setExposure(ev);
    sky.update(eph, ev);

    /* --- move ------------------------------------------------------------- */
    /* Two ways of being here. On foot, physics/player.js decides where the body
       goes and the camera follows it; in the free camera, the camera is the only
       thing there is, and it flies. */
    let camFrame;
    if (driving && vehicle) {
      /* Driving. The player rides along, so the suit keeps running unless the
         canopy is shut and the cabin has come up to pressure. */
      cam.yaw -= look.yaw; cam.pitch = clampPitch(cam.pitch - look.pitch);
      look.yaw = look.pitch = 0;
      vehicle.step(dt, {
        throttle: (keys.has('KeyW') ? 1 : 0) - (keys.has('KeyS') ? 1 : 0),
        steer: (keys.has('KeyD') ? 1 : 0) - (keys.has('KeyA') ? 1 : 0),
        brake: keys.has('Space'),
        boost: keys.has('ShiftLeft') || keys.has('ShiftRight'),
        toggleCanopy: canopyPress,
      }, true);
      canopyPress = false;
      /* Move the vehicle before reading the seat out of it, or the camera
         trails the vehicle by a frame and the ride looks loose. */
      vehicle.place(stage.origin.origin, dt);
      /* The player goes where the rover goes. */
      eva.player.place(vehicle.rover.lat, vehicle.rover.lon, 0.9);
      eva.player.yaw = cam.yaw;
      eva.suit.step(dt * Math.max(1, state.timeRate), {
        exertion: 0.12, sunlit: local.sunEl > 0, lights: eva.lampMode > 0,
        inShelter: vehicle.rover.pressure > 0.9,
      });
      camFrame = vehicle.camera(cam.yaw, cam.pitch);
      cam.lat = vehicle.rover.lat; cam.lon = vehicle.rover.lon;
      cam.alt = camFrame.eye ? heightfield.heightAt(cam.lat, cam.lon) + 1.5 : cam.alt;
      world.x = camFrame.eye.x; world.y = camFrame.eye.y; world.z = camFrame.eye.z;
    } else if (eva) {
      eva.step(dt, {
        forward: (keys.has('KeyW') ? 1 : 0) - (keys.has('KeyS') ? 1 : 0),
        strafe: (keys.has('KeyD') ? 1 : 0) - (keys.has('KeyA') ? 1 : 0),
        run: keys.has('ShiftLeft') || keys.has('ShiftRight'),
        jump: keys.has('Space'),
        jet: keys.has('KeyJ'),
        dYaw: look.yaw, dPitch: look.pitch,
      }, {
        sunlit: local.sunEl > 0,
        timeScale: Math.max(1, state.timeRate),
      });
      look.yaw = look.pitch = 0;
      camFrame = eva.camera();
      cam.lat = eva.player.llh.lat; cam.lon = eva.player.llh.lon;
      cam.alt = eva.player.llh.h; cam.yaw = eva.player.yaw; cam.pitch = eva.player.pitch;
      world.x = camFrame.eye.x; world.y = camFrame.eye.y; world.z = camFrame.eye.z;
    } else if (mode === 'descent') {
      descent.step(dtWall);
      const c = descent.camera();
      cam.lat = c.lat; cam.lon = c.lon; cam.alt = c.alt;
      cam.yaw = c.yaw; cam.pitch = c.pitch;
      llhToXyz(cam.lat, cam.lon, cam.alt, world);
      const bd = enuBasis(cam.lat, cam.lon);
      const cyd = Math.cos(cam.yaw), syd = Math.sin(cam.yaw);
      const cpd = Math.cos(cam.pitch), spd = Math.sin(cam.pitch);
      camFrame = {
        eye: { x: world.x, y: world.y, z: world.z },
        dir: {
          x: (bd.n.x * cyd + bd.e.x * syd) * cpd + bd.u.x * spd,
          y: (bd.n.y * cyd + bd.e.y * syd) * cpd + bd.u.y * spd,
          z: (bd.n.z * cyd + bd.e.z * syd) * cpd + bd.u.z * spd,
        },
        up: bd.u, head: { x: world.x, y: world.y, z: world.z }, fov: null,
      };
    } else if (mode === 'orbit') {
      /* Turning the Moon rather than turning the camera: the view stays nadir
         and north up, and dragging slides the sub-point across the surface.
         How far a drag moves you depends on how high you are, so the same
         gesture works from a thousand kilometres and from thirty. */
      const scale = (cam.alt / R_MOON) * 34;
      cam.lon -= look.yaw * scale * 57.2958 * 0.6;
      cam.lat = Math.max(-89.9, Math.min(89.9, cam.lat + look.pitch * scale * 57.2958 * 0.6));
      if (cam.lon > 180) cam.lon -= 360;
      if (cam.lon < -180) cam.lon += 360;
      look.yaw = look.pitch = 0;
      cam.pitch = -89 * Math.PI / 180;
      cam.yaw = 0;
      llhToXyz(cam.lat, cam.lon, cam.alt, world);
      const bo = enuBasis(cam.lat, cam.lon);
      camFrame = {
        eye: { x: world.x, y: world.y, z: world.z },
        dir: { x: -bo.u.x, y: -bo.u.y, z: -bo.u.z },
        /* North is the top of the picture; straight down has no other sensible
           roll, and using the local vertical here would be degenerate. */
        up: bo.n, head: { x: world.x, y: world.y, z: world.z }, fov: null,
      };
    } else {
      cam.yaw -= look.yaw; cam.pitch = clampPitch(cam.pitch - look.pitch);
      look.yaw = look.pitch = 0;
      const b = enuBasis(cam.lat, cam.lon);
      const cp0 = Math.cos(cam.pitch), sp0 = Math.sin(cam.pitch);
      const cy0 = Math.cos(cam.yaw), sy0 = Math.sin(cam.yaw);
      const fwd = {
        x: (b.n.x * cy0 + b.e.x * sy0) * cp0 + b.u.x * sp0,
        y: (b.n.y * cy0 + b.e.y * sy0) * cp0 + b.u.y * sp0,
        z: (b.n.z * cy0 + b.e.z * sy0) * cp0 + b.u.z * sp0,
      };
      const right = { x: b.e.x * cy0 - b.n.x * sy0, y: b.e.y * cy0 - b.n.y * sy0, z: b.e.z * cy0 - b.n.z * sy0 };
      const boost = keys.has('ShiftLeft') || keys.has('ShiftRight') ? 6 : 1;
      const v = cam.speed * boost * dt;
      let dx = 0, dy = 0, dz = 0;
      if (keys.has('KeyW')) { dx += fwd.x * v; dy += fwd.y * v; dz += fwd.z * v; }
      if (keys.has('KeyS')) { dx -= fwd.x * v; dy -= fwd.y * v; dz -= fwd.z * v; }
      if (keys.has('KeyD')) { dx += right.x * v; dy += right.y * v; dz += right.z * v; }
      if (keys.has('KeyA')) { dx -= right.x * v; dy -= right.y * v; dz -= right.z * v; }
      if (keys.has('KeyE')) { dx += b.u.x * v; dy += b.u.y * v; dz += b.u.z * v; }
      if (keys.has('KeyQ')) { dx -= b.u.x * v; dy -= b.u.y * v; dz -= b.u.z * v; }

      llhToXyz(cam.lat, cam.lon, cam.alt, world);
      world.x += dx; world.y += dy; world.z += dz;
      const llh = xyzToLlh(world.x, world.y, world.z);
      cam.lat = llh.lat; cam.lon = llh.lon; cam.alt = llh.h;

      /* Keep the free camera above the ground. The heightfield is the authority
         here, not the resident tile grid: early in a session the only tile under
         you may be hundreds of kilometres across, and a one-directional clamp
         against its interpolated surface would shove the camera a hundred metres
         into the air and leave it there. */
      const gh = heightfield.heightAt(cam.lat, cam.lon);
      if (cam.alt < gh + 1.6) {
        cam.alt = gh + 1.6;
        llhToXyz(cam.lat, cam.lon, cam.alt, world);
      }
      const b2 = enuBasis(cam.lat, cam.lon);
      camFrame = {
        eye: { x: world.x, y: world.y, z: world.z },
        dir: fwd, up: b2.u, head: { x: world.x, y: world.y, z: world.z }, fov: null,
      };
    }
    const surfaceH = heightfield.heightAt(cam.lat, cam.lon);

    const rebased = stage.setEye(world.x, world.y, world.z);

    /* Orientation: three.js wants a basis, and the camera looks down its own
       negative z, so the forward direction is negated into the third column. */
    const zAxis = tmpZ.set(-camFrame.dir.x, -camFrame.dir.y, -camFrame.dir.z).normalize();
    const upV = tmpUp.set(camFrame.up.x, camFrame.up.y, camFrame.up.z);
    const xAxis = tmpX.crossVectors(upV, zAxis).normalize();
    const yAxis = tmpY.crossVectors(zAxis, xAxis);
    tmpM.makeBasis(xAxis, yAxis, zAxis);
    stage.camera.quaternion.setFromRotationMatrix(tmpM);
    stage.camera.updateMatrixWorld();
    const wantFov = photo.active ? photo.fov : camFrame.fov;
    if (wantFov && Math.abs(stage.camera.fov - wantFov) > 0.01 && !params.get('fov')) {
      stage.setFov(wantFov);
    }
    /* A long lens magnifies the ground without moving the camera closer to it,
       so the terrain has to be told to refine further than distance alone
       would ask for, or a 250 mm shot is a photograph of a smooth wall. */
    terrain.quadtree.lodScale = Math.min(4, 55 / Math.max(8, stage.camera.fov));
    terrain.setPixelAngle(stage.camera.fov, stage.renderer.domElement.height);
    /* Footfalls throw a little, wheels throw more, and a descent engine throws
       a thin sheet outwards rather than a cloud upwards. */
    dust.update(dt, rebased ? stage.origin.lastShift : null);
    dust.setPixelScale(stage.renderer.domElement.height, stage.camera.fov);
    if (eva && !driving && eva.player.grounded) {
      const steps = eva.player.stepsTaken;
      if (steps !== lastSteps) {
        lastSteps = steps;
        const u = eva.player.up();
        const o = stage.origin.origin;
        dust.burst({
          at: { x: eva.player.pos.x - o.x, y: eva.player.pos.y - o.y, z: eva.player.pos.z - o.z },
          up: u, count: eva.player.speed > 2 ? 14 : 6,
          speed: 0.7 + eva.player.speed * 0.35, angle: 26, spread: 0.7, size: 13,
        });
      }
    }
    if (driving && vehicle && Math.abs(vehicle.rover.speed) > 1.2) {
      const r = vehicle.rover;
      const o = stage.origin.origin;
      const b = enuBasis(r.lat, r.lon);
      const p = { x: 0, y: 0, z: 0 };
      llhToXyz(r.lat, r.lon, (r.meanGround ?? cam.alt), p);
      /* A rooster tail comes off the wheels, and it comes off hardest when they
         are sliding, which is what the Apollo crews found the moment they
         tried to corner. */
      const hard = r.sliding || r.slipping || r.boost;
      dust.burst({
        at: { x: p.x - o.x, y: p.y - o.y, z: p.z - o.z }, up: b.u,
        count: hard ? 12 : 5, speed: 1.0 + Math.abs(r.speed) * 0.5,
        angle: 34, spread: 0.8, size: 15,
      });
    }
    if (descent && descent.dust > 0.02) {
      const o = stage.origin.origin;
      const b = enuBasis(descent.lat, descent.lon);
      const p = { x: 0, y: 0, z: 0 };
      llhToXyz(descent.lat, descent.lon, heightfield.heightAt(descent.lat, descent.lon), p);
      /* One to three degrees above horizontal, which is why it reads as a sheet
         moving outwards rather than as a cloud going up. */
      dust.burst({
        at: { x: p.x - o.x, y: p.y - o.y, z: p.z - o.z }, up: b.u,
        count: Math.round(26 * descent.dust), speed: 9 + 26 * descent.dust,
        angle: 2.5, spread: 0.9, size: 10,
      });
    }

    if (eva) {
      eva.updateLights(stage.origin.origin, camFrame);
      eva.updateModel(stage.origin.origin, dt);
      if (eva.model) eva.model.group.visible = !driving && eva.view === 'third';
    }
    /* Somewhere pressurised is somewhere you can take the helmet off. */
    const sheltered = base && base.inside(cam.lat, cam.lon, cam.alt) ? 'ship'
      : driving && vehicle && vehicle.rover.pressure > 0.9 ? 'rover' : null;
    shelter.needs.step(dt * Math.max(1, state.timeRate));
    if (now - shelterAt > 900) {
      shelterAt = now;
      shelter.update(sheltered, sheltered ? {
        sunEl: local.sunEl,
        nextSunrise: local.sunEl > 0 ? null : hoursUntilSunElevation(
          skyAt, ephemerisAt, jdFromUnixMs, state.simMs, cam.lat, cam.lon, 0, true),
      } : null);
    }

    historic.update(cam.lat, cam.lon, stage.origin.origin, dt, local.sunDir);
    if (base) {
      base.step(dt, eva ? eva.player.llh : null);
      base.place(stage.origin.origin);
    }
    if (vehicle && !driving) {
      vehicle.step(dt, { toggleCanopy: canopyPress }, false);
      canopyPress = false;
      vehicle.place(stage.origin.origin, dt);
    }

    /* --- terrain ---------------------------------------------------------- */
    if (surface) surface.update(cam.lat, cam.lon, cam.alt - surfaceH);

    projScreen.multiplyMatrices(stage.camera.projectionMatrix, stage.camera.matrixWorldInverse);
    frustum.setFromProjectionMatrix(projScreen);
    terrain.update(world, params.get('cull') === '0' ? null : frustum, rebased);
    stage.focusShadow(stage.camera.position.x, stage.camera.position.y, stage.camera.position.z,
      cam.alt < 200 ? 180 : 700);

    stage.render();

    /* Autosave: often enough that nothing is lost, rarely enough that it is
       never noticed. The ship arriving somewhere new is worth one immediately. */
    if (base) save.tick(now, game);

    if (!ready && terrain.stats.tiles > 40) {
      ready = true;
      el('boot').classList.add('gone');
      window.SELENE.ready = true;
    }

    /* --- HUD -------------------------------------------------------------- */
    el('s-lat').textContent = fmtLat(cam.lat);
    el('s-lon').textContent = fmtLon(cam.lon);
    el('s-elev').textContent = surfaceH.toFixed(0) + ' m';
    el('s-alt').textContent = fmtDist(cam.alt - surfaceH);
    el('s-sun').textContent = `${local.sunEl.toFixed(1)}° el  ${local.sunAz.toFixed(0)}° az`;
    el('s-earth').textContent = local.earthVisible
      ? `${local.earthEl.toFixed(1)}° el  ${(eph.earthIllum * 100).toFixed(0)}% lit`
      : 'below horizon';
    el('s-time').textContent = new Date(state.simMs).toISOString().replace('T', ' ').slice(0, 19) +
      (state.timeRate === 0 ? '  (held)' : state.timeRate === 1 ? '' : `  ${fmtRate(state.timeRate)}`);
    const evaSnap = eva ? eva.snapshot() : null;
    /* The caption for arriving. It waits until the ground under you has
       actually resolved, so the elevation it quotes is the real one. */
    moment.update(now);
    if (eva && mode === 'surface' && !photo.active && terrain.stats.tiles > 90 &&
        now - startedAt > 2500) {
      const near = historic.nearest();
      moment.firstStep({
        lat: cam.lat, lon: cam.lon, elevation: surfaceH,
        feature: near && near.range < 1200 ? 'Tranquility Base'
          : orbit.nearestFeature(cam.lat, cam.lon)?.f[0],
        unit: geology ? geologyName(geology, cam.lat, cam.lon) : null,
        earthVisible: local.earthEl > 0, earthEl: local.earthEl, farSide: local.farSide,
        earthDist: eph.earthDist / 1000,
        /* The site the ship was held off, and which way it is from here. */
        approach: keepOut && keepOut.site ? {
          name: keepOut.site.name,
          distance: fmtDist(surfaceDistance(cam.lat, cam.lon, keepOut.site.lat, keepOut.site.lon)),
          where: compass(bearing(cam.lat, cam.lon, keepOut.site.lat, keepOut.site.lon)),
        } : null,
      });
    }
    nav.show(driving && !photo.active);
    if (driving && vehicle) {
      const near = orbit.nearestFeature(cam.lat, cam.lon);
      nav.update({
        lat: cam.lat, lon: cam.lon, heading: vehicle.rover.heading,
        elevation: surfaceH, slope: heightfield.slopeAt(cam.lat, cam.lon, 8),
        speed: vehicle.rover.speed,
        home: base ? { lat: base.lat, lon: base.lon } : null,
        driven: vehicle.rover.distance,
        roverHours: vehicle.rover.endurance(),
        suitSeconds: eva ? eva.suit.endurance() : Infinity,
        nearest: near ? { name: near.f[0], km: near.km } : null,
      });
    }
    suitHud.update(photo.active ? null : evaSnap);
    if (photo.active) {
      photo.update({
        lat: cam.lat, lon: cam.lon, simMs: state.simMs, sunEl: local.sunEl,
        bias: photo.bias, source: heightfield.probe(cam.lat, cam.lon).source,
      });
    }
    /* Vacuum outside, air inside. Until there is a ship or a rover to be in,
       the only two states are wearing a suit and flying a camera that is not
       there at all. */
    /* Where you are decides what you can hear. Outside there is no air at all,
       so everything arrives through the suit or through whatever you are
       touching; inside the rover or the ship there is a cabin around you. */
    const roverSnap = vehicle ? vehicle.snapshot(eva ? eva.player.llh : null) : null;
    const baseSnap = base ? base.snapshot(eva ? eva.player.llh : null) : null;
    const environment = baseSnap && baseSnap.inside ? 'ship'
      : driving ? (roverSnap.pressure > 0.5 ? 'rover_closed' : 'rover_open')
      : evaSnap ? 'suit' : 'ship';
    sound.update({
      dt, environment,
      pressure: baseSnap && baseSnap.inside ? baseSnap.pressure
        : driving ? roverSnap.pressure : evaSnap ? 0 : 1,
      player: evaSnap ? evaSnap.player : undefined,
      suit: evaSnap ? evaSnap.suit : undefined,
      rover: roverSnap ? {
        throttle: driving ? 1 : 0, speed: roverSnap.speed,
        wheelImpact: roverSnap.airborne ? 0 : Math.min(1, Math.abs(roverSnap.speed) / 8),
        boost: roverSnap.boost, canopy: roverSnap.canopy,
      } : undefined,
      ship: baseSnap ? { interiorLevel: baseSnap.interiorLevel, airlock: baseSnap.airlock } : undefined,
    });
    el('s-tiles').textContent = `${terrain.stats.tiles}  (${terrain.stats.building} building)`;
    el('s-tris').textContent = (terrain.stats.triangles / 1000).toFixed(0) + 'k';
    el('s-fps').textContent = fps.toFixed(0);

    if (state.showScience && now - probeCache.t > 250) {
      probeCache.t = now;
      updateScience(heightfield, geology, cam, local, eph, surface, streams, temperature);
    }
  }

  window.SELENE = {
    ready: false, stage, terrain, sky, heightfield, cam, state, streams, surface,
    get eva() { return eva; },
    historic,
    get base() { return base; },
    get vehicle() { return vehicle; },
    get driving() { return driving; },
    board() { driving = true; },
    get descent() { return descent; },
    get mode() { return mode; },
    land(lat, lon) { land({ lat, lon }); },
    temperature,
    get astronaut() { return astronaut; },
    walk(lat, lon) { startEva(lat, lon); },
    goto(lat, lon, alt) { cam.lat = lat; cam.lon = lon; cam.alt = alt ?? cam.alt; },
    setTime(iso) { state.simMs = Date.parse(iso); },
    stats: () => ({ ...terrain.stats, fps }),
  };
  requestAnimationFrame(frame);
}

/* --- helpers ---------------------------------------------------------------- */

/**
 * How much of the frame is ground rather than black sky, which is what an eye
 * or a camera actually meters.
 *
 * Near the surface it depends on where you are looking. From orbit it is
 * geometry: the Moon's angular radius from a given height against the lens's
 * own half-angle. Treating the globe from a thousand kilometres up as a small
 * bright object in a mostly black frame was worth nearly a stop, and it is the
 * reason the opening view came out as a sheet of white paper rather than as
 * the grey, mare-mottled disc every photograph of it shows.
 */
function groundFraction(cam, heightfield, fovDeg) {
  const alt = cam.alt - heightfield.heightAt(cam.lat, cam.lon);
  if (alt < 50000) return 0.55 + 0.35 * Math.max(0, -Math.sin(cam.pitch));
  const angle = Math.asin(Math.min(1, R_MOON / (R_MOON + Math.max(1, alt))));
  const half = (fovDeg || 55) * 0.5 * Math.PI / 180;
  /* Squared because it is an area, floored because there is always something
     under a camera pointed at a planet from orbit. */
  return Math.max(0.25, Math.min(0.95, (angle / half) ** 2));
}

/** The USGS unit name under a point, for the arrival caption. */
function geologyName(geology, lat, lon) {
  const x = Math.min(geology.width - 1, Math.max(0, ((lon + 180) / 360 * geology.width) | 0));
  const y = Math.min(geology.height - 1, Math.max(0, ((90 - lat) / 180 * geology.height) | 0));
  const u = geology.legend.units[String(geology.data[y * geology.width + x])];
  return u ? u.name.toLowerCase() : null;
}

/** Angle between two directions given as elevation and azimuth, in degrees. */
function phaseAngle(el1, az1, el2, az2) {
  const D = Math.PI / 180;
  const c = Math.sin(el1 * D) * Math.sin(el2 * D) +
            Math.cos(el1 * D) * Math.cos(el2 * D) * Math.cos((az1 - az2) * D);
  return Math.acos(Math.max(-1, Math.min(1, c))) / D;
}

/** Normal albedo under a point, from the USGS geologic unit. REGIONAL. */
function albedoAt(geology, lat, lon) {
  if (!geology) return OPTICS.albedoMare;
  const x = Math.min(geology.width - 1, Math.max(0, ((lon + 180) / 360 * geology.width) | 0));
  const y = Math.min(geology.height - 1, Math.max(0, ((90 - lat) / 180 * geology.height) | 0));
  return geology.albedo[geology.data[y * geology.width + x]];
}

function fmtLat(v) { return `${Math.abs(v).toFixed(5)}° ${v >= 0 ? 'N' : 'S'}`; }
function fmtLon(v) { return `${Math.abs(v).toFixed(5)}° ${v >= 0 ? 'E' : 'W'}`; }
function fmtDist(m) {
  if (Math.abs(m) < 1000) return m.toFixed(1) + ' m';
  if (Math.abs(m) < 1e6) return (m / 1000).toFixed(2) + ' km';
  return (m / 1000).toFixed(0) + ' km';
}
/* Which way to look, in words, because a bearing in degrees is not something
   you can turn towards without reading it off an instrument first. */
const POINTS = ['north', 'north-east', 'east', 'south-east',
                'south', 'south-west', 'west', 'north-west'];
function compass(az) { return POINTS[Math.round(((az % 360) + 360) % 360 / 45) % 8]; }
function fmtRate(r) {
  if (r >= 86400) return (r / 86400).toFixed(0) + ' d/s';
  if (r >= 3600) return (r / 3600).toFixed(0) + ' h/s';
  if (r >= 60) return (r / 60).toFixed(0) + ' min/s';
  return r + '×';
}
const tag = (label) => {
  const cls = label.toLowerCase().split(' ')[0];
  return `<span class="tag ${cls}">${label}</span>`;
};

let sciencePending = false;
let scienceRemote = null;
let scienceAt = { lat: 999, lon: 999 };

function updateScience(hf, geology, cam, local, eph, streamer, streams, temperature) {
  const p = hf.probe(cam.lat, cam.lon);
  el('d-topo').innerHTML = `${p.res_m < 10 ? p.res_m.toFixed(1) : p.res_m.toFixed(0)} m/px ${tag(p.label)}`;
  el('d-detail').innerHTML = Math.abs(p.proceduralHeight) > 0.001
    ? `${p.proceduralHeight >= 0 ? '+' : ''}${p.proceduralHeight.toFixed(2)} m ${tag('PROCEDURAL')}`
    : 'none';
  const desc = streamer ? streamer.describe() : null;
  if (desc && desc.elevation) {
    el('d-topo').innerHTML =
      `${p.res_m < 10 ? p.res_m.toFixed(1) : p.res_m.toFixed(0)} m/px ${tag(p.label)}`;
  }
  el('d-img').innerHTML = desc && desc.imagery
    ? `${desc.imagery.res_m < 10 ? desc.imagery.res_m.toFixed(2) : desc.imagery.res_m.toFixed(0)} m/px ${tag('MEASURED')}`
    : `LROC WAC 1.3 km/px ${tag('MEASURED')}`;
  let geolText = 'unavailable';
  if (geology) {
    const x = Math.min(geology.width - 1, Math.max(0, ((cam.lon + 180) / 360 * geology.width) | 0));
    const y = Math.min(geology.height - 1, Math.max(0, ((90 - cam.lat) / 180 * geology.height) | 0));
    const dn = geology.data[y * geology.width + x];
    const u = geology.legend.units[String(dn)];
    geolText = u ? `${u.code} ${u.name}, ${u.age}` : `unit ${dn}`;
  }
  el('d-geol').innerHTML = `${geolText} ${tag('REGIONAL')}`;
  /* Diviner's own maps, vendored at half a degree, interpolated across the day
     by the model in data/temperature.js. */
  const lt = localSolarTime(eph, cam.lat, cam.lon);
  const temp = temperature ? temperature.at(cam.lat, cam.lon, local.sunEl, lt * 24) : null;
  el('d-temp').innerHTML = temp
    ? `${temp.kelvin.toFixed(0)} K  <span class="est">${temp.celsius.toFixed(0)} C</span> ` +
      `${tag('REGIONAL')}<span class="est"> Diviner ${temp.diviner.min.toFixed(0)}–${temp.diviner.max.toFixed(0)} K</span>`
    : 'unavailable';
  el('d-slope').textContent = hf.slopeAt(cam.lat, cam.lon).toFixed(1) + '°';

  /* Ask NASA what is really here, but only when the player has moved: these are
     network round trips, not something to do every frame. */
  if (streams && streams.enabled && !sciencePending &&
      (Math.abs(cam.lat - scienceAt.lat) > 0.002 || Math.abs(cam.lon - scienceAt.lon) > 0.002)) {
    sciencePending = true;
    scienceAt = { lat: cam.lat, lon: cam.lon };
    streams.probe(cam.lat, cam.lon).then((r) => { scienceRemote = r; })
      .finally(() => { sciencePending = false; });
  }
  /* What NASA says is here, when the network can be asked. Each of these is a
     different instrument at a different resolution, so each carries its own
     tag rather than being merged into one confident-looking line. */
  if (scienceRemote) {
    if (scienceRemote.geology) {
      const g = scienceRemote.geology;
      el('d-geol').innerHTML = `${g.unit} ${g.name}, ${g.period} ${tag('REGIONAL')}`;
    }
    if (scienceRemote.minerals && scienceRemote.minerals.FeO !== null) {
      el('d-min').innerHTML = `FeO ${scienceRemote.minerals.FeO.toFixed(1)} wt % ${tag('REGIONAL')}` +
        '<span class="est"> Kaguya MI, 7.6 km</span>';
    }
    if (scienceRemote.gravity && scienceRemote.gravity.freeAir_mGal !== null) {
      /* A hundred milligals is about six thousandths of lunar gravity, which
         is real, is measured, and is far too small for anyone to feel. */
      const mGal = scienceRemote.gravity.freeAir_mGal;
      el('d-grav').innerHTML =
        `${(1.6246 + mGal * 1e-5).toFixed(4)} m/s² ${tag('MEASURED')}` +
        `<span class="est"> free-air ${mGal >= 0 ? '+' : ''}${mGal.toFixed(0)} mGal, GRAIL</span>`;
    }
    if (scienceRemote.lolaCount !== null && scienceRemote.lolaCount !== undefined) {
      const n = scienceRemote.lolaCount;
      el('d-count').innerHTML = n > 0
        ? `${n.toFixed(0)} LOLA shots in this pixel ${tag('MEASURED')}`
        : `no altimeter shot here ${tag('INTERPOLATED')}` +
          '<span class="est"> the elevation is filled in between tracks</span>';
    }
  } else if (streams && !streams.enabled) {
    for (const id of ['d-min', 'd-grav', 'd-count']) el(id).textContent = 'offline';
  }

  const parts = [p.source];
  if (desc && desc.imagery) parts.push(desc.imagery.source);
  if (temp) parts.push(temp.source);
  if (p.padded) parts.push('landing pad (FICTIONAL)');
  if (desc) parts.push('streaming: ' + desc.status);
  el('d-src').textContent = parts.join('  ·  ');
}

start().catch(e => {
  const f = document.getElementById('fatal');
  f.style.display = 'flex';
  f.textContent = 'SELENE failed to start\n\n' + (e && e.stack || e);
});
