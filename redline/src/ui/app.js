/* The application shell: top bar, views, the session lifecycle, and the
   frame loop that advances the simulation and redraws what is visible. */

import { h, btn, clear, setText } from './dom.js';
import { DISPLAY, fmtT, fmtClock, psi, unitLabel } from '../lib/units.js';
import { Session } from '../sim/session.js';
import { STANDS, PROGRAMS, MODES, findLevel } from '../content/programs.js';
import { GLOSSARY } from '../content/glossary.js';
import { store } from './store.js';
import { Audio } from './audio.js';
import { modal, toast } from './modal.js';
import { ControlView } from './views/control.js';
import { TrainingView } from './views/training.js';
import { AnalysisView } from './views/analysis.js';
import { NotebookView } from './views/notebook.js';
import { ReferenceView } from './views/reference.js';
import { HardwareView } from './views/hardware.js';
import { history } from './history.js';
import { openPoll, debrief } from './panels/dialogs.js';

const VIEWS = [['training', 'TRAINING'], ['hardware', 'HARDWARE'], ['control', 'CONTROL ROOM'], ['analysis', 'ANALYSIS'], ['notebook', 'NOTEBOOK'], ['reference', 'REFERENCE']];

export class App {
  constructor(root) {
    this.root = root;
    store.load();
    this.applySettings();
    this.audio = new Audio();
    this.audio.enabled = store.data.settings.sound;
    this.session = null;
    this.level = null;
    this.selected = null;
    this.toast = toast;
    this.buildShell();
    this.views = {};
    this.views.training = new TrainingView(this.viewHost('training'), this);
    this.views.reference = new ReferenceView(this.viewHost('reference'), this);
    this.views.hardware = new HardwareView(this.viewHost('hardware'), this);
    this.views.notebook = this.notebook = new NotebookView(this.viewHost('notebook'), this);
    this.views.analysis = new AnalysisView(this.viewHost('analysis'), this);
    this.show('training');
    document.addEventListener('pointerdown', () => this.audio.ensure(), { once: true });
    // a session is not saved: leaving the page ends it
    window.addEventListener('beforeunload', e => {
      const S = this.session;
      if (S && (S.runs.length || S.controller.armed || S.t > 120)) { e.preventDefault(); e.returnValue = ''; }
    });
    this.last = performance.now();
    requestAnimationFrame(t => this.frame(t));
  }

  applySettings() {
    const st = store.data.settings;
    DISPLAY.pressure = st.pressure; DISPLAY.force = st.force; DISPLAY.temperature = st.temperature;
  }

  /* ---- shell ----------------------------------------------------------- */
  buildShell() {
    const r = this.root;
    this.nav = h('div.nav');
    for (const [k, l] of VIEWS) this.nav.append(h('button', { dataset: { k }, onclick: () => this.show(k) }, l));
    this.tb = {
      sess: h('div.v', '—'), state: h('div.v.state-badge', '—'), T: h('div.v', 'T  --:--.--'), clock: h('div.v', '--:--:--'),
    };
    this.speedBtns = [1, 2, 5, 10].map(x => h('button', { onclick: () => { if (this.session) this.session.speed = x; } }, `${x}×`));
    this.freezeBtn = h('button', { onclick: () => { if (this.session) this.session.frozen = !this.session.frozen; }, title: 'Freeze the simulation (instructor freeze)' }, '❚❚');
    this.master = h('button.master', { onclick: () => { if (this.session) { this.session.alarms.ackAll(); this.views.control?.log.show('ALARMS'); } }, title: 'Master alarm — click to acknowledge all' }, h('span.lamp'), h('span.mtxt', 'MASTER ALARM'));
    const top = h('div.topbar',
      h('div.brand', h('span.mark'), h('b', 'REDLINE'), h('span', 'test-stand operations trainer')),
      this.nav, h('div.tb-grow'),
      h('div.tb-cell', h('div.k', 'Session'), this.tb.sess),
      h('div.tb-cell', { style: { minWidth: '112px' } }, h('div.k', 'Stand state'), this.tb.state),
      h('div.tb-cell', { style: { minWidth: '106px' } }, h('div.k', 'Test time'), this.tb.T),
      h('div.tb-cell.opt', h('div.k', 'Facility clock'), this.tb.clock),
      h('div.tb-speed', this.freezeBtn, ...this.speedBtns),
      this.master,
      h('button.tb-icon', { onclick: () => this.settings(), title: 'Units and sound' }, 'SETTINGS'));
    this.main = h('div.view');
    r.append(top, this.main);
  }

  viewHost(k) {
    const el = h('div.view.hidden', { style: { height: '100%' }, dataset: { view: k } });
    this.main.append(el);
    return el;
  }

