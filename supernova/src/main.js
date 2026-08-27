/* =============================================================================
   SUPERNOVA — main
   -----------------------------------------------------------------------------
   Per-frame order is fixed and deliberate:

     clock  ->  physics  ->  snapshot  ->  gpu upload  ->  scene  ->  camera
            ->  ui  ->  audio  ->  composite

   Physics never reads the scene and the scene never reads physics state
   directly — everything crosses at snapshot(), which is a plain object.
   ========================================================================== */

import * as THREE from 'three';
import { Renderer, autoQuality } from './render/renderer.js';
import { Stage } from './render/scene.js';
import { Rig, MODE } from './camera/rig.js';
import { Star } from './render/star.js';
import { MODELS, DEFAULT_MODEL } from './physics/models.js';
import { SimClock } from './time/clock.js';
import { Engine } from './physics/engine.js';
import { Hud } from './ui/hud.js';
import { Profiles } from './render/profiles.js';
import { Interior, VIEW } from './render/interior.js';
import { Core } from './render/core.js';
import { Shock } from './render/shock.js';
import { Ejecta } from './render/ejecta.js';
import { LightCurve } from './ui/lightcurve.js';
import { Annotations } from './ui/annotations.js';
import { Modals } from './ui/modals.js';
import { Refs } from './render/refs.js';
import { Cinematic } from './camera/cinematic.js';
import { ELEMENTS, ELEMENT_COLOR } from './config.js';
import { Score } from './audio/audio.js';
import { Timeline } from './ui/timeline.js';
import { QUALITY, KM } from './config.js';
import * as fmt from './ui/format.js';

const $ = id => document.getElementById(id);

/* --- boot ----------------------------------------------------------------- */
const qualityName = (() => {
  try { const q = localStorage.getItem('sn-quality'); if (q && QUALITY[q]) return q; } catch {}
  return autoQuality();
})();
const quality = QUALITY[qualityName];

const renderer = new Renderer(qualityName);
const stage = new Stage(quality);
const rig = new Rig(stage, renderer.gl.domElement);

renderer.attach(gl => stage.draw(gl), stage.near, stage.camera);
renderer.onResize = (w, h) => stage.resize(w, h);

/* --- progenitor ---------------------------------------------------------- */
const modelId = (() => {
  const q = new URLSearchParams(location.search).get('m');
  if (q && MODELS[q]) return q;
  return DEFAULT_MODEL;
})();
const model = MODELS[modelId];
const star = new Star(stage, quality, model);
const R_STAR_KM = model.R_star * KM;         // 4.17e8 km

rig.focusOn(0, 0, 0, R_STAR_KM * 5.0);

/* --- physics -------------------------------------------------------------- */
const clock = new SimClock(model);
const engine = new Engine(model, clock);
const hud = new Hud(model);
const timeline = new Timeline(clock, engine, () => { /* seek: engine follows in the loop */ });
const lightcurve = new LightCurve(clock);
const annotations = new Annotations(model.id === 'ia' ? 'ia' : 'cc');
let snap = engine.snapshot();

/* --- physics -> GPU bridge + interior view -------------------------------- */
const profiles = new Profiles();
const interior = new Interior(stage, profiles, quality);
const core = new Core(stage);
const shock = new Shock(stage, quality);
const ejecta = new Ejecta(stage, quality, model);
const score = new Score();

/* --- focus targets --------------------------------------------------------
   Star and core share the origin; focusing is a matter of orbit distance.
   Approaching the proto-neutron star means a 1e7x zoom — the point. */
$('focus-star')?.addEventListener('click', () => {
  rig.focusOn(0, 0, 0, Math.max(snap.R_star * KM * 5, 100));
  $('focus-star').classList.add('on'); $('focus-core').classList.remove('on');
});
$('focus-core')?.addEventListener('click', () => {
  const R = Math.max((snap.t >= 0 ? snap.R_pns : snap.R_core) * KM, 12 * 1e-5 / 1e-5);
  rig.focusOn(0, 0, 0, Math.max(R * 6, 60));
  $('focus-core').classList.add('on'); $('focus-star').classList.remove('on');
});

const viewButtons = { 'view-ext': VIEW.EXTERIOR, 'view-cut': VIEW.CUTAWAY, 'view-int': VIEW.INTERIOR };
for (const [id, mode] of Object.entries(viewButtons)) {
  $(id)?.addEventListener('click', () => {
    interior.setMode(mode, star, renderer);
    for (const other of Object.keys(viewButtons)) $(other)?.classList.toggle('on', other === id);
  });
}

