/* =============================================================================
   MAIN — the seam between the model and the screen
   -----------------------------------------------------------------------------
   Everything physical lives behind Engine; everything visual behind Stage,
   BodyViews and FieldView. This file owns exactly three things: the frame
   loop, the DOM, and the mouse. It computes no physics of its own — if a
   number appears on screen, it came out of engine.snapshot() or out of
   relativity.js, never out of a formula written here.
   ========================================================================== */

import * as THREE from 'three';

import { Engine } from './physics/engine.js';
import { Body } from './physics/body.js';
import { PRESETS, PRESET_ORDER } from './physics/presets.js';
import { MATERIALS, G, C } from './physics/constants.js';
import { circularSpeed } from './physics/nbody.js';
import { tidalTensor, tendexFrame, timeDilation } from './physics/relativity.js';

import { Stage } from './render/scene.js';
import { BodyViews } from './render/bodies.js';
import { FieldView, MODES } from './render/field.js';

import * as F from './ui/format.js';
import { EXPLAIN, HELP } from './ui/explain.js';

const $ = (id) => document.getElementById(id);

/* =============================================================================
   STATE
   ========================================================================== */
const S = {
  paused: true,
  mult: 1,                  // multiplier on baseRate
  baseRate: 1,              // simulated years per wall second at 1x
  mode: 'none',
  selected: null,
  presetKey: 'earthMoon',
  follow: false,
  placing: null,            // { pos, vel } while placing a new body
};

const SPEEDS = [1, 10, 100, 1000];
const CHECKPOINTS = 120;

let stage, views, field, engine;
const ring = [];            // rewind checkpoints
let lastSnap = null;

/* =============================================================================
   BOOT
   ========================================================================== */
function boot() {
  stage = new Stage();
  views = new BodyViews(stage);
  field = new FieldView(stage);
  engine = new Engine({ integrator: 'verlet', relativistic: false });

  buildPresetMenu();
  buildSpeedButtons();
  wireModes();
  wireTransport();
  wireModal();
  wirePointer();
  wireKeys();

  loadPreset(S.presetKey);
  setMode('none');

  requestAnimationFrame(frame);
}

/* Frame the camera on the whole system, so a preset is never off screen or
   swallowed by its own scale. */
function frameSystem() {
  let ext = 0, maxR = 0;
  for (const b of engine.bodies) {
    ext = Math.max(ext, Math.hypot(...b.pos) + b.radius);
    maxR = Math.max(maxR, b.radius);
  }
  /* A lone body would otherwise fill the frame: hold at least a few radii
     back so there is space around it for the field to be drawn in. */
  ext = Math.max(ext, maxR * 3.5);
  if (!(ext > 0)) ext = 1;
  const d = ext * 2.6;
  stage.controls.target.set(0, 0, 0);
  stage.camera.position.set(d * 0.35, d * 0.55, d * 0.85);
  stage.camera.near = Math.max(d * 1e-7, 1e-9);
  stage.camera.far = Math.max(d * 1e5, 1e4);
  stage.camera.updateProjectionMatrix();
  stage.controls.minDistance = ext * 1e-4;
  stage.controls.maxDistance = ext * 1e4;
  stage.controls.update();
}

function loadPreset(key) {
  S.presetKey = key;
  S.selected = null;
  S.follow = false;
  stage.follow = null;
  engine.clear();
  for (const b of PRESETS[key].build()) engine.add(b);
  views.clearTrails();
  ring.length = 0;
  S.paused = true;
  pickBaseRate();
  frameSystem();
  refreshBodyList();
  showInspector(null);
  $('t-play').textContent = '▶';
}

/* The natural pace of a system: engine.dt is chosen at roughly 1/320 of the
   shortest dynamical time, so ~320 steps is one tight orbit. One orbit every
   four seconds at 1x makes every preset watchable without the user hunting
   for a speed. */
function pickBaseRate() {
  S.baseRate = engine.bodies.length > 1 ? 80 * engine.dt : 1;
}

