/* ============================================================================
   main.js — HORIZON · Observable Universe Explorer
   ----------------------------------------------------------------------------
   Orchestration: renderer + post chain, the camera rig, the layer stack,
   per-frame projection of every named object (shared by beacons, labels and
   picking), and all input routing. See README.md for the architecture notes.
   ========================================================================== */
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

import { compressLen, clamp } from './scale.js';
import { daysSinceJ2000 } from './data.js';
import { Rig } from './camera.js';
import { Beacons } from './render.js';
import { buildSolarLayer } from './layers/solar.js';
import { buildStarsLayer } from './layers/stars.js';
import { buildGalaxyLayer } from './layers/galaxy.js';
import { buildLocalGroupLayer } from './layers/localgroup.js';
import { buildClustersLayer } from './layers/clusters.js';
import { buildCosmicWebLayer } from './layers/cosmicweb.js';
import { Labels } from './ui/labels.js';
import { pick } from './picking.js';
import { Panel } from './ui/panel.js';
import { Search } from './ui/search.js';
import { Hud } from './ui/hud.js';
import { loadSettings, QUALITY, initSettingsUI } from './ui/settings.js';
import { Tour } from './tour.js';
import { Voyage } from './voyage.js';
import { NavDock } from './ui/nav.js';
import { TimeMode } from './timemode.js';
import { Ambient } from './audio.js';

const $ = s => document.querySelector(s);
const canvas = $('#view');
const settings = loadSettings();
const quality = QUALITY[settings.quality];

// ----------------------------------------------------------- renderer
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;
const DPR = Math.min(window.devicePixelRatio || 1, quality.pixelRatio);
renderer.setPixelRatio(DPR);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000004);
const FOV = 50;
const camera = new THREE.PerspectiveCamera(FOV, 1, 0.01, 2.4e5);

let composer = null, bloom = null;
function buildComposer() {
  const size = new THREE.Vector2();
  renderer.getSize(size);
  const rt = new THREE.WebGLRenderTarget(size.x * DPR, size.y * DPR,
    { type: THREE.HalfFloatType, samples: 4 });
  composer = new EffectComposer(renderer, rt);
  composer.addPass(new RenderPass(scene, camera));
  bloom = new UnrealBloomPass(new THREE.Vector2(size.x * 2, size.y * 2), 0.3, 0.45, 0.95);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());
}
function resize() {
  const w = window.innerWidth, h = window.innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  if (settings.post) buildComposer();
}
window.addEventListener('resize', resize);

// -------------------------------------------------------- world build
const registry = [];
const ctx = {
  S: 1, logS: 7, focus: [0, 0, 0], camPos: [0, 0, 0],
  camRender: [0, 0, 0], camRenderV: new THREE.Vector3(),
  pxPerUnit: 100, pxPerUnitCSS: 100, cssW: 0, cssH: 0,
  T: daysSinceJ2000() / 36525, time: 0, dt: 0, frame: 0,
  quality, timeMode: false, timeEarly: 0, timeScaleA: 1,
  earthPos: [0, 0, 0],
};
window.__ctx = ctx;                 // read by pos() closures + debug tooling

const solar = buildSolarLayer(scene, registry, ctx);
const galaxy = buildGalaxyLayer(scene, registry, ctx);
const localgroup = buildLocalGroupLayer(scene, registry, ctx);
const clusters = buildClustersLayer(scene, registry, ctx);
const web = buildCosmicWebLayer(scene, registry, ctx);
const layers = [solar, galaxy, localgroup, clusters, web];
const beacons = new Beacons(scene, 768);
const stars = await buildStarsLayer(scene, registry, ctx);
layers.splice(1, 0, stars);
// deep-sky catalog layer arrives as data; degrade gracefully without it
try {
  const { buildDeepSkyLayer } = await import('./layers/deepsky.js');
  const deepsky = await buildDeepSkyLayer(scene, registry, ctx);
  if (deepsky) layers.push(deepsky);
} catch (e) { console.warn('deep-sky layer unavailable:', e.message); }

const byId = id => registry.find(o => o.id === id);
const earthObj = byId('earth');

// ------------------------------------------------------------ camera
const rig = new Rig(canvas);
{
  // start: sunlit Earth, terminator in view, slightly above the ecliptic
  ctx.frame = 1;
  const e = earthObj.pos(ctx);
  rig.focus = [...e];
  rig.focusObj = earthObj;
  const sunward = Math.atan2(-e[2], -e[0]);
  rig.theta = rig.tTheta = sunward - 0.55;
  rig.phi = rig.tPhi = 1.22;
  rig.logD = rig.tLogD = 7.45;
}

