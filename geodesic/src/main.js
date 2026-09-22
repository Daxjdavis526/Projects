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
import { LatticeView } from './render/lattice.js';
import { Lattice } from './physics/lattice.js';
import { INTEGRATORS } from './physics/integrators.js';

import { q, SMALL, LIGHT } from './ui/device.js';
import * as F from './ui/format.js';
import { EXPLAIN, HELP } from './ui/explain.js';

const $ = (id) => document.getElementById(id);

/* Input fields get eight significant figures, and exponent form once the
   magnitude gets away from you. An Earth mass in solar units is
   0.0000030033996, which is a wall of zeros to read and worse to retype;
   3.0033996e-6 says the same thing and a number input accepts it verbatim.
   This matters most on a phone, where the field is a thumb wide. */
const inp = (v) => {
  if (v === 0) return '0';
  const a = Math.abs(v);
  if (a < 1e-3 || a >= 1e7) {
    return v.toExponential(7).replace(/\.?0+e/, 'e');
  }
  return Number(v.toPrecision(8)).toString();
};

/* =============================================================================
   STATE
   ========================================================================== */
const S = {
  paused: true,
  mult: 1,                  // multiplier on baseRate
  baseRate: 1,              // simulated years per wall second at 1x
  gridRate: 1e-3,           // ditto, but paced by the lattice's tidal time
  gridDt: 1e-6,             // the lattice's own timestep
  mode: 'none',
  selected: null,
  presetKey: 'earthMoon',
  follow: false,
  placing: null,            // { pos, vel } while placing a new body
  gridScope: 'space',       // 'space' fills the view; 'local' is a probe cube
};

const SPEEDS = [1, 10, 100, 1000];
const CHECKPOINTS = 120;

/* The lattice is 2197 markers integrated on the same clock as the bodies, so
   it costs about as much per step as a nine-body system does per thousand.
   Rather than let it silently fall behind or quietly coarsen its timestep —
   either of which would make the volume law a lie — grid mode caps the time
   multiplier and says so. */
/* 13^3 is 2197 markers and 6084 edges. Denser than this and a lattice
   spanning the whole view stops being a fabric and becomes a thicket: you
   are already looking through thirteen layers of line, and what decides
   whether the picture can be read is how many edges cross any given pixel.
   The sense of a fabric comes from filling the view, not from more lines in
   it. A phone gets 11^3. */
const GRID_N = q(11, 13);
const GRID_MAX_MULT = 100;

/* The lattice has its own natural clock, and it is nothing like the orbital
   one. Deformation becomes order-one after about one tidal time,
   1/sqrt(|E|) — which near the Earth is a few minutes and near a stellar
   black hole is microseconds. Running the grid at the orbital rate would
   collapse it in the first frame, so in this mode time is paced by the
   lattice instead, and the grid re-releases itself once it has deformed as
   far as it can while still being readable. */
const GRID_TIDAL_FRACTION = 0.12;   // tidal times per wall second at 1x
const GRID_RELEASE_STRAIN = 0.85;   // re-release once the stretch reaches this
/* A view-filling lattice is readable for about half a tidal time. After that
   the inner markers have crossed each other's paths and the picture is a
   thicket rather than a flow, so it is released again and the brightness is
   faded in and out across the cycle to keep the reset from being a pop. */
const GRID_CYCLE = 0.55;            // in tidal times
const GRID_LANDED_FRACTION = 0.15;

let stage, views, field, engine, lattice, latticeView;
const ring = [];            // rewind checkpoints
let lastSnap = null;

/* =============================================================================
   BOOT
   ========================================================================== */