/* =============================================================================
   FRAME LOOP
   ========================================================================== */
let prev = performance.now();
let uiAccum = 0;

function frame(now) {
  requestAnimationFrame(frame);
  /* Clamp: a backgrounded tab must not come back and integrate an hour of
     orbit in a single frame. */
  const dt = Math.min((now - prev) / 1000, 0.05);
  prev = now;

  if (!S.paused && engine.bodies.length) {
    engine.advance(dt, S.baseRate * S.mult);
    pushCheckpoint();
  }

  const snap = engine.snapshot();
  lastSnap = snap;

  if (S.follow && S.selected != null) {
    const b = snap.bodies.find(x => x.id === S.selected);
    stage.follow = b ? b.pos : null;
  } else {
    stage.follow = null;
  }

  stage.update(dt);
  views.setSelected(S.selected);
  views.update(snap, { paused: S.paused });
  field.update(snap);
  updatePlacementArrow();
  stage.render();

  uiAccum += dt;
  if (uiAccum > 0.1) { uiAccum = 0; updateUI(snap); }
}

function pushCheckpoint() {
  ring.push(engine.saveState());
  if (ring.length > CHECKPOINTS) ring.shift();
}

/* =============================================================================
   UI — readouts
   ========================================================================== */
function updateUI(snap) {
  const d = snap.diagnostics;

  $('r-n').textContent = snap.bodies.length;
  $('r-integ').textContent = snap.integrator + (snap.relativistic ? ' + 1PN' : '');
  $('r-dt').textContent = F.time(snap.dt);
  $('r-steps').textContent = snap.steps.toLocaleString();
  $('r-E').textContent = snap.bodies.length ? F.sci(d.energy, 3) : '—';
  $('r-Edrift').textContent = snap.bodies.length ? F.sci(d.energyDrift, 2) : '—';
  $('r-L').textContent = snap.bodies.length ? F.sci(Math.hypot(...d.L), 3) : '—';

  $('tclock').textContent = F.time(snap.t);
  $('tsub').textContent = S.paused
    ? 'paused'
    : `${F.time(S.baseRate * S.mult)} / second`;

  updateSelectedReadout(snap);
  updateInspectorDerived(snap);
  updateWarnings(snap);
  updateScaleBar();
}

function updateSelectedReadout(snap) {
  const box = $('sel-readout');
  const b = S.selected == null ? null : snap.bodies.find(x => x.id === S.selected);
  if (!b) { box.style.display = 'none'; return; }
  box.style.display = '';

  const others = fieldBodies(snap);
  $('s-name').textContent = b.name;
  $('s-v').textContent = F.speed(Math.hypot(...b.vel));
  $('s-a').textContent = F.accel(Math.hypot(...b.acc));

  /* Distance to the most massive OTHER body — "primary" in the only sense
     that is unambiguous without assuming a hierarchy. */
  let prim = null;
  for (const o of snap.bodies) {
    if (o.id === b.id) continue;
    if (!prim || o.mass > prim.mass) prim = o;
  }
  $('s-r').textContent = prim
    ? F.dist(Math.hypot(b.pos[0] - prim.pos[0], b.pos[1] - prim.pos[1], b.pos[2] - prim.pos[2]))
    : '—';

  /* Clock rate and tidal stretch AT the body, from every other mass — the
     body's own field is excluded, because an object does not tidally stretch
     itself by its own monopole. */
  const ext = others.filter(o => o.id !== b.id);
  $('s-td').textContent = ext.length ? F.num(timeDilation(ext, b.pos), 9) : '1.000000000';
  if (ext.length) {
    const E = tidalTensor(ext, b.pos);
    const axes = tendexFrame(E);
    $('s-tide').textContent = F.tidal(Math.abs(axes[0].tendicity));
  } else {
    $('s-tide').textContent = '—';
  }
}

/* The shape relativity.js and field.js expect: plain objects carrying the
   derived quantities, with `alive` set. */
