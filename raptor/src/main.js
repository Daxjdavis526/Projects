// RAPTOR — entry point. Owns the fixed-timestep simulation loop and wires the
// subsystems together. The flight model never learns which camera is active.

import * as THREE from 'three';
import { AC, SIM, WORLD } from './config.js';
import { Wind, isa } from './atmosphere.js';
import { FlightModel } from './aero.js';
import { Propulsion } from './engine.js';
import { Terrain, heightAt } from './terrain.js';
import { Aircraft } from './aircraft.js';
import { Effects } from './effects.js';
import { Sky } from './sky.js';
import { Clouds } from './clouds.js';
import { Weather, PRESETS } from './weather.js';
import { Water } from './water.js';
import { Scenery } from './scenery.js';
import { CameraRig, MODES } from './cameras.js';
import { HUD } from './hud.js';
import { Cockpit } from './cockpit.js';
import { Nav } from './nav.js';
import { Input } from './input.js';
import { AudioEngine } from './audio.js';
import { origin, updateOrigin, toRender, AIRPORTS, CITIES, nearestAirport, worldToGeo } from './world.js';

const D = Math.PI / 180;
const clamp = (x, a, b) => x < a ? a : x > b ? b : x;
const MS_TO_KT = 1.94384;
const M_TO_FT = 3.28084;

const view = document.getElementById('view');
const hudCanvas = document.getElementById('hud');
const mapCanvas = document.getElementById('map');
const ui = {
  status: document.getElementById('status'),
  camera: document.getElementById('cameraName'),
  toast: document.getElementById('toast'),
  help: document.getElementById('help'),
  settings: document.getElementById('settings'),
  loading: document.getElementById('loading'),
  loadingText: document.getElementById('loadingText'),
  weather: document.getElementById('weatherName'),
  clock: document.getElementById('clock'),
  timeRate: document.getElementById('timeRate'),
};

// ---------------------------------------------------------------------------
// Renderer & scene
// ---------------------------------------------------------------------------
const renderer = new THREE.WebGLRenderer({
  canvas: view, antialias: true, powerPreference: 'high-performance',
  logarithmicDepthBuffer: true,
});
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.06;

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x9fb5cf, 4000, 60000);

const wind = new Wind();
const terrain = new Terrain(scene);
const sky = new Sky(scene);
const water = new Water(scene);
const clouds = new Clouds(scene);
const weather = new Weather(scene, wind);
const scenery = new Scenery(scene);
const aircraft = new Aircraft(scene, renderer);
const effects = new Effects(scene, aircraft);
const cockpit = new Cockpit(scene, aircraft);

const fm = new FlightModel(wind, heightAt);
const prop = new Propulsion();
const rig = new CameraRig(innerWidth / innerHeight);
const hud = new HUD(hudCanvas);
const nav = new Nav(mapCanvas);
const input = new Input(view);
const audio = new AudioEngine();

const sim = {
  paused: false,
  timeRate: 1,
  timeOfDay: 14.2,          // hours
  dayOfYear: 172,
  clockRate: 1,             // day/night advance multiplier
  started: false,
  frame: 0,
};

// ---------------------------------------------------------------------------
// Start position: lined up on the runway at Nellis.
// ---------------------------------------------------------------------------
function placeOnRunway(a, airborne = false) {
  // back up to the threshold along the runway heading, then sit on whatever
  // the height field actually returns there rather than the published elevation
  const p = new THREE.Vector3(
    a.x - a.dir.x * a.rwyLen * 0.42, 0, a.z - a.dir.y * a.rwyLen * 0.42);
  p.y = Math.max(heightAt(p.x, p.z), a.elev) + AC.gearHeight + 0.35;
  if (airborne) {
    p.y = a.elev + 3500;
    fm.gearDown = false; fm.gearPos = 0;
    fm.reset(p, a.rwyHdg, 240);
    prop.throttle = 0.85;
    input.axes.throttle = 0.85;
  } else {
    fm.gearDown = true; fm.gearPos = 1;
    fm.reset(p, a.rwyHdg, 0);
    prop.throttle = 0;
    input.axes.throttle = 0;
  }
  fm.fuel = AC.fuelCapacity;
  origin.set(Math.round(p.x / 4096) * 4096, 0, Math.round(p.z / 4096) * 4096);
  effects.clearTrails();
  rig.groundPos = null;
  rig.flybyPos = null;
}
placeOnRunway(AIRPORTS[0]);
nav.center.set(fm.position.x, fm.position.z);
nav.setWaypointAirport(AIRPORTS[1]);