function boot() {
  stage = new Stage();
  views = new BodyViews(stage);
  field = new FieldView(stage);
  /* Yoshida-4 by default. It is three Verlet steps with the triple-jump
     coefficients: the same one-force-eval-per-substep cost structure, three
     times the work per step, and three to four orders of magnitude less
     energy error at the same step size. On an eccentric orbit that is the
     difference between a drift of 1e-4 and one of 1e-8. */
  engine = new Engine({ integrator: 'yoshida4', relativistic: false });

  lattice = new Lattice(GRID_N);
  latticeView = new LatticeView(stage).attach(lattice);
  latticeView.visible = false;

  buildPresetMenu();
  buildIntegratorMenu();
  buildSpeedButtons();
  wireModes();
  wireTransport();
  wireModal();
  wireGrid();
  wireSheets();
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
  reseedLattice();
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

  const grid = S.mode === 'grid';
  const mult = grid ? Math.min(S.mult, GRID_MAX_MULT) : S.mult;
  const rate = grid ? S.gridRate : S.baseRate;
  if (!S.paused && engine.bodies.length) {
    const adv = engine.advance(dt, rate * mult);
    if (grid) {
      const elapsed = dt * rate * mult;
      const n = Math.min(Math.ceil(elapsed / S.gridDt), 60);
      const h = elapsed / n;
      for (let k = 0; k < n; k++) lattice.step(engine.bodies, h);
      /* Let them go again once the picture stops being readable. What counts
         as unreadable differs by scope: a view-filling lattice is done when a
         good fraction of its markers have landed, while a small probe cube
         never reaches a surface at all and is done when it has simply
         deformed too far. */
      if (lattice.t > 0) {
        const spent = S.gridScope === 'space'
          ? gridCycle() >= 1 ||
            lattice.landedCount() > GRID_LANDED_FRACTION * lattice.count
          : (() => {
              const g = lattice.strainAxes();
              return !(lattice.volumeRatio() > 0.2) ||
                Math.max(Math.abs(g[0] - 1), Math.abs(g[4] - 1), Math.abs(g[8] - 1))
                  > GRID_RELEASE_STRAIN;
            })();
        /* Follow the camera too: the fabric should fill whatever you are
           looking at, not whatever you were looking at when it was released. */
        const zoom = stage.camDistance / (lattice.seedCamDist || stage.camDistance);
        if (spent || zoom > 2.5 || zoom < 0.4) reseedLattice();
      }
    }
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
  if (S.mode === 'grid') {
    latticeView.envelope = S.gridScope === 'space' ? gridEnvelope() : 1;
    /* Paused with nothing moving, last frame's buffers are still correct.
       The camera may have moved, though, and the depth cue depends on it. */
    if (!S.paused || stage.camDistance !== latticeView.lastCamDist) {
      latticeView.update();
      latticeView.lastCamDist = stage.camDistance;
    }
    updateGridInfo();
  }
  views.setSelected(S.selected);
  views.update(snap, { paused: S.paused });
  field.update(snap, S.selected);
  updatePlacementArrow();
  stage.render();

  uiAccum += dt;
  if (uiAccum > 0.1) { uiAccum = 0; updateUI(snap); }

  /* We are up. From here the failure panel stands down — see index.html. */
  window.__geodesicRunning = true;
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
  if ($('r-integ').value !== snap.integrator) $('r-integ').value = snap.integrator;
  $('r-dt').textContent = F.time(snap.dt);
  $('r-steps').textContent = snap.steps.toLocaleString();
  $('r-E').textContent = snap.bodies.length ? F.sci(d.energy, 3) : '—';
  $('r-Edrift').textContent = snap.bodies.length ? F.sci(d.energyDrift, 2) : '—';
  $('r-L').textContent = snap.bodies.length ? F.sci(Math.hypot(...d.L), 3) : '—';

  $('tclock').textContent = F.time(snap.t);
  $('tsub').textContent = S.paused
    ? 'paused'
    : `${F.time((S.mode === 'grid' ? S.gridRate : S.baseRate) *
                 (S.mode === 'grid' ? Math.min(S.mult, GRID_MAX_MULT) : S.mult))} / second`;

  refreshModeNote();
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

  for (const e of snap.events.slice(-2)) {
    if (!e.kind?.startsWith('merge')) continue;
    lines.push(`${e.text} (at t = ${F.time(e.at ?? snap.t)})`);
  }

  if (!lines.length) {
    document.body.classList.remove('has-warn');
    el.style.display = 'none';
    return;
  }
  document.body.classList.add('has-warn');
  el.style.display = SMALL ? '' : 'block';
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
    document.body.classList.remove('has-sel');
    panel.style.display = 'none';
    insp = null;
    if (document.body.dataset.sheet === 'inspector') closeSheet();
    syncTabs();
    return;
  }
  const b = engine.get(id);
  document.body.classList.add('has-sel');
  panel.style.display = SMALL ? '' : 'block';
  syncTabs();

  const matOpts = Object.entries(MATERIALS)
    .map(([k, m]) => `<option value="${k}"${k === b.material ? ' selected' : ''}>${m.label}</option>`)
    .join('');

  host.innerHTML = `
    <div class="field"><label>name</label>
      <input type="text" id="i-name" value="${b.name}"></div>
    <div class="field"><label>material</label>
      <select id="i-mat">${matOpts}</select></div>
    <div class="field"><label>mass · M☉</label>
      <input type="number" id="i-mass" step="any" value="${inp(b.mass)}"></div>
    <div class="field"><label>radius · AU</label>
      <input type="number" id="i-rad" step="any" value="${inp(b.radius)}"></div>
    <div class="field"><label><input type="checkbox" id="i-lock" checked>
      keep density when mass changes</label></div>
    <div class="field"><label>position · AU</label>
      <div style="display:flex;gap:3px">
        <input type="number" id="i-px" step="any" value="${inp(b.pos[0])}">
        <input type="number" id="i-py" step="any" value="${inp(b.pos[1])}">
        <input type="number" id="i-pz" step="any" value="${inp(b.pos[2])}">
      </div></div>
    <div class="field"><label>velocity · AU/yr</label>
      <div style="display:flex;gap:3px">
        <input type="number" id="i-vx" step="any" value="${inp(b.vel[0])}">
        <input type="number" id="i-vy" step="any" value="${inp(b.vel[1])}">
        <input type="number" id="i-vz" step="any" value="${inp(b.vel[2])}">
      </div></div>
    <div class="field"><label>spin · M☉ AU²/yr</label>
      <div style="display:flex;gap:3px">
        <input type="number" id="i-sx" step="any" value="${inp(b.spin[0])}">
        <input type="number" id="i-sy" step="any" value="${inp(b.spin[1])}">
        <input type="number" id="i-sz" step="any" value="${inp(b.spin[2])}">
      </div></div>
    <div style="display:flex;gap:5px;margin-top:8px;flex-wrap:wrap">
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
    $('i-rad').value = inp(b.radius);
    engine.touch();
    refreshBodyList();
  });

  on('i-mass', 'change', () => {
    const rho = b.density;
    const v = parseFloat($('i-mass').value);
    if (!isFinite(v) || v <= 0) return;
    b.mass = v;
    if ($('i-lock').checked) { b.density = rho; $('i-rad').value = inp(b.radius); }
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
    if (e && e !== active) e.value = inp(val);
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
  const entering = mode === 'grid' && S.mode !== 'grid';
  S.mode = mode;
  field.setMode(mode);
  latticeView.visible = mode === 'grid';
  $('grid-controls').style.display = mode === 'grid' ? 'flex' : 'none';
  syncTabs();
  if (entering) reseedLattice();
  for (const btn of document.querySelectorAll('#modes .btn')) {
    btn.classList.toggle('on', btn.dataset.mode === mode);
  }
  $('mode-note').innerHTML = MODES[mode]?.note ?? '';
  noteBase = MODES[mode]?.note ?? '';
}

/* Modes that compute numbers append them under the static note. */
let noteBase = '';
function refreshModeNote() {
  const extra = field.info
    ? `<div style="margin-top:6px;color:var(--ink)">${field.info}</div>` : '';
  const html = noteBase + extra;
  if (html !== $('mode-note')._last) {
    $('mode-note').innerHTML = html;
    $('mode-note')._last = html;
  }
}

/* =============================================================================
   PHONE CHROME — bottom sheets and the tab bar
   -----------------------------------------------------------------------------
   On a wide screen every panel is on screen at once and none of this runs:
   the tab bar is display:none and the sheet state is simply never set. On a
   narrow one the same panels become bottom sheets, one at a time, because
   five of them side by side on a 390px display is what the layout was doing
   before and it was unusable.

   The state lives in a single data attribute on <body>, which the stylesheet
   reads. Nothing is moved in the DOM — every panel keeps its listeners and
   its identity, and the desktop layout is one media query away at all times.
   ========================================================================== */

function openSheet(name) {
  if (document.body.dataset.sheet === name) return closeSheet();
  document.body.dataset.sheet = name;
  syncTabs();
}

function closeSheet() {
  delete document.body.dataset.sheet;
  syncTabs();
}

function syncTabs() {
  const open = document.body.dataset.sheet;
  for (const b of document.querySelectorAll('#tabbar button[data-sheet]')) {
    b.classList.toggle('on', b.dataset.sheet === open);
    /* Nothing is selected, so there is nothing to edit. Saying so with a
       disabled tab beats opening an empty sheet. */
    if (b.dataset.sheet === 'inspector') {
      b.disabled = !document.body.classList.contains('has-sel');
    }
  }
}

function wireSheets() {
  for (const b of document.querySelectorAll('#tabbar button[data-sheet]')) {
    b.onclick = () => openSheet(b.dataset.sheet);
  }
  $('tab-help').onclick = () => { closeSheet(); openModal(HELP); };

  /* The top strip is truncated to three lines on a phone. Tapping it opens
     the full explainer for whatever mode is running, which is the same thing
     the "Why is it doing this?" button does on a desktop. */
  $('mode-note').onclick = () => {
    if (!SMALL) return;
    openModal(EXPLAIN[S.mode] ?? EXPLAIN.none);
  };

  /* One button instead of four: a phone has no room for a row of speeds. */
  $('speed-cycle').onclick = () => {
    setMult(SPEEDS[(SPEEDS.indexOf(S.mult) + 1) % SPEEDS.length]);
  };

  /* Choosing a view should show you the view, not leave you staring at the
     sheet you chose it from. */
  for (const btn of document.querySelectorAll('#modes .btn')) {
    btn.addEventListener('click', () => { if (SMALL) closeSheet(); });
  }
  $('preset-select').addEventListener('change', () => { if (SMALL) closeSheet(); });

  syncTabs();
}

/* =============================================================================
   THE 3D GRID
   ========================================================================== */

/* Release a fresh cube of markers from rest, sized and centred on what the
   camera is looking at. Rest is a declared choice: it means everything that
   happens afterwards is the field acting, with none of our own motion mixed
   in. */
function reseedLattice() {
  const t = stage.controls.target;
  const centre = [t.x, t.y, t.z];
  const space = S.gridScope === 'space';

  /* SPACE fills the view. The masses sit inside the lattice, so the markers
     nearest them visibly pour in while the distant ones barely stir — which
     is what a field that exists everywhere and falls off with distance
     actually looks like.

     LOCAL is a small cube placed beside the dominant mass. It exists because
     the two checkable numbers — the 2 : 1 stretch-to-squeeze ratio and volume
     conservation in vacuum — are local statements, and a lattice spanning the
     whole screen is the opposite of local. */
  /* Half a camera distance puts the box's silhouette just past the edges of
     the frame without swallowing the camera itself — any larger and the near
     face is close enough that perspective turns it into a tunnel. */
  let hw = stage.camDistance * (space ? 0.5 : 0.12);

  if (!space) {
    let host = null;
    for (const b of engine.bodies) if (!host || b.mass > host.mass) host = b;
    if (host) {
      const d = Math.hypot(
        centre[0] - host.pos[0], centre[1] - host.pos[1], centre[2] - host.pos[2]);
      if (d < hw * 2.6) {
        const cam = stage.camera.matrixWorld.elements;
        const right = [cam[0], cam[1], cam[2]];
        const rn = Math.hypot(...right) || 1;
        for (let i = 0; i < 3; i++) centre[i] = host.pos[i] + right[i] / rn * hw * 4;
      }
    }
  }

  lattice.seed(centre, hw, engine.bodies);
  lattice._probe = null;
  lattice.seedCamDist = stage.camDistance;

  /* The step follows the TYPICAL field across the lattice, not the fiercest.

     The fiercest is a marker skimming the surface of the dominant body, where
     the tidal timescale is five orders of magnitude shorter than it is out at
     the edges. Resolving that everywhere means thousands of substeps a frame
     for a lattice this size — 1.7 million field evaluations, which is exactly
     what it cost before this was noticed.

     What makes the cheap step safe is the landing clamp. A marker stepped too
     coarsely near a surface would overshoot into the body; instead it is
     caught and parked on the surface, which is where it was going anyway. It
     arrives a little early, and that is the whole of the error. Markers out
     in the weak field, where the timing actually shows, are resolved to
     better than a three-hundredth of their own timescale. */
  const bodies = engine.bodies.map(b => ({
    pos: b.pos, mass: b.mass, radius: b.radius,
    isBlackHole: b.isBlackHole, schwarzschildRadius: b.schwarzschildRadius,
    alive: true,
  }));

  const samples = [];
  if (bodies.length) {
    const E = new Float64Array(9);
    const at = (p) => {
      tidalTensor(bodies, p, E);
      samples.push(Math.abs(tendexFrame(E)[0].tendicity));
    };
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        for (let k = -1; k <= 1; k++) {
          at([centre[0] + i * hw * 0.8, centre[1] + j * hw * 0.8, centre[2] + k * hw * 0.8]);
        }
      }
    }
  }
  samples.sort((a, b) => a - b);
  /* Median, not maximum. One sample can sit deep inside a body — the
     Earth-Moon barycentre is 1700 km below the Earth's surface, so the centre
     sample routinely does — where the field is five orders of magnitude
     stronger than anywhere else in the box. */
  const lamTypical = samples.length ? samples[samples.length >> 1] : 0;

  const tTypical = lamTypical > 0 ? 1 / Math.sqrt(lamTypical) : 1;

  lattice.tTidal = tTypical;                    // what the probe is latched against
  S.gridRate = GRID_TIDAL_FRACTION * tTypical;
  S.gridDt = tTypical / 300;

  latticeView.update();
}

/* Where we are in the release cycle, 0 at release and 1 when it is spent. */
function gridCycle() {
  const span = GRID_CYCLE * (lattice.tTidal || 1);
  return span > 0 ? lattice.t / span : 0;
}

/* Fade in off the release and out before the reset, so the cycle reads as a
   pulse of infall rather than a flicker. */
function gridEnvelope() {
  const c = Math.min(1, Math.max(0, gridCycle()));
  const up = smoothstep(0, 0.14, c);
  const down = 1 - smoothstep(0.78, 1, c);
  return up * down;
}

function smoothstep(a, b, x) {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

function wireGrid() {
  const syncGrid = () => {
    $('g-space').classList.toggle('on', S.gridScope === 'space');
    $('g-local').classList.toggle('on', S.gridScope === 'local');
    $('g-frame').textContent = latticeView.frame === 'tidal' ? 'Tidal' : 'Infall';
    $('g-frame').title = latticeView.frame === 'tidal'
      ? 'drawn in the lattice\u2019s own falling frame \u2014 tap for raw positions'
      : 'drawn where the markers actually go \u2014 tap for the falling frame';
    /* In the space scope the lattice surrounds the masses, so its centroid
       barely moves and subtracting it changes almost nothing. The toggle is
       left enabled rather than hidden — it is still telling the truth, it
       just has little to subtract. */
    $('g-frame').classList.toggle('on', latticeView.frame === 'tidal');
  };
  $('g-space').onclick = () => { S.gridScope = 'space'; reseedLattice(); syncGrid(); };
  $('g-local').onclick = () => { S.gridScope = 'local'; reseedLattice(); syncGrid(); };
  $('g-frame').onclick = () => {
    latticeView.frame = latticeView.frame === 'tidal' ? 'infall' : 'tidal';
    latticeView.update(); syncGrid();
  };
  $('g-reset').onclick = () => reseedLattice();
  latticeView.frame = 'infall';      // the space scope wants raw positions
  syncGrid();
}

/* The numbers that make the mode checkable rather than merely pretty.

   Two claims, reported differently because they can be measured to
   differently well:

     - THE SHAPE is crisp. Stretch along the line to the mass, squeeze across
       it, in the ratio 2 : 1 because E_ij is trace-free. It comes out around
       1.9 : 1 for the cube this mode draws, and the shortfall is the cube's
       own size — it is a fifth of its distance from the mass, so the field is
       not quite uniform across it.

     - THE VOLUME is exact only in the limit of a small cube over a short
       time. Where a mass is enclosed the effect is large and the measurement
       is meaningful, so it is quoted against Gauss. In vacuum the true answer
       is zero and what is measured is the finite-cube residual, so it is
       quoted as a fraction of the tidal scale and named for what it is
       rather than dressed up as a precision result. The sharp version of the
       vacuum claim lives in test/physics.test.mjs, where the cube can be made
       as small as the argument needs.
*/
function updateGridInfo() {
  const { rho, enclosedMass, d2VoverV } =
    Lattice.predictedVolumeAcceleration(engine.bodies, lattice.centre, lattice.halfWidth);
  const t = lattice.t;
  const space = S.gridScope === 'space';

  let s = `${F.time(t)} since release · `;

  if (space) {
    /* A lattice that surrounds the masses is not a local probe, and quoting a
       2 : 1 ratio off a linear fit spanning the whole screen would be
       inventing a precision the geometry cannot carry. What IS meaningful at
       this size is how much of the fabric has fallen in, and Gauss, because
       the enclosed mass is a real number rather than a rounding residual. */
    const landed = lattice.landedCount();
    const free = lattice.freeCount();
    s += `<b>${landed.toLocaleString()}</b> of ` +
         `${(lattice.count - lattice.buriedCount).toLocaleString()} markers have ` +
         `reached a surface, ${free.toLocaleString()} still falling`;
    if (enclosedMass > 0) {
      s += ` · <b>${F.mass(enclosedMass)}</b> enclosed, ⟨ρ⟩ = ${fmtRho(rho)}, so the ` +
           `volume inside is collapsing at −4πG⟨ρ⟩ = <b>${d2VoverV.toExponential(3)}</b> /yr²`;
    } else {
      s += ` · nothing enclosed, so nothing is falling anywhere`;
    }
    s += ` · <span class="warn">the markers are massless and do not pull on ` +
         `each other</span>`;
  } else {
    const V = lattice.cellVolumeRatio();
    if (lattice._probe == null && t >= 0.02 * (lattice.tTidal ?? Infinity)) {
      lattice._probe = 2 * (V - 1) / (t * t);
    }
    const measured = lattice._probe;
    const tidalScale = lattice.tTidal ? 1 / lattice.tTidal ** 2 : 0;

    const grad = lattice.strainAxes();
    const d = [grad[0] - 1, grad[4] - 1, grad[8] - 1].sort((a, b) => b - a);
    const squeeze = -(d[1] + d[2]) / 2;

    s += `centre cell at <b>${(V * 100).toFixed(3)}%</b> of its released volume · `;
    if (squeeze > 1e-12) {
      s += `stretch : squeeze = <b>${(d[0] / squeeze).toFixed(2)} : 1</b> ` +
           `(2 : 1 exactly, for a cube small enough) · `;
    }
    if (rho > 0 && measured != null) {
      s += `<b>${F.mass(enclosedMass)}</b> enclosed, ⟨ρ⟩ = ${fmtRho(rho)}, so Gauss ` +
           `gives d²V/V = <b>${d2VoverV.toExponential(3)}</b> /yr² — measured ` +
           `<b>${measured.toExponential(3)}</b>`;
    } else if (measured != null) {
      const rel = tidalScale > 0 ? Math.abs(measured) / tidalScale : 0;
      s += `nothing enclosed, so the volume is conserved. What is left is ` +
           `${(rel * 100).toFixed(1)}% of the tidal scale that is visibly ` +
           `deforming the cube, and it is the cube's own width, not matter`;
    } else {
      s += 'releasing…';
    }
  }

  if (S.mult > GRID_MAX_MULT) {
    s += ` · <span class="warn">time capped at ${GRID_MAX_MULT}× here, so the ` +
         `markers stay as accurately integrated as the bodies</span>`;
  }
  field.info = s;
}

