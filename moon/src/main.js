/* =============================================================================
   MAIN — bootstrap and the frame loop
   -----------------------------------------------------------------------------
   Order every frame: clock, ephemeris, physics, snapshot, render. Nothing in the
   renderer reaches back into the simulation.

   URL parameters (used by the screenshot harness and handy for exploring):
     ?site=apollo11        a site id from data/sites.json, or lat,lon
     ?t=1969-07-20T20:17Z  simulation start time
     ?alt=800              starting altitude in metres
     ?view=orbit|ground|descent   camera framing, or fly the landing in
     ?quality=high         performance | balanced | high | ultra | science
     ?rate=600             time acceleration
     ?offline=1            do not stream anything from NASA
   ========================================================================== */

import * as THREE from 'three';
import { QUALITY, DEFAULT_QUALITY, R_MOON, TERRAIN, OPTICS, TIME, STREAM, LABEL,
         SUIT, ROVER, PLAYER } from './config.js';
import { Stage } from './render/stage.js';
import { TerrainSystem } from './render/terrain.js';
import { Sky } from './render/sky.js';
import { DustField } from './render/dust.js';
import { Exposure } from './render/exposure.js';
import { ephemerisAt, skyAt, jdFromUnixMs, localSolarTime, nextDaylight } from './physics/ephemeris.js';
import { llhToXyz, xyzToLlh, enuBasis, llToUnit, horizonDistance,
         offsetLatLon, surfaceDistance, bearing } from './physics/frames.js';
import { loadVendoredHeightfield, readJson, readBinary } from './terrain/loader.js';
import { tileLambda } from './terrain/cubesphere.js';
import { Detail } from './terrain/detail.js';
import { decodePng8 } from './terrain/png16.js';
import { Streams } from './data/streams.js';
import { Cache } from './data/cache.js';
import { SurfaceStreamer } from './data/surface.js';
import { TemperatureMap, pitTemperature, PIT_THERMAL } from './data/temperature.js';
import { GravityMap } from './data/gravity.js';
import { EVA, VIEW } from './game/eva.js';
import { Descent } from './game/descent.js';
import { Base } from './game/base.js';
import { Vehicle } from './game/vehicle.js';
import { HistoricSites } from './game/historic.js';
import { Shelter, hoursUntilSunElevation } from './game/shelter.js';
import { Visited } from './game/visited.js';
import { Track } from './game/track.js';
import { Achievements } from './game/achievements.js';
import { PitField } from './game/pitfield.js';
import { floorBoulders } from './game/cave.js';
import { Gamepads } from './game/gamepad.js';
import { Tracks } from './render/tracks.js';
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

/* The rates T cycles through: fixed, then realistic, then every accelerated
   step the config table names. One list, built from the table the brief's
   three modes are described in. */
