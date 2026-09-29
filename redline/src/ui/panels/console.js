/* The operator console: stand commands, DAQ, facility, and fire control.
   Every button goes through the controller (and so through the
   interlocks); nothing here touches the physics. */

import { h, btn, clear, setText, toggleClass } from '../dom.js';
import { fmt, fmtT, unitLabel, toDisplay, fromDisplay } from '../../lib/units.js';
import { DAQ_RATES } from '../../instruments/daq.js';
import { act, modal } from '../modal.js';

export class Console {
  constructor(host, app) {
    this.app = app;
    this.host = host;
    this.live = [];
    this.tab = 'STAND';
    this.body = h('div.pb.console');
    this.tabs = h('div.tabs');
    const head = h('div.ph', h('span.t', 'Console'), h('span.sp'), this.tabs);
    host.append(head, this.body);
    for (const t of ['STAND', 'DAQ', 'FACILITY']) this.tabs.append(h('button', { onclick: () => this.show(t), dataset: { t } }, t));
    this.show('STAND');
  }
  get S() { return this.app.session; }

  show(t) {
    this.tab = t;
    for (const b of this.tabs.children) b.classList.toggle('on', b.dataset.t === t);
    clear(this.body);
    this.live = [];
    if (t === 'STAND') this._stand(); else if (t === 'DAQ') this._daq(); else this._facility();
    this.update();
  }

  _stand() {
    const S = this.S, def = S.def;
    this.body.append(h('div.grp', 'Valves'));
    for (const v of def.consoleValves) {
      if (v.kind === 'tech') {
        const st = h('span.ind');
        this.body.append(h('div.row', h('span.nm', h('b', v.id), v.label.replace(v.id + ' ', '')),
          h('span', btn('TECH…', () => this.show('FACILITY'), 'sm ghost', { title: 'Hand valve: technician task (FACILITY tab)' })), st));
        this.live.push(() => { const c = S.controller.cmd[v.id]; st.className = 'ind ' + (c ? 'open' : 'closed'); setText(st, c ? 'OPEN' : 'CLOSED'); st.append(h('span.src', 'tech')); });
        continue;
      }
      const seg = h('div.seg2');
      const bo = h('button', { onclick: () => act(S, 'valve', { id: v.id, open: true }) }, 'OPEN');
      const bc = h('button', { onclick: () => act(S, 'valve', { id: v.id, open: false }) }, 'CLOSE');
      seg.append(bo, bc);
      const st = h('span.ind');
      this.body.append(h('div.row', h('span.nm', { onclick: () => this.app.inspect(v.id, 'component'), style: { cursor: 'pointer' } }, h('b', v.id), v.label.replace(v.id + ' ', '')), seg, st));
      this.live.push(() => {
        const c = S.controller.cmd[v.id];
        toggleClass(bo, 'on', c === 1); toggleClass(bc, 'on', c === 0);
        const ind = this.app.indication(v.id);
        st.className = 'ind ' + ind.st;
        st.textContent = ind.text;
        st.append(h('span.src', ind.src));
      });
    }
    this.body.append(h('div.grp', 'Regulator PR-101 (via EPC-101)'));
    const inp = h('input.in', { type: 'number', step: '1', min: 0, style: { width: '70px' } });
    inp.value = toDisplay(S.controller.regSet, 'pressure').toFixed(0);
    const go = () => act(S, 'regSet', { value: fromDisplay(Number(inp.value) || 0, 'pressure') });
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
    const unit = h('span.faint', unitLabel('pressure', true));
    const fb = h('span.stat.muted');
    this.body.append(h('div.line', h('span.muted', 'Setpoint'), inp, unit, btn('SET', go, 'sm primary'), btn('0', () => { inp.value = 0; go(); }, 'sm ghost', { title: 'Setpoint to zero (dome vented)' })));
    this.body.append(h('div.line', fb));
    this.live.push(() => {
      setText(fb, `cmd ${fmt(S.controller.regSet, 'pressure')}   EPC fb ${S.daq.online ? fmt(S.daq.latest('EPC-101'), 'pressure') : '----'}   PT-201 ${S.daq.online ? fmt(S.daq.latest('PT-201'), 'pressure') : '----'} ${unitLabel('pressure', true)}`);
      setText(unit, unitLabel('pressure', true));
    });
  }