// --------------------------------------------------------------- ui
const hud = new Hud();
const panel = new Panel({
  focus: o => flyToObj(o),
  returnToEarth: () => returnToEarth(),
});
const labels = new Labels($('#labels'), o => select(o));
labels.density = settings.labels;
const ambient = new Ambient();
const timeMode = new TimeMode({});
const tour = new Tour(rig, registry, {
  onStart: () => { $('#bTour').classList.add('on'); panel.hide(); ambient.swell(); },
  onStop: () => $('#bTour').classList.remove('on'),
});
const search = new Search(registry, o => { select(o); flyToObj(o); });
const voyage = new Voyage(rig, registry, {
  onStart: () => { tour.stop(); panel.hide(); ambient.swell(); },
  onStop: () => {},
  onArrive: () => {},
});
const nav = new NavDock(registry, o => { select(o); flyToObj(o); });
rig.onLockedInput = () => { tour.stop(); voyage.stop(); };
rig.onModeChange = mode => {
  $('#flybox').classList.toggle('on', mode === 'fly');
  $('#bFly').classList.toggle('on', mode === 'fly');
  if (mode === 'fly') { tour.stop(); voyage.stop(); panel.hide(); }
};
$('#bFly').onclick = () => rig.toggleFly();
function skyView() {
  tour.stop(); voyage.stop(); panel.hide();
  const earth = registry.find(o => o.id === 'earth');
  const e = earth.pos(ctx);
  const el = Math.hypot(e[0], e[1], e[2]);
  const n = [e[0]/el, e[1]/el, e[2]/el];        // zenith on the midnight side
  if (rig.mode !== 'fly') rig.enterFly();
  rig.focus = [e[0] + n[0]*earth.radius*2.2, e[1] + n[1]*earth.radius*2.2,
               e[2] + n[2]*earth.radius*2.2];
  // open facing the heart of the Milky Way — the most striking stretch of sky
  const sgr = registry.find(o => o.id === 'sgra');
  const q = sgr ? sgr.pos() : [n[0]*1e20, n[1]*1e20, n[2]*1e20];
  const cp = rig.focus;
  const v = [q[0]-cp[0], q[1]-cp[1], q[2]-cp[2]];
  const vl = Math.hypot(v[0], v[1], v[2]);
  const d = [v[0]/vl, v[1]/vl, v[2]/vl];
  rig.pitch = rig.tPitch = Math.asin(Math.max(-1, Math.min(1, d[1])));
  rig.yaw = rig.tYaw = Math.atan2(d[0], -d[2]);
  rig.logD = rig.tLogD = 6.7;                    // gentle starting speed
  hudMsgSky();
}
function hudMsgSky() {
  const m = $('#flybox');
  m.classList.add('on');
}
$('#bSky').onclick = skyView;
$('#bVoyage').onclick = () => voyage.active ? voyage.stop() : voyage.start(ctx);

let selected = null;
function select(o) {
  selected = o;
  labels.selected = o;
  if (o) panel.show(o, ctx); else panel.hide();
}
function flyToObj(o) {
  const d = o.focusD ?? Math.max(o.radius * 4, 1e7);
  rig.flyTo(o, Math.log10(d));
  ambient.swell();
}
function returnToEarth() {
  select(earthObj);
  rig.flyTo(earthObj, 7.45);
  ambient.swell();
  if (timeMode.active) timeMode.deactivate();
}

initSettingsUI(settings, {
  setPost: v => { /* handled per frame */ },
  setLabelDensity: v => { labels.density = v; },
});

// modal helpers
const modals = ['#searchbox', '#settingsbox', '#helpbox'];
function closeModals() { modals.forEach(m => $(m).classList.remove('on')); }
function toggleModal(id) {
  const el = $(id), was = el.classList.contains('on');
  closeModals();
  if (!was) el.classList.add('on');
}
document.querySelectorAll('[data-close]').forEach(b =>
  b.onclick = () => closeModals());

