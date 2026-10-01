/* HARDWARE: build a cold-gas stand from your own parts. Edit every value a
   datasheet gives (and say where it came from), see the pre-test checks
   and a steady-state estimate as you type, predict a whole planned test,
   or open the stand in the control room and run it yourself.

   Configurations are kept in the browser and can be exported and imported
   as JSON — the same JSON a parts file in the repo uses. */

import { h, clear, btn } from '../dom.js';
import { toast, modal } from '../modal.js';
import { store } from '../store.js';
import { history, download } from '../history.js';
import { GROUPS, SOURCES, defaultConfig, complete, val } from '../../content/hardware/schema.js';
import { PRESETS } from '../../content/hardware/presets.js';
import { buildColdGasStand, checkConfig } from '../../content/stands/custom-coldgas.js';
import { predictColdGas } from '../../physics/predict.js';
import { predictTest, describePrediction } from '../../sim/predict-test.js';
import { STANDS } from '../../content/programs.js';
import { psi } from '../../lib/units.js';

const uid = () => Math.random().toString(36).slice(2, 9);

export class HardwareView {
  constructor(host, app) {
    this.app = app;
    this.host = host;
    store.data.hardware ||= [];
    this.sel = store.data.hardwareSel || null;
    this.plan = { regSet: 150, mode: 'single', duration: 2, on: 20, off: 80, count: 10, rate: 2000 };
    this.root = h('div.split', { style: { gridTemplateColumns: '250px minmax(620px, 1fr) 400px' } });
    host.append(this.root);
    this.render();
  }

  get configs() { return store.data.hardware; }
  get cfg() { return this.configs.find(c => c.id === this.sel) || null; }
  save() { store.data.hardwareSel = this.sel; store.save(); }

  render() {
    clear(this.root);
    this.root.append(this.listPanel());
    const c = this.cfg;
    if (!c) {
      this.root.append(h('div.panel', h('div.ph', h('span.t', 'Custom hardware')), h('div.pb', { style: { padding: '14px', lineHeight: 1.6, maxWidth: '640px' } },
        h('p', 'Describe your own cold-gas test stand — bottle, regulator, lines, solenoid, thruster, load cell, transducers — from the parts\' datasheets, and REDLINE builds it: the same control room, instruments, redlines and data reduction as TS-1, running your hardware.'),
        h('p', 'Then predict a test before you run it — chamber pressure, thrust, flow, droop, valve timing, the whole recorded run — and, after you run it, compare.'),
        h('p.faint', 'Start from a preset on the left, or a new configuration at the TS-1 reference values. Every value carries where it came from — datasheet, measured, estimate — and the prediction is only as good as the estimates.'))), h('div.panel'));
      return;
    }
    this.root.append(this.editor(c), this.side(c));
    this.refreshSide();
  }

  listPanel() {
    const list = h('div.pb.list');
    list.append(h('div.proc-sec', 'Your configurations'));
    if (!this.configs.length) list.append(h('div.faint', { style: { padding: '6px 10px', fontSize: '11.5px' } }, 'None yet.'));
    for (const c of this.configs) {
      const est = Object.values(c.f).filter(x => x.src === 'default' || x.src === 'estimate').length;
      list.append(h('div.li' + (c.id === this.sel ? '.sel' : ''), { onclick: () => { this.sel = c.id; this.save(); this.render(); } },
        h('div.a', h('b', c.name)), h('div.b', `${est} default/estimated value${est === 1 ? '' : 's'}`)));
    }
    list.append(h('div.proc-sec', 'Start from'));
    for (const p of PRESETS) list.append(h('div.li', { onclick: () => this.add(p.make(), p.newName || p.name) }, h('div.a', h('span', p.name)), h('div.b', p.blurb)));
    const file = h('input', { type: 'file', accept: '.json,application/json', style: { display: 'none' }, onchange: e => this.importFile(e.target.files[0]) });
    return h('div.panel', h('div.ph', h('span.t', 'Hardware'), h('span.sp'), btn('Import', () => file.click(), 'sm ghost', { title: 'Import a configuration (JSON)' }), file), list);
  }

  add(cfg, name) {
    const c = { ...complete(cfg), id: uid(), name };
    this.configs.push(c); this.sel = c.id; this.save(); this.render();
  }

  async importFile(f) {
    if (!f) return;
    try {
      const j = JSON.parse(await f.text());
      const c = { ...complete(j), id: uid() };
      this.configs.push(c); this.sel = c.id; this.save(); this.render();
      toast('Imported', c.name, 'info');
    } catch (e) { toast('Not a configuration', String(e.message || e), 'info'); }
  }

