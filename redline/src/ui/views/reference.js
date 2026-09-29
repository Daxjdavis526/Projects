/* Reference: the glossary, the stand's data, and what the simulator
   models honestly versus approximates. */
import { h, clear } from '../dom.js';
import { GLOSSARY, CATEGORIES } from '../../content/glossary.js';
import { fmt, unitLabel, psi } from '../../lib/units.js';
import { STANDS } from '../../content/programs.js';

export class ReferenceView {
  constructor(host, app) {
    this.app = app;
    this.host = host;
    this.q = '';
    const root = h('div.gloss');
    this.list = h('div.pb.list');
    this.search = h('input.in', { placeholder: 'Search…', style: { width: '100%', fontFamily: 'var(--sans)' }, oninput: () => { this.q = this.search.value.toLowerCase(); this.renderList(); } });
    root.append(h('div.panel', h('div.ph', h('span.t', 'Reference')), h('div', { style: { padding: '6px' } }, this.search), this.list));
    this.doc = h('div.pb');
    root.append(h('div.panel', this.doc));
    host.append(root);
    this.renderList();
    this.renderDoc();
  }

  renderList() {
    clear(this.list);
    const pages = [['__stand', 'TS-1 stand data'], ['__honest', 'What is simulated, what is approximated']];
    for (const [id, t] of pages) if (!this.q || t.toLowerCase().includes(this.q)) this.list.append(h('div.li', { onclick: () => this.go(id) }, h('div.a', h('span', t))));
    for (const [cat, name] of CATEGORIES) {
      const items = GLOSSARY.filter(g => g.cat === cat && (!this.q || (g.title + ' ' + g.body.join(' ')).toLowerCase().includes(this.q)));
      if (!items.length) continue;
      this.list.append(h('div.proc-sec', name));
      for (const g of items) this.list.append(h('div.li', { onclick: () => this.go(g.id), dataset: { id: g.id } }, h('div.a', h('span', g.title))));
    }
  }

  renderDoc() {
    clear(this.doc);
    for (const [cat, name] of CATEGORIES) {
      this.doc.append(h('div', { style: { padding: '18px 22px 0' } }, h('div.cat', { style: { color: 'var(--ink-4)', fontSize: '10px', letterSpacing: '.14em', textTransform: 'uppercase' } }, name)));
      for (const g of GLOSSARY.filter(x => x.cat === cat)) {
        this.doc.append(h('div.gl-entry', { id: 'ref-' + g.id },
          h('h3', g.title),
          g.body.map(p => h('p', p)),
          g.see?.length ? h('div.see', 'See also: ', g.see.map(s => h('a', { onclick: () => this.go(s) }, this.app.refTitle(s)))) : null));
      }
    }
    this.doc.append(this.standPage(), this.honestPage());
  }

