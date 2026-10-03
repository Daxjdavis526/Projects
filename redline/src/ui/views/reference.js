/* Reference: the glossary, the stand's data, and what the simulator
   models honestly versus approximates. */
import { h, clear } from '../dom.js';
import { GLOSSARY, CATEGORIES } from '../../content/glossary.js';
import { fmt, unitLabel, psi } from '../../lib/units.js';
import { STANDS } from '../../content/programs.js';
import { GAS_MAIN, MR_STOICH } from '../../physics/propellants.js';

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
    const pages = [['__stand', 'TS-1 stand data'], ['__stand2', 'TS-2 stand data'], ['__stand2r', 'TS-2 with BPE-2 (regen) data'], ['__stand3', 'TS-3 turbopump stand data'], ['__stand3g', 'TS-3G gas-generator engine data'], ['__honest', 'What is simulated, what is approximated']];
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
    this.doc.append(this.standPage(), this.standPage2(), this.standPage2R(), this.standPage3(), this.standPage3G(), this.honestPage());
  }

  standPage() {
    const def = STANDS['TS-1'];
    const R = def.ratings;
    const el = h('div.gl-entry', { id: 'ref-__stand' }, h('h3', 'TS-1 stand data (fictional)'));
    el.append(h('p', 'Nitrogen K-bottle → HV-100 bottle valve → IV-101 remote isolation → PR-101 dome-loaded regulator (EPC-101) → F-201 filter → SV-301 fire valve → CGT-1 thruster on a flexure thrust stand (LC-501). Vents VV-101 (regulator inlet) and VV-201 (feed line) are normally open; RV-201 protects the low-pressure side.'));
    const t = h('table.metrics', { style: { maxWidth: '640px' } });
    const row = (a, b) => t.append(h('tr', h('td', a), h('td.v', b)));
    row('MEOP, low-pressure side', `${fmt(R.MEOP_LP, 'pressure', 0)} ${unitLabel('pressure', true)}`);
    row('RV-201 set', `${fmt(R.RELIEF_LP, 'pressure', 0)} ${unitLabel('pressure', true)}`);
    row('MAWP, low-pressure side', `${fmt(R.MAWP_LP, 'pressure', 0)} ${unitLabel('pressure', true)}`);
    row('Personnel limit (cell open)', `${fmt(R.PERSONNEL_MAX, 'pressure', 0)} ${unitLabel('pressure', true)}`);
    row('EPC command limit', `${fmt(R.REG_MAX_CMD, 'pressure', 0)} ${unitLabel('pressure', true)}`);
    row('Minimum supply for a test', `${fmt(R.SUPPLY_MIN, 'pressure', 0)} ${unitLabel('pressure', true)}`);
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
    const P = x => `${fmt(x, 'pressure', 0)} ${unitLabel('pressure', true)}`;
    row('Tank MEOP / relief / MAWP', `${P(R.TANK_MEOP)} / ${P(R.RELIEF_TANK)} / ${P(R.MAWP_TANK)}`);
    row('Personnel limit (cell open)', P(R.PERSONNEL_MAX));
    row('EPC limits: tanks / purge', `${P(R.REG_MAX_CMD)} / ${P(R.PURGE_MAX)}`);
    row('Purge needed before arming', P(R.PURGE_MIN));
    row('Simulant load (water)', `T-710 ${R.FILL_OX} kg, T-720 ${R.FILL_FU} kg`);
    row('Injector CdA, drawing: ox / fuel', `${(D.CdAox * 1e6).toFixed(2)} / ${(D.CdAfu * 1e6).toFixed(2)} mm²`);
    row('Propellant load (hot fire)', `T-710 ≈ ${(R.FILL_OX * def.fluids[D.oxidiser].rho / 998).toFixed(1)} kg ${D.oxidiser}, T-720 ≈ ${(R.FILL_FU * def.fluids[D.fuel].rho / 998).toFixed(1)} kg ${D.fuel}`);
    row('Throat / exit diameter', `${(D.throatDia * 1e3).toFixed(1)} / ${(D.exitDia * 1e3).toFixed(1)} mm (heat-sink copper chamber, uncooled)`);
    row('Burn limit / re-fire throat temperature', `${D.burnLimit} s at the design point / below ${fmt(R.WALL_REFIRE, 'temperature', 0)} °C`);
    row('Design point (hot)', `${D.oxidiser} ${(D.mdotOx * 1e3).toFixed(0)} g/s, ${D.fuel} ${(D.mdotFu * 1e3).toFixed(0)} g/s, MR ${D.MR.toFixed(2)}, injector ΔP ${fmt(D.dPinj, 'pressure', 0)} ${unitLabel('pressure', 'd')}`);
    row('Propellant densities', `${D.oxidiser} ${def.fluids[D.oxidiser].rho} kg/m³ (at its boiling point, 90 K), ${D.fuel} ${def.fluids[D.fuel].rho} kg/m³ (20 °C), water ${def.fluids.water.rho} kg/m³`);
    row('Propellant combustion', `NASA CEA equilibrium: ideal c* ${GAS_MAIN.cstar(D.MR, D.Pc + 101325).toFixed(0)} m/s, ${GAS_MAIN.Tc(D.MR, D.Pc + 101325).toFixed(0)} K at the design MR and Pc; stoichiometric MR ${MR_STOICH.toFixed(2)}`);
    el.append(t);
    el.append(...this.limitsTable(def.limits));
    return el;
  }

  limitsTable(limits) {
    const lt = h('table.metrics', { style: { maxWidth: '760px' } });
    lt.append(h('tr.hd', h('td', 'Limit'), h('td', 'Channel'), h('td', 'Level'), h('td', 'Action')));
    for (const L of limits) lt.append(h('tr', h('td', L.text), h('td.v', L.channel), h('td', L.level), h('td', L.action === 'abort' ? 'AUTO-ABORT' : 'alarm')));
    return [h('p', { style: { marginTop: '14px' } }, h('b', 'Limits')), lt];
  }

  standPage2R() {
    const def = STANDS['TS-2R'], D = def.design, J = def.physics.regen, R = def.ratings;
    const el = h('div.gl-entry', { id: 'ref-__stand2r' }, h('h3', 'TS-2 with BPE-2, regeneratively cooled (fictional)'));
    el.append(h('p', 'The same stand as TS-2 with BPE-2 in place of BPE-1. All the fuel runs through a milled-channel jacket from the nozzle exit to the injector before it is injected: PT-729 at the jacket inlet, PT-725 and TC-728 at the injector fuel manifold, TC-727 on the fuel run line. Tanks, regulators, valves and purge are TS-2\'s.'));
    const t = h('table.metrics', { style: { maxWidth: '640px' } });
    const row = (a, b) => t.append(h('tr', h('td', a), h('td.v', b)));
    const C = x => `${fmt(x, 'temperature', 0)} ${unitLabel('temperature')}`;
    row('Jacket', `${J.segments.length} zones, ${(J.Vjacket * 1e6).toFixed(0)} cc, counterflow, copper liner ${(J.liner.t * 1e3).toFixed(1)} mm`);
    row('Jacket ΔP at the design fuel flow', `${fmt(D.dPjacket, 'pressure', 0)} ${unitLabel('pressure', 'd')}`);
    row('Coolant inlet temperature, maximum', C(R.COOLANT_MAX_IN));
    row('Coking onset (ethanol film on the wall)', C(J.Tcoke));
    row('Liner damage above (hot face)', C(J.Tdamage));
    row('Critical heat flux at design flow, saturated', `${(J.qchf0 / 1e6).toFixed(1)} MW/m²`);
    row('Burn limit', `${D.burnLimit} s (no heat sink to fill: the tanks and the stand rating set it)`);
    el.append(t);
    el.append(...this.limitsTable(def.limits));
    return el;
  }

  standPage3() {
    const def = STANDS['TS-3'], R = def.ratings, TP = def.physics.turbopump, D = def.design;
    const el = h('div.gl-entry', { id: 'ref-__stand3' }, h('h3', 'TS-3 turbopump component stand (fictional)'));
    el.append(h('p', 'A 300 L nitrogen bank → HV-300 → IV-301 → a header feeding two RELIEVING tank regulators (PR-410, PR-420) and the turbine drive regulator PR-330. Each 60 L run tank feeds its pump of TPA-1 through a short suction line; each pump discharges through a ball valve (DV-414 / DV-424), a turbine flowmeter and a throttle valve (FCV-418 / FCV-428) into the catch tank. The drive gas reaches the turbine through TSV-332 and leaves up the exhaust stack. The speed controller SC-330 holds the planned speed by moving PR-330\'s dome.'));
    const t = h('table.metrics', { style: { maxWidth: '640px' } });
    const row = (a, b) => t.append(h('tr', h('td', a), h('td.v', b)));
    const P = x => `${fmt(x, 'pressure', 0)} ${unitLabel('pressure', true)}`;
    row('Design speed / redline', `${TP.Nd.toLocaleString('en-US')} rpm / ${Math.round(R.N_REDLINE).toLocaleString('en-US')} rpm (110 %); plans limited to 105 %`);
    row('Ox pump (designed for LOX)', `${D.ox.H0} m at ${(D.ox.mdot / D.ox.rho * 1e3).toFixed(2)} L/s, efficiency ${D.ox.eta}, NPSH required ${D.ox.npshr0} m at design`);
    row('Fuel pump (designed for ethanol)', `${D.fu.H0} m at ${(D.fu.mdot / D.fu.rho * 1e3).toFixed(2)} L/s, efficiency ${D.fu.eta}, NPSH required ${D.fu.npshr0} m at design`);
    row('Turbine', `impulse, mean blade radius ${(TP.turbine.rm * 1e3).toFixed(0)} mm, nozzle CdA ${(def.physics.elements.find(e => e.id === 'TNZ-337').CdA * 1e6).toFixed(0)} mm²`);
    row('Rotor inertia', `${TP.J.toExponential(2)} kg·m²`);
    row('Tank MEOP / relief / MAWP', `${P(R.TANK_MEOP)} / ${P(R.RELIEF_TANK)} / ${P(R.MAWP_TANK)}`);
    row('Drive regulator EPC limit / relief', `${P(R.DRIVE_MAX)} / ${P(def.physics.elements.find(e => e.id === 'RV-331').set)}`);
    row('Minimum tank pressure (except a suction test)', P(R.NPSH_MIN_TANK));
    row('Water per tank / reserve', `${R.FILL_OX} kg / ${R.TANK_RESERVE} kg above the 4 kg low-level redline`);
    el.append(t);
    el.append(...this.limitsTable(def.limits));
    return el;
  }

  standPage3G() {
    const def = STANDS['TS-3G'], R = def.ratings, D = def.design, ph = def.physics, G = ph.gg, C = ph.chamber;
    const el = h('div.gl-entry', { id: 'ref-__stand3g' }, h('h3', 'TS-3G gas-generator engine stand (fictional)'));
    el.append(h('p', 'TS-3 rebuilt to fire BPE-3. TPA-1 takes LOX and ethanol from the 60 L run tanks at about 50 psig and delivers them through the main valves MOV-414 and MFV-424 to the main injector. Off each pump discharge a tap runs through a GG valve (GOV-416, GFV-426), a GG throttle (GCV-417, GCV-427) and a calibrated orifice into the gas generator, whose outlet is the turbine manifold; the turbine exhausts up a duct to the berm. For the start, PR-330 and the turbine start valve TSV-332 put nitrogen into the gas generator volume. PR-630 feeds three purges: both main injector manifolds and the gas generator.'));
    const t = h('table.metrics', { style: { maxWidth: '640px' } });
    const row = (a, b) => t.append(h('tr', h('td', a), h('td.v', b)));
    const P = x => `${fmt(x, 'pressure', 0)} ${unitLabel('pressure', true)}`;
    const mm2 = x => `${(x * 1e6).toFixed(2)} mm²`;
    row('Design point (drawing)', `${Math.round(ph.turbopump.Nd).toLocaleString('en-US')} rpm, Pc ${(D.Pc / 1e6).toFixed(1)} MPa abs, MR ${D.MR}, GG MR ≈ 0.37 at ≈ 850 K`);
    row('Main chamber', `ablative, silica-phenolic liner ${(C.ablative.t * 1e3).toFixed(0)} mm in a steel case; throat Ø ${(D.throatDia * 1e3).toFixed(1)} mm, exit Ø ${(D.exitDia * 1e3).toFixed(0)} mm; design burn ${R.MAX_BURN} s`);
    row('Main injector CdA (drawing)', `ox ${mm2(D.CdAox)}, fuel ${mm2(D.CdAfu)}; as built ox ${Math.round((def.asBuilt.ox - 1) * 100)} %, fuel +${Math.round((def.asBuilt.fu - 1) * 100)} %`);
    row('GG orifice CdA (drawing)', `ox ${mm2(D.CdAggOx)}, fuel ${mm2(D.CdAggFu)}; the GG flow channels GGF-OX / GGF-FU are inferred from these`);
    row('Gas generator', `${(G.V * 1e6).toFixed(0)} cc; its throat is the turbine nozzle, Ø ${(D.turbNozzleDia * 1e3).toFixed(2)} mm equivalent; c* efficiency ${def.asBuilt.etaGG}`);
    row('Turbine inlet redline / caution', `${R.TIT_REDLINE} K / 960 K (TT-334)`);
    row('Speed redline', `${Math.round(R.N_REDLINE).toLocaleString('en-US')} rpm (110 %)`);
    row('Start gas', `${P(psi(120))} – ${P(R.START_MAX)} (PR-330, set by the sequencer); relief RV-331 at 500 psig`);
    row('Standard start', 'start gas T−3; pre-purge T−2; igniters T−0.5; TSV-332 T0; main valves T+0.45; GG fuel T+0.72, GG oxidiser T+0.75; start gas off T+1.10; igniters off T+2.0');
    row('Start checks (aborts)', 'Pc by T+0.9 (main light); TT-334 above 450 K by T+1.25 (GG light); speed above 80 % of the predicted mainstage between T+2.5 and T+3.5 (start hang)');
    row('Shutdown', 'GG oxidiser, GG fuel 30 ms later, main oxidiser 250 ms after the GG, main fuel 50 ms after that; three post-purges');
    row('Throttle range', `GG throttles ${Math.round(R.THR_MIN * 100)} – 100 %`);
    row('Propellant load', `${R.FILL_OX} kg LOX, ${R.FILL_FU} kg ethanol; water fill ${R.FILL_WATER} kg each`);
    row('Tank MEOP / minimum for the pumps', `${P(R.TANK_MEOP)} / ${P(R.NPSH_MIN_TANK)}`);
    row('Case re-fire limit', `TC-503 below ${(R.CASE_REFIRE - 273.15).toFixed(0)} °C`);
    el.append(t);
    el.append(...this.limitsTable(def.limits));
    return el;
  }

  honestPage() {
    const el = h('div.gl-entry', { id: 'ref-__honest' }, h('h3', 'What is simulated, and what is approximated'));
    const items = [
      ['Modelled physically', 'Compressible (choked and unchoked) orifice flow through every restriction; mass and energy balance in six gas volumes; wall heat transfer; bottle blowdown and cooling; a dome-loaded regulator with droop, lock-up, supply-pressure effect and dropout; a relief valve with hysteresis; a solenoid valve with coil inductance, pull-in and drop-out currents and back-EMF; nozzle flow including subsonic, separated and attached regimes; a thrust stand with ringing and pressure tare.'],
      ['Approximated', 'Nitrogen is an ideal gas except for one real-gas effect, a constant Joule–Thomson coefficient across the regulator. Gas lines have no wave dynamics (no acoustic ringing). Flow separation uses a single Summerfield ratio; shocks inside the nozzle are folded into it. Heat transfer coefficients are tuned, not correlated. The near-equal-pressure part of the flow curve is linearised for numerical stability.'],
      ['Liquid feed (TS-2)', 'Incompressible liquid lines with lumped inertance (so a closing valve raises the upstream pressure — water hammer as a lumped surge, not a travelling wave); square-law resistances for line, valve and injector; a manifold that fills from dry while its gas escapes through the orifices, then cushions the liquid with the gas left trapped; tank ullage that grows and cools as liquid leaves. Not modelled: cavitation, two-phase flow beyond that fill fraction, line elasticity and acoustic modes, temperature-dependent liquid properties, the time the liquid takes to cross the chamber. The as-built injector differs from its drawing by a fixed few per cent — by design, so the cold flow has something to find.'],
      ['Combustion (TS-2)', 'One lumped chamber holding combustion products and nitrogen; products enter with the energy their characteristic velocity implies, from NASA CEA\'s equilibrium c*, γ and temperature for LOX/ethanol against mixture ratio and chamber pressure, at 94 % c* efficiency (the products carry the γ and gas constant of the mixture they burned at); choked or unchoked throat; ideal nozzle with crude separation. Ignition is a rule (spark on, both propellants present in a flammable ratio, a few milliseconds of delay), not chemistry. Unlit liquid is spray that leaves in milliseconds plus a share that wets the wall and lingers; lit, it burns as fast as it can vaporise and pair — which is what makes a late light a hard start. Chug is an onset criterion on injector stiffness (ΔP/Pc below 0.2), screech appears only when a fault drives it; neither is a solution of the governing equations. The copper walls are two thermal nodes tuned to a 5 s burn limit with soak-back. The flame detector and accelerometer read invented functions of the chamber state.'],
      ['Regenerative cooling (BPE-2)', 'The liner is seven axial zones, each a thin copper-alloy node and the fuel in its channels, integrated implicitly. Gas-side heat transfer scales as Bartz\'s correlation does (Pc^0.8, area ratio^-0.9) with a tuned constant; coolant side as Dittus–Boelter (flow^0.8) with zone constants. The ethanol boils on its own saturation curve (an Antoine fit); nucleate boiling helps, past a lumped critical heat flux (falling with less flow and less subcooling) a vapour film forms and holds until the wall cools. Coking is an empirical deposit rate above a threshold temperature; damage and cracking are a running overtemperature integral. The fuel\'s density does not change as it warms in the jacket; its heat goes back to the chamber only in spirit (c* is not raised by it).'],
      ['Turbopump (TS-3)', 'Each pump is a parabolic head–flow curve scaled by the affinity laws (head ∝ speed², flow ∝ speed), added as a pressure source to its liquid line\'s momentum equation; its shaft power is a shutoff share plus a share rising with flow, so efficiency emerges rather than being looked up. Cavitation is a single factor on head (and partly on torque) from NPSH available against an NPSH required that scales with speed² and flow — no bubble dynamics, no inducer backflow, no rotating cavitation. The pump casing holds a lumped mass of liquid that heats with the power not delivered as head. The turbine is a one-dimensional impulse stage: Euler torque from a spouting velocity, a nozzle velocity coefficient, a blade-velocity coefficient and one lumped loss factor; the drive gas leaves colder by exactly the work done. The shaft has one inertia, two bearings with linear friction and lumped thermal nodes, and windage. Vibration is an invented RMS figure (imbalance ∝ speed², cavitation, bearing distress). No rotordynamics: no critical speeds, no whirl, no axial thrust balance. The speed controller is a PI loop with feed-forward from the steady prediction, acting on the DAQ\'s readings.'],
      ['Gas-generator engine (TS-3G)', 'The gas generator is a second lumped chamber of the same kind as the main one, burning fuel-rich: its gas is CEA\'s fuel-rich equilibrium with methane and soot suppressed (the usual stand-in for chemistry too slow to happen in the time the gas spends there — the real temperature of a fuel-rich gas generator is set by kinetics and measured, and this is an approximation of it), with the γ and gas constant of the mixture ratio it burns at, and the turbine is fed straight from it — the turbine nozzle is its throat. The taps are quasi-steady orifice flows off each pump discharge, lagged a few milliseconds; the pumps see the main and the tap flow together. The cycle closes through the shaft with nothing else: no turbine-inlet duct dynamics, no heat lost from the gas generator\'s gas to its walls worth the name, no afterburning in the exhaust (that flame on the cameras is drawn, not computed). The start gas and the gas generator\'s gas mix in one volume. The ablative chamber is one char front with a fixed rate law scaled by chamber pressure, a throat that erodes at a fixed rate, and a case node behind a conductance that grows as the liner thins — no pyrolysis gas, no spalling, no uneven char. The steady predictor balances turbine and pump power by bisection on speed; the transient model is a separate integration and agrees with it to a few per cent, which is the honest size of the difference.'],
      ['Instruments', 'Every channel passes through a sensor model: response lag, zero offset, noise that grows with bandwidth, mains pickup, an anti-alias filter set by the sample rate, ADC quantisation and amplifier saturation. Zeroing is a software offset after conversion, as in a real DAQ.'],
      ['Not claimed', 'Numbers are plausible for a small research cold-gas thruster, engine and turbopump at sea level; they are not a prediction of any real hardware. The stands, the thruster, the engines, the turbopump and the procedures are invented; the propellants, LOX and ethanol, are real, and their combustion is NASA CEA\'s. LOX is modelled simply: one temperature per tank, heat leak, boil-off, density and vapour pressure from its temperature — no stratification, no chill-down of the lines, no geysering, and the pressurant does not cool or condense on it.'],
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
