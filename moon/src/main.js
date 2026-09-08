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
  });
  if (params.get('shadows') === '0') stage.renderer.shadowMap.enabled = false;
  window.__dbg = { params };
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

  const view = params.get('view') || 'ground';
  /* `alt` is height above the local surface, which is what anyone actually
     means by it; the surface at Tranquility Base is 1.9 km below the datum. */
  const startAgl = Number(params.get('alt') ?? (view === 'orbit' ? 900000 : 2.2));
  const siteGround = heightfield.heightAt(site.lat, site.lon);

  const cam = {
    lat: site.lat, lon: site.lon, alt: siteGround + startAgl,
    yaw: 90 * Math.PI / 180, pitch: view === 'orbit' ? -0.9 : -0.06,
    speed: view === 'orbit' ? 40000 : 6,
  };

  const exposure = new Exposure();
  const world = { x: 0, y: 0, z: 0 };
  const frustum = new THREE.Frustum();
  const projScreen = new THREE.Matrix4();

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
  });
  addEventListener('keyup', (e) => keys.delete(e.code));
  let dragging = false;
  canvas.addEventListener('pointerdown', (e) => { dragging = true; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointerup', (e) => { dragging = false; canvas.releasePointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    cam.yaw -= e.movementX * 0.0022;
    cam.pitch = Math.max(-1.55, Math.min(1.55, cam.pitch - e.movementY * 0.0022));
  });
  canvas.addEventListener('wheel', (e) => {
    cam.speed = Math.max(0.4, Math.min(400000, cam.speed * Math.exp(-e.deltaY * 0.0015)));
    e.preventDefault();
  }, { passive: false });

  /* --- the loop ------------------------------------------------------------ */
  let last = performance.now(), fpsAcc = 0, fpsN = 0, fps = 0, ready = false;
  const probeCache = { t: 0, value: null };

  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    fpsAcc += dt; fpsN++;
    if (fpsAcc > 0.5) { fps = fpsN / fpsAcc; fpsAcc = 0; fpsN = 0; }

    state.simMs += dt * 1000 * state.timeRate;
    const eph = ephemerisAt(jdFromUnixMs(state.simMs));

    /* --- move the camera ------------------------------------------------- */
    const b = enuBasis(cam.lat, cam.lon);
    const cp = Math.cos(cam.pitch), sp = Math.sin(cam.pitch);
    const cy = Math.cos(cam.yaw), sy = Math.sin(cam.yaw);
    /* Forward in the local frame: yaw 0 is north, positive towards east. */
    const fwd = {
      x: (b.n.x * cy + b.e.x * sy) * cp + b.u.x * sp,
      y: (b.n.y * cy + b.e.y * sy) * cp + b.u.y * sp,
      z: (b.n.z * cy + b.e.z * sy) * cp + b.u.z * sp,
    };
    const right = { x: b.e.x * cy - b.n.x * sy, y: b.e.y * cy - b.n.y * sy, z: b.e.z * cy - b.n.z * sy };
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
    const surfaceH = heightfield.heightAt(cam.lat, cam.lon);
    if (cam.alt < surfaceH + 1.6) {
      cam.alt = surfaceH + 1.6;
      llhToXyz(cam.lat, cam.lon, cam.alt, world);
    }

    const rebased = stage.setEye(world.x, world.y, world.z);

    /* Orientation: build the camera basis from the local frame. */
    const b2 = enuBasis(cam.lat, cam.lon);
    const f2 = {
      x: (b2.n.x * cy + b2.e.x * sy) * cp + b2.u.x * sp,
      y: (b2.n.y * cy + b2.e.y * sy) * cp + b2.u.y * sp,
      z: (b2.n.z * cy + b2.e.z * sy) * cp + b2.u.z * sp,
    };
    const m = new THREE.Matrix4();
    const zAxis = new THREE.Vector3(-f2.x, -f2.y, -f2.z).normalize();
    const upV = new THREE.Vector3(b2.u.x, b2.u.y, b2.u.z);
    const xAxis = new THREE.Vector3().crossVectors(upV, zAxis).normalize();
    const yAxis = new THREE.Vector3().crossVectors(zAxis, xAxis);
    m.makeBasis(xAxis, yAxis, zAxis);
    stage.camera.quaternion.setFromRotationMatrix(m);
    stage.camera.updateMatrixWorld();

    /* --- sky and light ---------------------------------------------------- */
    const local = skyAt(eph, cam.lat, cam.lon, cam.alt);
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
      albedo: OPTICS.albedoMare,
      groundFraction: cam.alt - surfaceH > 50000 ? 0.35 : 0.55 + 0.35 * Math.max(0, -Math.sin(cam.pitch)),
      earthIllum: eph.earthIllum,
      earthElevation: local.earthEl,
    }, ready ? dt : 1e6);
    stage.setExposure(ev);
    sky.update(eph, ev);

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
    el('s-tiles').textContent = `${terrain.stats.tiles}  (${terrain.stats.building} building)`;
    el('s-tris').textContent = (terrain.stats.triangles / 1000).toFixed(0) + 'k';
    el('s-fps').textContent = fps.toFixed(0);

    if (state.showScience && now - probeCache.t > 250) {
      probeCache.t = now;
      updateScience(heightfield, geology, cam, local, eph, surface, streams);
    }
  }

  window.SELENE = {
    ready: false, stage, terrain, sky, heightfield, cam, state, streams, surface,
    goto(lat, lon, alt) { cam.lat = lat; cam.lon = lon; cam.alt = alt ?? cam.alt; },
    setTime(iso) { state.simMs = Date.parse(iso); },
    stats: () => ({ ...terrain.stats, fps }),
  };
  requestAnimationFrame(frame);
}

/* --- helpers ---------------------------------------------------------------- */

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

function updateScience(hf, geology, cam, local, eph, streamer, streams) {
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
  /* Diviner-style estimate until the streamed layer is wired in. */
  const lt = localSolarTime(eph, cam.lat, cam.lon);
  const noon = Math.max(0, Math.cos((lt - 0.5) * 2 * Math.PI));
  const t = 95 + 300 * Math.pow(noon * Math.max(0.02, Math.cos(cam.lat * Math.PI / 180)), 0.25);
  el('d-temp').innerHTML = `${t.toFixed(0)} K ${tag('DERIVED')}`;
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
    if (scienceRemote.temperature && scienceRemote.temperature.max !== null) {
      const t2 = scienceRemote.temperature;
      const lt2 = localSolarTime(eph, cam.lat, cam.lon);
      const day = Math.max(0, Math.cos((lt2 - 0.5) * 2 * Math.PI));
      const est = t2.min + (t2.max - t2.min) * Math.pow(day, 0.28);
      el('d-temp').innerHTML = `${est.toFixed(0)} K ${tag('REGIONAL')}` +
        `<span class="est"> ${t2.min.toFixed(0)}–${t2.max.toFixed(0)} K</span>`;
    }
  }

  const parts = [p.source];
  if (desc && desc.imagery) parts.push(desc.imagery.source);
  if (scienceRemote && scienceRemote.temperature) parts.push(scienceRemote.temperature.source);
  if (p.padded) parts.push('landing pad (FICTIONAL)');
  if (desc) parts.push('streaming: ' + desc.status);
  el('d-src').textContent = parts.join('  ·  ');
}

start().catch(e => {
  const f = document.getElementById('fatal');
  f.style.display = 'flex';
  f.textContent = 'SELENE failed to start\n\n' + (e && e.stack || e);
});