function fmtRho(rhoInternal) {
  return F.density(rhoInternal * 1.98847e30 / (1.495978707e11 ** 3));
}

/* =============================================================================
   TRANSPORT
   ========================================================================== */
/* The integrator is selectable because comparing them is part of the point.
   RK4 is in the list precisely so you can watch a fourth-order method that is
   not symplectic lose energy while a second-order one that is does not. */
function buildIntegratorMenu() {
  const sel = $('r-integ');
  sel.innerHTML = Object.entries(INTEGRATORS).map(([k, v]) =>
    `<option value="${k}">${v.label ?? k}${v.symplectic ? '' : ' (drifts)'}</option>`).join('');
  sel.value = engine.integrator;
  sel.onchange = () => { engine.integrator = sel.value; engine.touch(); };
}

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
  $('speed-cycle').textContent = `${m}×`;
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
  /* A class, not an inline style. `#hint` is display:none in the stylesheet,
     so clearing an inline display just falls back to that and the hint never
     appears — which is exactly what it did until this was noticed. */
  document.body.classList.add('placing');
  $('hint').textContent = SMALL
    ? 'Tap the grid to place a mass, then drag to launch it'
    : 'Click on the grid to place the mass — Esc to cancel';
  if (SMALL) closeSheet();          // you cannot aim at a scene you cannot see
}

function endPlacement() {
  S.placing = null;
  document.body.classList.remove('placing');
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
      $('hint').textContent = SMALL
        ? 'Drag to set its velocity — release here for a circular orbit'
        : 'Drag out a velocity — release on the spot for a circular orbit';
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
const MODE_KEYS = ['none', 'tendex', 'dilation', 'potential', 'field', 'drag',
                   'grid', 'geodesic', 'waves', 'embedding'];

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
      case 'd': case 'D': {
        const b = S.selected != null ? engine.get(S.selected) : null;
        if (b) $('i-dup')?.click();
        break;
      }
      case 'Delete': case 'Backspace':
        if (S.selected != null) {
          engine.remove(S.selected); S.selected = null; pickBaseRate();
          refreshBodyList(); showInspector(null);
        }
        break;
      default:
        if (e.key >= '1' && e.key <= '9') setMode(MODE_KEYS[+e.key - 1]);
        else if (e.key === '0') setMode(MODE_KEYS[9]);
        else if ((e.key === 'r' || e.key === 'R') && S.mode === 'grid') reseedLattice();
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