function fieldBodies(snap) {
  return snap.bodies.map(b => ({
    id: b.id, pos: b.pos, mass: b.mass, radius: b.radius, spin: b.spin,
    isBlackHole: b.isBlackHole, schwarzschildRadius: b.rs, alive: true,
  }));
}

function updateWarnings(snap) {
  const el = $('warnings');
  const lines = snap.diagnostics.warnings.map(w => w.text);

  for (const f of engine.rocheFlags()) {
    const p = engine.get(f.primary), s = engine.get(f.satellite);
    if (!p || !s) continue;
    lines.push(`${s.name} is inside the fluid Roche limit of ${p.name} ` +
      `(${F.dist(f.d)} < ${F.dist(f.fluid)}) — a real body held together only by ` +
      `gravity would be pulled apart here. This simulator does not break it up.`);
  }

  if (snap.events.length) {
    for (const e of snap.events.slice(-2)) {
      if (e.kind === 'merge') lines.push(e.text ?? 'Two bodies merged.');
    }
  }

  if (!lines.length) { el.style.display = 'none'; return; }
  el.style.display = 'block';
  el.innerHTML = '<h2>Warnings</h2>' +
    lines.map(t => `<div class="warnrow">${t}</div>`).join('');
  document.documentElement.style.setProperty(
    '--readout-h', ($('readout').offsetHeight + 10) + 'px');
}

/* Scale bar: snapped to 1/2/5 per decade so the number is readable rather
   than arbitrary. */
function updateScaleBar() {
  const upp = stage.unitsPerPixel(stage.camDistance);
  const raw = upp * 120;
  const e = Math.floor(Math.log10(raw));
  const m = raw / 10 ** e;
  const snapped = (m >= 5 ? 5 : m >= 2 ? 2 : 1) * 10 ** e;
  $('sb-line').style.width = Math.round(snapped / upp) + 'px';
  $('sb-label').textContent =
    `${F.dist(snapped)}  ·  grid ${F.dist(stage.gridCell)}`;
}

/* =============================================================================
   UI — body list
   ========================================================================== */
function refreshBodyList() {
  const el = $('body-list');
  el.innerHTML = '';
  if (!engine.bodies.length) {
    el.innerHTML = '<div class="note">Empty. Press <b>+ Add</b> and click in the ' +
      'scene to place a mass, then drag to give it a velocity.</div>';
    return;
  }
  for (const b of engine.bodies) {
    const row = document.createElement('div');
    row.className = 'body-row' + (b.id === S.selected ? ' sel' : '');
    row.innerHTML =
      `<span class="swatch" style="background:${b.color ?? '#cccccc'}"></span>` +
      `<span class="nm">${b.name}</span>` +
      `<span class="mass">${F.mass(b.mass)}</span>`;
    row.onclick = () => select(b.id);
    el.appendChild(row);
  }
}

function buildPresetMenu() {
  const sel = $('preset-select');
  sel.innerHTML = PRESET_ORDER
    .map(k => `<option value="${k}">${PRESETS[k].label}</option>`).join('');
  sel.value = S.presetKey;
  sel.onchange = () => loadPreset(sel.value);
  $('btn-add').onclick = () => beginPlacement();
}

/* =============================================================================
   UI — inspector
   ========================================================================== */
let insp = null;   // { el, inputs..., id }

function select(id) {
  S.selected = id;
  refreshBodyList();
  showInspector(id);
}