// ---------------------------------------------------------------------------
// Resize
// ---------------------------------------------------------------------------
function resize() {
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h, false);
  rig.camera.aspect = w / h;
  rig.camera.updateProjectionMatrix();
  const dpr = Math.min(devicePixelRatio, 2);
  hud.resize(w, h, dpr);
  nav.resize(w, h, dpr);
}
addEventListener('resize', resize);
resize();

// ---------------------------------------------------------------------------
// UI helpers
// ---------------------------------------------------------------------------
let toastTimer = 0;
function toast(msg, ms = 2000) {
  ui.toast.textContent = msg;
  ui.toast.classList.add('show');
  toastTimer = ms / 1000;
}

function setCamera(id) {
  rig.setMode(id, fm);
  const m = MODES.find(x => x.id === id);
  ui.camera.textContent = m.name;
  toast(`Camera — ${m.name}`);
}

// ---------------------------------------------------------------------------
// Key bindings
// ---------------------------------------------------------------------------
const CAM_KEYS = {
  Digit1: 'cockpit', Digit2: 'chase', Digit3: 'chaseClose', Digit4: 'chaseFar',
  Digit5: 'orbit', Digit6: 'cinematic', Digit7: 'flyby', Digit8: 'wing',
  Digit9: 'nose', Digit0: 'tail',
};

input.on('key', (code, e) => {
  audio.resume();
  if (CAM_KEYS[code]) { setCamera(CAM_KEYS[code]); return; }
  switch (code) {
    case 'KeyC': rig.cycle(1, fm); ui.camera.textContent = rig.info.name; toast(`Camera — ${rig.info.name}`); break;
    case 'KeyV': rig.cycle(-1, fm); ui.camera.textContent = rig.info.name; toast(`Camera — ${rig.info.name}`); break;
    case 'Backquote': setCamera(rig.isCockpit ? 'chase' : 'cockpit'); break;
    case 'KeyG':
      fm.gearDown = !fm.gearDown;
      audio.blip(fm.gearDown ? 220 : 320, 0.5, 0.12, 'square');
      toast(`Landing gear ${fm.gearDown ? 'DOWN' : 'UP'}`);
      break;
    case 'KeyH': {
      hud.mode = hud.mode === 'full' ? 'minimal' : hud.mode === 'minimal' ? 'off' : 'full';
      toast(`HUD — ${hud.mode}`);
      break;
    }
    case 'KeyM': nav.toggle(); mapCanvas.style.display = nav.open ? 'block' : 'none'; break;
    case 'KeyP': sim.paused = !sim.paused; toast(sim.paused ? 'Paused' : 'Resumed'); break;
    case 'KeyT': {
      const rates = [1, 2, 4, 8, 16, 32];
      sim.timeRate = rates[(rates.indexOf(sim.timeRate) + 1) % rates.length];
      toast(`Time ×${sim.timeRate}`);
      break;
    }
    case 'KeyN': {
      sim.timeOfDay = (sim.timeOfDay + 3) % 24;
      toast(`Time of day ${formatClock(sim.timeOfDay)}`);
      break;
    }
    case 'KeyJ':
      input.mouseStick = !input.mouseStick;
      toast(`Mouse stick ${input.mouseStick ? 'ON' : 'OFF'} — right-drag still moves the camera`);
      break;
    case 'KeyR': placeOnRunway(nearestAirport(fm.position.x, fm.position.z).airport); toast('Repositioned on the runway'); break;
    case 'KeyY': placeOnRunway(nearestAirport(fm.position.x, fm.position.z).airport, true); toast('Airborne restart'); break;
    case 'KeyO': rig.placeGround(fm); setCamera('ground'); toast('Ground observer placed ahead of the jet'); break;
    case 'KeyU': audio.toggle(); toast(`Audio ${audio.enabled ? 'on' : 'off'}`); break;
    case 'KeyF': {
      nav.autopilot.on = !nav.autopilot.on;
      nav.autopilot.mode = nav.waypoint ? 'waypoint' : 'heading';
      nav.autopilot.heading = fm.heading;
      nav.autopilot.altitude = Math.max(fm.position.y, heightAt(fm.position.x, fm.position.z) + 3000);
      toast(`Autopilot ${nav.autopilot.on ? 'engaged — ' + nav.autopilot.mode : 'off'}`);
      break;
    }
    case 'KeyK': {
      const keys = Object.keys(PRESETS);
      const next = keys[(keys.indexOf(weather.preset) + 1) % keys.length];
      weather.set(next);
      toast(`Weather — ${PRESETS[next].name}`);
      break;
    }
    case 'KeyX': rig.recenter(); break;
    case 'Slash': case 'F1':
      ui.help.classList.toggle('open');
      break;
    case 'Escape':
      ui.help.classList.remove('open');
      if (nav.open) { nav.toggle(); mapCanvas.style.display = 'none'; }
      break;
    case 'Tab':
      ui.settings.classList.toggle('open');
      break;
  }
});

