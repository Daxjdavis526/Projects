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
    const pages = [['__stand', 'TS-1 stand data'], ['__stand2', 'TS-2 stand data'], ['__honest', 'What is simulated, what is approximated']];
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
    this.doc.append(this.standPage(), this.standPage2(), this.honestPage());
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

  standPage2() {
    const def = STANDS['TS-2'], R = def.ratings, D = def.design;
    const el = h('div.gl-entry', { id: 'ref-__stand2' }, h('h3', 'TS-2 stand data (fictional)'));
    el.append(h('p', 'Nitrogen K-bottle → HV-600 → IV-601 → a header feeding three dome-loaded regulators: PR-610 (oxidiser tank T-710, 12 L), PR-620 (fuel tank T-720, 10 L) and PR-630 (purge). Each tank: check valve in, vent and relief, weigh scale under it, run line → main ball valve (MOV-713 / MFV-723) → turbine meter → injector manifold of BPE-1. Purge reaches each manifold through PV-631/632 and check valves CV-633/634.'));
    const t = h('table.metrics', { style: { maxWidth: '640px' } });
    const row = (a, b) => t.append(h('tr', h('td', a), h('td.v', b)));
    const P = x => `${fmt(x, 'pressure', 0)} psig`;
    row('Tank MEOP / relief / MAWP', `${P(R.TANK_MEOP)} / ${P(R.RELIEF_TANK)} / ${P(R.MAWP_TANK)}`);
    row('Personnel limit (cell open)', P(R.PERSONNEL_MAX));
    row('EPC limits: tanks / purge', `${P(R.REG_MAX_CMD)} / ${P(R.PURGE_MAX)}`);
    row('Purge needed before arming', P(R.PURGE_MIN));
    row('Simulant load (water)', `T-710 ${R.FILL_OX} kg, T-720 ${R.FILL_FU} kg`);
    row('Injector CdA, drawing: ox / fuel', `${(D.CdAox * 1e6).toFixed(2)} / ${(D.CdAfu * 1e6).toFixed(2)} mm²`);
    row('Propellant load (hot fire)', `T-710 ≈ ${(R.FILL_OX * 1.14).toFixed(1)} kg ${D.oxidiser}, T-720 ≈ ${(R.FILL_FU * 0.8).toFixed(1)} kg ${D.fuel}`);
    row('Throat / exit diameter', `${(D.throatDia * 1e3).toFixed(1)} / ${(D.exitDia * 1e3).toFixed(1)} mm (heat-sink copper chamber, uncooled)`);
    row('Burn limit / re-fire throat temperature', `${D.burnLimit} s at the design point / below ${fmt(R.WALL_REFIRE, 'temperature', 0)} °C`);
    row('Design point (hot)', `${D.oxidiser} ${(D.mdotOx * 1e3).toFixed(0)} g/s, ${D.fuel} ${(D.mdotFu * 1e3).toFixed(0)} g/s, MR ${D.MR.toFixed(2)}, injector ΔP ${fmt(D.dPinj, 'pressure', 0)} psi`);
    row('Propellant densities (fictional)', `${D.oxidiser} ${def.fluids[D.oxidiser].rho} kg/m³, ${D.fuel} ${def.fluids[D.fuel].rho} kg/m³, water ${def.fluids.water.rho} kg/m³`);
    el.append(t);
    el.append(h('p', { style: { marginTop: '14px' } }, h('b', 'Limits')));
    const lt = h('table.metrics', { style: { maxWidth: '760px' } });
    lt.append(h('tr.hd', h('td', 'Limit'), h('td', 'Channel'), h('td', 'Level'), h('td', 'Action')));
    for (const L of def.limits) lt.append(h('tr', h('td', L.text), h('td.v', L.channel), h('td', L.level), h('td', L.action === 'abort' ? 'AUTO-ABORT' : 'alarm')));
    el.append(lt);
    return el;
  }

  honestPage() {
    const el = h('div.gl-entry', { id: 'ref-__honest' }, h('h3', 'What is simulated, and what is approximated'));
    const items = [
      ['Modelled physically', 'Compressible (choked and unchoked) orifice flow through every restriction; mass and energy balance in six gas volumes; wall heat transfer; bottle blowdown and cooling; a dome-loaded regulator with droop, lock-up, supply-pressure effect and dropout; a relief valve with hysteresis; a solenoid valve with coil inductance, pull-in and drop-out currents and back-EMF; nozzle flow including subsonic, separated and attached regimes; a thrust stand with ringing and pressure tare.'],
      ['Approximated', 'Nitrogen is an ideal gas except for one real-gas effect, a constant Joule–Thomson coefficient across the regulator. Gas lines have no wave dynamics (no acoustic ringing). Flow separation uses a single Summerfield ratio; shocks inside the nozzle are folded into it. Heat transfer coefficients are tuned, not correlated. The near-equal-pressure part of the flow curve is linearised for numerical stability.'],
      ['Liquid feed (TS-2)', 'Incompressible liquid lines with lumped inertance (so a closing valve raises the upstream pressure — water hammer as a lumped surge, not a travelling wave); square-law resistances for line, valve and injector; a manifold that fills from dry while its gas escapes through the orifices, then cushions the liquid with the gas left trapped; tank ullage that grows and cools as liquid leaves. Not modelled: cavitation, two-phase flow beyond that fill fraction, line elasticity and acoustic modes, temperature-dependent liquid properties, the time the liquid takes to cross the chamber. The as-built injector differs from its drawing by a fixed few per cent — by design, so the cold flow has something to find.'],
      ['Combustion (TS-2)', 'One lumped chamber holding combustion products and nitrogen; products enter with the energy their characteristic velocity implies, from an invented c*(mixture ratio) table at 94 % efficiency; choked or unchoked throat; ideal nozzle with crude separation. Ignition is a rule (spark on, both propellants present in a flammable ratio, a few milliseconds of delay), not chemistry. Unlit liquid is spray that leaves in milliseconds plus a share that wets the wall and lingers; lit, it burns as fast as it can vaporise and pair — which is what makes a late light a hard start. Chug is an onset criterion on injector stiffness (ΔP/Pc below 0.2), screech appears only when a fault drives it; neither is a solution of the governing equations. The copper walls are two thermal nodes tuned to a 5 s burn limit with soak-back. The flame detector and accelerometer read invented functions of the chamber state.'],
      ['Regenerative cooling (BPE-2)', 'The liner is seven axial zones, each a thin copper-alloy node and the fuel in its channels, integrated implicitly. Gas-side heat transfer scales as Bartz\'s correlation does (Pc^0.8, area ratio^-0.9) with a tuned constant; coolant side as Dittus–Boelter (flow^0.8) with zone constants. FU-1 boils on an invented alcohol-like saturation curve; nucleate boiling helps, past a lumped critical heat flux (falling with less flow and less subcooling) a vapour film forms and holds until the wall cools. Coking is an empirical deposit rate above a threshold temperature; damage and cracking are a running overtemperature integral. The fuel\'s density does not change as it warms; its heat goes back to the chamber only in spirit (c* is not raised by it).'],
      ['Instruments', 'Every channel passes through a sensor model: response lag, zero offset, noise that grows with bandwidth, mains pickup, an anti-alias filter set by the sample rate, ADC quantisation and amplifier saturation. Zeroing is a software offset after conversion, as in a real DAQ.'],
      ['Not claimed', 'Numbers are plausible for a small research cold-gas thruster at sea level; they are not a prediction of any real hardware. The stand, the thruster, the engine, its propellants (OX-1, FU-1) and the procedures are invented.'],
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