function showInspector(id) {
  const panel = $('inspector');
  const host = $('insp-body');
  if (id == null || !engine.get(id)) {
    panel.style.display = 'none';
    insp = null;
    return;
  }
  const b = engine.get(id);
  panel.style.display = 'block';

  const matOpts = Object.entries(MATERIALS)
    .map(([k, m]) => `<option value="${k}"${k === b.material ? ' selected' : ''}>${m.label}</option>`)
    .join('');

  host.innerHTML = `
    <div class="field"><label>name</label>
      <input type="text" id="i-name" value="${b.name}"></div>
    <div class="field"><label>material</label>
      <select id="i-mat">${matOpts}</select></div>
    <div class="field"><label>mass · M☉</label>
      <input type="number" id="i-mass" step="any" value="${b.mass}"></div>
    <div class="field"><label>radius · AU</label>
      <input type="number" id="i-rad" step="any" value="${b.radius}"></div>
    <div class="field"><label><input type="checkbox" id="i-lock" checked>
      keep density when mass changes</label></div>
    <div class="field"><label>position · AU</label>
      <div style="display:flex;gap:3px">
        <input type="number" id="i-px" step="any" value="${b.pos[0]}">
        <input type="number" id="i-py" step="any" value="${b.pos[1]}">
        <input type="number" id="i-pz" step="any" value="${b.pos[2]}">
      </div></div>
    <div class="field"><label>velocity · AU/yr</label>
      <div style="display:flex;gap:3px">
        <input type="number" id="i-vx" step="any" value="${b.vel[0]}">
        <input type="number" id="i-vy" step="any" value="${b.vel[1]}">
        <input type="number" id="i-vz" step="any" value="${b.vel[2]}">
      </div></div>
    <div class="field"><label>spin · M☉ AU²/yr</label>
      <div style="display:flex;gap:3px">
        <input type="number" id="i-sx" step="any" value="${b.spin[0]}">
        <input type="number" id="i-sy" step="any" value="${b.spin[1]}">
        <input type="number" id="i-sz" step="any" value="${b.spin[2]}">
      </div></div>
    <div style="display:flex;gap:5px;margin-top:8px">
      <button class="btn sm" id="i-circ" title="circular orbit about the dominant mass">Circularise</button>
      <button class="btn sm" id="i-dup">Duplicate</button>
      <button class="btn sm" id="i-del">Delete</button>
    </div>
    <div class="derived" id="i-derived"></div>
  `;

  insp = { id, host };
  const on = (elId, ev, fn) => { const e = $(elId); if (e) e.addEventListener(ev, fn); };

  on('i-name', 'input', () => { b.name = $('i-name').value; refreshBodyList(); });

  on('i-mat', 'change', () => {
    b.material = $('i-mat').value;
    b.radius = Body.radiusFor(b.mass, b.material);
    $('i-rad').value = b.radius;
    engine.touch();
    refreshBodyList();
  });

  on('i-mass', 'change', () => {
    const rho = b.density;
    const v = parseFloat($('i-mass').value);
    if (!isFinite(v) || v <= 0) return;
    b.mass = v;
    if ($('i-lock').checked) { b.density = rho; $('i-rad').value = b.radius; }
    engine.touch();
    pickBaseRate();
    refreshBodyList();
  });

  on('i-rad', 'change', () => {
    const v = parseFloat($('i-rad').value);
    if (isFinite(v) && v > 0) { b.radius = v; engine.touch(); }
  });

  for (const [k, i] of [['px', 0], ['py', 1], ['pz', 2]]) {
    on('i-' + k, 'change', () => {
      const v = parseFloat($('i-' + k).value);
      if (isFinite(v)) { b.pos[i] = v; views.clearTrails(); engine.touch(); }
    });
  }
  for (const [k, i] of [['vx', 0], ['vy', 1], ['vz', 2]]) {
    on('i-' + k, 'change', () => {
      const v = parseFloat($('i-' + k).value);
      if (isFinite(v)) { b.vel[i] = v; engine.touch(); }
    });
  }
  for (const [k, i] of [['sx', 0], ['sy', 1], ['sz', 2]]) {
    on('i-' + k, 'change', () => {
      const v = parseFloat($('i-' + k).value);
      if (isFinite(v)) b.spin[i] = v;
    });
  }

  on('i-circ', 'click', () => circularise(b));
  on('i-dup', 'click', () => {
    const c = new Body({
      name: b.name + ' copy', material: b.material, color: b.color,
      mass: b.mass, radius: b.radius,
      pos: [b.pos[0] * 1.05 + 1e-3, b.pos[1], b.pos[2]],
      vel: [...b.vel], spin: [...b.spin],
    });
    engine.add(c); pickBaseRate(); refreshBodyList(); select(c.id);
  });
  on('i-del', 'click', () => {
    engine.remove(b.id); pickBaseRate(); S.selected = null;
    refreshBodyList(); showInspector(null);
  });
}