$('#bSearch').onclick = () => { closeModals(); search.open(); };
$('#bTour').onclick = () => tour.active ? tour.stop() : tour.start();
$('#bTime').onclick = () => {
  if (!timeMode.toggle(rig.logD)) {
    // fly out to where time mode makes sense, then enable
    const obs = byId('observable');
    select(null);
    rig.flyTo(obs, 26.3, { done: () => timeMode.toggle(rig.logD) });
  }
};
$('#bAudio').onclick = () => {
  const on = ambient.toggle();
  $('#bAudio').classList.toggle('on', on);
};
$('#bSettings').onclick = () => toggleModal('#settingsbox');
$('#bHelp').onclick = () => toggleModal('#helpbox');

// ---------------------------------------------------------- pointers
let downXY = null, moved = false;
canvas.addEventListener('pointerdown', e => { downXY = [e.clientX, e.clientY]; moved = false; });
canvas.addEventListener('pointermove', e => {
  if (downXY && Math.hypot(e.clientX - downXY[0], e.clientY - downXY[1]) > 5) moved = true;
});
canvas.addEventListener('pointerup', e => {
  if (!downXY || moved) { downXY = null; return; }
  downXY = null;
  const o = pick(registry, e.clientX, e.clientY, ctx);
  select(o);
  onboardTick('click');
});
canvas.addEventListener('dblclick', e => {
  const o = pick(registry, e.clientX, e.clientY, ctx);
  if (o) { select(o); flyToObj(o); }
});
canvas.addEventListener('wheel', () => onboardTick('zoom'), { passive: true });
canvas.addEventListener('pointermove', () => { if (moved) onboardTick('drag'); });

const FLYKEYS = { w:'f', W:'f', s:'b', S:'b', a:'l', A:'l', d:'r', D:'r', ' ':'u', c:'d', C:'d' };
window.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT') {
    if (e.key === 'Escape') { search.close(); closeModals(); }
    return;
  }
  if (rig.mode === 'fly') {
    const k = FLYKEYS[e.key];
    if (k) { rig.keys[k] = 1; e.preventDefault(); }
    rig.keys.boost = e.shiftKey ? 1 : rig.keys.boost;
    rig.keys.slow = e.ctrlKey ? 1 : rig.keys.slow;
  }
  switch (e.key) {
    case 't': case 'T': tour.active ? tour.stop() : tour.start(); break;
    case 'f': case 'F': if (!rig.keys.f) rig.toggleFly(); break;
    case 'v': case 'V': voyage.active ? voyage.stop() : voyage.start(ctx); break;
    case 'g': case 'G': skyView(); break;
    case 'n': case 'N': {
      const star = nav.nearest(ctx, 'star', rig.focusObj);
      if (star) { select(star); flyToObj(star); }
      break;
    }
    case 'm': case 'M': $('#bAudio').onclick(); break;
    case 'h': case 'H': case '?': toggleModal('#helpbox'); break;
    case '/': e.preventDefault(); closeModals(); search.open(); break;
    case '0': case 'Home': returnToEarth(); break;
    case 'Escape':
      if (voyage.active) voyage.stop();
      else if (tour.active) tour.stop();
      else if (rig.mode === 'fly') rig.exitFly();
      else if (search.isOpen) search.close();
      else if (timeMode.active) timeMode.deactivate();
      else { closeModals(); select(null); }
      break;
    case '+': case '=': rig.tLogD = clamp(rig.tLogD - 0.5, rig.minLogD, rig.maxLogD); break;
    case '-': case '_': rig.tLogD = clamp(rig.tLogD + 0.5, rig.minLogD, rig.maxLogD); break;
  }
});
window.addEventListener('keyup', e => {
  const k = FLYKEYS[e.key];
  if (k) rig.keys[k] = 0;
  if (e.key === 'Shift') rig.keys.boost = 0;
  if (e.key === 'Control') rig.keys.slow = 0;
});

// ------------------------------------------------------- onboarding
const onboardDone = new Set();
let onboardTimer = 0;
function onboardTick(k) {
  onboardDone.add(k);
  if (onboardDone.size >= 2) $('#onboard').classList.remove('on');
}
setTimeout(() => { if (onboardDone.size < 2) $('#onboard').classList.add('on'); }, 1800);
setTimeout(() => $('#onboard').classList.remove('on'), 30000);

// -------------------------------------------------------- main loop
const selring = $('#selring');
const projV = new THREE.Vector3();
let last = performance.now();

