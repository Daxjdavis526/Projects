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
import { Score } from './audio/audio.js';
import { Timeline } from './ui/timeline.js';
import { QUALITY, KM } from './config.js';
import * as fmt from './ui/format.js';

const $ = id => document.getElementById(id);

/* --- boot ----------------------------------------------------------------- */
const qualityName = autoQuality();
const quality = QUALITY[qualityName];

const renderer = new Renderer(qualityName);
const stage = new Stage(quality);
const rig = new Rig(stage, renderer.gl.domElement);

renderer.attach(gl => stage.draw(gl), stage.near, stage.camera);
renderer.onResize = (w, h) => stage.resize(w, h);

/* --- progenitor ---------------------------------------------------------- */
const model = MODELS[DEFAULT_MODEL];
const star = new Star(stage, quality, model);
const R_STAR_KM = model.R_star * KM;         // 4.17e8 km

rig.focusOn(0, 0, 0, R_STAR_KM * 5.0);

/* --- physics -------------------------------------------------------------- */
const clock = new SimClock(model);
const engine = new Engine(model, clock);
const hud = new Hud(model);
const timeline = new Timeline(clock, engine, () => { /* seek: engine follows in the loop */ });
let snap = engine.snapshot();

/* --- physics -> GPU bridge + interior view -------------------------------- */
const profiles = new Profiles();
const interior = new Interior(stage, profiles, quality);
const core = new Core(stage);
const shock = new Shock(stage, quality);
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
  /* Jump the story to the last seconds before instability and let it run. */
  clock.seekU(0.128);
  clock.play('narrative');
});

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

  /* clock -> physics -> snapshot -> gpu */
  const tTarget = clock.advance(dt);
  engine.stepTo(tTarget);
  snap = engine.snapshot();
  profiles.upload(snap);

  rig.update(dt, focusRadius(snap));
  star.update(dt, snap.t, snap);
  interior.update(dt, snap, star.group.position);
  core.update(dt, snap);
  shock.update(dt, snap);
  score.update(snap, dt);

  /* Exposure kick at bounce, decaying — brightness through the tone mapper,
     never through emissive values. */
  if (snap.phase === 'bounce' && snap.t < 0.004) renderer.exposure = 1.7;
  else renderer.exposure += (1.0 - renderer.exposure) * Math.min(dt * 1.5, 1);

  /* Inside the photosphere the surface fades to a ghost — an x-ray view;
     otherwise the camera would stare at the inside of an opaque ball. */
  const camR = Math.hypot(stage.origin.x, stage.origin.y, stage.origin.z);
  star.xray = camR < snap.R_star * KM * 0.99;

  hud.update(snap, clock);
  timeline.update();

  stage.sync();
  updateStats(dt);
  renderer.render();
}

requestAnimationFrame(frame);

/* Expose for the screenshot harness and for poking at in the console. */
window.SN = { renderer, stage, rig, star, model, clock, engine, interior, profiles, core, shock, score, THREE };
