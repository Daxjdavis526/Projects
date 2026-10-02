/* The test cell in 3D: the stand's cameras.

   Everything it shows is drawn from cellState (sim/visual.js) — the true
   state of the model as a camera would see it — so the plume is the engine
   that is running: its chamber pressure, its mixture ratio, its expansion,
   its instabilities. Five views: the cell camera on the roof, a close-up,
   a camera downrange looking back up the plume, the bunker's long lens
   (sound arrives late out there), and a free camera. The panel can expand
   into the FIRE VIEW, which fills the screen and carries the countdown,
   the readouts that matter and the ABORT button.

   Loaded only when first opened: three.js is not fetched until someone
   looks at the cell. */
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { h, setText } from '../dom.js';
import { store } from '../store.js';
import { fmt, fmtT, fmtClock, unitLabel } from '../../lib/units.js';
import { cellState, CellEvents } from '../../sim/visual.js';
import { Environment } from './environment.js';
import { buildStand } from './stands.js';
import { Plume } from './plume.js';
import { Particles } from './particles.js';

const CCTV = {
  uniforms: { tDiffuse: { value: null }, uTime: { value: 0 }, uAmt: { value: 1 }, uFlash: { value: 0 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
  fragmentShader: /* glsl */`
    uniform sampler2D tDiffuse; uniform float uTime, uAmt, uFlash; varying vec2 vUv;
    float rnd(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233)) + uTime * 61.7) * 43758.5453); }
    void main(){
      vec2 uv = vUv;
      vec2 d = uv - 0.5;
      // a little chromatic fringe toward the edges, a vignette, sensor noise
      float ca = 0.0012 * uAmt * dot(d, d) * 4.0;
      vec3 c = vec3(texture2D(tDiffuse, uv + d * ca).r, texture2D(tDiffuse, uv).g, texture2D(tDiffuse, uv - d * ca).b);
      float lum = dot(c, vec3(0.299, 0.587, 0.114));
      c = mix(c, vec3(lum), 0.12 * uAmt);
      c *= 1.0 - uAmt * 0.55 * pow(length(d) * 1.25, 2.4);
      c += (rnd(uv * 731.0) - 0.5) * 0.045 * uAmt;
      c += uFlash;
      gl_FragColor = vec4(c, 1.0);
    }`,
};

const HUD_CH = { coldgas: ['PT-401', 'LC-501'], biprop: ['PT-801', 'LC-901', 'FT-714', 'FT-724'], turbopump: ['SPD', 'PT-414', 'PT-424', 'VIB-345'] };

export class CellView {
  constructor(host, app) {
    this.app = app; this.host = host;
    this.el = h('div.cell3d');
    host.append(this.el);
    this.full = false; this.autoFull = false;
    this.camIx = 0;
    this.shake = 0; this.flash = 0;
    this.exposure = 1;
    this.events = new CellEvents();
    this.last = performance.now();
    try { this.init(); } catch (e) {
      console.error(e);
      this.el.append(h('div.cell3d-err', 'The 3D cell needs WebGL, which this browser did not provide. The 2D CCTV view still works.'));
      this.failed = true;
    }
  }
  get S() { return this.app.session; }

  init() {
    const S = this.S;
    const r = this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap;
    r.toneMapping = THREE.ACESFilmicToneMapping;
    r.outputColorSpace = THREE.SRGBColorSpace;
    this.el.append(r.domElement);
    const scene = this.scene = new THREE.Scene();
    this.env = new Environment();
    scene.add(this.env.group);
    scene.fog = this.env.fog;
    this.stand = buildStand(S.def);
    scene.add(this.stand.group);
    this.plume = new Plume();
    const ex = this.exhaust = new THREE.Group();
    ex.position.copy(this.stand.exit);
    ex.add(this.plume.mesh, this.plume.light);
    scene.add(ex);
    this.parts = new Particles({ count: 4000 });
    scene.add(this.parts.group);
    this.flashLight = new THREE.PointLight(0xffcc88, 0, 30, 2);
    this.flashLight.position.copy(this.stand.exit).add(new THREE.Vector3(0.3, 0, 0));
    scene.add(this.flashLight);
    // cameras
    this.camera = new THREE.PerspectiveCamera(50, 16 / 9, 0.01, 2500);
    this.cams = this._presets();
    this.controls = new OrbitControls(this.camera, r.domElement);
    this.controls.enabled = false; this.controls.enableDamping = true;
    this.controls.minDistance = 0.1; this.controls.maxDistance = 120; this.controls.maxPolarAngle = Math.PI * 0.495;
    this.setCam(0);
    // post
    const comp = this.composer = new EffectComposer(r);
    comp.addPass(new RenderPass(scene, this.camera));
    this.bloom = new UnrealBloomPass(new THREE.Vector2(512, 512), 0.4, 0.3, 0.95);
    comp.addPass(this.bloom);
    comp.addPass(new OutputPass());
    this.cctv = new ShaderPass(CCTV);
    comp.addPass(this.cctv);
    // HUD
    this.buildHud();
    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(this.el);
    this.resize();
    // keyboard: camera numbers, F for the fire view, Esc to leave it
    this.onKey = e => {
      if (!this.visible || e.target.closest?.('input,textarea,select')) return;
      if (e.key >= '1' && e.key <= '5') { this.setCam(+e.key - 1); this.autoFull = false; }
      else if (e.key === 'f' || e.key === 'F') this.toggleFull();
      else if (e.key === 'Escape' && this.full) this.toggleFull(false);
    };
    window.addEventListener('keydown', this.onKey);
  }

  _presets() {
    const E = this.stand.exit, k = this.stand.kind;
    const V = (x, y, z) => new THREE.Vector3(x, y, z);
    const near = k === 'coldgas' ? 0.38 : k === 'turbopump' ? 1.9 : 1.35;
    const list = [
      { id: 'CAM 1', name: 'CELL', pos: V(-3.25, 3.3, 3.55), tgt: V(E.x - 0.2, 0.85, -0.6), fov: k === 'coldgas' ? 34 : 46, mic: 'camera' },
      k === 'turbopump'
        ? { id: 'CAM 2', name: 'TPA-1', pos: V(0.1, 1.45, 1.55), tgt: V(-0.1, 0.95, -0.4), fov: 40, mic: 'camera' }
        : { id: 'CAM 2', name: 'NOZZLE', pos: V(E.x + near * 0.25, E.y + near * 0.06, near), tgt: V(E.x + near * 0.4, E.y, 0), fov: k === 'coldgas' ? 30 : 40, mic: 'camera' },
      k === 'turbopump'
        ? { id: 'CAM 3', name: 'CATCH TANK', pos: V(5.0, 2.6, 4.8), tgt: V(1.4, 1.0, 0.2), fov: 40, mic: 'camera' }
        : { id: 'CAM 3', name: 'DOWNRANGE', pos: V(E.x + (k === 'coldgas' ? 2.2 : 4.5), E.y + 0.3, k === 'coldgas' ? 0.5 : 1.0), tgt: V(E.x - 0.05, E.y, 0), fov: k === 'coldgas' ? 7 : 20, mic: 'camera' },
      { id: 'CAM 4', name: 'BUNKER', pos: V(-25, 2.2, 39.2), tgt: V(E.x + 0.6, 1.2, 0), fov: 9, mic: 'far', dist: 48 },
      { id: 'FREE', name: 'ORBIT', pos: V(E.x + 2.2, 1.9, 3.2), tgt: V(E.x, E.y, 0), fov: 45, mic: 'camera', free: true },
    ];
    return list;
  }

  setCam(i) {
    this.camIx = i;
    const c = this.cams[i];
    this.camera.position.copy(c.pos); this.camera.fov = c.fov; this.camera.updateProjectionMatrix();
    if (this.composer) this.resize();
    this.camera.lookAt(c.tgt);
    if (this.controls) {
      this.controls.enabled = !!c.free;
      if (c.free) { this.controls.target.copy(c.tgt); this.controls.update(); }
    }
    this.app.audio?.setListener?.(this.visible ? c.mic : 'bunker', c.dist || 0);
    for (const b of this.camBtns || []) b.classList.toggle('on', +b.dataset.i === i);
  }

  buildHud() {
    const hud = this.hud = h('div.cell-hud');
    this.capEl = h('div.cell-cap');
    this.clockEl = h('div.cell-clock');
    this.stateEl = h('div.cell-state');
    this.readEl = h('div.cell-read');
    const chans = (HUD_CH[this.stand.kind] || []).filter(id => this.S.daq.channel(id));
    this.reads = chans.map(id => {
      const ch = this.S.daq.channel(id);
      const v = h('b'), u = h('i', unitLabel(ch.quantity, ch.gauge));
      this.readEl.append(h('span', h('em', id), v, u));
      return { id, ch, v };
    });
    this.camBtns = this.cams.map((c, i) => h('button', { dataset: { i }, title: `${c.id} · ${c.name} (key ${i + 1})`, onclick: () => { this.setCam(i); this.autoFull = false; } }, c.id === 'FREE' ? 'FREE' : c.id.replace('CAM ', '')));
    this.fullBtn = h('button.cell-full', { title: 'Fire view (F)', onclick: () => { this.autoFull = false; this.toggleFull(); } }, '⛶');
    const bar = h('div.cell-bar', ...this.camBtns, this.fullBtn);
    // the abort: a guarded button, as on the console
    this.abortCover = h('button.cell-cover', { onclick: () => this.abortWrap.classList.add('open'), title: 'Lift the cover' }, 'ABORT ▲');
    this.abortGo = h('button.cell-abort', { onclick: () => { this.S.execute('abort', { reason: 'Manual abort by test conductor (fire view)' }); this.abortWrap.classList.remove('open'); } }, 'ABORT');
    this.abortWrap = h('div.cell-abortwrap', this.abortCover, this.abortGo);
    this.closeBtn = h('button.cell-close', { onclick: () => { this.autoFull = false; this.toggleFull(false); } }, '✕ CONSOLE');
    // replay of the last run off the cell's tape, at speed or slowed down
    const play = (lbl, sp, title) => h('button', { title, onclick: () => this.startReplay(sp) }, lbl);
    this.repPlay = h('span.rp', h('em', 'REPLAY'), play('1×', 1, 'Replay the last run'), play('¼×', 0.25, 'Replay at quarter speed'), play('⅒×', 0.1, 'High-speed camera: one tenth speed'), play('1/50×', 0.02, 'One fiftieth: the ignition transient'));
    this.repStop = h('button', { onclick: () => this.stopReplay(), title: 'Back to live' }, '■ LIVE');
    this.repInfo = h('em.rinfo');
    this.repBar = h('div.cell-rep', this.repPlay, this.repInfo, this.repStop);
    hud.append(this.capEl, this.clockEl, this.stateEl, this.readEl, bar, this.abortWrap, this.closeBtn, this.repBar);
    this.el.append(hud);
  }

  toggleFull(on = !this.full) {
    if (this.failed) return;
    this.full = on;
    if (on) {
      this.home = this.el.parentNode;
      this.overlay = this.overlay || h('div.fireview');
      document.body.append(this.overlay);
      this.overlay.append(this.el);
    } else if (this.home) {
      this.home.append(this.el);
      this.overlay?.remove();
    }
    this.el.classList.toggle('full', on);
    this.visible = true;
    this.setCam(this.camIx);
    this.resize();
  }

  resize() {
    if (this.failed) return;
    const w = Math.max(64, this.el.clientWidth), hh = Math.max(64, this.el.clientHeight);
    this.renderer.setSize(w, hh, false);
    this.composer.setSize(w, hh);
    this.bloom.resolution.set(w, hh);
    this.camera.aspect = w / hh; this.camera.updateProjectionMatrix();
    this.parts.setScale(this.renderer.getPixelRatio() * hh * 0.5 / Math.tan(this.camera.fov * Math.PI / 360));
  }

  /* The countdown opened the fire view by itself: the sequence's end hands
     the operator back to the console. */
  onSequence(state) {
    if (this.failed) return;
    if (state === 'COUNTDOWN' && store.data.settings.autoCam !== false && !this.full) { this.autoFull = true; this.toggleFull(true); if (this.stand.kind !== 'turbopump') this.setCam(1); }
    if ((state === 'COMPLETE' || state === 'ABORTED') && this.autoFull) setTimeout(() => { if (this.autoFull) { this.autoFull = false; this.toggleFull(false); } }, 7000);
  }

  startReplay(speed) {
    const tape = this.app.tape?.last;
    if (!tape) return;
    const [a, b] = this.app.tape.span(tape);
    // slowed down, start just before the moment that matters: the light-up,
    // or the rotor starting to turn, or failing those T-0
    const f = tape.frames, k = f.findIndex(x => x.jet?.lit || (x.tp?.rpm ?? 0) > 300);
    const t0 = k > 0 ? f[k].t - tape.tFire - (speed < 0.2 ? 0.06 : 0.3) : -0.3;
    this.rep = { tape, speed, t: speed < 1 ? Math.max(a, t0) : a, end: speed < 0.2 ? Math.min(b, t0 + 2.5) : b, ev: new CellEvents() };
    this.last = performance.now();
  }
  stopReplay() { this.rep = null; }
  get replaying() { return this.rep ? { speed: this.rep.speed, st: this.rep.st } : null; }

  setVisible(v) {
    this.visible = v || this.full;
    if (!this.failed) this.app.audio?.setListener?.(this.visible ? this.cams[this.camIx].mic : 'bunker', this.cams[this.camIx].dist || 0);
  }

  update(st) {
    if (this.failed || !(this.visible || this.full)) return;
    const now = performance.now(), dt = Math.min(0.1, (now - this.last) / 1000);
    this.last = now;
    const S = this.S, time = now / 1000;
    st = st || cellState(S);
    let events = this.events;
    if (this.rep) {
      const r = this.rep;
      r.t += dt * r.speed;
      if (r.t > r.end || S.controller.seq) this.rep = null;
      else { st = r.st = this.app.tape.at(r.t, r.tape) || st; events = r.ev; }
    }
    // daylight, facility, hardware
    const light = this.env.setTime(st.clock);
    const spots = this.stand.people?.(st.tech || 'default');
    this.env.setFacility(st, time, spots);
    this.stand.update(st, dt, time);
    // the plume
    if (this.controls.enabled) this.controls.update();
    this.plume.update(st.jet, time, this.camera);
    // events: light-up, a hard start, shutdown
    for (const e of events.update(st)) this.onEvent(e, st);
    const pdt = this.rep ? dt * this.rep.speed : dt;
    this.emit(st, pdt);
    this.parts.step(pdt);
    const lum = st.jet?.lit ? (st.jet.look?.lum || 0) : 0;
    this.parts.setLight({ amb: new THREE.Color(0.35 + 0.65 * light, 0.35 + 0.62 * light, 0.38 + 0.6 * light), flamePos: this.stand.exit.clone().add(new THREE.Vector3(this.plume.visibleLen * 0.4, 0, 0)), flameCol: this.plume.light.color, flame: lum * 0.6 });
    // the camera's iris: it closes down when the flame lights, slowly
    const target = (0.8 + 0.4 * (1 - light)) / (1 + 2.5 * lum * (this.cams[this.camIx].name === 'BUNKER' ? 0.3 : 1));
    this.exposure += (target - this.exposure) * Math.min(1, dt / 0.45);
    this.renderer.toneMappingExposure = this.exposure;
    // shake: the sound reaches the camera mount
    const jp = st.sound.jetPower, base = jp > 0 ? Math.min(1, Math.log10(1 + jp / 2000) / 3) : 0;
    const shk = (base * 0.6 + (st.jet?.chug || 0) * 6 + (st.jet?.hf || 0) * 8 + (st.sound.sep ? 0.5 : 0) + this.shake) * (this.cams[this.camIx].name === 'BUNKER' ? 0.15 : 1);
    this.shake *= Math.exp(-dt * 4);
    this.flash *= Math.exp(-dt * 9);
    this.flashLight.intensity = this.flash * 40;
    this.cctv.uniforms.uTime.value = time; this.cctv.uniforms.uFlash.value = this.flash * 0.25;
    const off = new THREE.Vector3((Math.random() - 0.5), (Math.random() - 0.5), (Math.random() - 0.5)).multiplyScalar(0.004 * shk * (this.stand.kind === 'coldgas' ? 0.3 : 1));
    this.camera.position.add(off);
    this.composer.render(dt);
    this.camera.position.sub(off);
    this.hudUpdate(st);
  }

  onEvent(e, st) {
    const E = this.stand.exit;
    if (e.type === 'ignition') { this.flash = Math.max(this.flash, 0.35); this.shake += 0.4; }
    if (e.type === 'hardstart') {
      const k = Math.min(3, e.ratio - 1);
      this.flash = Math.max(this.flash, 0.6 + 0.4 * k); this.shake += 2 + 2 * k;
      this.parts.burst('spark', Math.round(60 + 80 * k), [E.x + 0.02, E.y, E.z], [4, 1.5, 0], { spread: 5, size: 0.025 });
      this.parts.burst('smoke', 20, [E.x + 0.2, E.y, E.z], [2, 0.6, 0], { spread: 1.5, size: 0.25 });
    }
    if (e.type === 'shutdown') this.parts.burst('steam', 12, [E.x + 0.05, E.y, E.z], [1.5, 0.3, 0], { spread: 0.5, size: 0.12 });
  }

  /* Smoke, steam, water and fog from what is flowing. */
  emit(st, dt) {
    const P = this.parts, E = this.stand.exit, j = st.jet;
    if (j?.lit && j.look) {
      const L = this.plume.visibleLen || 0.5;
      const m = j.mdot;
      // combustion products are mostly water vapour: it condenses into a cloud downstream
      P.emit('steam', 'steam', Math.min(60, 160 * m), dt, [E.x + L * 1.3, E.y, E.z], [Math.min(8, j.Uj * 0.003), 0.3, 0], { spread: 0.8, size: 0.12 + 0.25 * L, jitter: 0.25 * L });
      if (j.look.soot > 0.1) P.emit('smoke', 'smoke', 80 * m * j.look.soot, dt, [E.x + L * 1.4, E.y, E.z], [5, 0.4, 0], { spread: 1.0, size: 0.2 + 0.25 * L });
      if (st.walls?.breached) P.emit('burn', 'spark', 60, dt, [E.x - 0.06, E.y + 0.03, E.z + 0.03], [0, 1.5, 2.5], { spread: 2.5, size: 0.02 });
      if (j.regime === 'separated') P.emit('sepdust', 'dust', 20, dt, [E.x + 1.2, 0.05, E.z], [2, 0.3, 0], { spread: 1, size: 0.3 });
    } else if (j && j.fog > 0.05) {
      // cold nitrogen: humid air condensing in the jet (faint)
      P.emit('fog', 'fog', Math.min(80, 6000 * j.mdot * j.fog), dt, [E.x + 0.05, E.y, E.z], [Math.min(6, j.Uj * 0.01), 0, 0], { spread: 0.25, size: 0.03, jitter: 0.01 });
    }
    if (st.spray) {
      // unlit: the injected liquid leaves the nozzle as spray, and rains on the apron
      const v = st.spray.v;
      P.emit('drop', 'drop', Math.min(1400, 5000 * st.spray.mdot), dt, [E.x + 0.01, E.y, E.z], [v * 0.7, 0.3, 0], { spread: v * 0.1, size: 0.012, life: 1.1 });
      P.emit('mist', 'mist', Math.min(120, 500 * st.spray.mdot), dt, [E.x + 0.05, E.y, E.z], [v * 0.25, 0.1, 0], { spread: 0.8, size: 0.06, life: 1.5 });
    }
    if (st.purge > 1e-4) P.emit('purge', 'vent', Math.min(60, st.purge * 4000), dt, [E.x + 0.02, E.y, E.z], [3, 0.2, 0], { spread: 0.6, size: 0.05 });
    // the vent stack: cold nitrogen makes a white plume of condensed moisture
    const vtop = this.env.ventTop;
    for (const v of st.vents) {
      if (v.id === 'TNZ-337') continue;
      const cold = v.T < 268;
      P.emit('v' + v.id, cold ? 'fog' : 'vent', Math.min(90, v.mdot * 3500), dt, [vtop.x, vtop.y, vtop.z], [0.2, 3 + Math.min(8, v.mdot * 300), 0], { spread: 0.6, size: 0.12 });
    }
    const tp = st.tp;
    if (tp) {
      const ex = tp.exhaust, top = this.stand.stackTop;
      if (ex.mdot > 1e-4) P.emit('texh', ex.T < 275 ? 'fog' : 'vent', Math.min(120, ex.mdot * 1500), dt, [top.x, top.y, top.z], [0.3, 4 + ex.mdot * 60, 0], { spread: 0.8, size: 0.14 });
      const q = Object.values(tp.discharge).reduce((a, b) => a + b, 0);
      if (q > 0.01) {
        const ct = this.stand.catchTop;
        P.emit('catch', 'mist', Math.min(60, q * 70), dt, [ct.x, ct.y, ct.z], [0, 0.8, 0], { spread: 0.5, size: 0.2, jitter: 0.3 });
        P.emit('catchd', 'drop', Math.min(80, q * 90), dt, [ct.x - 0.2, ct.y + 0.1, ct.z], [0, 2.2, 0], { spread: 1.0, size: 0.02, jitter: 0.25 });
      }
    }
  }

  hudUpdate(st) {
    const S = this.S, c = this.cams[this.camIx];
    setText(this.capEl, this.rep ? `${c.id} · ${c.name} · ${S.def.id} · TAPE ${fmtClock(this.rep.st?.clock ?? S.clock)}` : `${c.id} · ${c.name} · ${S.def.id} · ${fmtClock(S.clock)}${S.daq.recording ? '  ● REC' : ''}`);
    const q = S.controller.seq, r = this.rep;
    setText(this.clockEl, r ? fmtT(r.t, 3) : q ? fmtT(S.t - q.tFire, 2) : '');
    this.clockEl.className = 'cell-clock' + (r ? ' rep' : q ? (q.state === 'COUNTDOWN' ? ' cd' : ' run') : '');
    const canRep = !q && !!this.app.tape?.last;
    this.repBar.style.display = canRep || r ? '' : 'none';
    this.repPlay.style.display = r ? 'none' : '';
    this.repStop.style.display = r ? '' : 'none';
    setText(this.repInfo, r ? `REPLAY ${r.speed === 1 ? '1×' : r.speed >= 0.25 ? '¼×' : r.speed >= 0.1 ? '⅒× HIGH SPEED' : '1/50× HIGH SPEED'}` : '');
    setText(this.stateEl, S.controller.stateLabel || (st.area === 'OPEN' ? 'CELL OPEN' : st.area));
    this.stateEl.className = 'cell-state s-' + (S.controller.stateLabel || st.area || '').replace(/\W/g, '');
    this.readEl.style.opacity = r ? 0.35 : 1;
    for (const x of this.reads) setText(x.v, S.daq.online ? fmt(S.daq.latest(x.id), x.ch.quantity) : '—');
    this.abortWrap.style.display = this.full ? '' : 'none';
    this.closeBtn.style.display = this.full ? '' : 'none';
  }

  destroy() {
    window.removeEventListener('keydown', this.onKey);
    this.ro?.disconnect();
    this.overlay?.remove();
    if (!this.failed) { this.renderer.dispose(); this.renderer.forceContextLoss?.(); }
    this.el.remove();
  }
}