  show(k) {
    if (k === 'control' && !this.session) { toast('No session', 'Start a level or the open stand from TRAINING.', 'info'); k = 'training'; }
    this.current = k;
    for (const el of this.main.children) el.classList.toggle('hidden', el.dataset.view !== k);
    for (const b of this.nav.children) b.classList.toggle('on', b.dataset.k === k);
    this.views[k]?.onShow?.();
  }

  /* ---- sessions -------------------------------------------------------- */
  /* An open-stand session on a stand definition built elsewhere (HARDWARE). */
  startDef(def, mode) { STANDS[def.id] = def; this._startDef = def; this.start(null, mode, def.id); this._startDef = null; }

  start(levelId, mode, standId = null) {
    const found = levelId ? findLevel(levelId) : null;
    const scenario = found?.level.scenario || null;
    const def = this._startDef || STANDS[found?.program.stand || standId || 'TS-1'];
    if (this.session && !this._confirmedLeave) {
      const m = modal({ title: 'Start a new session?', narrow: true,
        body: h('p', 'The current session ends. Its runs stay in the notebook; their recorded data (the traces) do not survive a new session.'),
        footer: [btn('Cancel', () => m.close(), 'ghost'), btn('Start new session', () => { m.close(); this._confirmedLeave = true; this._startDef = def; this.start(levelId, mode, standId); this._startDef = null; this._confirmedLeave = false; }, 'primary')] });
      return;
    }
    if (this.views.control) { this.views.control.destroy(); }
    const prefix = `${def.id.replace('-', '')}-${({ coldgas: 'CG', turbopump: 'TP' })[def.program] || 'BP'}`;
    this.session = new Session({ def, scenario, mode, runPrefix: prefix, firstRun: store.data.nextRun[prefix] || 1 });
    this.level = found?.level || null;
    const S = this.session;
    S.audioSink = (n, d) => this.audio.play(n, n === 'valve'
      ? { ...d, pneumatic: (def.pneumaticValves || []).includes(d.id), hand: d.id === (def.bottle?.valve || 'HV-100') } : d);
    S.on('recording', e => { if (e.on) { store.data.nextRun[prefix] = S.nextRun; store.save(); } });
    S.on('run', run => {
      this.notebook.onRun(run);
      history.save(run, { level: this.level ? `L${this.level.n} ${this.level.title}` : 'Open stand' });
    });
    S.controller.on('blocked', () => {});
    const host = this.main.querySelector('[data-view="control"]') || this.viewHost('control');
    clear(host);
    this.views.control = new ControlView(host, this);
    this.views.analysis.onSession();
    this.notebook.onSession();
    this.show('control');
    this.briefing(found, mode);
  }

  briefing(found, mode) {
    const S = this.session;
    const req = S.request;
    const body = h('div',
      h('div.disclaimer', 'Educational simulator. The stand, the thruster and every procedure here are fictional and generalised. They teach how test engineering is thought about; they are not operating procedures for real hardware, and completing them qualifies nobody to operate a real test facility.'),
      found ? h('p', h('b', `Level ${found.level.n}: ${found.level.title}`), ` — ${MODES[mode].label} mode. ${MODES[mode].text}`) : h('p', h('b', 'Open stand'), ` — ${MODES[mode].label} mode. No procedure: everything is available, and the interlocks and physics still apply.`),
      req && req.text ? h('div', { style: { border: '1px solid var(--line)', padding: '8px 12px', margin: '8px 0' } },
        h('div.faint', { style: { fontSize: '10px', letterSpacing: '.14em' } }, 'TEST REQUEST'),
        h('p', { style: { margin: '4px 0' } }, req.text),
        req.success ? h('p.muted', { style: { margin: 0 } }, 'Success criteria: ' + req.success) : null) : null,
      h('p.muted', 'Everything you see is a measurement. Before every action ask: what state is the system in, what should happen next, and do the instruments agree with that?'),
      h('p.faint', 'Sim speed (top bar) can be raised to skip waits; it is locked to 1× while armed or firing. ❚❚ freezes the simulation.'));
    const m = modal({ title: 'Briefing', body, narrow: true, footer: [btn('Begin', () => m.close(), 'primary')] });
  }

  /* ---- helpers used by panels ------------------------------------------ */
  inspect(id, kind = 'component') {
    this.selected = id;
    if (id && kind === 'component') this.session.inspect(id);
    this.views.control?.inspector.show(id, kind);
  }

  indication(id) {
    const S = this.session, d = S.daq, c = S.controller;
    const ix = (S.def.indications || []).find(x => x.valve === id);
    if (ix && d.online) {
      const o = d.latest(ix.zso), cl = d.latest(ix.zsc);
      const st = o === 1 && cl === 0 ? 'open' : cl === 1 && o === 0 ? 'closed' : 'travel';
      return { st, text: st === 'travel' ? 'TRAVEL' : st.toUpperCase(), src: 'ZS' };
    }
    const cm = c.cmd[id];
    return { st: cm ? 'open' : 'closed', text: cm ? 'OPEN' : 'CLOSED', src: 'cmd' };
  }