input.on('drag', (dx, dy) => {
  if (nav.open) {
    nav.follow = false;
    nav.center.x -= dx * nav.mppx;
    nav.center.y -= dy * nav.mppx;
    nav._reliefKey = '';
  } else {
    rig.orbitDrag(dx, dy);
  }
});

input.on('wheel', (dy) => {
  if (nav.open) nav.zoomBy(dy > 0 ? 0.82 : 1.22, fm);
  else rig.zoom(dy);
});

input.on('click', (e) => {
  audio.resume();
  if (nav.open) {
    const w = nav.screenToWorld(e.clientX, e.clientY);
    // snap to an airport if one is close on screen
    let best = null, bd = 26;
    for (const a of AIRPORTS) {
      const s = nav.worldToScreen(a.x, a.z);
      const d = Math.hypot(s.x - e.clientX, s.y - e.clientY);
      if (d < bd) { bd = d; best = a; }
    }
    if (best) { nav.setWaypointAirport(best); toast(`Waypoint — ${best.icao} ${best.name}`); }
    else { nav.setWaypoint(w.x, w.z, 'WPT'); toast('Waypoint set'); }
    return;
  }
  if (rig.mode === 'ground') return;
  // cockpit hotspots
  if (rig.isCockpit) {
    const ray = new THREE.Raycaster();
    ray.setFromCamera(new THREE.Vector2(input.mouseX, -input.mouseY), rig.camera);
    const hits = ray.intersectObjects(cockpit.hotspots, true);
    if (hits.length) {
      fm.gearDown = !fm.gearDown;
      audio.blip(260, 0.35, 0.15, 'square');
      toast(`Landing gear ${fm.gearDown ? 'DOWN' : 'UP'}`);
    }
  }
});

input.on('padbutton', (i) => {
  audio.resume();
  if (i === 0) { fm.gearDown = !fm.gearDown; toast(`Landing gear ${fm.gearDown ? 'DOWN' : 'UP'}`); }
  if (i === 1) { rig.cycle(1, fm); toast(`Camera — ${rig.info.name}`); }
  if (i === 9) { sim.paused = !sim.paused; }
});

// settings panel bindings
function bindSlider(id, get, set, fmt) {
  const el = document.getElementById(id);
  if (!el) return;
  el.value = get();
  const out = document.getElementById(id + 'Val');
  const sync = () => { if (out) out.textContent = fmt ? fmt(get()) : Number(get()).toFixed(2); };
  sync();
  el.addEventListener('input', () => { set(parseFloat(el.value)); sync(); rig.save(); });
}
bindSlider('setDistance', () => rig.settings.chaseDistance, v => rig.settings.chaseDistance = v);
bindSlider('setStiffness', () => rig.settings.stiffness, v => rig.settings.stiffness = v);
bindSlider('setLag', () => rig.settings.lag, v => rig.settings.lag = v);
bindSlider('setFov', () => rig.settings.fov, v => rig.settings.fov = v, v => v.toFixed(0) + '°');
bindSlider('setShake', () => rig.settings.shake, v => rig.settings.shake = v);
bindSlider('setZoomSens', () => rig.settings.zoomSensitivity, v => rig.settings.zoomSensitivity = v);
bindSlider('setOrbitSens', () => rig.settings.orbitSensitivity, v => rig.settings.orbitSensitivity = v);
bindSlider('setVolume', () => audio.masterVolume, v => audio.setVolume(v));
bindSlider('setSens', () => input.sensitivity, v => input.sensitivity = v);