function circularise(b) {
  let prim = null;
  for (const o of engine.bodies) {
    if (o.id === b.id) continue;
    if (!prim || o.mass > prim.mass) prim = o;
  }
  if (!prim) return;
  const r = Math.hypot(b.pos[0] - prim.pos[0], b.pos[1] - prim.pos[1], b.pos[2] - prim.pos[2]);
  if (!(r > 0)) return;
  const phase = Math.atan2(b.pos[2] - prim.pos[2], b.pos[0] - prim.pos[0]);
  engine.placeInOrbit(b, prim, r, { phase });
  views.clearTrails();
  showInspector(b.id);
}

/* The derived block refreshes on the UI tick; the input fields do not, unless
   the simulation is moving them and the user is not typing in them. */
function updateInspectorDerived(snap) {
  if (!insp) return;
  const b = snap.bodies.find(x => x.id === insp.id);
  if (!b) { showInspector(null); return; }
  const view = views.viewOf(b.id);
  const active = document.activeElement;

  const setIf = (id, val) => {
    const e = $(id);
    if (e && e !== active) e.value = val;
  };
  if (!S.paused) {
    setIf('i-px', b.pos[0]); setIf('i-py', b.pos[1]); setIf('i-pz', b.pos[2]);
    setIf('i-vx', b.vel[0]); setIf('i-vy', b.vel[1]); setIf('i-vz', b.vel[2]);
  }

  const rows = [
    ['density', b.isBlackHole ? '—' : F.density(b.densitySI)],
    ['horizon r_s', F.dist(b.rs)],
    ['compactness', F.sci(b.compactness, 2)],
    ['surface dτ/dt', F.num(b.timeDilation, 9)],
    ['escape speed', F.speed(b.vEsc)],
    ['surface gravity', F.accel(b.gSurf)],
    ['spin a*', F.num(b.spinParam, 3)],
  ];
  let html = rows.map(([k, v]) =>
    `<div class="row"><span class="k">${k}</span><span class="v">${v}</span></div>`).join('');

  /* The scale-honesty flag. */
  if (view) {
    html += view.isMarker
      ? `<div class="note" style="margin-top:6px">Drawn as a <b>marker</b>, not to
         scale — its true radius is ${F.dist(b.radius)}, below one pixel at this
         zoom. Zoom in and it becomes a real sphere.</div>`
      : `<div class="note" style="margin-top:6px">Drawn at <b>true radius</b>,
         ${F.dist(b.radius)}.</div>`;
  }
  if (b.violatesBuchdahl && !b.isBlackHole) {
    html += `<div class="warnrow">Above the Buchdahl bound. No static body can
      hold itself up at this compactness; in reality this is already a black hole.</div>`;
  }
  $('i-derived').innerHTML = html;
}

/* =============================================================================
   MODES
   ========================================================================== */
function wireModes() {
  for (const btn of document.querySelectorAll('#modes .btn')) {
    btn.onclick = () => setMode(btn.dataset.mode);
  }
  $('btn-why').onclick = () => openModal(EXPLAIN[S.mode] ?? EXPLAIN.none);
  $('btn-help').onclick = () => openModal(HELP);
}

function setMode(mode) {
  S.mode = mode;
  field.setMode(mode);
  for (const btn of document.querySelectorAll('#modes .btn')) {
    btn.classList.toggle('on', btn.dataset.mode === mode);
  }
  $('mode-note').innerHTML = MODES[mode]?.note ?? '';
}

/* =============================================================================
   TRANSPORT
   ========================================================================== */
function buildSpeedButtons() {
  const host = $('speeds');
  host.innerHTML = SPEEDS
    .map(s => `<button class="btn${s === S.mult ? ' on' : ''}" data-mult="${s}">${s}×</button>`)
    .join('');
  for (const b of host.querySelectorAll('.btn')) {
    b.onclick = () => setMult(parseFloat(b.dataset.mult));
  }
}

