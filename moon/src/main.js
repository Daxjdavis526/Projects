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
import { Exposure } from './render/exposure.js';
import { ephemerisAt, skyAt, jdFromUnixMs, localSolarTime } from './physics/ephemeris.js';
import { llhToXyz, xyzToLlh, enuBasis, llToUnit, horizonDistance } from './physics/frames.js';
import { loadVendoredHeightfield, readJson, readBinary } from './terrain/loader.js';
import { Detail } from './terrain/detail.js';
import { decodePng8 } from './terrain/png16.js';
import { Streams } from './data/streams.js';
import { Cache } from './data/cache.js';
import { SurfaceStreamer } from './data/surface.js';
import { TemperatureMap } from './data/temperature.js';
import { EVA } from './game/eva.js';
import { Descent } from './game/descent.js';
import { SuitHud } from './ui/suithud.js';
import { OrbitPicker } from './ui/orbit.js';
import { Sound } from './audio/audio.js';

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
  let astronaut = null;
  import('./models/astronaut.js')
    .then((m) => {
      astronaut = m.buildAstronaut({ quality: state.qualityName });
      if (eva) eva.setModel(astronaut);
    })
    .catch((e) => console.warn('astronaut model unavailable:', e.message));

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

  const suitHud = new SuitHud();
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
  let eva = null;
  const startEva = (lat, lon) => {
    eva = new EVA({
      stage, heightfield, quality: state.quality,
      lat: lat ?? cam.lat, lon: lon ?? cam.lon, yaw: cam.yaw * 180 / Math.PI,
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

  const orbit = new OrbitPicker({
    heightfield, names, sites, geology, cam,
    getSky: (lat, lon) => skyAt(ephemerisAt(jdFromUnixMs(state.simMs)), lat, lon, 0),
    onLand: (pick) => land(pick),
  });

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
  function land(pick) {
    mode = 'descent';
    orbit.show(false);
    el('hint').textContent = 'landing · press space to skip';
    descent = new Descent({
      heightfield, target: { lat: pick.lat, lon: pick.lon },
      onDone: (at) => {
        descent = null;
        mode = 'surface';
        el('hint').textContent = 'H for controls';
        startEva(at.lat, at.lon);
        eva.player.yaw = at.heading * Math.PI / 180;
      },
    });
    /* Ask for the ground under the landing site straight away rather than
       waiting for the camera to arrive. */
    if (surface) surface.update(pick.lat, pick.lon, 400);
  }

  /* `?mode=eva` starts on foot, which is what the screenshot harness wants when
     it is checking the suit, the lamps or the third-person camera. */
  if (params.get('mode') === 'eva') {
    startEva(site.lat, site.lon);
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

  /* --- the loop ------------------------------------------------------------ */
  let last = performance.now(), fpsAcc = 0, fpsN = 0, fps = 0, ready = false;
  const probeCache = { t: 0, value: null };

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
    }
    stage.setSun(local.sunDir, Math.max(0, local.sunEl > -0.3 ? 1 : 0));
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
    });

    const ev = exposure.update({
      sunElevation: local.sunEl,
      sunVisible: local.sunEl > 0 ? 1 : 0,
      /* What the eye is actually adapting to: mare is half as bright as
         highlands, and standing on one or the other is a two-thirds of a stop
         difference in how dark the shadows look. */
      albedo: albedoAt(geology, cam.lat, cam.lon),
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
      groundFraction: cam.alt - heightfield.heightAt(cam.lat, cam.lon) > 50000
        ? 0.35 : 0.55 + 0.35 * Math.max(0, -Math.sin(cam.pitch)),
      earthIllum: eph.earthIllum,
      earthElevation: local.earthEl,
    }, ready ? dt : 1e6);
    stage.setExposure(ev);
    sky.update(eph, ev);

    /* --- move ------------------------------------------------------------- */
    /* Two ways of being here. On foot, physics/player.js decides where the body
       goes and the camera follows it; in the free camera, the camera is the only
       thing there is, and it flies. */
    let camFrame;
    if (eva) {
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
    if (camFrame.fov && Math.abs(stage.camera.fov - camFrame.fov) > 0.01 && !params.get('fov')) {
      stage.setFov(camFrame.fov);
    }
    if (eva) {
      eva.updateLights(stage.origin.origin, camFrame);
      eva.updateModel(stage.origin.origin, dt);
    }

    /* --- terrain ---------------------------------------------------------- */
    if (surface) surface.update(cam.lat, cam.lon, cam.alt - surfaceH);

    projScreen.multiplyMatrices(stage.camera.projectionMatrix, stage.camera.matrixWorldInverse);
    frustum.setFromProjectionMatrix(projScreen);
    terrain.update(world, params.get('cull') === '0' ? null : frustum, rebased);
    stage.focusShadow(stage.camera.position.x, stage.camera.position.y, stage.camera.position.z,
      cam.alt < 200 ? 180 : 700);

    stage.render();

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
    suitHud.update(evaSnap);
    /* Vacuum outside, air inside. Until there is a ship or a rover to be in,
       the only two states are wearing a suit and flying a camera that is not
       there at all. */
    sound.update({
      dt,
      environment: evaSnap ? 'suit' : 'ship',
      pressure: evaSnap ? 0 : 1,
      player: evaSnap ? evaSnap.player : undefined,
      suit: evaSnap ? evaSnap.suit : undefined,
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
  if (scienceRemote) {
    if (scienceRemote.geology) {
      const g = scienceRemote.geology;
      el('d-geol').innerHTML = `${g.unit} ${g.name}, ${g.period} ${tag('REGIONAL')}`;
    }
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
