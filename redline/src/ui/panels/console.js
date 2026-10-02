/* The operator console: stand commands, DAQ, facility, and fire control.
   Every button goes through the controller (and so through the
   interlocks); nothing here touches the physics. */

import { h, btn, clear, setText, toggleClass } from '../dom.js';
import { fmt, fmtT, unitLabel, toDisplay, fromDisplay } from '../../lib/units.js';
import { DAQ_RATES } from '../../instruments/daq.js';
import { act, modal } from '../modal.js';
import { openDiagnosis, reveal } from './diagnosis.js';
import { HINT_COST } from '../../faults/engine.js';

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
    for (const t of ['STAND', 'DAQ', 'FACILITY', 'INSPECT']) this.tabs.append(h('button', { onclick: () => this.show(t), dataset: { t } }, t));
    this.show('STAND');
  }
  get S() { return this.app.session; }

  show(t) {
    this.tab = t;
    for (const b of this.tabs.children) b.classList.toggle('on', b.dataset.t === t);
    clear(this.body);
    this.live = [];
    if (t === 'STAND') this._stand(); else if (t === 'DAQ') this._daq(); else if (t === 'INSPECT') this._inspect(); else this._facility();
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
    // one setpoint row per regulator (TS-1 has one; TS-2 has three)
    const regs = def.regulators || [{ id: def.regulator, label: 'Setpoint', epc: 'EPC-101', out: 'PT-201', title: `Regulator ${def.regulator} (via EPC-101)` }];
    this.body.append(h('div.grp', regs.length > 1 ? 'Regulators (via EPCs)' : regs[0].title));
    for (const rg of regs) {
      const inp = h('input.in', { type: 'number', step: '1', min: 0, style: { width: '64px' } });
      inp.value = toDisplay(S.controller.sp[rg.id], 'pressure').toFixed(0);
      const go = () => act(S, 'regSet', { id: rg.id, value: fromDisplay(Number(inp.value) || 0, 'pressure') });
      inp.addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
      const unit = h('span.faint', unitLabel('pressure', true));
      const fb = h('span.stat.muted');
      this.body.append(h('div.line', h('span.muted', { style: { minWidth: regs.length > 1 ? '118px' : '' } }, rg.label), inp, unit,
        btn('SET', go, 'sm primary'), btn('0', () => { inp.value = 0; go(); }, 'sm ghost', { title: 'Setpoint to zero (dome vented)' })));
      this.body.append(h('div.line', fb));
      let shown = S.controller.sp[rg.id];
      this.live.push(() => {
        // the box follows the command (set here, by a procedure or by an abort) unless being typed in
        const cur = S.controller.sp[rg.id];
        if (cur !== shown && document.activeElement !== inp) { inp.value = toDisplay(cur, 'pressure').toFixed(0); shown = cur; }
        const on = S.daq.online, q = x => (on ? fmt(S.daq.latest(x), 'pressure') : '----');
        setText(fb, `cmd ${fmt(S.controller.sp[rg.id], 'pressure')}   ${rg.epc} fb ${q(rg.epc)}   ${rg.out} ${q(rg.out)} ${unitLabel('pressure', true)}`);
        setText(unit, unitLabel('pressure', true));
      });
    }
    // the pressure-decay leak check, for sessions with no procedure to run it
    this.body.append(h('div.grp', 'Leak check (isolate, 60 s hold)'));
    const lst = h('span.stat.muted'), bar = h('div.bar', h('i')), lb = btn('START HOLD', () => {
      const r = S.startLeakCheck();
      if (!r.ok) this.app.toast('Leak check not started', r.msg, 'info', 4500);
    }, 'sm');
    this.body.append(h('div.leak', lb, bar, lst));
    this.live.push(() => {
      const run = S.leakRun, res = S.leakCheck;
      lb.disabled = !!run;
      bar.firstChild.style.width = run ? `${Math.min(100, 100 * (S.t - run.start) / (run.end - run.start))}%` : '0';
      bar.style.visibility = run ? 'visible' : 'hidden';
      setText(lst, run ? `holding — ${Math.max(0, run.end - S.t).toFixed(0)} s` : res ? res.msg : 'not performed');
      lst.style.color = run ? 'var(--caution)' : res ? (res.ok ? 'var(--good)' : 'var(--warning)') : '';
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
    const lc = S.def.loadCell || 'LC-501';
    const scales = d.sensors.filter(x => x.kind === 'WT').map(x => x.id);
    const shunt = btn('SHUNT CAL', () => act(S, 'shunt', { id: lc, on: !d.sensor(lc).shunt }), 'sm');
    this.body.append(h('div.line',
      btn('ZERO PTs', () => act(S, 'zero', { ids: d.sensors.filter(x => x.kind === 'PT').map(x => x.id) }), 'sm', { title: 'Take the current reading of every pressure transducer as zero' }),
      btn('TARE LC', () => act(S, 'tare', { ids: [lc] }), 'sm', { title: `Take the current ${lc} reading as zero` }),
      scales.length ? btn('TARE SCALES', () => act(S, 'tare', { ids: scales }), 'sm', { title: `Take the current ${scales.join(' / ')} readings as zero — with the tanks EMPTY` }) : null,
      shunt));
    const zs = h('div.line.faint', { style: { fontSize: '11px' } });
    this.body.append(zs);
    // turbine meters: the density the DAQ converts volume flow to mass with
    const meterSel = [];
    if (S.def.actions?.meterCal) {
      const fl = Object.entries(S.def.fluids);
      const mk = (line, tag) => {
        const sl = h('select.in', { title: `Density ${tag} is converted to mass flow with`, onchange: () => { const r = act(S, 'meterCal', { line, fluid: sl.value }); if (!r.ok) sl.value = S.controller.meterFluid[line]; } },
          fl.map(([id, f]) => h('option', { value: id }, `${id} (${f.rho})`)));
        meterSel.push([sl, line]);
        return h('span', { style: { display: 'inline-flex', gap: '4px', alignItems: 'center' } }, h('span.lbl', tag), sl);
      };
      this.body.append(h('div.line', h('span.muted', { style: { width: '70px' } }, 'Meter fluid'), mk('ox', 'FT-714'), mk('fu', 'FT-724')));
    }
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
      toggleClass(shunt, 'on', d.sensor(lc).shunt);
      const z = d.sensors.filter(x => x.kind === 'PT');
      setText(zs, z.some(x => x.zeroCorr) ? 'PT zero corrections are applied (see each channel\'s faceplate).' : 'No PT zero taken this session.');
      for (const [sl, line] of meterSel) if (document.activeElement !== sl) sl.value = S.controller.meterFluid?.[line] || 'water';
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
    const hv = S.def.bottle?.valve || 'HV-100';
    this.body.append(h('div.line',
      btn('Walkdown', () => act(S, 'tech', { task: 'walkdown' }), 'sm'),
      btn(`Open ${hv}`, () => act(S, 'tech', { task: 'openHV' }), 'sm'),
      btn(`Close ${hv}`, () => act(S, 'tech', { task: 'closeHV' }), 'sm'),
      btn('Inspect article', () => act(S, 'tech', { task: 'inspect' }), 'sm'),
      ...(S.def.techButtons || []).map(([task, label, title]) => btn(label, () => act(S, 'tech', { task }), 'sm', { title }))));
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

  /* The inspection workbench: technician tasks that return measurements,
     never verdicts. Where each can be done is part of the lesson — the
     rack in the control room, or hands-on in a cell that has been made
     safe to enter. */
  _inspect() {
    const S = this.S, list = S.def.inspections || [];
    const NEEDS = { rack: 'from the rack', cell: 'cell open', vented: 'cell open, system vented', lowP: 'cell open, low side 20–50 psig' };
    const st = h('div.line.stat');
    const diagBox = h('div.line');
    const res = h('div.iresults');
    this.body.append(st, diagBox, h('div.grp', 'Results (newest first)'), res);
    const groups = [...new Set(list.map(i => i.group))];
    for (const g of groups) {
      this.body.append(h('div.grp', g));
      for (const it of list.filter(i => i.group === g)) {
        const b = btn('RUN', () => act(S, 'inspection', { id: it.id }), 'sm');
        this.body.append(h('div.row.insp', h('span.nm', it.label, h('span.need', `${NEEDS[it.needs] || it.needs} · ≈${it.dur} s`)), b));
      }
    }
    let shown = -1, diag = undefined;
    this.live.push(() => {
      const tech = S.controller.tech;
      setText(st, tech ? `Technician busy: ${tech.text} — ${Math.max(0, tech.until - S.t).toFixed(0)} s` : `Technician available · cell ${S.controller.facility.area}`);
      st.style.color = tech ? 'var(--caution)' : '';
      if (diag !== S.faults.diagnosis) {
        diag = S.faults.diagnosis;
        clear(diagBox);
        if (diag) diagBox.append(btn('Root cause…', () => reveal(this.app), 'sm primary'), h('span.faint', `Diagnosis submitted · ${diag.result.score}/100`));
        else {
          diagBox.append(btn('Submit diagnosis…', () => openDiagnosis(this.app), S.faults.enabled ? 'sm primary' : 'sm ghost'),
            h('span.faint', S.faults.enabled ? 'Fault session: diagnose before you leave.' : 'No faults are injected in this session.'));
          if (S.faults.enabled && S.mode === 'guided') diagBox.append(btn(`Ask for a hint (−${HINT_COST})`, () => this._hint(), 'sm ghost', { title: 'The senior engineer asks a question. Three at most, each costs points on the diagnosis.' }));
          for (const x of S.faults.hints) diagBox.append(h('div.hint', h('b', 'SENIOR ENGINEER  '), x.text));
        }
      }
      if (shown === S.inspections.length) return;
      shown = S.inspections.length;
      clear(res);
      if (!shown) res.append(h('p.faint', 'No inspections yet.'));
      for (const r of [...S.inspections].reverse()) {
        res.append(h('div.ires', h('div.ih', h('b', r.label), h('span.faint', `session t = ${r.t.toFixed(0)} s`)),
          h('table', h('tr', h('th', ''), h('th', 'found'), h('th', 'expected')), r.lines.map(l => h('tr', h('td', l[0]), h('td.m', l[1]), h('td.faint', l[2] ?? '')))),
          r.text ? h('p.muted', r.text) : null));
      }
    });
  }

  _hint() {
    const t = this.S.faults.hint();
    if (!t) { this.app.toast('No more hints', 'That was the last one — the rest is yours.', 'info'); return; }
    this.show('INSPECT');
  }

  _pa() {
    const d = this.S.def, cell = d.custom ? 'the test cell' : `test cell ${d.family || d.id}`;
    const inp = h('input.in', { style: { width: '100%' }, value: `Attention: ${cell} is hazardous. Stay clear of the cell until further notice.` });
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
    // a liquid stand plans flows (which sides, which valve leads); a
    // thruster stand plans burns and pulse trains
    this.liquid = !!S.def.sequence;
    this.hotCapable = !!S.def.physics.chamber;
    this.gg = S.def.planForm === 'gg';
    this.pump = !!S.def.planForm && !this.gg;
    const opts = this.gg ? [['hot', 'HOT FIRE'], ['cold', 'Pump-fed cold flow (water)']]
      : this.pump ? [['spin', 'Spin (hold speed)'], ['map', 'Pump map (throttle steps)'], ['suction', 'Suction test (tank ramp)']]
      : this.liquid ? [['both', 'Cold flow · both'], ['ox', 'Cold flow · ox only'], ['fuel', 'Cold flow · fuel only'], ...(this.hotCapable ? [['hot', 'HOT FIRE']] : [])]
      : [['single', 'Single burn'], ['pulse', 'Pulse train']];
    const mode = h('select.in', { onchange: () => this._planFields() }, opts.map(([v, l]) => h('option', { value: v }, l)));
    this.fields = h('span', { style: { display: 'inline-flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' } });
    this.mode = mode;
    const plan = h('div.plan', mode, this.fields, btn('LOAD', () => this._load(), 'sm'));
    this.loaded = h('div.loaded');
    host.append(plan, this.loaded);
    mode.value = this.gg || this.pump ? S.controller.plan.mode : this.liquid ? (S.controller.plan.mode === 'hot' ? 'hot' : S.controller.plan.sides || 'both') : S.controller.plan.mode;
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
    const num = (v, step, w, title) => h('input.in', { type: 'number', step, value: v, style: { width: w }, title });
    const L = t => h('span.lbl', t);
    if (this.gg) {
      // a gas-generator engine: the start is the plan — start gas, the
      // order and timing of the valves, the igniters — then the throttle
      const PSI = 6894.757, hot = this.mode.value === 'hot';
      this.dur = num((p.duration ?? 10).toFixed(1), '0.5', '62px', hot ? 'Burn duration, s (T-0 → GG shutdown); ignored when throttle steps are given' : 'Run duration, s (start valve open → shut)');
      this.sgp = num(((p.startP ?? 220 * PSI) / PSI).toFixed(0), '5', '58px', 'Start gas pressure (PR-330, set by the sequencer at T-3), psig: 120–400');
      this.mo = num((p.mainOpen ?? (hot ? 0.45 : 0.3)).toFixed(2), '0.05', '64px', 'Main valves open, s after T-0');
      this.pp = num((p.postPurge ?? 4).toFixed(0), '1', '48px', 'Post-purge, s');
      if (!hot) {
        this.fields.append(this.dur, L('s'), L('start gas'), this.sgp, L('psig'), L('mains T+'), this.mo, this.pp, L('s purge'));
        return;
      }
      const t0 = p.thrSteps?.length ? p.thrSteps[0] : (p.thr ?? 1);
      this.tox = num(Math.round(100 * (p.thrOx ?? t0)), '1', '56px', 'GG oxidiser throttle GCV-417, % (60–100)');
      this.tfu = num(Math.round(100 * (p.thrFu ?? t0)), '1', '56px', 'GG fuel throttle GCV-427, % (60–100). Equal to the oxidiser side keeps the GG mixture ratio');
      this.steps = h('input.in', { value: p.thrSteps?.length > 1 ? p.thrSteps.map(x => Math.round(x * 100)).join(',') : '', placeholder: 'e.g. 100,85,70', style: { width: '104px' },
        title: 'Throttle profile: GG throttle positions in %, both legs together. Blank: one point at the throttles on the left' });
      this.settle = num((p.settle ?? 4).toFixed(0), '1', '46px', 'Profile: seconds at the first point (it includes the start)');
      this.dwell = num((p.dwell ?? 4).toFixed(0), '1', '46px', 'Profile: seconds at each later point');
      this.go = num((p.ggOpen ?? 0.75).toFixed(2), '0.05', '64px', 'Gas generator valves open, s after T-0 (fuel 30 ms ahead of oxidiser)');
      this.se = num((p.spinEnd ?? 1.1).toFixed(2), '0.05', '64px', 'Start gas off (TSV-332 shut), s after T-0 — bootstrap');
      this.ign = num((p.ignLead ?? 0.5).toFixed(2), '0.05', '64px', 'Both igniters on, s BEFORE T-0');
      this.ioff = num((p.ignOff ?? 2).toFixed(1), '0.1', '56px', 'Both igniters off, s after T-0');
      this.lag = num(Math.round((p.shutLag ?? 0.25) * 1000), '10', '60px', 'Shutdown: main valves this many ms after the gas generator');
      this.fields.append(this.dur, L('s · GG thr ox'), this.tox, L('fu'), this.tfu, L('% · profile'), this.steps, this.settle, L('/'), this.dwell, L('s'),
        h('span', { style: { flexBasis: '100%', height: 0 } }),
        L('start gas'), this.sgp, L('psig to T+'), this.se, L('· mains T+'), this.mo, L('GG T+'), this.go,
        L('· IGN T−'), this.ign, L('→ T+'), this.ioff, L('· mains'), this.lag, L('ms after GG ·'), this.pp, L('s purge'));
    } else if (this.pump) {
      // a turbopump run: how the speed is held, what speed, the throttles,
      // and what the run does with them
      const m = this.mode.value;
      this.ctl = h('select.in', { title: 'Speed control holds the speed with SC-330; pressure control runs on the PR-330 setpoint' },
        [['speed', 'speed ctl'], ['pressure', 'pressure ctl']].map(([v, l]) => h('option', { value: v }, l)));
      this.ctl.value = p.ctl || 'speed';
      this.spd = num(Math.round(p.speed ?? 30000), '500', '74px', 'Speed target, rpm (design 36 000; 105 % max)');
      this.fields.append(this.ctl, this.spd, h('span.lbl', 'rpm'));
      if (m === 'map') {
        this.steps = h('input.in', { value: (p.thrSteps || [0.4, 0.55, 0.7, 0.85, 1.0]).map(x => Math.round(x * 100)).join(','), style: { width: '120px' }, title: 'Throttle positions, %, in order' });
        this.dwell = num((p.dwell ?? 4).toFixed(0), '1', '44px', 'Seconds at each throttle position');
        this.fields.append(h('span.lbl', 'throttles %'), this.steps, this.dwell, h('span.lbl', 's each'));
      } else {
        this.thr = num(Math.round(100 * (p.thr ?? 0.66)), '1', '50px', 'Both throttle positions, %');
        this.dur = num((p.duration ?? 10).toFixed(0), '1', '50px', 'Run duration, s (turbine start valve open → shut)');
        this.fields.append(h('span.lbl', 'thr'), this.thr, h('span.lbl', '%'), this.dur, h('span.lbl', 's'));
        if (m === 'suction') {
          this.side = h('select.in', { title: 'The pump under test: its tank is ramped down' }, [['ox', 'ox side'], ['fu', 'fuel side']].map(([v, l]) => h('option', { value: v }, l)));
          this.side.value = p.side || 'ox';
          this.pEnd = num(((p.pEnd ?? 6894.757 * 3) / 6894.757).toFixed(0), '1', '44px', 'Tank pressure the ramp ends at, psig');
          this.rate = num(((p.rate ?? 6894.757 * 1.5) / 6894.757).toFixed(1), '0.1', '48px', 'Ramp rate, psi/s');
          this.fields.append(this.side, h('span.lbl', 'to'), this.pEnd, h('span.lbl', 'psig at'), this.rate, h('span.lbl', 'psi/s'));
        }
      }
    } else if (this.liquid && this.mode.value === 'hot') {
      this.dur = num(p.duration.toFixed(1), '0.1', '58px', 'Burn duration, s (later main valve open → first closes)');
      this.lead = num(Math.round((p.lead ?? 0) * 1000), '10', '58px', 'Oxidiser lead, ms (negative: fuel leads)');
      this.ign = num((p.ignLead ?? 0.5).toFixed(2), '0.05', '62px', 'Igniter on, seconds BEFORE T-0');
      this.chk = num((p.ignCheck ?? 0.5).toFixed(2), '0.05', '62px', 'Ignition check (Pc confirmed), seconds AFTER T-0');
      this.shut = h('select.in', { title: 'Shutdown order (50 ms apart)' }, [['ox-first', 'ox first'], ['fuel-first', 'fuel first']].map(([v, l]) => h('option', { value: v }, l)));
      this.shut.value = p.shutdown || 'ox-first';
      this.pp = num((p.postPurge ?? 3).toFixed(0), '1', '44px', 'Post-purge, s');
      this.fields.append(this.dur, h('span.lbl', 's'), this.lead, h('span.lbl', 'ms ox lead'), h('span.lbl', 'IGN T−'), this.ign,
        h('span.lbl', 'check T+'), this.chk, this.shut, this.pp, h('span.lbl', 's purge'));
    } else if (this.liquid) {
      this.dur = h('input.in', { type: 'number', step: '0.5', min: 0.5, value: p.duration.toFixed(1), style: { width: '50px' } });
      this.lead = h('input.in', { type: 'number', step: '10', value: Math.round((p.lead ?? 0) * 1000), style: { width: '50px' }, title: 'Oxidiser lead, ms (negative: fuel leads)' });
      this.pp = h('input.in', { type: 'number', step: '1', min: 0, value: (p.postPurge ?? 3).toFixed(0), style: { width: '38px' }, title: 'Post-purge, s' });
      this.fields.append(this.dur, h('span.lbl', 's'));
      if (this.mode.value === 'both') this.fields.append(this.lead, h('span.lbl', 'ms ox lead'));
      this.fields.append(this.pp, h('span.lbl', 's purge'));
    } else if (this.mode.value === 'pulse') {
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
    if (this.gg) {
      const PSI = 6894.757, R = S.def.ratings, n = (el, d) => (Number.isFinite(Number(el.value)) && el.value !== '' ? Number(el.value) : d);
      const common = { duration: Math.max(2, Math.min(R.MAX_BURN, n(this.dur, 10))), startP: n(this.sgp, 220) * PSI,
        mainOpen: Math.max(0, Math.min(3, n(this.mo, 0.45))), postPurge: Math.max(0, Math.min(30, n(this.pp, 4))), thrSteps: null };
      if (this.mode.value === 'cold') plan = { mode: 'cold', ...common };
      else {
        const ox = Math.max(0, Math.min(1, n(this.tox, 100) / 100)), fu = Math.max(0, Math.min(1, n(this.tfu, 100) / 100));
        const steps = this.steps.value.split(/[ ,;]+/).map(Number).filter(x => x > 0 && x <= 100).map(x => x / 100);
        plan = { mode: 'hot', ...common, thr: Math.max(ox, fu), thrOx: ox === fu ? null : ox, thrFu: ox === fu ? null : fu,
          thrSteps: steps.length > 1 ? steps : null, settle: Math.max(3, Math.min(20, n(this.settle, 4))), dwell: Math.max(2, Math.min(20, n(this.dwell, 4))),
          ggOpen: Math.max(0, Math.min(3, n(this.go, 0.75))), spinEnd: Math.max(0, Math.min(5, n(this.se, 1.1))),
          ignLead: Math.max(0, Math.min(3, n(this.ign, 0.5))), ignOff: Math.max(0, Math.min(10, n(this.ioff, 2))), shutLag: Math.max(0, Math.min(1, n(this.lag, 250) / 1000)) };
        if (plan.thrSteps) { plan.thrOx = null; plan.thrFu = null; }
      }
    } else if (this.pump) {
      const m = this.mode.value, PSI = 6894.757;
      plan = { mode: m, ctl: this.ctl.value, speed: Math.max(0, Number(this.spd.value) || 0), ramp: 3, settle: 3 };
      if (m === 'map') {
        plan.thrSteps = this.steps.value.split(/[ ,;]+/).map(Number).filter(x => x > 0 && x <= 100).map(x => x / 100);
        plan.dwell = Math.max(2, Math.min(15, Number(this.dwell.value) || 4));
      } else {
        plan.thr = Math.max(0, Math.min(1, (Number(this.thr.value) || 0) / 100));
        plan.duration = Math.max(2, Math.min(S.def.ratings.MAX_BURN, Number(this.dur.value) || 0));
        delete plan.thrOx; delete plan.thrFu;
        if (m === 'suction') { plan.side = this.side.value; plan.pEnd = (Number(this.pEnd.value) || 0) * PSI; plan.rate = Math.max(0.2, Number(this.rate.value) || 1.5) * PSI; }
      }
    } else if (this.liquid && this.mode.value === 'hot') {
      const chk = Math.max(0.1, Math.min(3, Number(this.chk.value) || 0.5));
      plan = { mode: 'hot', sides: 'both', duration: Math.max(0.2, Math.min(S.def.ratings.MAX_BURN, Number(this.dur.value) || 0)),
        lead: Math.max(-1, Math.min(1, (Number(this.lead.value) || 0) / 1000)), ignLead: Math.max(0, Math.min(3, Number(this.ign.value) || 0)),
        ignCheck: chk, ignOff: Math.max(1.0, chk + 0.5), shutdown: this.shut.value, shutLag: 0.05, postPurge: Math.max(0, Math.min(30, Number(this.pp.value) || 0)) };
    } else if (this.liquid) plan = { mode: 'single', sides: this.mode.value, duration: Math.max(0.5, Math.min(S.def.ratings.MAX_BURN, Number(this.dur.value) || 0)),
      lead: this.mode.value === 'both' ? Math.max(-1, Math.min(1, (Number(this.lead.value) || 0) / 1000)) : 0, postPurge: Math.max(0, Math.min(30, Number(this.pp.value) || 0)) };
    else if (this.mode.value === 'pulse') plan = { mode: 'pulse', on: Math.max(0.002, Number(this.on.value) / 1000), off: Math.max(0.02, Number(this.off.value) / 1000), count: Math.max(1, Math.min(50, Math.round(Number(this.cnt.value)))) };
    else plan = { mode: 'single', duration: Math.max(0.05, Math.min(S.def.ratings.MAX_BURN, Number(this.dur.value) || 0)) };
    act(S, 'plan', { plan });
  }

  _fire() { act(this.app.session, 'fire'); }

  update() {
    const S = this.app.session, c = S.controller;
    const p = S.prediction;
    // a plan loaded from elsewhere (a procedure, the API) re-syncs the editor
    if (c.plan !== this._planRef) {
      this._planRef = c.plan;
      const want = this.gg || this.pump ? c.plan.mode : this.liquid ? (c.plan.mode === 'hot' ? 'hot' : c.plan.sides || 'both') : c.plan.mode;
      if (!this.mode.contains(document.activeElement) && !this.fields.contains(document.activeElement) && [...this.mode.options].some(o => o.value === want)) { this.mode.value = want; this._planFields(); }
    }
    this.loaded.innerHTML = '';
    const pt = !p ? '' : p.kind === 'gg'
      ? `  ·  pred. (drawing) ${Math.round(p.rpm)} rpm, Pc ${fmt(p.Pc - 101325, 'pressure')} ${unitLabel('pressure', true)}, F ${fmt(p.F, 'force')} ${unitLabel('force')}, MR ${p.MR.toFixed(2)}, TIT ${Math.round(p.TIT)} K`
      : p.kind === 'ggcold'
      ? `  ·  pred. (drawing) ${Math.round(p.rpm)} rpm on start gas, ox ${fmt(p.mdotOx, 'massflow')}, fuel ${fmt(p.mdotFu, 'massflow')} ${unitLabel('massflow')} water`
      : p.kind === 'pump'
      ? `  ·  pred. ${Math.round(p.rpm)} rpm: heads ${p.headOx.toFixed(0)} / ${p.headFu.toFixed(0)} m, drive ${fmt(p.Ptin, 'pressure', 0)} ${unitLabel('pressure', true)}`
      : p.kind === 'coldflow'
      ? `  ·  pred. (drawing) ox ${fmt(p.mdotOx, 'massflow')}, fuel ${fmt(p.mdotFu, 'massflow')} ${unitLabel('massflow')} water`
      : p.kind === 'hotfire' ? (p.Pc > 0 ? `  ·  pred. (drawing) Pc ${fmt(p.Pc, 'pressure')} ${unitLabel('pressure', true)}, F ${fmt(p.F, 'force')} ${unitLabel('force')}, MR ${p.MR.toFixed(2)}` : '')
      : `  ·  pred. Pc ${fmt(p.Pc, 'pressure')} ${unitLabel('pressure', true)}, F ${fmt(p.F, 'force')} ${unitLabel('force')}`;
    this.loaded.append('Loaded: ', h('b', c.planText()), pt ? h('span', pt) : null);
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