const TIME_RATES = [...TIME.modes.fixed, ...TIME.modes.realistic, ...TIME.modes.accelerated];

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
  /* GRAIL's free-air anomaly, likewise vendored. This file has been in the
     repository since the pipeline first ran and had no reader anywhere, while
     DATA_SOURCES.md described the layer as streamed *and* vendored — so the
     gravity row was the one line on the science overlay with no offline
     fallback at all. */
  let gravity = null;
  if (manifest.gravity) {
    try { gravity = await new GravityMap(manifest.gravity).load(DATA); }
    catch (e) { console.warn('gravity map unavailable:', e.message); }
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

  /* The catalogued lava-tube pits. Not streamed, because nothing streams them:
     these are built from the LROC atlas's published dimensions and installed
     when you come within thirty kilometres of one. Independent of `registry`,
     since the numbers are in the source rather than on a server. */
  const pitField = new PitField({ heightfield, terrain });
  /* The conduit under the Mare Tranquillitatis pit is a mesh rather than
     terrain, because a height field cannot describe a ceiling over a void. It
     is built the first time the pit is installed and thrown away with it. */
  let caveModel = null, caveOwner = null;

  /* --- where are we? ------------------------------------------------------ */
  let site = sites.sites.find(s => s.id === (params.get('site') || 'apollo11'));
  if (!site && params.get('site') && params.get('site').includes(',')) {
    const [lat, lon] = params.get('site').split(',').map(Number);
    site = { id: 'custom', name: 'custom', lat, lon };
  }
  if (!site) site = sites.sites[0];

  /* --- and is anyone home when we get there? ------------------------------
     The Moon turns once a month, so "now" is a coin toss between a lit
     landscape and fourteen days of dark. On the day this was written forty of
     the forty-seven sites in the catalogue were below the horizon or within
     three degrees of the terminator, Tranquility Base among them at eighty-two
     degrees below -- local midnight. Arriving there without being told is
     indistinguishable from a black screen and a broken game, which is exactly
     how it was reported.
     So unless a time was asked for, the clock moves to the next time the sun
     is over the place we are going. Nothing about the lighting is faked: the
     date on the HUD is the date being simulated, and the shift is said out
     loud when it happens. `?t=` still wins, and touching the picker's clock
     hands control back for good. */
  let autoClock = !params.get('t');
  let clockMoved = 0;
  if (autoClock) {
    const lit = nextDaylight(state.simMs, site.lat, site.lon);
    if (lit && lit.waitedMs > 0) { state.simMs = lit.ms; clockMoved = lit.waitedMs; }
  }
  /* Cut the pit before anyone stands anywhere near it. The frame loop would get
     to this a moment later, which is a moment too late: it would put the ground
     a hundred metres below someone who had already been placed on it. */
  pitField.update(site.lat, site.lon);

  /* The astronaut is only needed in third person, and the page must still run
     if the module is missing, so it is imported on the side. */
  /* Declared before the dynamic imports below, because those resolve on their
     own schedule and one of them will land before this line otherwise.

     `eva` belongs here for exactly the same reason and was three hundred lines
     further down, which was a latent crash rather than a safe ordering: there
     are awaits between this line and its old declaration, and an import that
     resolves during one of them reaches `if (eva)` while `eva` is still in the
     temporal dead zone. It threw "Cannot access 'eva' before initialization",
     the catch turned that into "astronaut model unavailable", and the game
     then ran with no astronaut in third person — a real failure reported as a
     graceful degradation, which is the shape of bug this project has been
     digging out all week. */
  let base = null, vehicle = null;
  let eva = null;
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
  /* Where the rover has been, which the console draws and the save keeps. */
  /* Two lines: what the wheels left and what the boots left. There is no wind
     here to take them away, so they do not go away. */
  const track = new Track();
  const bootTrack = new Track();
  const nav = new Nav({ waypoints: [], track, heightfield });
  /* Eating, sleeping, and waiting for the Sun, which on a body with a
     29 and a half day rotation is a real thing to want to do. */
  const shelter = new Shelter({
    el: el('shelter'),
    onRest: (hours, what) => {
      if (what === 'eat') { shelter.needs.eat(); sound.beep('confirm'); return; }
      /* The vacuum point in the vestibule. The ship has had the hose, the brush
         and the tray under the grating modelled since it was built, and nothing
         behind them; this is the chore they were built for. */
      if (what === 'clean' && eva) {
        const was = eva.suit.dust;
        eva.suit.clean();
        sound.beep(was > 0.02 ? 'confirm' : 'deny');
        say(was > 0.02 ? 'suit vacuumed; the tray goes out with the rubbish'
                       : 'nothing much to clean off', 3500);
        return;
      }
      if (what === 'resupply' && vehicle) {
        vehicle.rover.restock(); vehicle.dust = 0;
        sound.beep('confirm');
        say('rover restocked from the ship', 3000);
        return;
      }
      /* A recharge comes out of somewhere. Free suit consumables on every
         sleep made the middle range tier decorative: you could stay out
         indefinitely as long as you napped. */
      if (what === 'recharge' && eva) {
        const from = shelterKind();
        if (from === 'rover' && vehicle) {
          if (!vehicle.rover.rechargeSuit(eva.suit)) {
            /* The point of the middle tier is that it can run out too, so
               being refused has to be legible rather than a button that does
               nothing. */
            sound.beep('deny');
            say('the rover has not enough left to fill the suit', 4000);
            return;
          }
          say('suit recharged from the rover', 3000);
        } else {
          eva.suit.recharge();               // the ship restocks from its own tanks
          say('suit recharged from the ship', 3000);
        }
        sound.beep('confirm');
        return;
      }
      let h = hours;
      if (what && what.startsWith('sun:')) {
        h = hoursUntilSunElevation(skyAt, ephemerisAt, jdFromUnixMs,
          state.simMs, cam.lat, cam.lon, Number(what.slice(4)), true);
        if (h === null) {
          sound.beep('deny');
          say('the Sun does not reach that elevation here', 4000);
          return;
        }
      }
      if (!h) return;
      state.simMs += h * 3600 * 1000;
      shelter.needs.sleep(h);
      /* Sleeping in the rover draws on the rover; sleeping in the ship draws
         on the ship, which for now is the one place with more than it needs. */
      const where = shelterKind();
      if (vehicle && where === 'rover') vehicle.rover.consume(h, 1);
      if (eva) {
        if (where === 'rover' && vehicle) vehicle.rover.rechargeSuit(eva.suit);
        else eva.suit.recharge();
      }
      save.write(game, 'slept');
      sound.beep('confirm');
    },
  });
  /* Where you are sheltering, which decides what a night's sleep costs and
     whose tanks a recharge comes out of. */
  const shelterKind = () => (
    base && eva && base.inside(eva.player.llh.lat, eva.player.llh.lon, eva.player.llh.h) ? 'ship'
      : driving && vehicle && vehicle.rover.pressure > 0.9 ? 'rover' : null);

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
  let driving = false, canopyPress = false;
  /* The places you have actually been inside. Nothing gates on it; it is
     the record of a run, and the brief is explicit that discovery is the
     content. It was a hardcoded empty array that nothing appended to and
     the save never read back. */
  const visited = new Visited();

  /* How hard a wheel just hit something.
     An impact is a rate, not a speed: what puts a knock into a chassis is a
     suspension leg being compressed fast, which is what happens when a wheel
     drops off a crater rim or lands after a jump. Feeding it the speed
     instead — which is what this did — meant driving flat out across a smooth
     mare knocked continuously and dropping a metre onto a boulder at walking
     pace was silent, exactly backwards.
     The reference rate is most of the 42 cm of travel used up in about a tenth
     of a second, which is a hard hit. */
  const prevSusp = [0, 0, 0, 0];
  const wheelImpact = (snap, dt) => {
    if (!snap || !snap.suspension || dt <= 0) return 0;
    let worst = 0;
    for (let i = 0; i < snap.suspension.length; i++) {
      const rate = (snap.suspension[i] - prevSusp[i]) / dt;
      prevSusp[i] = snap.suspension[i];
      /* Only a wheel that is on the ground can be hit by it. */
      if (snap.contact && !snap.contact[i]) continue;
      if (rate > worst) worst = rate;
    }
    return Math.min(1, worst / 3.5);
  };

  /* One implementation each for getting in and out of things, because the
     keyboard and the pad both do them and two copies is how they diverge. */
  const clamp1 = (v) => (v < -1 ? -1 : v > 1 ? 1 : v);
  /* The two movement axes, in one place so the arrows cannot be bound for
     walking and forgotten for driving. `KeyW` and friends are physical key
     positions rather than letters, so this is still the top-left cluster on a
     keyboard that calls it Z. */
  const held = (...codes) => codes.some(c => keys.has(c));
  const moveAhead = () =>
    (held('KeyW', 'ArrowUp') ? 1 : 0) - (held('KeyS', 'ArrowDown') ? 1 : 0);
  const moveSide = () =>
    (held('KeyD', 'ArrowRight') ? 1 : 0) - (held('KeyA', 'ArrowLeft') ? 1 : 0);

  const boardToggle = () => {
    if (!vehicle || !eva) return;
    if (driving) {
      /* Getting out of a moving vehicle.
         This used to just do it, and leave the rover with every bit of its
         speed — so stepping out at the cruise ceiling abandoned a driverless
         vehicle that coasted 324 metres before the residual drag caught it,
         and over a kilometre from a boost. That is the whole of "when I got
         out it disappeared": it had driven off without you.
         So: below a walking pace you may step down, and the vehicle is
         stopped as you do. Above it, you are told to stop first. */
      if (Math.abs(vehicle.rover.speed) > 1.5) {
        sound.beep('deny');
        say(`${(vehicle.rover.speed * 3.6).toFixed(0)} km/h is too fast to step down — space is the brake`, 3000);
        return;
      }
      driving = false;
      vehicle.rover.speed = 0;
      vehicle.rover.vertical = 0;
      vehicle.rover.yawRate = 0;
      const out = vehicle.dismountPoint();
      eva.place(out.lat, out.lon, 0.1);
      sound.beep('select');
    } else if (vehicle.canBoard(eva.player.llh.lat, eva.player.llh.lon)) {
      driving = true;
      /* Face the way the vehicle is pointing rather than the way you happened
         to be walking, or the first thing you see is its own bodywork. */
      cam.yaw = vehicle.rover.heading * Math.PI / 180;
      cam.pitch = -0.05;
      sound.beep('select');
    } else {
      /* A control that does nothing and says nothing is indistinguishable
         from one that is broken. */
      sound.beep('deny');
      say('too far from the rover', 2000);
    }
  };

  const hatchToggle = () => {
    if (!eva || !base || driving) return;
    const p = eva.player.llh;
    if (base.canExit(p.lat, p.lon, p.h)) {
      base.cycleAirlock(0);
      const f = base.ladderFoot();
      eva.place(f.lat, f.lon, 0.1);
      sound.beep('confirm');
      say('airlock cycling to vacuum', 4000);
    } else if (base.canEnter(p.lat, p.lon, p.h)) {
      base.cycleAirlock(1);
      /* Whatever is on the suit comes through the hatch with you. */
      base.admit(eva.suit);
      const inn = base.insideStand();
      eva.place(inn.lat, inn.lon, inn.agl);
      sound.beep('confirm');
      say(eva.suit.dust > 0.3
        ? 'airlock repressurising · you are bringing the Moon in with you'
        : 'airlock repressurising', 4500);
    } else {
      sound.beep('deny');
      say('no hatch within reach', 2000);
    }
  };

  /* The log panel. Rebuilt only when it changes or when it is opened, because
     nothing about it needs to be live. */
  const renderLog = () => {
    if (!el('log')) return;
    const km = (m) => (m >= 1000 ? `${(m / 1000).toFixed(2)} km` : `${m.toFixed(0)} m`);
    el('lg-walk').textContent = eva ? km(eva.player.distance) : '—';
    el('lg-drive').textContent = vehicle ? km(vehicle.rover.distance) : '—';
    const ex = achievements.extremes;
    const line = (e, unit, dp) => (e
      ? `<div class="e"><b>${e.value.toFixed(dp)}${unit}</b>` +
        `<span>${e.note} · ${fmtLat(e.lat)} ${fmtLon(e.lon)}</span></div>`
      : '');
    el('lg-extremes').innerHTML =
      line(ex.deepest, ' m', 0) + line(ex.highest, ' m', 0) +
      line(ex.steepest, '°', 1) +
      (ex.furthest ? `<div class="e"><b>${km(ex.furthest.value)}</b>` +
        `<span>${ex.furthest.note}</span></div>` : '') ||
      '<div class="none">nothing measured yet</div>';
    el('lg-list').innerHTML = achievements.list().map(e =>
      `<div class="e"><b>${e.title}</b>${e.note ? `<span>${e.note}</span>` : ''}</div>`
    ).join('') || '<div class="none">nowhere yet</div>';
  };

  /* The bottom-right line, which is the game's whole notification budget.
     What it falls back to depends on whether the pointer is yours or the
     game's: on the surface with the pointer loose, the single most useful
     thing it can say is how to start looking around. */
  let hintBack = 0;
  const idleHint = () =>
    (mode !== 'orbit' && !looking() && !lockDenied)
      ? 'click to look  ·  H for controls'
      : 'H for controls';
  const restHint = () => { el('hint').textContent = idleHint(); };
  const say = (text, ms) => {
    el('hint').textContent = text;
    clearTimeout(hintBack);
    hintBack = setTimeout(restHint, ms);
  };
  addEventListener('pointerlockchange', restHint, false);

  const startEva = (lat, lon) => {
    /* Standing on the exact published coordinates of a landing site puts you
       inside the spacecraft. Step out of the hardware and turn to look at it,
       which is what you would do anyway. */
    const clear = standClearOf(sites.sites, lat ?? cam.lat, lon ?? cam.lon);
    eva = new EVA({
      stage, heightfield, quality: state.quality,
      lat: clear.lat, lon: clear.lon,
      yaw: clear.yaw ?? cam.yaw * 180 / Math.PI,
      /* The URL wins, then whatever the settings panel was last left on. This
         read the URL alone, so a saved `relaxed` was honoured until you
         reloaded and then silently was not: `Settings.apply` pushes the mode
         into a live suit, and on a fresh load there is no live suit yet --
         the game opens in orbit and this builds the first one. */
      suitMode: params.get('suit') || (Save.readSettings() || {}).suit || undefined,
    });
    if (astronaut) eva.setModel(astronaut);
    if (base) eva.setBase(base);
    /* Before the first step rather than after it: a walker created inside the
       cave would otherwise take one step with no cave to stand on, find itself
       a hundred metres under the ground the height field describes, and be
       pushed up through the roof. */
    eva.cave = pitField.cave;
    return eva;
  };

  /* --- the opening: orbit ---------------------------------------------------
     The game starts by looking at the real Moon from a few hundred kilometres
     up and choosing somewhere to go. `?view=ground` and `?mode=eva` skip
     straight past it, which is what the screenshot harness wants. */
  let names = { features: [] };
  try { names = await readJson(DATA, 'names.json'); }
  catch (e) { console.warn('nomenclature unavailable', e.message); }

  /* The log: real places reached, not tasks completed. Nothing is gated on it
     and nothing about it interrupts anything. Built here rather than with the
     other game objects because it reads the gazetteer, which is loaded above
     this line and not below it. */
  const achievements = new Achievements({ sites, names });

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
    getTime: () => state.simMs,
    /* Setting the clock by hand is a decision, and it stands: from here on
       nothing moves it to find you better light. */
    onTime: (ms) => { state.simMs = ms; autoClock = false; },
  });
  terrain.setOverlayMaps(geology, temperature);
  /* The marks, drawn on the surface from the same recorders the nav map uses. */
  const tracks = new Tracks(stage, heightfield);

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
    /* You may well have picked somewhere other than where the URL pointed, and
       the boot-time daylight search only knew about that first place. Look
       again for wherever you actually chose. */
    if (autoClock) {
      const lit = nextDaylight(state.simMs, pick.lat, pick.lon);
      if (lit && lit.waitedMs > 0) { state.simMs = lit.ms; clockMoved = lit.waitedMs; }
    }
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
    pitField.update(keepOut.lat, keepOut.lon);
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
    if (eva) eva.setBase(base);
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
    arriveInto(lat, lon);
    save.write(game, 'landed');
  }

  /* What the ground looks like at the moment you reach it, said out loud.
     -----------------------------------------------------------------------
     Two cases worth a sentence. Either the clock was moved to find the sun,
     which the player is entitled to know about because the date on the HUD is
     no longer today; or it is genuinely night, in which case the screen is
     black for a real reason and saying nothing makes a correct simulation
     look like a failed one. Lamps come on by themselves in the dark: a person
     who had walked down that ladder would not be feeling for the switch. */
  const days = (ms) => {
    const d = ms / 86400e3;
    return d < 1.5 ? `${Math.round(d * 24)} hours` : `${d.toFixed(1).replace(/\.0$/, '')} days`;
  };

  /* The controls panel, and the one time it opens on its own.
     -----------------------------------------------------------------------
     Everything a player needs was already in here on H, and the only thing
     pointing at it was five words of grey text in a corner. That is not a
     control scheme, it is a rumour. So the first time anyone stands on the
     Moon the panel is simply open, and after that it stays out of the way
     for good. Remembered next to the settings, because a player who has read
     it once does not want it again tomorrow. */
  const setHelp = (v) => {
    state.showHelp = v;
    el('help').style.display = v ? 'block' : 'none';
    restHint();
  };
  function openHelpOnce() {
    /* `?help=0` for anyone who already knows, and for the screenshot harness,
       whose pictures are documentation and should not have a panel across
       them. `?help=1` forces it back for testing the thing itself. */
    if (params.get('help') === '0') return;
    let seen = false;
    try { seen = !!Save.readSettings().helpSeen; } catch { /* private mode: show it */ }
    if (seen && params.get('help') !== '1') return;
    Save.writeSettings({ ...Save.readSettings(), helpSeen: true });
    setHelp(true);
  }

  /* Three things the game owned and never mentioned.
     -----------------------------------------------------------------------
     The rover parks eleven metres off the ship's port side and boards from
     within four, and `boardable` has been computed every frame since it was
     written without anything ever reading it -- so the vehicle was, in
     practice, invisible. The jetpack is held on J and was findable only by
     reading the panel. Each of these gets one line, the first time it can
     possibly be useful, and then never again. */
  const told = { rover: false, jet: false, rolled: false };
  let fallingFor = 0;
  function prompts() {
    if (photo.active || mode !== 'surface' || !eva) return;
    if (vehicle && !driving) {
      const s = vehicle.snapshot(eva.player.llh);
      if (s.rolled && !told.rolled) {
        told.rolled = true;
        say('The rover is on its roof. R rights it.', 6000);
      } else if (s.boardable && !told.rover) {
        told.rover = true;
        say('R gets you into the rover. Shift is the boost.', 6000);
      }
    }
    /* Long enough in the air to be worried rather than mid-stride. */
    fallingFor = (!driving && eva.player && !eva.player.grounded) ? fallingFor + 1 : 0;
    if (fallingFor > 90 && !told.jet) {
      told.jet = true;
      say('Hold J for the jetpack.', 6000);
    }
  }

  function arriveInto(lat, lon) {
    openHelpOnce();
    const sunEl = skyAt(ephemerisAt(jdFromUnixMs(state.simMs)), lat, lon, 0).sunEl;
    if (sunEl <= 0) {
      if (eva && eva.lampMode === 0) eva.cycleLamps();
      const dawn = nextDaylight(state.simMs, lat, lon, 0.5);
      say(dawn && dawn.waitedMs > 0
        ? `Lunar night, sun ${Math.abs(sunEl).toFixed(0)}° below the horizon. Lamps on. Sunrise in ${days(dawn.waitedMs)} — T runs the clock forward.`
        : 'Lunar night. Lamps on.', 12000);
    } else if (clockMoved > 0) {
      say(`Waited ${days(clockMoved)} for the sun to come up here. The clock is running from ${new Date(state.simMs).toISOString().slice(0, 10)}.`, 10000);
      clockMoved = 0;
    }
  }

  /* One object holding the live game, so the save system has something to read
     and write without reaching into closures. */
  const game = {
    state, settle, visited, shelter, track, bootTrack, achievements,
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

  /* `?view=descent` flies the approach into `?site=` rather than starting on
     the ground there. It is the only way to reach the landing from a URL, which
     is why nothing tested it until a landing crashed on the live site: the
     harness's `descent` shot uses `view=ground`, and everything that is not
     `view=orbit` starts already parked. The keep-out still applies, so asking
     to land at Tranquility Base puts you two kilometres short of it. */
  if (params.get('view') === 'descent') land({ lat: site.lat, lon: site.lon });

  /* `?mode=eva` starts on foot, which is what the screenshot harness wants when
     it is checking the suit, the lamps or the third-person camera. */
  if (params.get('mode') === 'eva') {
    if (params.get('ship') === '1') settle(site.lat, site.lon, 0);
    else startEva(site.lat, site.lon);
    /* On foot the body owns the view, so `?yaw` and `?pitch` have to be set on
       the player rather than on the camera or they are read back over. */
    if (params.get('yaw') !== null) eva.player.yaw = Number(params.get('yaw')) * Math.PI / 180;
    if (params.get('pitch') !== null) eva.player.pitch = Number(params.get('pitch')) * Math.PI / 180;
    if (params.get('view3') === '1') eva.view = VIEW.THIRD;
    if (params.get('helmet') === '1') eva.view = VIEW.HELMET;
    if (params.get('lamps')) eva.lampMode = Number(params.get('lamps'));
  }

  /* --- input --------------------------------------------------------------- */
  const keys = new Set();
  /* A pad, if there is one. It produces the same two things the keyboard and
     the mouse do — held directions and a look delta — and everything
     downstream is unchanged, so the physics cannot tell which hand is on it. */
  const pads = new Gamepads();
  let pad = pads.read(0);
  addEventListener('keydown', (e) => {
    keys.add(e.code);
    if (e.code === 'KeyH') setHelp(!state.showHelp);
    if (e.code === 'Escape' && state.showHelp) setHelp(false);
    if (e.code === 'KeyV') { state.showScience = !state.showScience; el('science').style.display = state.showScience ? 'block' : 'none'; }
    if (e.code === 'KeyT') {
      /* From the config table rather than from a copy of it. The brief asked
         for REALISTIC, ACCELERATED and FIXED; `TIME.modes` has said what each
         one means since the first commit and this held its own list, so the
         table was decorative and the two could drift apart silently. */
      /* Shift steps back down it. The list is ascending and should stay that
         way -- it reads as one -- but without a way down, getting from the
         default to held or to real time is five presses of the same key. */
      const step = e.shiftKey ? -1 : 1;
      const n = TIME_RATES.length;
      state.timeRate = TIME_RATES[(TIME_RATES.indexOf(state.timeRate) + step + n) % n];
      say(state.timeRate === 0 ? 'time held'
        : state.timeRate === 1 ? 'time realistic'
        : `time ${fmtRate(state.timeRate)}`, 2000);
      sound.beep('select');
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
    /* Righting a rolled rover. This is a game convention and it exists so a
       save cannot be permanently ruined, which is what the brief asked for;
       until now `recover()` was called from a test and nothing else, so a roll
       past forty degrees was final. */
    if (e.code === 'KeyR' && vehicle && eva && vehicle.rover.rolled && !driving) {
      vehicle.rover.recover();
      sound.beep('confirm');
      say('rover righted', 2500);
      return;
    }
    if (e.code === 'KeyR' && vehicle && eva) boardToggle();
    /* E goes in and out of the ship. There is no ladder-climbing physics and
       there should not be: what was asked for is a walkable interior and an
       airlock that means something, not a climbing minigame. The cycle it
       starts is where the physics actually is — pressure ramps over twenty-two
       seconds and the sound follows it down, which is the whole demonstration
       the vacuum audio was built around and which nothing could trigger before
       this existed. */
    if (e.code === 'KeyE' && eva && base && !driving) hatchToggle();
    if (e.code === 'KeyC' && vehicle) canopyPress = true;
    if (e.code === 'KeyP') { photo.toggle(); sound.beep('select'); }
    /* Markers stay off unless you ask. Walking up to Tranquility Base and
       recognising it should not require a floating label. */
    if (e.code === 'KeyM') {
      state.markers = !state.markers;
      settings.set('markers', state.markers ? 'on' : 'off');
      sound.beep('select');
    }
    /* The settings panel is buttons, and buttons need a pointer, so opening it
       hands the pointer back. Clicking the canvas afterwards takes it again. */
    if (e.code === 'KeyO') { releaseLook(); settings.toggle(); sound.beep('select'); }
    if (e.code === 'KeyK') {
      state.showLog = !state.showLog;
      el('log').classList.toggle('on', state.showLog);
      if (state.showLog) renderLog();
      sound.beep('select');
    }
    if (photo.active) {
      if (e.code === 'BracketLeft') photo.zoom(-1);
      if (e.code === 'BracketRight') photo.zoom(1);
      if (e.code === 'Minus' || e.code === 'NumpadSubtract') photo.expose(-0.5);
      if (e.code === 'Equal' || e.code === 'NumpadAdd') photo.expose(0.5);
    }
    /* F5 would reload the page, so saving is on F2, and it autosaves anyway. */
    if (e.code === 'F2') {
      const w = save.write(game, 'manual');
      say(w ? 'saved' : 'could not save', 2500);
      sound.beep(w ? 'confirm' : 'deny');
      e.preventDefault();
    }
    /* One view key, whichever thing you are in. It used to always toggle the
       astronaut's view, so pressing F while driving silently cycled a state
       with nothing to show for it and then dropped you into a different view
       when you got out. */
    if (e.code === 'KeyF') {
      if (driving && vehicle) say(vehicle.toggleView() === 'chase' ? 'chase view' : 'from the seat', 1600);
      else if (eva) eva.toggleView();
    }
    if (e.code === 'KeyL' && eva) eva.cycleLamps();
  });
  addEventListener('keyup', (e) => keys.delete(e.code));
  let dragging = false;
  let dragged = 0;
  /* Looking around, in the two ways the two views want.
     -----------------------------------------------------------------------
     In orbit you are handling an object: you grab the Moon and turn it, so
     the pointer stays where it is and a press-drag is exactly right. Standing
     on the surface you are a head, and a head does not work that way. This
     used to be press-drag everywhere, which meant turning to look at
     something was grab, drag, release, re-grab, over and over, and it felt
     broken because for a first-person view it is.
     So: on the surface, in the rover and in the free camera, a click takes
     the pointer and the mouse simply turns you until Escape gives it back.
     The move handler already reads `movementX/Y`, which is what a locked
     pointer reports, so both paths feed the same two numbers. Drag survives
     as the fallback for when the lock is refused -- some browsers and most
     embedded frames will refuse it -- and as the only mode in orbit. */
  const looking = () => document.pointerLockElement === canvas;
  const releaseLook = () => { if (looking()) document.exitPointerLock(); };
  /* Set once the browser has told us no. Without it a refusal is a soft lock:
     every click would ask again, always fail, and never reach the drag path,
     which is the one case where looking around has to keep working. */
  let lockDenied = false;
  addEventListener('pointerlockerror', () => { lockDenied = true; }, false);
  canvas.addEventListener('pointerdown', (e) => {
    /* The first click after the panel opens itself is almost always "yes, I
       have read it" -- and it is the same click that takes the pointer, so
       reading and playing are not two separate gestures. */
    if (state.showHelp) setHelp(false);
    if (mode !== 'orbit' && !looking() && !lockDenied) {
      /* Only ever from a real gesture. Older browsers return undefined here
         rather than a promise, hence the shape check. */
      const r = canvas.requestPointerLock();
      if (r && typeof r.catch === 'function') r.catch(() => { lockDenied = true; });
      return;
    }
    dragging = true; dragged = 0; canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointerup', (e) => {
    if (!dragging) return;
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
    if (!dragging && !looking()) return;
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
      sky: () => sky,
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
  let shelterAt = 0, visitedAt = 0;
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

    /* Stand on the ground that is actually drawn.
       -----------------------------------------------------------------------
       Everything physical samples the height field without asking for a band
       limit, and it used to get all of it: octaves down to twenty-five
       centimetres that the mesh, built at three times its own vertex spacing,
       never carried. At a coarse tile level that is metres of relief you can
       stand on and cannot see -- which is how a walker ends up inside a hill,
       and how a rover doing thirty metres a second samples sub-Nyquist noise
       and levitates on it.
       So physics is told what the renderer managed. `finestLevel` is from the
       frame just drawn (terrain.update runs at the bottom of this function),
       and one frame of lag against a quadtree that refines towards the eye is
       not worth the reorder. Level 0 gives a lambda wider than the Moon, which
       correctly means "nothing is refined here, simulate the measurements and
       nothing else". */
    heightfield.walkLambda = tileLambda(terrain.stats.finestLevel, TERRAIN.verts);

    /* Read the pad once a frame and fold its look into the same delta the
       mouse writes, so everything after this is the same code either way. */
    pad = pads.read(dt);
    if (pad.connected) {
      look.yaw += pad.lookYaw * Math.PI / 180;
      look.pitch += pad.lookPitch * Math.PI / 180;
      if (pad.pressed.has('view')) {
        if (driving && vehicle) vehicle.toggleView();
        else if (eva) eva.toggleView();
      }
      if (pad.pressed.has('lamps') && eva) eva.cycleLamps();
      if (pad.pressed.has('board')) boardToggle();
      if (pad.pressed.has('hatch')) hatchToggle();
      if (pad.pressed.has('help')) {
        setHelp(!state.showHelp);
      }
    }

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
    sky.update(eph, local);

    /* --- move ------------------------------------------------------------- */
    /* Two ways of being here. On foot, physics/player.js decides where the body
       goes and the camera follows it; in the free camera, the camera is the only
       thing there is, and it flies. */
    let camFrame;
    if (driving && vehicle) {
      /* Driving. The player rides along, so the suit keeps running unless the
         canopy is shut and the cabin has come up to pressure. */
      /* `+=` on the yaw: see game/eva.js, which had the same sign backwards. */
      cam.yaw += look.yaw; cam.pitch = clampPitch(cam.pitch - look.pitch);
      look.yaw = look.pitch = 0;
      vehicle.step(dt, {
        /* The stick is analogue where the physics takes an analogue value, so
           easing along a rim at walking pace is something a pad can ask for
           and a key cannot. */
        throttle: clamp1(moveAhead() + pad.forward),
        steer: clamp1(moveSide() + pad.strafe),
        brake: keys.has('Space') || pad.held.has('jump'),
        boost: keys.has('ShiftLeft') || keys.has('ShiftRight') || pad.run,
        toggleCanopy: canopyPress,
      }, true);
      canopyPress = false;
      /* Living out of the rover costs the rover. `consume` used to be called
         from the sleep handler alone, so the nav console's days-remaining
         never moved while you drove and the middle range tier was a readout
         rather than a constraint. Sealed and pressurised, you are breathing
         its air; with the canopy open you are on the suit and it is not. */
      if (vehicle.rover.pressure > 0.9) {
        vehicle.rover.consume(dt / 3600, 1);
      }
      /* The model is placed below, with everything else, once `setEye` has
         settled the floating origin. It used to be placed here instead — the
         only object in the scene put down against the PREVIOUS origin — so on
         every rebase, which is roughly every two kilometres, the rover was
         drawn a couple of hundred metres from where it was and vanished for a
         frame. The camera does not need it: `camera()` works from the rover's
         coordinates, not from its mesh. */
      /* The player goes where the rover goes. */
      eva.player.place(vehicle.rover.lat, vehicle.rover.lon, 0.9);
      eva.player.yaw = cam.yaw;
      eva.suit.step(dt, {
        exertion: 0.12, sunlit: local.sunEl > 0, lights: eva.lampMode > 0,
        inShelter: vehicle.rover.pressure > 0.9,
      });
      camFrame = vehicle.camera(cam.yaw, cam.pitch);
      cam.lat = vehicle.rover.lat; cam.lon = vehicle.rover.lon;
      cam.alt = camFrame.eye ? heightfield.heightAt(cam.lat, cam.lon) + 1.5 : cam.alt;
      world.x = camFrame.eye.x; world.y = camFrame.eye.y; world.z = camFrame.eye.z;
    } else if (eva) {
      eva.cave = pitField.cave;
      eva.vehicle = vehicle;
      eva.step(dt, {
        forward: clamp1(moveAhead() + pad.forward),
        strafe: clamp1(moveSide() + pad.strafe),
        run: keys.has('ShiftLeft') || keys.has('ShiftRight') || pad.run,
        jump: keys.has('Space') || pad.pressed.has('jump'),
        jet: keys.has('KeyJ') || pad.held.has('jet'),
        dYaw: look.yaw, dPitch: look.pitch,
      }, {
        sunlit: local.sunEl > 0,
      });
      look.yaw = look.pitch = 0;
      camFrame = eva.camera();
      cam.lat = eva.player.llh.lat; cam.lon = eva.player.llh.lon;
      cam.alt = eva.player.llh.h; cam.yaw = eva.player.yaw; cam.pitch = eva.player.pitch;
      world.x = camFrame.eye.x; world.y = camFrame.eye.y; world.z = camFrame.eye.z;
    } else if (mode === 'descent') {
      /* Held for the length of the branch rather than read twice, because the
         second read used to come back null and take the whole game with it.
         Touchdown happens inside `step`: it calls `finish`, which calls the
         `onDone` this file passed in, which sets `descent = null` and flips
         `mode` to 'surface' — all before `step` has returned. The next line
         then asked the cleared variable for a camera and threw, on exactly one
         frame, the frame you land on. Nothing caught it because nothing had
         ever flown a landing: `?view=descent` exists now partly so the
         screenshot harness can.

         The frame still finishes on the pose it landed in, which is the right
         one to draw; the next frame is a surface frame. */
      const d = descent;
      d.step(dtWall);
      const c = d.camera();
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
      /* The free camera, and the third place the same sign was wrong. */
      cam.yaw += look.yaw; cam.pitch = clampPitch(cam.pitch - look.pitch);
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
      const ahead = moveAhead() * v, side = moveSide() * v;
      dx += fwd.x * ahead + right.x * side;
      dy += fwd.y * ahead + right.y * side;
      dz += fwd.z * ahead + right.z * side;
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
    /* Boot prints, recorded wherever you actually walk rather than only in the
       rover. Both lines are drawn by the same ribbon. */
    if (eva && !driving && eva.player.grounded) {
      bootTrack.add(eva.player.llh.lat, eva.player.llh.lon);
    }
    if (mode === 'surface') {
      /* The same geometry the terrain shader is handed, so the marks stay the
         right amount darker than the ground as the Sun moves. */
      const upDotSun = Math.sin(local.sunEl * Math.PI / 180);
      tracks.setLight({
        mu0: upDotSun, mu: Math.max(0.06, Math.sin(Math.max(0.05, -cam.pitch))),
        phase: Math.acos(Math.max(-1, Math.min(1, upDotSun))),
        albedo: albedoAt(geology, cam.lat, cam.lon),
      });
      tracks.update({ boots: bootTrack, wheels: track }, stage.origin.origin, cam);
    }
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
         tried to corner.

         It has to be thrown, not sprayed. This used to be an isotropic cone
         from the vehicle's centre — the burst API has taken a `forward` and a
         `bias` since it was written and nothing ever passed them — so the
         rover drove inside a symmetrical puff rather than trailing anything.
         What the LRV film actually shows is regolith leaving the tread near
         the top of the contact patch and arcing up and back, in two fans
         behind the rear wheels, which is what this is now. */
      const hard = r.sliding || r.slipping || r.boost;
      const hd = r.heading * Math.PI / 180;
      const sh = Math.sin(hd), ch = Math.cos(hd);
      /* Forward in world coordinates: north at heading zero, east at ninety. */
      const fx = b.e.x * sh + b.n.x * ch;
      const fy = b.e.y * sh + b.n.y * ch;
      const fz = b.e.z * sh + b.n.z * ch;
      /* Backwards for a forward run, forwards in reverse: the throw always
         opposes the direction of travel because that is where the tread is
         flinging it. */
      const sign = r.speed >= 0 ? -1 : 1;
      const back = { x: fx * sign, y: fy * sign, z: fz * sign };
      /* From the rear axle rather than the middle of the vehicle, and from
         both sides of it. */
      const axle = ROVER.wheelBase * 0.5 * sign;
      const halfTrack = ROVER.track * 0.5;
      const ex = b.e.x * ch - b.n.x * sh;
      const ey = b.e.y * ch - b.n.y * sh;
      const ez = b.e.z * ch - b.n.z * sh;
      for (const side of [-1, 1]) {
        dust.burst({
          at: { x: p.x - o.x + fx * axle + ex * halfTrack * side,
                y: p.y - o.y + fy * axle + ey * halfTrack * side,
                z: p.z - o.z + fz * axle + ez * halfTrack * side },
          up: b.u,
          count: hard ? 7 : 3, speed: 1.0 + Math.abs(r.speed) * 0.5,
          angle: 34, spread: 0.8, size: 15,
          forward: back, bias: hard ? 0.8 : 0.55,
        });
      }
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
      /* Third person on foot, and also whenever the chase camera is looking at
         the rover — a driverless vehicle bounding across a mare is the wrong
         picture. The pose is the walker's rather than a seated one, which is a
         known cheat: at chase distance the figure is a metre tall on screen
         and the alternative is a rig this model does not have. */
      if (eva.model) {
        eva.model.group.visible = driving
          ? !!(vehicle && vehicle.view === 'chase')
          : eva.view === 'third';
      }
      /* The bubble, and where the Sun is on it. The helmet is only drawn on
         foot in the helmet view: the rover's canopy is not a helmet and the
         free camera has no head to put one on. */
      const wearing = !driving && eva.view === 'helmet' && !photo.active;
      const hel = el('helmet');
      if (hel) {
        hel.classList.toggle('on', wearing);
        if (wearing) helmetGlare(hel, local.sunDir, camFrame, stage.camera);
      }
    }
    /* Somewhere pressurised is somewhere you can take the helmet off. */
    const sheltered = shelterKind();
    shelter.needs.step(dt);
    if (now - shelterAt > 900) {
      shelterAt = now;
      shelter.update(sheltered, sheltered ? {
        sunEl: local.sunEl,
        nextSunrise: local.sunEl > 0 ? null : hoursUntilSunElevation(
          skyAt, ephemerisAt, jdFromUnixMs, state.simMs, cam.lat, cam.lon, 0, true),
        suitDust: eva ? eva.suit.dust : undefined,
        cabinDust: sheltered === 'ship' && base ? base.describeDust() : null,
      } : null);
    }

    historic.update(cam.lat, cam.lon, stage.origin.origin, dt, local.sunDir, state.simMs);
    if (base) {
      base.step(dt, eva ? eva.player.llh : null);
      base.place(stage.origin.origin);
    }
    /* The rover's mesh, whether or not anyone is in it, and always after
       `setEye` above so it is placed against the origin everything else is
       placed against. Its physics only runs here when nobody is driving —
       otherwise the driving branch has already stepped it. */
    if (vehicle) {
      if (!driving) {
        vehicle.step(dt, { toggleCanopy: canopyPress }, false);
        canopyPress = false;
      }
      vehicle.place(stage.origin.origin, dt);
    }

    /* --- terrain ---------------------------------------------------------- */
    /* Driving, the streamer is told where the rover is going rather than only
       where it is: at the boost ceiling it covers nearly two kilometres a
       minute, which is faster than a patch arrives. */
    if (surface) {
      surface.update(cam.lat, cam.lon, cam.alt - surfaceH,
        driving && vehicle
          ? { heading: vehicle.rover.heading, speed: Math.abs(vehicle.rover.speed) }
          : null);
    }
    pitField.update(cam.lat, cam.lon);
    if (pitField.cave !== caveOwner) {
      caveOwner = pitField.cave;
      if (caveModel) { stage.world.remove(caveModel.group); caveModel.dispose(); caveModel = null; }
      if (caveOwner) {
        const forCave = caveOwner;
        import('./models/cave.js')
          .then((m) => {
            /* By the time the module arrives you may have walked away again. */
            if (pitField.cave !== forCave) return;
            caveModel = m.buildCave({
              cave: forCave,
              boulders: floorBoulders(forCave.pit),
              quality: modelQuality,
            });
            stage.world.add(caveModel.group);
          })
          .catch((e) => console.warn('cave model unavailable:', e.message));
      }
    }
    if (caveModel) {
      caveModel.place(stage.origin.origin);
      caveModel.update(cam.lat, cam.lon, cam.alt);
    }

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
    /* And one for the other place worth a second of room. Every number in it
       is read off where you actually are, like the first one — off the walker
       rather than off the camera, because the camera exists before the walker
       does and during those first seconds it is nowhere in particular. */
    if (eva && pitField.cave && !photo.active && mode === 'surface' &&
        terrain.stats.tiles > 90 && now - startedAt > 2500 &&
        pitField.cave.inside(eva.player.llh.lat, eva.player.llh.lon, eva.player.llh.h)) {
      const c = pitField.cave;
      const l = c.toLocal(eva.player.llh.lat, eva.player.llh.lon);
      /* The roof is what is overhead, not your boots: the rock between the
         ceiling here and the plain up there. */
      const overhead = -(c.ceilingLocal(l.e, l.n) ?? c.floorU);
      moment.show('cave', {
        title: 'under the Moon',
        a: `${overhead.toFixed(0)} m of basalt overhead, and about 290 K in here `
         + 'whatever hour it is outside.',
        b: 'Nobody has seen this. In 2024 a radar instrument in orbit found a '
         + 'reflection off the pit that only made sense if something was down '
         + 'here, and this is the shape that fit it best.',
        c: 'Carrer et al. 2024 · DERIVED, not measured · the same data admits a '
         + 'level chamber instead of this ramp',
        seconds: 13,
      });
    }
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
    /* Arriving somewhere. Inside a mapped feature's own radius, on foot or in
       the rover — the same containment test the orbital picker uses, so the
       two agree about what being inside Tycho means. */
    if (mode === 'surface' && now - visitedAt > 1500) {
      visitedAt = now;
      const here = orbit.nearestFeature(cam.lat, cam.lon);
      const got = visited.step(here, { lat: cam.lat, lon: cam.lon, simMs: state.simMs });
      if (got) {
        /* Quietly. A named crater on the Moon does not need a banner, and the
           brief was specific about not turning the place into a theme park. */
        say(`entering ${got.name}`, 4000);
        sound.beep('comms');
        save.write(game, 'arrived');
      }
      /* And the log, which is the same question asked of the whole run. */
      const won = achievements.step({
        lat: cam.lat, lon: cam.lon, simMs: state.simMs,
        elevation: surfaceH, slope: heightfield.slopeAt(cam.lat, cam.lon, 8),
        walked: eva ? eva.player.distance : 0,
        driven: vehicle ? vehicle.rover.distance : 0,
        homeRange: base ? surfaceDistance(cam.lat, cam.lon, base.lat, base.lon) : 0,
        nearestFeature: here,
        inCave: !!(pitField.cave && pitField.cave.inside(cam.lat, cam.lon, cam.alt)),
      });
      if (won.length) {
        say(won[won.length - 1].title, 5000);
        sound.beep('comms');
        renderLog();
        save.write(game, 'reached');
      }
    }
    nav.show(driving && !photo.active);
    if (driving && vehicle) {
      track.add(vehicle.rover.lat, vehicle.rover.lon);
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
    prompts();
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
    /* Where the sound is coming from. The last case is the free camera, which
       has no helmet around it and no cabin near it: it used to fall through to
       the ship at full pressure and play the whole cabin bed outdoors, which is
       an ambient drone with no physical source on the surface of the Moon — the
       one thing the audio design forbids by name. */
    const environment = baseSnap && baseSnap.inside ? 'ship'
      : driving ? (roverSnap.pressure > 0.5 ? 'rover_closed' : 'rover_open')
      : evaSnap ? 'suit' : 'vacuum';
    sound.update({
      dt, environment,
      pressure: baseSnap && baseSnap.inside ? baseSnap.pressure
        : driving ? roverSnap.pressure : 0,
      player: evaSnap ? evaSnap.player : undefined,
      suit: evaSnap ? evaSnap.suit : undefined,
      rover: roverSnap ? {
        throttle: driving ? 1 : 0, speed: roverSnap.speed,
        wheelImpact: wheelImpact(roverSnap, dt),
        boost: roverSnap.boost, canopy: roverSnap.canopy,
      } : undefined,
      ship: baseSnap ? { interiorLevel: baseSnap.interiorLevel, airlock: baseSnap.airlock } : undefined,
    });
    el('s-tiles').textContent = `${terrain.stats.tiles}  (${terrain.stats.building} building)`;
    el('s-tris').textContent = (terrain.stats.triangles / 1000).toFixed(0) + 'k';
    el('s-fps').textContent = fps.toFixed(0);

    if (state.showScience && now - probeCache.t > 250) {
      probeCache.t = now;
      updateScience(heightfield, geology, cam, local, eph, surface, streams, temperature, historic,
                    gravity, pitField);
    }
  }

  window.SELENE = {
    ready: false, stage, terrain, sky, heightfield, cam, state, streams, surface,
    pitField,
    get eva() { return eva; },
    historic,
    get base() { return base; },
    get vehicle() { return vehicle; },
    get driving() { return driving; },
    board() { driving = true; },
    get descent() { return descent; },
    get mode() { return mode; },
    land(lat, lon) { land({ lat, lon }); },
    /* Where the sun is from where you are standing, for tests that care
       whether it is daylight rather than what the screen looks like. Not
       `sky`, which is already the renderer's sky above. */
    skyHere: () => skyAt(ephemerisAt(jdFromUnixMs(state.simMs)), cam.lat, cam.lon, cam.alt),
    temperature,
    get astronaut() { return astronaut; },
    game, save, visited, tracks, moment,
    walk(lat, lon) { startEva(lat, lon); },
    goto(lat, lon, alt) { cam.lat = lat; cam.lon = lon; cam.alt = alt ?? cam.alt; },
    setTime(iso) { state.simMs = Date.parse(iso); },
    stats: () => ({ ...terrain.stats, fps }),
  };
  requestAnimationFrame(frame);
}

/* --- helpers ---------------------------------------------------------------- */

/**
 * Put the Sun on the visor where the Sun actually is.
 *
 * A bloom fixed in the middle of the screen would be a lens flare in a game;
 * this is the reflection off a curved piece of glass a few centimetres from
 * your eye, so it has to move as you turn your head and go out when the Sun is
 * behind you. Three CSS variables, no render pass, no post-processing chain.
 */
const _hv = new THREE.Vector3();
function helmetGlare(node, sunDir, frame, camera) {
  if (!sunDir || !frame) return;
  /* Whether the Sun is in front at all, from the direction the head is
     pointing. This has to come first and it has to be the dot product: a point
     placed out at the Sun's real distance projects to an NDC z past one simply
     for being beyond the far plane, so the depth test would call every
     direction "behind" and the glare would never appear at all.  */
  const behind = sunDir.x * frame.dir.x + sunDir.y * frame.dir.y +
                 sunDir.z * frame.dir.z <= 0;
  /* Somewhere comfortably inside the frustum, along the same direction: the
     Sun is at infinity, so any distance gives the same screen position. */
  _hv.set(camera.position.x + sunDir.x * 1000,
          camera.position.y + sunDir.y * 1000,
          camera.position.z + sunDir.z * 1000);
  _hv.project(camera);
  const x = (_hv.x * 0.5 + 0.5) * 100, y = (-_hv.y * 0.5 + 0.5) * 100;
  /* Fade at the edges of the frame rather than clipping: the glass carries the
     glare a little way past the field of view. */
  const off = Math.max(Math.abs(x - 50) / 50, Math.abs(y - 50) / 50);
  const vis = behind ? 0 : Math.max(0, Math.min(1, 1.6 - off));
  node.style.setProperty('--sx', x.toFixed(1) + '%');
  node.style.setProperty('--sy', y.toFixed(1) + '%');
  node.style.setProperty('--sv', vis.toFixed(3));
}

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

/* What the equipment is, on the screen rather than in a comment. The README
   claimed these were labelled FICTIONAL wherever they surfaced and the word
   reached the display exactly once, on the landing pad; `LABEL.FICTIONAL` sat
   unused. Every number in this line is from `config.js`, so it cannot drift
   away from what the simulation actually uses. */
const equipmentLine = () =>
  `suit ${SUIT.o2Capacity.toFixed(2)} kg O2, ${(SUIT.powerCapacity / 1000).toFixed(1)} kWh · ` +
  `rover ${ROVER.supplies.o2} kg O2, ${ROVER.supplies.water} kg water · ` +
  `jetpack ${PLAYER.jetpackAccel.toFixed(1)} m/s² ${tag(LABEL.FICTIONAL)}` +
  '<span class="est"> a plausible near-future design, not flown hardware</span>';

/* The gravity row, from whichever source has an answer. */
const vendoredGravity = (map, cam) => {
  const g = map && map.at(cam.lat, cam.lon);
  return g ? g.freeAir_mGal : null;
};
const drawGravity = (mGal, where) => {
  if (mGal === null || mGal === undefined) return false;
  el('d-grav').innerHTML =
    `${(1.6246 + mGal * 1e-5).toFixed(4)} m/s² ${tag(LABEL.MEASURED)}` +
    `<span class="est"> free-air ${mGal >= 0 ? '+' : ''}${mGal.toFixed(0)} mGal, ${where}</span>`;
  return true;
};

let sciencePending = false;
let scienceRemote = null;
let scienceAt = { lat: 999, lon: 999 };

function updateScience(hf, geology, cam, local, eph, streamer, streams, temperature, historic,
                       gravity, pitField) {
  const p = hf.probe(cam.lat, cam.lon);
  /* Inside the cave the height field is describing the plain a hundred and
     thirty metres over your head, not the floor you are standing on, and
     printing its provenance here would be a lie of the exact kind this panel
     exists to prevent. The floor down here came out of a radar inversion. */
  const inCaveNow = !!(pitField && pitField.cave &&
                       pitField.cave.inside(cam.lat, cam.lon, cam.alt));
  const caveInfo = inCaveNow ? pitField.cave.describe() : null;
  el('d-topo').innerHTML = caveInfo
    ? `${caveInfo.what} ${tag(caveInfo.label)}` +
      `<span class="est"> ${caveInfo.widthM} m wide, ${caveInfo.lengthM} m long, ` +
      `${caveInfo.deepestM} m down at its deepest. ${caveInfo.source}. ${caveInfo.note}</span>`
    : `${p.res_m < 10 ? p.res_m.toFixed(1) : p.res_m.toFixed(0)} m/px ${tag(p.label)}`;
  el('d-detail').innerHTML = caveInfo
    ? `roughness only ${tag(LABEL.PROCEDURAL)}<span class="est"> and outward, so the ` +
      `room you can see is never smaller than the one you are walking in</span>`
    : Math.abs(p.proceduralHeight) > 0.001
      ? `${p.proceduralHeight >= 0 ? '+' : ''}${p.proceduralHeight.toFixed(2)} m ${tag(LABEL.PROCEDURAL)}`
      : 'none';
  const desc = streamer ? streamer.describe() : null;
  if (desc && desc.elevation) {
    el('d-topo').innerHTML =
      `${p.res_m < 10 ? p.res_m.toFixed(1) : p.res_m.toFixed(0)} m/px ${tag(p.label)}`;
  }
  el('d-img').innerHTML = desc && desc.imagery
    ? `${desc.imagery.res_m < 10 ? desc.imagery.res_m.toFixed(2) : desc.imagery.res_m.toFixed(0)} m/px ${tag(LABEL.MEASURED)}`
    : `LROC WAC 1.3 km/px ${tag(LABEL.MEASURED)}` +
      (desc && desc.imageryError ? `<span class="est"> nothing finer: ${desc.imageryError}</span>` : '');
  /* Why the topography is no finer than it is. A failed request and a request
     that came back with nothing better are different facts about the Moon and
     the network, and saying neither — which is what this did — leaves the one
     line in the game that is supposed to explain its own limits silent about
     the most common reason it has one. */
  if (desc && !desc.elevation) {
    if (desc.elevationError) {
      el('d-topo').innerHTML += `<span class="est"> nothing finer: ${desc.elevationError}</span>`;
    } else if (desc.elevationSkipped) {
      el('d-topo').innerHTML +=
        `<span class="est"> nothing finer offered: best available ${desc.elevationSkipped.toFixed(0)} m/px</span>`;
    }
  }
  let geolText = 'unavailable';
  if (geology) {
    const x = Math.min(geology.width - 1, Math.max(0, ((cam.lon + 180) / 360 * geology.width) | 0));
    const y = Math.min(geology.height - 1, Math.max(0, ((90 - cam.lat) / 180 * geology.height) | 0));
    const dn = geology.data[y * geology.width + x];
    const u = geology.legend.units[String(dn)];
    geolText = u ? `${u.code} ${u.name}, ${u.age}` : `unit ${dn}`;
  }
  el('d-geol').innerHTML = `${geolText} ${tag(LABEL.REGIONAL)}`;
  /* Diviner's own maps, vendored at half a degree, interpolated across the day
     by the model in data/temperature.js. */
  const lt = localSolarTime(eph, cam.lat, cam.lon);
  const temp = temperature ? temperature.at(cam.lat, cam.lon, local.sunEl, lt * 24) : null;
  /* Inside a pit the half-degree Diviner map is describing the plain overhead
     rather than the hole you are standing in, and the difference is the whole
     reason anybody wants to go into one: a shaded cavity holds about 290 K
     while the surface it is cut into swings across three hundred. */
  const inPit = pitField && pitField.at(cam.lat, cam.lon);
  const inCave = inCaveNow;
  const pitT = temp && (inPit || inCave)
    ? pitTemperature(temp.kelvin, {
        inCave, sunElDeg: local.sunEl,
        /* A pit floor is only lit when the Sun can actually get down it: a
           hundred and twenty five metres of vertical wall is a lot of sky to
           lose. This is the geometric test, not a shadow map lookup. */
        sunlit: !inCave && local.sunEl > 0 &&
          Math.tan(local.sunEl * Math.PI / 180) * (inPit ? inPit.innerMin : 0) >
            (inPit ? inPit.depth : 0),
      })
    : null;
  el('d-temp').innerHTML = !temp ? 'unavailable'
    : pitT
      ? `${pitT.kelvin.toFixed(0)} K  <span class="est">${(pitT.kelvin - 273.15).toFixed(0)} C</span> ` +
        `${tag(LABEL.DERIVED)}<span class="est"> ${pitT.why}; ` +
        `${PIT_THERMAL.source}. Outside: ${temp.kelvin.toFixed(0)} K</span>`
      : `${temp.kelvin.toFixed(0)} K  <span class="est">${temp.celsius.toFixed(0)} C</span> ` +
        `${tag(LABEL.REGIONAL)}<span class="est"> Diviner ${temp.diviner.min.toFixed(0)}–${temp.diviner.max.toFixed(0)} K</span>`;
  /* Slope is computed from the measured grid rather than measured directly, so
     it carries the tag that says so — it was the one number on this panel
     printed with no provenance at all. */
  el('d-slope').innerHTML = `${hf.slopeAt(cam.lat, cam.lon).toFixed(1)}° ${tag(LABEL.DERIVED)}` +
    `<span class="est"> from ${p.res_m < 10 ? p.res_m.toFixed(1) : p.res_m.toFixed(0)} m/px topography</span>`;
  el('d-kit').innerHTML = equipmentLine();

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
  /* Three states, not two. A service that answered with no measurement here
     and a service that could not be reached are different things, and telling
     them apart is the entire reason this overlay exists. Until now they were
     both a bare null and both rendered as whatever the row happened to say
     last, which could be a reading from a place you left ten kilometres ago. */
  /* Gravity first, from the disk, so the row is right before any request has
     come back and stays right if none ever does. A streamed reading overwrites
     it below when there is one. */
  const haveVendoredG = drawGravity(vendoredGravity(gravity, cam), 'GRAIL, vendored 4 ppd');
  if (streams && !streams.enabled) {
    for (const id of ['d-min', 'd-count']) el(id).textContent = 'offline';
    if (!haveVendoredG) el('d-grav').textContent = 'offline';
  } else if (scienceRemote) {
    const r = scienceRemote;
    if (r.geology) {
      const g = r.geology;
      el('d-geol').innerHTML = `${g.unit} ${g.name}, ${g.period} ${tag(LABEL.REGIONAL)}`;
    } else if (r.geologyFailed) {
      el('d-geol').innerHTML = `${geolText} ${tag(LABEL.REGIONAL)}` +
        '<span class="est"> USGS unreachable; vendored map shown</span>';
    }
    if (r.minerals) {
      /* What the ground is made of, from Kaguya's deconvolution maps. Each
         figure is a quarter of a degree — 7.6 km — so this is the composition
         of the region, not of the rock at your feet, and it says so. */
      const m = r.minerals;
      const bits = [];
      if (m.FeO !== null) bits.push(`FeO ${m.FeO.toFixed(1)} wt %`);
      if (m.plagioclase !== null) bits.push(`plag ${m.plagioclase.toFixed(0)} %`);
      if (m.clinopyroxene !== null) bits.push(`cpx ${m.clinopyroxene.toFixed(0)} %`);
      if (m.orthopyroxene !== null) bits.push(`opx ${m.orthopyroxene.toFixed(0)} %`);
      if (m.olivine !== null) bits.push(`ol ${m.olivine.toFixed(0)} %`);
      el('d-min').innerHTML = `${bits.join(', ')} ${tag(LABEL.REGIONAL)}` +
        `<span class="est"> Kaguya MI, 7.6 km` +
        (m.maturity !== null ? `; optical maturity ${m.maturity.toFixed(2)}` : '') +
        '</span>';
    } else {
      el('d-min').textContent = r.mineralsFailed ? 'service unreachable' : 'no measurement here';
    }
    if (r.gravity && r.gravity.freeAir_mGal !== null) {
      /* A hundred milligals is about six thousandths of lunar gravity, which
         is real, is measured, and is far too small for anyone to feel. */
      drawGravity(r.gravity.freeAir_mGal, 'GRAIL, 16 ppd');
    } else if (!haveVendoredG) {
      el('d-grav').textContent = r.gravityFailed ? 'service unreachable' : 'no measurement here';
    }
    if (r.lolaCountFailed) {
      el('d-count').textContent = 'service unreachable';
    } else if (r.lolaCount !== null && r.lolaCount !== undefined) {
      const n = r.lolaCount;
      el('d-count').innerHTML = n > 0
        ? `${n.toFixed(0)} LOLA shots in this pixel ${tag(LABEL.MEASURED)}`
        : `no altimeter shot here ${tag(LABEL.INTERPOLATED)}` +
          '<span class="est"> the elevation is filled in between tracks</span>';
    } else {
      el('d-count').textContent = 'no measurement here';
    }
  }

  const parts = [p.source];
  if (desc && desc.imagery) parts.push(desc.imagery.source);
  if (temp) parts.push(temp.source);
  if (p.padded) parts.push(`landing pad (${LABEL.FICTIONAL})`);
  if (desc) parts.push('streaming: ' + desc.status);
  /* Six science services are asked at once; say when some of them did not
     answer, rather than letting the rows above imply the Moon is featureless. */
  if (scienceRemote && scienceRemote.asked && scienceRemote.reached < scienceRemote.asked) {
    parts.push(`${scienceRemote.asked - scienceRemote.reached} of ` +
               `${scienceRemote.asked} science services unreachable`);
  }
  /* A reconstruction that failed to build is the one silence that matters
     most: standing at Tranquility Base with no hardware in front of you looks
     from the inside exactly like standing on empty mare. */
  const broken = historic ? historic.failures() : [];
  for (const b of broken) parts.push(`${b.name} could not be built: ${b.why}`);
  el('d-src').textContent = parts.join('  ·  ');
}

start().catch(e => {
  const f = document.getElementById('fatal');
  f.style.display = 'flex';
  f.textContent = 'SELENE failed to start\n\n' + (e && e.stack || e);
});
