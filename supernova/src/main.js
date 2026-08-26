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
import { QUALITY, R_SUN, KM } from './config.js';
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

/* --- placeholder progenitor ----------------------------------------------
   S1 only: a smooth emissive sphere at the true radius of a 600 R☉ red
   supergiant. It exists to prove the composer chain — if ACES and bloom are
   working, this reads as a glowing body with a soft falloff rather than a flat
   disc of clipped colour. S2 replaces it with the real photosphere shader.  */
const R_STAR_KM = 600 * R_SUN * KM;         // 4.17e8 km

const star = new THREE.Mesh(
  new THREE.SphereGeometry(R_STAR_KM, 96, 48),
  new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 0.72, 0.26) }),
);
stage.near.add(star);

/* A wide, faint halo so the star has some presence beyond its limb. */
const halo = new THREE.Mesh(
  new THREE.SphereGeometry(R_STAR_KM * 1.32, 48, 24),
  new THREE.ShaderMaterial({
    transparent: true, blending: THREE.AdditiveBlending,
    depthWrite: false, side: THREE.BackSide,
    vertexShader: `varying vec3 vN; varying vec3 vP;
      void main(){ vN = normalize(normalMatrix * normal);
        vec4 mv = modelViewMatrix * vec4(position,1.0);
        vP = mv.xyz; gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `varying vec3 vN; varying vec3 vP;
      void main(){
        float f = pow(1.0 - abs(dot(normalize(vN), normalize(-vP))), 1.7);
        gl_FragColor = vec4(vec3(1.0, 0.40, 0.15) * f * 0.85, f * 0.85); }`,
  }),
);
stage.near.add(halo);

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

  /* floating origin: shift the world so the camera sits at (0,0,0) */
  star.position.set(-stage.origin.x, -stage.origin.y, -stage.origin.z);
  halo.position.copy(star.position);

  stage.sync();
  updateStats(dt);
  renderer.render();
}

requestAnimationFrame(frame);

/* Expose for the screenshot harness and for poking at in the console. */
window.SN = { renderer, stage, rig, THREE };