  standPage() {
    const def = STANDS['TS-1'];
    const R = def.ratings;
    const el = h('div.gl-entry', { id: 'ref-__stand' }, h('h3', 'TS-1 stand data (fictional)'));
    el.append(h('p', 'Nitrogen K-bottle → HV-100 bottle valve → IV-101 remote isolation → PR-101 dome-loaded regulator (EPC-101) → F-201 filter → SV-301 fire valve → CGT-1 thruster on a flexure thrust stand (LC-501). Vents VV-101 (regulator inlet) and VV-201 (feed line) are normally open; RV-201 protects the low-pressure side.'));
    const t = h('table.metrics', { style: { maxWidth: '640px' } });
    const row = (a, b) => t.append(h('tr', h('td', a), h('td.v', b)));
    row('MEOP, low-pressure side', `${fmt(R.MEOP_LP, 'pressure', 0)} psig`);
    row('RV-201 set', `${fmt(R.RELIEF_LP, 'pressure', 0)} psig`);
    row('MAWP, low-pressure side', `${fmt(R.MAWP_LP, 'pressure', 0)} psig`);
    row('Personnel limit (cell open)', `${fmt(R.PERSONNEL_MAX, 'pressure', 0)} psig`);
    row('EPC command limit', `${fmt(R.REG_MAX_CMD, 'pressure', 0)} psig`);
    row('Minimum supply for a test', `${fmt(R.SUPPLY_MIN, 'pressure', 0)} psig`);
    row('Longest single burn', `${R.MAX_BURN} s`);
    row('Throat / exit (drawing)', `${(def.nominal.throatDia * 1e3).toFixed(2)} / ${(def.physics.elements.find(e => e.type === 'nozzle').nozzle.exitDia * 1e3).toFixed(2)} mm`);
    el.append(t);
    el.append(h('p', { style: { marginTop: '14px' } }, h('b', 'Limits')));
    const lt = h('table.metrics', { style: { maxWidth: '760px' } });
    lt.append(h('tr.hd', h('td', 'Limit'), h('td', 'Channel'), h('td', 'Level'), h('td', 'Action'), h('td', 'Condition')));
    for (const L of def.limits) {
      const q = def.sensors.find(x => x.id === L.channel)?.quantity || 'pressure';
      const val = x => `${fmt(x, q, q === 'force' || q === 'current' ? 2 : 0)} ${unitLabel(q, q === 'pressure' ? true : undefined)}`;
      lt.append(h('tr', h('td', L.text), h('td.v', L.channel), h('td', L.level), h('td', L.action === 'abort' ? 'AUTO-ABORT' : 'alarm'),
        h('td.n', `${L.hi !== undefined ? (typeof L.hi === 'function' ? 'HI (relative to setpoint/prediction)' : `HI ${val(L.hi)}`) : ''} ${L.lo !== undefined ? (typeof L.lo === 'function' ? 'LO (relative to setpoint/prediction)' : `LO ${val(L.lo)}`) : ''} · persist ${L.persist ?? 0} s`)));
    }
    el.append(lt);
    return el;
  }

  honestPage() {
    const el = h('div.gl-entry', { id: 'ref-__honest' }, h('h3', 'What is simulated, and what is approximated'));
    const items = [
      ['Modelled physically', 'Compressible (choked and unchoked) orifice flow through every restriction; mass and energy balance in six gas volumes; wall heat transfer; bottle blowdown and cooling; a dome-loaded regulator with droop, lock-up, supply-pressure effect and dropout; a relief valve with hysteresis; a solenoid valve with coil inductance, pull-in and drop-out currents and back-EMF; nozzle flow including subsonic, separated and attached regimes; a thrust stand with ringing and pressure tare.'],
      ['Approximated', 'Nitrogen is an ideal gas except for one real-gas effect, a constant Joule–Thomson coefficient across the regulator. Lines have no wave dynamics (no water hammer, no acoustic ringing). Flow separation uses a single Summerfield ratio; shocks inside the nozzle are folded into it. Heat transfer coefficients are tuned, not correlated. The near-equal-pressure part of the flow curve is linearised for numerical stability.'],
      ['Instruments', 'Every channel passes through a sensor model: response lag, zero offset, noise that grows with bandwidth, mains pickup, an anti-alias filter set by the sample rate, ADC quantisation and amplifier saturation. Zeroing is a software offset after conversion, as in a real DAQ.'],
      ['Not claimed', 'Numbers are plausible for a small research cold-gas thruster at sea level; they are not a prediction of any real hardware. The stand, the thruster and the procedures are invented. Bipropellant combustion (phases 6–7) will be a lumped, quasi-steady model and will say so.'],
    ];
    for (const [k, v] of items) el.append(h('p', h('b', k + '. '), v));
    return el;
  }

  go(id) {
    const el = this.doc.querySelector('#ref-' + CSS.escape(id));
    if (!el) return;
    el.scrollIntoView({ block: 'start' });
    el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash');
    for (const li of this.list.querySelectorAll('.li')) li.classList.toggle('sel', li.dataset.id === id);
  }
}
