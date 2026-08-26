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

/* --- title gate ----------------------------------------------------------- */
$('begin').addEventListener('click', () => {
  $('title').classList.add('gone');
  setTimeout(() => $('title').style.display = 'none', 950);
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

function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min((now - last) / 1000, 0.1);
  last = now;

  rig.update(dt, R_STAR_KM);
  star.update(dt, 0, null);

  stage.sync();
  updateStats(dt);
  renderer.render();
}

requestAnimationFrame(frame);

/* Expose for the screenshot harness and for poking at in the console. */
window.SN = { renderer, stage, rig, star, model, THREE };