  editor(c) {
    const body = h('div.pb', { style: { padding: '4px 0 40px' } });
    const name = h('input.in', { value: c.name, style: { width: '260px', fontFamily: 'var(--sans)' }, onchange: () => { c.name = name.value || 'Unnamed'; this.save(); this.render(); } });
    const head = h('div.ph', h('span.t', 'Configuration'), name, h('span.sp'),
      btn('Duplicate', () => this.add(JSON.parse(JSON.stringify(c)), c.name + ' (copy)'), 'sm ghost'),
      btn('Export JSON', () => download(`${c.name.replace(/[^\w]+/g, '-')}.redline-hw.json`, JSON.stringify({ name: c.name, version: 1, f: c.f }, null, 2), 'application/json'), 'sm ghost'),
      btn('Delete', () => { if (confirm(`Delete "${c.name}"?`)) { this.configs.splice(this.configs.indexOf(c), 1); this.sel = null; this.save(); this.render(); } }, 'sm ghost'));
    for (const g of GROUPS) {
      body.append(h('div.proc-sec', g.title));
      for (const f of g.fields) body.append(this.fieldRow(c, f));
    }
    return h('div.panel', head, body);
  }

  fieldRow(c, f) {
    const cur = c.f[f.k];
    const commit = () => { this.save(); this.refreshSide(); };
    let input;
    if (f.type === 'sel') {
      input = h('select.in', { onchange: () => { cur.v = input.value; markSrc(); commit(); } }, f.opts.map(([v, l]) => h('option', { value: v }, l)));
      input.value = cur.v;
    } else if (f.type === 'bool') {
      input = h('input', { type: 'checkbox', checked: !!cur.v, onchange: () => { cur.v = input.checked; markSrc(); commit(); } });
    } else if (f.type === 'text') {
      input = h('input.in', { value: cur.v, onchange: () => { cur.v = input.value; commit(); } });
    } else {
      input = h('input.in', { type: 'number', step: 'any', value: cur.v, onchange: () => { const x = parseFloat(input.value); if (Number.isFinite(x)) { cur.v = x; markSrc(); commit(); } else input.value = cur.v; } });
    }
    const src = h('select.in.src', { onchange: () => { cur.src = src.value; row.dataset.src = cur.src; commit(); } }, SOURCES.map(([v, l]) => h('option', { value: v }, l)));
    src.value = cur.src;
    // editing a default value makes it the operator's: an estimate until they say otherwise
    const markSrc = () => { if (cur.src === 'default') { cur.src = 'estimate'; src.value = 'estimate'; row.dataset.src = 'estimate'; } };
    const note = h('input.in.note', { value: cur.note || '', placeholder: 'source / note', onchange: () => { cur.note = note.value; commit(); } });
    const row = h('div.hwf', { dataset: { src: cur.src }, title: f.help || '' },
      h('span.l', f.label, f.help ? h('span.q', ' ?') : null), input, h('span.u', f.unit || ''), f.type === 'text' ? h('span') : src, f.type === 'text' ? h('span') : note);
    return row;
  }

  side(c) {
    this.sideBox = h('div.pb');
    const p = this.plan;
    const num = (k, step, w = '70px') => h('input.in', { type: 'number', step, value: p[k], style: { width: w }, onchange: e => { p[k] = parseFloat(e.target.value) || p[k]; this.refreshSide(); } });
    const mode = h('select.in', { onchange: () => { p.mode = mode.value; this.render(); } }, [['single', 'Single burn'], ['pulse', 'Pulse train']].map(([v, l]) => h('option', { value: v }, l)));
    mode.value = p.mode;
    const rate = h('select.in', { onchange: () => { p.rate = +rate.value; } }, [500, 1000, 2000, 5000].map(r => h('option', { value: r }, `${r} Hz`)));
    rate.value = p.rate;
    this.predOut = h('div', { style: { padding: '6px 10px', fontSize: '12px', lineHeight: 1.55 } });
    const planBox = h('div', { style: { padding: '6px 10px', display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '5px 10px', alignItems: 'center', fontSize: '12px' } },
      h('span', 'Regulator set'), h('span', num('regSet', 5), ' psig'),
      h('span', 'Firing'), mode,
      ...(p.mode === 'pulse' ? [h('span', 'Pulses'), h('span', num('on', 1, '56px'), ' ms on ', num('off', 5, '56px'), ' ms off × ', num('count', 1, '50px'))]
        : [h('span', 'Duration'), h('span', num('duration', 0.5), ' s')]),
      h('span', 'DAQ rate'), rate);
    this.predBtn = btn('Predict this test', () => this.predict(c), 'sm primary');
    return h('div.panel',
      h('div.ph', h('span.t', 'Plan, checks, prediction')),
      h('div.proc-sec', 'Test plan'), planBox,
      h('div', { style: { padding: '4px 10px 8px', display: 'flex', gap: '6px', flexWrap: 'wrap' } }, this.predBtn,
        btn('Open the stand', () => this.open(c), 'sm', { title: 'Start an open-stand session on this hardware: the control room, your parts' })),
      this.predOut, this.sideBox);
  }