  _daq() {
    const S = this.S, d = S.daq;
    this.body.append(h('div.grp', 'Data acquisition'));
    const pw = h('div.seg2', h('button', { onclick: () => act(S, 'daqPower', { on: true }) }, 'ON'), h('button', { onclick: () => act(S, 'daqPower', { on: false }) }, 'OFF'));
    const pst = h('span.stat');
    this.body.append(h('div.line', h('span.muted', { style: { width: '70px' } }, 'Power'), pw, pst));
    const sel = h('select.in', { onchange: () => { const r = act(S, 'daqRate', { rate: Number(sel.value) }); if (!r.ok) sel.value = d.rate; } },
      DAQ_RATES.map(r => h('option', { value: r }, `${r} Hz`)));
    sel.value = d.rate;
    const fc = h('span.faint');
    this.body.append(h('div.line', h('span.muted', { style: { width: '70px' } }, 'Rate'), sel, fc));
    const rec = btn('● RECORD', () => act(S, 'record', { on: !d.recording }), 'sm');
    const rst = h('span.stat');
    const auto = h('input', { type: 'checkbox', checked: S.controller.autoStop, onchange: () => S.execute('autoStop', { on: auto.checked }) });
    this.body.append(h('div.line', h('span.muted', { style: { width: '70px' } }, 'Record'), rec, rst));
    this.body.append(h('div.line', h('label.chk', auto, `Auto-stop ${S.controller.recordTail.toFixed(0)} s after the sequence ends`)));
    this.body.append(h('div.grp', 'Zero and calibration'));
    const shunt = btn('SHUNT CAL', () => act(S, 'shunt', { id: 'LC-501', on: !d.sensor('LC-501').shunt }), 'sm');
    this.body.append(h('div.line',
      btn('ZERO PTs', () => act(S, 'zero', { ids: d.sensors.filter(x => x.kind === 'PT').map(x => x.id) }), 'sm', { title: 'Take the current reading of every pressure transducer as zero' }),
      btn('TARE LC', () => act(S, 'tare', { ids: ['LC-501'] }), 'sm', { title: 'Take the current load-cell reading as zero' }),
      shunt));
    const zs = h('div.line.faint', { style: { fontSize: '11px' } });
    this.body.append(zs);
    this.live.push(() => {
      pw.children[0].classList.toggle('on', d.powered); pw.children[1].classList.toggle('on', !d.powered);
      setText(pst, d.online ? 'ONLINE' : d.powered ? 'BOOTING…' : 'OFF');
      pst.style.color = d.online ? 'var(--good)' : d.powered ? 'var(--caution)' : 'var(--ink-4)';
      if (document.activeElement !== sel) sel.value = d.rate;
      setText(fc, `anti-alias ${Math.round(d.fc)} Hz`);
      if (d.recording) {
        setText(rec, '■ STOP'); rec.classList.add('nogo');
        setText(rst, `REC ${d.recording.meta.runId}  ${(S.t - d.recording.start).toFixed(1)} s`);
        rst.style.color = 'var(--redline)';
      } else {
        setText(rec, '● RECORD'); rec.classList.remove('nogo');
        setText(rst, S.runs.length ? `last: ${S.runs[S.runs.length - 1].id}` : 'not recording'); rst.style.color = '';
      }
      rec.disabled = !d.online && !d.recording;
      toggleClass(shunt, 'on', d.sensor('LC-501').shunt);
      const z = d.sensors.filter(x => x.kind === 'PT');
      setText(zs, z.some(x => x.zeroCorr) ? 'PT zero corrections are applied (see each channel\'s faceplate).' : 'No PT zero taken this session.');
    });
  }