function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min((now - last) / 1000, 0.1);
  last = now;

  // solid bodies guard the zoom floor; abstract regions don't
  const fo = rig.focusObj;
  rig.minLogD = (rig.mode !== 'fly' && fo && ['planet', 'moon', 'star', 'sun'].includes(fo.kind))
    ? Math.max(6.2, Math.log10(fo.radius * 1.55)) : 6.2;

  rig.update(dt);
  tour.update(dt);
  voyage.update(dt);

  // ---- frame context
  ctx.frame++;
  ctx.dt = dt; ctx.time += dt;
  ctx.T = daysSinceJ2000() / 36525;
  ctx.S = rig.dist; ctx.logS = rig.logD;
  ctx.focus = rig.focus;
  ctx.camPos = rig.camPos();
  const cd = rig.mode === 'fly' ? [0, 0, 0] : rig.camDir();
  ctx.camRender = cd;
  ctx.camRenderV.set(cd[0], cd[1], cd[2]);
  ctx.cssW = window.innerWidth; ctx.cssH = window.innerHeight;
  const halfTan = Math.tan(FOV * Math.PI / 360);
  ctx.pxPerUnitCSS = (ctx.cssH / 2) / halfTan;
  ctx.pxPerUnit = ctx.pxPerUnitCSS * DPR;
  ctx.timeMode = timeMode.active;
  ctx.timeEarly = timeMode.early;
  ctx.timeScaleA = timeMode.scaleA;
  ctx.earthPos = earthObj.pos(ctx);

  rig.apply(camera);

  // ---- layers
  for (const l of layers) l.update(ctx);

  // ---- project registry: beacons + labels + picking share this pass
  beacons.begin();
  const f = ctx.focus, S = ctx.S;
  for (const o of registry) {
    const p = o.pos(ctx);
    const rx = (p[0]-f[0])/S, ry = (p[1]-f[1])/S, rz = (p[2]-f[2])/S;
    const L = Math.hypot(rx, ry, rz);
    const k = L > 0 ? compressLen(L) / L : 1;
    const cx = rx*k, cy = ry*k, cz = rz*k;
    projV.set(cx, cy, cz).project(camera);
    o._behind = projV.z > 1 || projV.z < -1;
    o._sx = (projV.x * 0.5 + 0.5) * ctx.cssW;
    o._sy = (-projV.y * 0.5 + 0.5) * ctx.cssH;
    // apparent pixel size of the object (for picking + mesh/beacon crossfade)
    const camDist = Math.max(Math.hypot(cx - cd[0], cy - cd[1], cz - cd[2]), 1e-9);
    o._px = (2 * (o.radius / S) * k / camDist) * ctx.pxPerUnitCSS;
    if (o.lum > 0 && !o._behind) {
      const meshFade = clamp((o._px - 2.5) / 3, 0, 1);   // mesh takes over
      let lum = o.lum * (1 - meshFade);
      if (lum > 0) {
        // the beacon shader (shared star shader) will read the camera
        // distance of the COMPRESSED position; rescale luminosity so the
        // flux comes out right for the TRUE camera distance
        const trueCam = Math.hypot(rx - cd[0], ry - cd[1], rz - cd[2]) * S;
        const shaderCam = Math.hypot(cx - cd[0], cy - cd[1], cz - cd[2]) * S;
        lum *= (shaderCam * shaderCam) / (trueCam * trueCam);
        beacons.add(cx, cy, cz, o.color, lum);
      }
    }
  }
  beacons.commit(ctx);

  labels.update(ctx, registry, dt);
  ctx.mode = rig.mode;
  nav.update(ctx, dt, rig.focusObj);
  hud.update(ctx, rig.mode === 'fly' ? 'Free flight'
    : rig.focusObj ? rig.focusObj.name
    : (selected ? selected.name : 'Deep space'));
  ambient.update(ctx);

  // selection reticle
  if (selected && !selected._behind &&
      selected._sx > -50 && selected._sx < ctx.cssW + 50 &&
      selected._sy > -50 && selected._sy < ctx.cssH + 50) {
    const r = clamp(selected._px, 22, 160);
    selring.style.display = 'block';
    selring.style.width = selring.style.height = r + 'px';
    selring.style.left = selected._sx + 'px';
    selring.style.top = selected._sy + 'px';
  } else selring.style.display = 'none';

  // ---- render
  if (settings.post && composer) composer.render();
  else renderer.render(scene, camera);
}

resize();
requestAnimationFrame(frame);
window.__rig = rig;                 // debug / automation hook
window.__registry = registry;
window.__layers = { solar, stars, galaxy, localgroup, clusters, web, beacons };
setTimeout(() => $('#loading').classList.add('off'), 900);