function setMult(m) {
  S.mult = m;
  for (const b of $('speeds').querySelectorAll('.btn')) {
    b.classList.toggle('on', parseFloat(b.dataset.mult) === m);
  }
}

function wireTransport() {
  $('t-play').onclick = togglePlay;
  $('t-reset').onclick = () => loadPreset(S.presetKey);
  $('t-fwd').onclick = () => { engine.advance(1 / 60, S.baseRate * S.mult); pushCheckpoint(); };
  $('t-back').onclick = stepBack;
  $('t-relativity').onclick = () => {
    engine.relativistic = !engine.relativistic;
    $('t-relativity').classList.toggle('on', engine.relativistic);
    engine.touch();
  };
}

function togglePlay() {
  S.paused = !S.paused;
  $('t-play').textContent = S.paused ? '▶' : '❙❙';
}

/* Rewind is a checkpoint restore, not a negative timestep: running a
   symplectic integrator backwards is legitimate, but running it backwards
   through a merge is not, and the ring keeps both cases honest. */
function stepBack() {
  const s = ring.pop();
  if (!s) return;
  engine.restoreState(s);
  views.clearTrails();
  refreshBodyList();
}

/* =============================================================================
   MODAL
   ========================================================================== */
function openModal(html) {
  $('modal-body').innerHTML = html;
  $('modal').classList.add('open');
}
function closeModal() { $('modal').classList.remove('open'); }
function wireModal() {
  $('modal-close').onclick = closeModal;
  $('modal').onclick = (e) => { if (e.target.id === 'modal') closeModal(); };
}

/* =============================================================================
   POINTER — selection, and placing a new body
   -----------------------------------------------------------------------------
   Placement is two gestures in one drag: where you press sets the position on
   the reference plane, and how far you drag sets the velocity. The arrow is
   drawn to scale against the circular speed at that radius, so "drag until
   the arrow reaches the primary" is literally a circular orbit.
   ========================================================================== */
const ray = new THREE.Raycaster();
const ndc = new THREE.Vector2();
const PLANE = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
let arrow = null;

function toNdc(ev) {
  ndc.set((ev.clientX / innerWidth) * 2 - 1, -(ev.clientY / innerHeight) * 2 + 1);
  ray.setFromCamera(ndc, stage.camera);
}

function planePoint(ev) {
  toNdc(ev);
  const p = new THREE.Vector3();
  return ray.ray.intersectPlane(PLANE, p) ? p : null;
}

function beginPlacement() {
  S.placing = { stage: 'position', pos: null, vel: [0, 0, 0] };
  $('hint').style.display = '';
  $('hint').textContent = 'Click on the grid to place the mass — Esc to cancel';
}

function endPlacement() {
  S.placing = null;
  $('hint').style.display = 'none';
  stage.controls.enabled = true;
  if (arrow) { stage.scene.remove(arrow); arrow = null; }
}

function wirePointer() {
  const dom = stage.renderer.domElement;

  dom.addEventListener('pointerdown', (ev) => {
    if (ev.button !== 0) return;
    if (S.placing && S.placing.stage === 'position') {
      const p = planePoint(ev);
      if (!p) return;
      S.placing.pos = p;
      S.placing.stage = 'velocity';
      stage.controls.enabled = false;
      $('hint').textContent =
        'Drag out a velocity — release on the spot for a circular orbit';
      return;
    }
    /* plain click: select */
    toNdc(ev);
    const hit = views.pick(ray);
    if (hit != null) select(hit); else { S.selected = null; refreshBodyList(); showInspector(null); }
  });

  dom.addEventListener('pointermove', (ev) => {
    if (S.placing && S.placing.stage === 'velocity') {
      const p = planePoint(ev);
      if (p) S.placing.drag = p;
    }
  });

  dom.addEventListener('pointerup', (ev) => {
    if (!S.placing || S.placing.stage !== 'velocity') return;
    commitPlacement();
  });
}