  setFocus(ids) {
    const pid = this.views.control?.pid;
    if (pid) pid.focus = new Set(ids);
  }

  showRef(id) { this.show('reference'); this.views.reference.go(id); }
  refTitle(id) { return GLOSSARY.find(g => g.id === id)?.title || id; }
  unitLabel(q) { return unitLabel(q); }
  openPoll() { if (this.session) openPoll(this); }
  debrief() { debrief(this); }

  recordCompetency(levelId, mode) {
    const p = store.data.progress[levelId] ||= {};
    p[mode] = new Date().toISOString().slice(0, 10);
    store.save();
    this.views.training.render();
  }

  settings() {
    const st = store.data.settings;
    const sel = (key, opts) => {
      const s = h('select.in', { onchange: () => { st[key] = s.value; store.save(); this.applySettings(); this.onUnitsChanged(); } }, opts.map(([v, l]) => h('option', { value: v }, l)));
      s.value = st[key];
      return s;
    };
    const snd = h('input', { type: 'checkbox', checked: st.sound, onchange: () => { st.sound = snd.checked; store.save(); this.audio.setEnabled(snd.checked); } });
    const m = modal({
      title: 'Settings', narrow: true,
      body: h('div.kv', { style: { gap: '8px 16px', alignItems: 'center' } },
        h('span.k', 'Pressure'), sel('pressure', [['psi', 'psi (g/a)'], ['bar', 'bar'], ['kPa', 'kPa']]),
        h('span.k', 'Force'), sel('force', [['N', 'N'], ['lbf', 'lbf']]),
        h('span.k', 'Temperature'), sel('temperature', [['C', '°C'], ['K', 'K'], ['F', '°F']]),
        h('span.k', 'Sound'), h('label.chk', snd, 'Test-stand sounds'),
        h('span.k', 'Stored data'), btn('Clear notebook, test history and progress…', () => {
          if (confirm('Erase the notebook, recorded test history, progress and plot layouts stored in this browser?')) {
            store.data.notebook = []; store.data.progress = {}; store.data.layouts = {}; store.data.sessionNotes = []; store.save();
            history.clear().then(() => this.views.analysis.render());
            this.views.training.render(); this.notebook.render(); m.close();
          }
        }, 'sm ghost')),
      footer: [btn('Close', () => m.close(), 'primary')],
    });
  }

  onUnitsChanged() {
    if (this.views.control) { this.views.control.console.show(this.views.control.console.tab); this.views.control.plots.rebuild(); }
    this.views.analysis.render?.();
    this.notebook.render?.();
  }

  /* ---- frame loop ------------------------------------------------------- */
  frame(now) {
    const dt = Math.min(0.1, (now - this.last) / 1000);
    this.last = now;
    const S = this.session;
    if (S) {
      S.advance(dt);
      if (this.current === 'control') this.views.control.update();
      this.topbar();
      // sound follows the physical flow (the cell microphone)
      const net = S.model.net;
      let vent = 0;
      for (const id of S.def.ventElements || []) vent += Math.max(0, net.el(id)?.mdot || 0);
      this.audio.flow({ thrust: S.model.thrust ?? S.model.nozzleEl.F, vent });
    }
    // analysis works on recorded runs, session or not
    if (this.current === 'analysis') this.views.analysis.update();
    requestAnimationFrame(t => this.frame(t));
  }

  topbar() {
    const S = this.session, c = S.controller, d = S.daq;
    if (!this._tbAt || performance.now() - this._tbAt > 100) {
      this._tbAt = performance.now();
      setText(this.tb.sess, this.level ? `L${this.level.n} · ${S.mode}` : `${S.def.id} open · ${S.mode}`);
      let st = c.stateLabel;
      if (!st) {
        if (!d.online) st = 'NO DATA';
        else st = (S.def.lpChannels || []).some(id => d.latest(id) > S.def.ratings.VENTED) ? 'PRESSURISED' : 'SAFE';
      }
      setText(this.tb.state, st);
      this.tb.state.className = 'v state-badge state-' + st.replace(' ', '');
      setText(this.tb.T, c.seq ? fmtT(S.t - c.seq.tFire) : 'T  --:--.--');
      setText(this.tb.clock, fmtClock(S.clock) + (S.frozen ? ' ❚❚' : ''));
      const locked = S.locked1x;
      this.speedBtns.forEach((b, i) => { const x = [1, 2, 5, 10][i]; b.classList.toggle('on', S.effectiveSpeed === x); b.disabled = locked && x !== 1; });
      this.freezeBtn.classList.toggle('on', S.frozen);
      const lvl = S.alarms.master;
      this.master.className = 'master' + (lvl ? ` lvl${lvl} blink` : '');
    }
  }
}