  refreshSide() {
    const c = this.cfg; if (!c || !this.sideBox) return;
    clear(this.sideBox);
    const set = this.plan.regSet;
    let def;
    try { def = buildColdGasStand(c); } catch (e) { this.sideBox.append(h('p', { style: { color: 'var(--warning)', padding: '0 10px' } }, `Cannot build: ${e.message}`)); return; }
    const est = predictColdGas(def, { supplyGauge: psi(val(c, 'fillP')), regSet: psi(set) });
    this.sideBox.append(h('div.proc-sec', `Steady state at ${set} psig, full bottle`),
      h('div.kv', { style: { padding: '4px 10px', fontSize: '12px' } },
        h('span.k', 'Chamber pressure'), h('span.v', `${(est.Pc / 6894.757).toFixed(1)} psig`),
        h('span.k', 'Regulator outlet (flowing)'), h('span.v', `${(est.Plp / 6894.757).toFixed(1)} psig`),
        h('span.k', 'Fire-valve inlet'), h('span.v', `${(est.Pfeed / 6894.757).toFixed(1)} psig`),
        h('span.k', 'Thrust'), h('span.v', `${est.F.toFixed(3)} N`),
        h('span.k', 'Mass flow'), h('span.v', `${(est.mdot * 1e3).toFixed(2)} g/s`),
        h('span.k', 'Isp (sea level)'), h('span.v', `${est.Isp.toFixed(1)} s`),
        h('span.k', 'Thrust coefficient'), h('span.v', est.Cf.toFixed(3))));
    const checks = checkConfig(c, { regSet: set });
    this.sideBox.append(h('div.proc-sec', 'Pre-test checks'));
    const col = { error: 'var(--redline)', warn: 'var(--caution)', info: 'var(--ink-3)' };
    for (const k of checks) this.sideBox.append(h('div', { style: { padding: '3px 10px', fontSize: '11.5px', lineHeight: 1.45, color: col[k.level] } }, `${k.level === 'error' ? '✕ ' : k.level === 'warn' ? '! ' : '· '}${k.text}`));
    const soft = Object.entries(c.f).filter(([, x]) => x.src === 'default' || x.src === 'estimate');
    if (soft.length) this.sideBox.append(h('div.proc-sec', 'Values the prediction leans on most'),
      h('p.faint', { style: { padding: '0 10px', fontSize: '11.5px', lineHeight: 1.5 } },
        ['throat', 'Cd', 'regCv', 'droopP', 'svCv', 'feedID', 'filtCv', 'svTopen'].filter(k => soft.some(([kk]) => kk === k)).map(k => k).join(', ') || '—',
        ' — still default or estimated. Measure or look these up first.'));
  }

  async predict(c) {
    let def;
    try { def = buildColdGasStand(c); } catch (e) { toast('Cannot build', e.message, 'info'); return; }
    STANDS[def.id] = def;
    this.predBtn.disabled = true;
    clear(this.predOut); this.predOut.append(h('span.faint', 'Running the test…'));
    const prefix = 'PRED';
    try {
      const res = await predictTest(def, { ...this.plan, seed: 1 }, {
        runPrefix: prefix, firstRun: store.data.nextRun[prefix] || 1,
        onProgress: ({ label }) => { clear(this.predOut); this.predOut.append(h('span.faint', `Running the test… ${label}`)); } });
      store.data.nextRun[prefix] = res.session.nextRun; store.save();
      clear(this.predOut);
      if (!res.run) { this.predOut.append(h('p', 'No run was recorded. ' + res.session.log.filter(e => e.cat === 'OPR' || e.cat === 'ALM').slice(-3).map(e => e.text).join(' '))); return; }
      await history.save(res.run, { level: `Prediction · ${c.name}` });
      this.predOut.append(h('div.proc-sec', `Predicted: ${res.run.id}`),
        ...describePrediction(res, def).map(t => h('div', { style: { padding: '2px 0' } }, t)),
        h('div', { style: { marginTop: '6px' } }, btn('Open in ANALYSIS', () => { this.app.show('analysis'); this.app.views.analysis.focus(res.run.id); }, 'sm')));
    } catch (e) {
      clear(this.predOut); this.predOut.append(h('p', { style: { color: 'var(--warning)' } }, `Prediction failed: ${e.message}`));
    } finally { this.predBtn.disabled = false; }
  }

  open(c) {
    let def;
    try { def = buildColdGasStand(c); } catch (e) { toast('Cannot build', e.message, 'info'); return; }
    STANDS[def.id] = def;
    const m = modal({ title: `Open the stand: ${c.name}`, narrow: true,
      body: h('div', h('p', 'An open-stand session on your hardware: every control, the poll, the redlines and the reductions — no procedure. Choose the rules.'),
        h('p.faint', 'No faults are injected on custom hardware: what you see is your parts as described.')),
      footer: [btn('Cancel', () => m.close(), 'ghost'), btn('Guided rules', () => { m.close(); this.app.startDef(def, 'guided'); }, 'sm'), btn('Independent rules', () => { m.close(); this.app.startDef(def, 'independent'); }, 'sm primary')] });
  }

  onShow() { this.render(); this.refreshSide(); }
}