  _facility() {
    const S = this.S, c = S.controller;
    const cells = ['Area', 'In cell', 'Door', 'Beacon'].map(k => { const v = h('div.v'); return { k, v, el: h('div', h('div.k', k), v) }; });
    this.body.append(h('div.fac-status', cells.map(x => x.el)));
    const clr = btn('Clear & secure cell', () => act(S, 'clearCell'), 'sm');
    const ent = btn('Enter cell', () => act(S, 'enterCell'), 'sm');
    this.body.append(h('div.line', clr, ent, btn('PA announcement', () => this._pa(), 'sm ghost')));
    this.body.append(h('div.grp', 'Technician (in cell)'));
    const tst = h('div.line.faint', { style: { fontSize: '11px' } });
    this.body.append(h('div.line',
      btn('Walkdown', () => act(S, 'tech', { task: 'walkdown' }), 'sm'),
      btn('Open HV-100', () => act(S, 'tech', { task: 'openHV' }), 'sm'),
      btn('Close HV-100', () => act(S, 'tech', { task: 'closeHV' }), 'sm'),
      btn('Inspect article', () => act(S, 'tech', { task: 'inspect' }), 'sm')));
    this.body.append(tst);
    this.body.append(h('div.grp', 'Safety record'));
    const sv = h('span.stat');
    const rv = btn('Review with test director', () => S.reviewViolations(), 'sm ghost');
    this.body.append(h('div.line', sv, rv));
    this.live.push(() => {
      const f = c.facility;
      setText(cells[0].v, f.area); cells[0].v.style.color = f.area === 'SECURED' ? 'var(--caution)' : f.area === 'OPEN' ? 'var(--good)' : 'var(--ink)';
      setText(cells[1].v, String(f.personnel));
      setText(cells[2].v, f.door);
      cells[3].v.innerHTML = ''; cells[3].v.append(h('span.beacon.' + f.beacon), f.beacon);
      clr.disabled = f.area !== 'OPEN'; ent.disabled = f.area === 'OPEN';
      setText(tst, c.tech ? `Busy: ${c.tech.text} — ${Math.max(0, c.tech.until - S.t).toFixed(0)} s` : f.area === 'OPEN' ? 'Technician available in the cell.' : 'Technician is in the control room (cell not open).');
      const n = S.safetyViolations.length - S.violationsReviewed;
      setText(sv, n ? `${n} unreviewed safety violation(s)` : `${S.safetyViolations.length} violation(s), all reviewed`);
      sv.style.color = n ? 'var(--warning)' : 'var(--ink-3)';
      rv.disabled = !n;
    });
  }

  _pa() {
    const inp = h('input.in', { style: { width: '100%' }, value: 'Attention: test cell TS-1 is hazardous. Stay clear of the cell until further notice.' });
    const m = modal({ title: 'PA announcement', narrow: true, body: [h('p.muted', 'Announcement to the facility:'), inp],
      footer: [btn('Cancel', () => m.close(), 'ghost'), btn('Announce', () => { this.S.execute('pa', { text: inp.value }); m.close(); }, 'primary')] });
  }

  update() { for (const f of this.live) f(); }
}

/* ---- fire control -------------------------------------------------------- */

export class FireControl {
  constructor(host, app) {
    this.app = app;
    const S = app.session;
    this.clock = h('span.mono', { style: { color: 'var(--ink)', fontSize: '12px', letterSpacing: '.04em' } }, '');
    host.append(h('div.ph', h('span.t', 'Fire control'), h('span.sp'), this.clock));
    // plan
    const mode = h('select.in', { onchange: () => this._planFields() }, h('option', { value: 'single' }, 'Single burn'), h('option', { value: 'pulse' }, 'Pulse train'));
    this.fields = h('span', { style: { display: 'inline-flex', gap: '6px', alignItems: 'center' } });
    this.mode = mode;
    const plan = h('div.plan', mode, this.fields, btn('LOAD', () => this._load(), 'sm'));
    this.loaded = h('div.loaded');
    host.append(plan, this.loaded);
    mode.value = S.controller.plan.mode;
    this._planFields();
    // keys
    this.pollB = h('button.keybtn', { onclick: () => app.openPoll() }, 'POLL');
    this.armB = h('button.keybtn.arm', { onclick: () => act(S, S.controller.armed ? 'disarm' : 'arm') }, 'ARM');
    this.fireB = h('button.keybtn.fire', { onclick: () => this._fire() }, 'FIRE');
    this.holdB = btn('HOLD', () => act(S, 'hold'), 'sm ghost', { title: 'Stop the countdown before T-0' });
    this.cutB = btn('CUTOFF', () => act(S, 'cutoff'), 'sm ghost', { title: 'Normal shutdown now (not an abort)' });
    host.append(h('div.keys', this.pollB, this.armB, this.fireB));
    host.append(h('div.line', { style: { display: 'flex', gap: '6px', padding: '0 10px 8px' } }, this.holdB, this.cutB, h('span.faint', { style: { fontSize: '11px', marginLeft: 'auto' } }, 'Guarded: lift the cover, then press.')));
    // abort
    this.abortBox = h('div.abort');
    const go = h('button.go', { onclick: () => { S.execute('abort', { reason: 'Manual abort by test conductor' }); this.abortBox.classList.remove('open'); } }, 'ABORT');
    const cover = h('div.cover', { onclick: () => { this.abortBox.classList.add('open'); clearTimeout(this._t); this._t = setTimeout(() => this.abortBox.classList.remove('open'), 5000); } },
      h('div.hinge'), 'ABORT — LIFT COVER');
    this.abortBox.append(go, cover);
    host.append(this.abortBox);
  }