/* Convert the drag into a velocity and add the body. */
function commitPlacement() {
  const P = S.placing;
  const pos = [P.pos.x, P.pos.y, P.pos.z];

  /* Dominant mass, for both the velocity scale and the circular fallback. */
  let prim = null;
  for (const o of engine.bodies) if (!prim || o.mass > prim.mass) prim = o;

  const b = new Body({
    name: `Body ${engine.bodies.length + 1}`, material: 'rock',
    mass: prim ? Math.max(prim.mass * 1e-6, 1e-9) : 1e-6,
    pos,
  });

  const drag = P.drag;
  const dragLen = drag ? drag.distanceTo(P.pos) : 0;
  const upp = stage.unitsPerPixel(stage.camDistance);

  engine.add(b);
  if (!prim) {
    /* First body in an empty universe: nothing to orbit, so it just sits. */
  } else if (dragLen < upp * 4) {
    const r = Math.hypot(pos[0] - prim.pos[0], pos[1] - prim.pos[1], pos[2] - prim.pos[2]);
    if (r > 0) {
      engine.placeInOrbit(b, prim, r, {
        phase: Math.atan2(pos[2] - prim.pos[2], pos[0] - prim.pos[0]),
      });
    }
  } else {
    const r = Math.hypot(pos[0] - prim.pos[0], pos[1] - prim.pos[1], pos[2] - prim.pos[2]);
    const vScale = r > 0 ? circularSpeed(prim.mass, b.mass, r) / r : 1;
    b.vel = [
      (drag.x - P.pos.x) * vScale,
      (drag.y - P.pos.y) * vScale,
      (drag.z - P.pos.z) * vScale,
    ];
  }

  engine.touch();
  pickBaseRate();
  endPlacement();
  refreshBodyList();
  select(b.id);
}

function updatePlacementArrow() {
  if (!S.placing || S.placing.stage !== 'velocity' || !S.placing.drag) {
    if (arrow) { stage.scene.remove(arrow); arrow = null; }
    return;
  }
  const from = S.placing.pos, to = S.placing.drag;
  const dir = to.clone().sub(from);
  const len = dir.length();
  if (len <= 0) return;
  if (!arrow) {
    arrow = new THREE.ArrowHelper(dir.clone().normalize(), from, len, 0x7fe6c8, len * 0.2, len * 0.1);
    stage.scene.add(arrow);
  } else {
    arrow.position.copy(from);
    arrow.setDirection(dir.clone().normalize());
    arrow.setLength(len, len * 0.2, len * 0.1);
  }
}

/* =============================================================================
   KEYS
   ========================================================================== */
const MODE_KEYS = ['none', 'tendex', 'dilation', 'potential', 'field', 'drag', 'embedding'];

function wireKeys() {
  addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
    switch (e.key) {
      case ' ': e.preventDefault(); togglePlay(); break;
      case 'Escape':
        if ($('modal').classList.contains('open')) closeModal();
        else if (S.placing) endPlacement();
        break;
      case '[': setMult(SPEEDS[Math.max(0, SPEEDS.indexOf(S.mult) - 1)]); break;
      case ']': setMult(SPEEDS[Math.min(SPEEDS.length - 1, SPEEDS.indexOf(S.mult) + 1)]); break;
      case 'f': case 'F':
        S.follow = !S.follow;
        break;
      case 't': case 'T':
        views.showTrails = !views.showTrails;
        break;
      case 'Delete': case 'Backspace':
        if (S.selected != null) {
          engine.remove(S.selected); S.selected = null; pickBaseRate();
          refreshBodyList(); showInspector(null);
        }
        break;
      default:
        if (e.key >= '1' && e.key <= '7') setMode(MODE_KEYS[+e.key - 1]);
    }
  });
}

/* =============================================================================
   GO
   ========================================================================== */
try {
  boot();
} catch (err) {
  const el = $('fatal');
  el.style.display = 'flex';
  el.textContent = 'GEODESIC failed to start\n\n' + (err.stack || err.message);
  throw err;
}