/* --- title gate ----------------------------------------------------------- */
$('begin').addEventListener('click', () => {
  $('title').classList.add('gone');
  setTimeout(() => $('title').style.display = 'none', 950);
  score.init();                       // needs the user gesture
  /* Jump the story to the last seconds before instability and let it run,
     with the documentary camera until the user takes over. */
  clock.seekU(0.128);
  clock.play('narrative');
  cinema.start();
});

const refs = new Refs(stage);
const modals = new Modals(rig, renderer);
const cinema = new Cinematic(rig, clock);

$('btn-cine')?.addEventListener('click', () => {
  cinema.active ? cinema.stop() : cinema.start();
});

/* scenario picker on the title screen */
document.querySelectorAll('#scenarios .sc').forEach(b => {
  b.addEventListener('click', e => {
    e.stopPropagation();
    const m = b.dataset.m;
    if (m !== modelId) location.search = '?m=' + m;
  });
  b.classList.toggle('on', b.dataset.m === modelId);
});

$('btn-refs')?.addEventListener('click', () => {
  const on = refs.toggle();
  $('btn-refs').classList.toggle('on', on);
});

/* --- visualisation modes + legend ------------------------------------------ */
const legend = $('legend');
function setViz(v) {
  interior.setViz(v);
  document.querySelectorAll('#vizbar .tl-btn').forEach(b =>
    b.classList.toggle('on', +b.dataset.viz === v));
  if (v === 0) { legend.style.display = 'none'; return; }
  legend.style.display = 'block';
  if (v === 1) {
    legend.innerHTML = '<h2>Elements</h2>' + ELEMENTS.map(e => {
      const c = ELEMENT_COLOR[e];
      const css = `rgb(${c.map(x => Math.round(x * 235)).join(',')})`;
      return `<div class="lg-row"><span class="lg-sw" style="background:${css}"></span>${e}</div>`;
    }).join('');
  } else if (v === 2) {
    legend.innerHTML = `<h2>Density</h2>
      <div class="lg-bar" style="background:linear-gradient(90deg,#1a0b2e,#7a2d8c,#e05c5c,#ffd27f,#fff)"></div>
      <div class="lg-cap"><span>10⁻⁸</span><span>g/cm³</span><span>10¹⁵</span></div>`;
  } else if (v === 3) {
    legend.innerHTML = `<h2>Temperature</h2>
      <div class="lg-bar" style="background:linear-gradient(90deg,#ff9d4a,#ffd9a0,#fff,#cfe0ff,#9db8ff)"></div>
      <div class="lg-cap"><span>10³</span><span>K</span><span>10¹²</span></div>`;
  } else if (v === 4) {
    legend.innerHTML = `<h2>Radial velocity</h2>
      <div class="lg-bar" style="background:linear-gradient(90deg,#4a8cff,#fff,#ff4a2e)"></div>
      <div class="lg-cap"><span>infall</span><span>0</span><span>outflow</span></div>`;
  }
}
document.querySelectorAll('#vizbar .tl-btn').forEach(b =>
  b.addEventListener('click', () => setViz(+b.dataset.viz)));

/* --- physical-time presets -------------------------------------------------- */
document.querySelectorAll('#speeds .tl-btn').forEach(b =>
  b.addEventListener('click', () => {
    document.querySelectorAll('#speeds .tl-btn').forEach(x => x.classList.remove('on'));
    b.classList.add('on');
    if (b.dataset.rate === 'narrative') {
      clock.mode = 'narrative';
    } else {
      clock.mode = 'physical';
      clock.physRate = parseFloat(b.dataset.rate);
    }
    if (!clock.playing) clock.play(clock.mode);
  }));

$('mute')?.addEventListener('click', () => {
  score.setMuted(score.enabled);
  $('mute').textContent = score.enabled ? '♪' : '∅';
});

addEventListener('keydown', e => {
  if (e.code === 'Space' && !rig.suspended) { e.preventDefault(); timeline.toggle(); }
});

/* --- stats ---------------------------------------------------------------- */
let fpsAccum = 0, fpsFrames = 0, fpsShown = 0;
$('s-q').textContent = qualityName;