  _planFields() {
    const p = this.app.session.controller.plan;
    clear(this.fields);
    if (this.mode.value === 'pulse') {
      this.on = h('input.in', { type: 'number', step: '1', min: 2, value: Math.round(p.on * 1000), style: { width: '54px' } });
      this.off = h('input.in', { type: 'number', step: '5', min: 20, value: Math.round(p.off * 1000), style: { width: '54px' } });
      this.cnt = h('input.in', { type: 'number', step: '1', min: 1, max: 50, value: p.count, style: { width: '44px' } });
      this.fields.append(this.on, h('span.lbl', 'ms on'), this.off, h('span.lbl', 'ms off ×'), this.cnt);
    } else {
      this.dur = h('input.in', { type: 'number', step: '0.1', min: 0.05, value: p.duration.toFixed(2) });
      this.fields.append(this.dur, h('span.lbl', 's'));
    }
  }

  _load() {
    const S = this.app.session;
    let plan;
    if (this.mode.value === 'pulse') plan = { mode: 'pulse', on: Math.max(0.002, Number(this.on.value) / 1000), off: Math.max(0.02, Number(this.off.value) / 1000), count: Math.max(1, Math.min(50, Math.round(Number(this.cnt.value)))) };
    else plan = { mode: 'single', duration: Math.max(0.05, Math.min(S.def.ratings.MAX_BURN, Number(this.dur.value) || 0)) };
    act(S, 'plan', { plan });
  }

  _fire() { act(this.app.session, 'fire'); }

  update() {
    const S = this.app.session, c = S.controller;
    const p = S.prediction;
    this.loaded.innerHTML = '';
    this.loaded.append('Loaded: ', h('b', c.planText()),
      p ? h('span', `  ·  pred. Pc ${fmt(p.Pc, 'pressure')} ${unitLabel('pressure', true)}, F ${fmt(p.F, 'force')} ${unitLabel('force')}`) : null);
    toggleClass(this.armB, 'on', c.armed);
    setText(this.armB, c.armed ? 'ARMED' : 'ARM');
    this.fireB.disabled = !!c.seq || !c.armed;
    toggleClass(this.fireB, 'live', c.armed && !c.seq);
    this.holdB.disabled = !(c.seq && c.seq.state === 'COUNTDOWN');
    this.cutB.disabled = !(c.seq && c.seq.state === 'BURN');
    this.pollB.disabled = !!c.seq || c.armed;
    const q = c.seq;
    if (q) { setText(this.clock, fmtT(S.t - q.tFire, 2)); this.clock.style.color = q.state === 'COUNTDOWN' ? 'var(--caution)' : 'var(--warning)'; }
    else if (c.abort && !c.abort.reset) { setText(this.clock, 'ABORT'); this.clock.style.color = 'var(--redline)'; }
    else { setText(this.clock, c.armed ? 'ARMED' : 'SAFE'); this.clock.style.color = c.armed ? 'var(--caution)' : 'var(--ink-3)'; }
  }
}