const invertEl = document.getElementById('setInvert');
if (invertEl) invertEl.addEventListener('change', () => { input.invertPitch = invertEl.checked; });
const dynWx = document.getElementById('setDynamicWeather');
if (dynWx) dynWx.addEventListener('change', () => { weather.dynamic = dynWx.checked; });

document.querySelectorAll('[data-cam]').forEach(b =>
  b.addEventListener('click', () => setCamera(b.dataset.cam)));
document.querySelectorAll('[data-wx]').forEach(b =>
  b.addEventListener('click', () => { weather.set(b.dataset.wx); toast(`Weather — ${PRESETS[b.dataset.wx].name}`); }));

// ---------------------------------------------------------------------------
// Simulation step
// ---------------------------------------------------------------------------
let touchdownArmed = false;
let prevOnGround = true;

function stepPhysics(dt) {
  const air = isa(fm.position.y);
  prop.update(dt, air, fm.mach, fm.position.y, fm.fuel);
  fm.step(dt, prop);
}

function formatClock(h) {
  const hh = Math.floor(h) % 24;
  const mm = Math.floor((h - Math.floor(h)) * 60);
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

let last = performance.now();
let acc = 0;
let fpsAcc = 0, fpsCount = 0, fps = 60;

function frame(now) {
  requestAnimationFrame(frame);
  let real = (now - last) / 1000;
  last = now;
  if (real > 0.25) real = 0.25;
  fpsAcc += real; fpsCount++;
  if (fpsAcc > 0.5) { fps = fpsCount / fpsAcc; fpsAcc = 0; fpsCount = 0; }

  input.update(real);

  const dt = sim.paused ? 0 : real * sim.timeRate;

  // ---- pilot inputs ----
  if (!sim.paused) {
    const apActive = nav.updateAutopilot(dt, fm, prop);
    if (!apActive) {
      fm.input.pitch = input.axes.pitch;
      fm.input.roll = input.axes.roll;
      fm.input.yaw = input.axes.yaw;
      prop.throttle = input.axes.throttle;
    } else {
      input.axes.throttle = prop.throttle;
    }
    fm.brakes = input.held('brakes') ? 1 : 0;
    fm.speedbrake = input.held('speedbrake') ? 1 : 0;
    if (input.held('trimUp')) fm.input.trim = clamp(fm.input.trim + real * 0.2, -0.4, 0.4);
    if (input.held('trimDown')) fm.input.trim = clamp(fm.input.trim - real * 0.2, -0.4, 0.4);
  }

  // ---- fixed-timestep physics ----
  if (!sim.paused) {
    acc += dt;
    // 240 Hz normally; under time acceleration the step grows (but never past
    // 60 Hz, or the landing-gear springs go unstable)
    const h = clamp(SIM.fixedDt * sim.timeRate, SIM.fixedDt, 1 / 60);
    let steps = 0;
    while (acc >= h && steps < SIM.maxSubSteps) {
      stepPhysics(h);
      acc -= h; steps++;
    }
    if (acc > h * 4) acc = 0;         // fell behind; drop the backlog
  }

  // ---- touchdown ----
  if (fm.onGround && !prevOnGround) {
    const impact = clamp(-fm.velocity.y / 6, 0.05, 1.4);
    audio.thump(impact);
    if (impact > 0.5) toast(`Touchdown — ${(fm.velocity.y * M_TO_FT * 60).toFixed(0)} fpm`);
  }
  prevOnGround = fm.onGround;

  // ---- world state ----
  sim.timeOfDay = (sim.timeOfDay + dt * sim.clockRate / 3600) % 24;
  wind.update(dt);
  weather.update(dt, rig.worldPosition || fm.position, fm.position.y, audio);

  // ---- cameras ----
  rig.update(real, fm, weather, prop);
  const camWorld = rig.worldPosition;

  // floating origin follows the camera so the renderer never sees big numbers
  if (updateOrigin(camWorld)) {
    toRender(rig.pos, rig.camera.position);
  }

  // ---- streaming ----
  terrain.update(camWorld, real, fps < 40 ? 1 : 3);
  scenery.update(camWorld, sky.isNight);
  clouds.update(real, camWorld, sky, weather);
  water.update(real, camWorld, sky, weather);

  // ---- sky & lighting ----
  sky.update(sim.timeOfDay, worldToGeo(fm.position.x, fm.position.z).lat,
    sim.dayOfYear, camWorld.y, weather, now / 1000);
  sky.follow(rig.camera);
  sky.sunLight.target.position.copy(rig.camera.position);
  sky.sunLight.target.updateMatrixWorld();

  // fog: visibility falls in cloud and in weather, and thins with altitude
  const inCloud = clouds.inCloud;
  const vis = weather.visibility * (1 - inCloud * 0.985) * (1 + clamp(camWorld.y / 12000, 0, 1) * 1.6);
  scene.fog.near = Math.max(1, vis * 0.28);
  scene.fog.far = Math.max(60, vis);
  const up = Math.max(0.02, sky.sunDir.y);
  const fogLum = 0.10 + 0.85 * Math.pow(up, 0.5);
  scene.fog.color.setRGB(
    (0.55 + 0.16 * inCloud) * fogLum,
    (0.62 + 0.16 * inCloud) * fogLum,
    (0.74 + 0.16 * inCloud) * fogLum);
  renderer.setClearColor(scene.fog.color);

  // ---- aircraft & effects ----
  toRender(fm.position, aircraft.group.position);
  aircraft.group.quaternion.copy(fm.quaternion);
  aircraft.update(fm, prop, real, sky.isNight);
  effects.update(real, fm, prop, weather);
  weather.setStreak(fm.velocity);

  // the exterior model stays visible from the cockpit — you can see your own
  // nose and wings from in there; the hull is back-face culled from inside
  const cockpitView = rig.isCockpit;
  cockpit.setVisible(cockpitView);
  cockpit.update(real, fm, prop, weather, nav, sky);

  // ---- audio ----
  audio.update(real, {
    position: camWorld,
    velocity: fm.velocity,
    right: rig.rightVector || new THREE.Vector3(1, 0, 0),
  }, fm, prop, cockpitView, weather);
  audio.warn(fm.stalled || fm.fuel <= 0, fm.fuel <= 0 ? 660 : 880);

  // ---- render ----
  renderer.render(scene, rig.camera);

  // ---- 2D overlays ----
  hud.draw({ fm, prop, camera: rig.camera, nav, cockpit: cockpitView, weather });
  nav.draw(fm, weather, sim.timeOfDay);

  // ---- status line ----
  if ((sim.frame++ & 7) === 0) updateStatus();
  if (toastTimer > 0) {
    toastTimer -= real;
    if (toastTimer <= 0) ui.toast.classList.remove('show');
  }
  if (!sim.started && sim.frame > 8) {
    sim.started = true;
    ui.loading.classList.add('hidden');
  }
}

function updateStatus() {
  const near = nearestAirport(fm.position.x, fm.position.z);
  ui.status.innerHTML =
    `<b>${(fm.tas * MS_TO_KT).toFixed(0)}</b> kt &nbsp; ` +
    `M <b>${fm.mach.toFixed(2)}</b> &nbsp; ` +
    `<b>${(fm.position.y * M_TO_FT).toFixed(0)}</b> ft &nbsp; ` +
    `<b>${fm.gLoad.toFixed(1)}</b> g &nbsp; ` +
    `${near.airport.icao} ${(near.distance / 1852).toFixed(0)} NM &nbsp; ` +
    `${fps.toFixed(0)} fps`;
  ui.clock.textContent = formatClock(sim.timeOfDay);
  ui.timeRate.textContent = sim.timeRate === 1 ? '' : `×${sim.timeRate}`;
  ui.weather.textContent = weather.target.name;
  ui.camera.textContent = rig.info.name;
}

// ---------------------------------------------------------------------------
// Boot
// ---------------------------------------------------------------------------
ui.loadingText.textContent = 'Building terrain…';
terrain.prime(fm.position, 10);
scenery.update(fm.position, false);
clouds.update(0, fm.position, sky, weather);
requestAnimationFrame(frame);

// let people start the audio context with any interaction
addEventListener('pointerdown', () => audio.resume(), { once: true });
addEventListener('keydown', () => audio.resume(), { once: true });

// expose a little of the sim for the console — handy when tuning
window.RAPTOR = {
  fm, prop, rig, terrain, weather, nav, sim, audio, sky, effects,
  water, clouds, scenery, scene, renderer, aircraft, cockpit,
  hud, input, THREE,
};