function updateStats(dt) {
  fpsAccum += dt; fpsFrames++;
  if (fpsAccum >= 0.5) {
    fpsShown = fpsFrames / fpsAccum;
    fpsAccum = 0; fpsFrames = 0;
    const i = stage.stats || { calls: 0, tris: 0 };
    $('s-fps').textContent   = fpsShown.toFixed(0);
    $('s-calls').textContent = i.calls;
    $('s-tris').textContent  = i.tris.toLocaleString();
    $('s-spd').textContent   = rig.mode === MODE.ORBIT
      ? 'orbit' : fmt.speed(rig.speed);
  }
}

/* --- loop ----------------------------------------------------------------- */
let last = performance.now();
let frameN = 0;

/* the rig's adaptive speed keys off whatever the camera is nearest to */
function focusRadius(s) {
  const camR = Math.hypot(stage.origin.x, stage.origin.y, stage.origin.z);
  const coreR = Math.max((s.t >= 0 ? s.R_pns : s.R_core) * KM, 12);
  /* near the core, scale to the core; otherwise to the star */
  return camR < coreR * 400 ? coreR : s.R_star * KM;
}

function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min((now - last) / 1000, 0.1);
  last = now;
  frameN++;

  /* clock -> physics -> snapshot -> gpu */
  const tTarget = clock.advance(dt);
  engine.stepTo(tTarget);
  snap = engine.snapshot();
  profiles.upload(snap);

  /* Swallow guard: if the expanding ejecta overtake a parked orbit camera,
     ease it back out so the explosion is seen, not sat inside of. Flying in
     deliberately (free mode) is untouched — that trip is a feature. */
  if (rig.mode === 'orbit') {
    const R = snap.R_star * KM;
    if (rig.orbitDist < R * 1.12) rig._pushOut = true;          // swallowed
    if (rig._pushOut) {
      const target = R * 2.6;
      rig.orbitDist += (target - rig.orbitDist) * Math.min(dt * 1.4, 1);
      if (rig.orbitDist > target * 0.96) rig._pushOut = false;  // done
    }
  }
  rig.update(dt, focusRadius(snap));
  star.update(dt, snap.t, snap);
  interior.update(dt, snap, star.group.position);
  core.update(dt, snap);
  shock.update(dt, snap);
  ejecta.update(dt, snap);
  score.update(snap, dt);
  lightcurve.push(snap);
  if ((frameN & 3) === 0) lightcurve.draw();   // 15 Hz is plenty for a plot

  /* Exposure kick at bounce, decaying — brightness through the tone mapper,
     never through emissive values. */
  if (snap.phase === 'bounce' && snap.t < 0.004) renderer.exposure = 1.7;
  else renderer.exposure += (1.0 - renderer.exposure) * Math.min(dt * 1.5, 1);

  /* The breakout flash illuminates the circumstellar medium — the wind the
     star spent its last ten thousand years shedding. */
  const csmU = star.csm.material.uniforms;
  csmU.uBoost.value = 1 + Math.min(Math.max(Math.log10(snap.L_em / 1e41), 0), 4) * 0.45;

  /* Inside the photosphere the surface fades to a ghost — an x-ray view;
     otherwise the camera would stare at the inside of an opaque ball. */
  const camR = Math.hypot(stage.origin.x, stage.origin.y, stage.origin.z);
  star.xray = camR < snap.R_star * KM * 0.99;

  hud.update(snap, clock);
  timeline.update();
  annotations.update(snap, dt);
  refs.update(snap);
  cinema.update(dt, snap);

  stage.sync();
  updateStats(dt);
  renderer.render();
}

requestAnimationFrame(frame);

/* Expose for the screenshot harness and for poking at in the console. */
{
  const sub = document.querySelector('#title .sub');
  const desc = document.querySelector('#title .desc');
  if (model.id === 'ccsn40bh') {
    sub.textContent = '40 M☉ stripped supergiant';
    desc.textContent = 'A core so massive the shock never escapes. Final moments before collapse to a black hole.';
  } else if (model.id === 'ia') {
    sub.textContent = 'White dwarf at the Chandrasekhar limit';
    desc.textContent = 'Degenerate carbon about to ignite. No core, no collapse — and no survivor.';
    document.getElementById('begin').textContent = 'IGNITE CARBON FUSION';
  }
}

window.SN = { renderer, stage, rig, star, model, clock, engine, interior, profiles, core, shock, ejecta, score, refs, modals, cinema, THREE };
