/* Faults and inspections that only a regeneratively cooled engine has —
   BPE-2 on TS-2. Everything else TS-2 can suffer (igniter, injector,
   regulators, valves, instruments) it suffers too: the stand file adds
   these to TS-2's catalogue.

   A cooling fault is the most dangerous kind there is: the wall is a
   millimetre of copper with three thousand kelvin on one side, and it lives
   only as long as the fuel keeps up. Most of these are visible first as a
   temperature trend, then as a margin, then as an abort. */

import { psi, degC } from '../../lib/units.js';
import { FAILURE_MODES, ACTIONS, RIGHT_ACTION, CHECKS, CATEGORIES } from './ts2-faults.js';

const C = k => `${(k - 273.15).toFixed(0)} °C`;
const segName = { c1: 'barrel, injector end', c2: 'barrel', c3: 'barrel, aft', cv: 'convergent', th: 'throat', d1: 'divergent', d2: 'nozzle exit' };

export const REGEN_FAULTS = [
  { id: 'jkt-blocked', component: 'JKT-2', mode: 'restricted', category: 'system', hazard: true, onset: 'start',
    params: rng => ({ b: 0.45 + rng.uniform(0, 0.12) }),
    apply: (S, p) => { S.model.jacket.seg_('th').block = p.b; S.model.jacket.seg_('cv').block = 0.5 * p.b; S.model.line('fu').jacketBlockage = 0.35 * p.b; },
    evidence: ['TC-803', 'DP-JKT', 'PT-729', 'jacket-flow', 'jacket-xray', 'prediction'],
    inspect: { 'jacket-flow': (S, p) => ({ lines: [
      ['Jacket CdA, water, 100 psid', `${(S.model.line('fu').CdAjacket * (1 - 0.6 * 0.35 * p.b) * 1e6).toFixed(2)} mm²`, `${(S.model.line('fu').CdAjacket * 1e6).toFixed(2)} mm² (acceptance)`],
      ['Thermal-transient zone check', `throat zone ${Math.round(100 * (1 - p.b))} % of nominal flow; convergent ${Math.round(100 * (1 - 0.5 * p.b))} %`, 'all zones 95–105 %']],
      text: 'Hot water through the jacket, an infrared camera on the outside of the shell: the throat zone warms up last. Something is in the channels there.' }),
      'jacket-xray': (S, p) => ({ lines: [['Throat-zone channels', `${Math.round(p.b * 24)} of 24 partly obstructed — dense debris`, 'all clear']],
        text: 'Machining swarf from the closeout, never flushed out of the channels.' }) },
    story: p => ({
      what: `About ${Math.round(100 * p.b)} % of the throat-zone channels were obstructed by machining debris. The jacket as a whole flowed nearly normally — so the outlet temperature hardly moved — but the throat, the highest heat flux on the engine, got a fraction of its coolant.`,
      indicators: 'TC-803 (throat liner) ran far hotter than on earlier runs while TC-802 (barrel) and TC-728 (coolant out) were nearly normal; the jacket ΔP (PT-729 − PT-725) was a little higher than the cold-flow value. A local problem, seen by the one instrument in the right place.',
      misleading: 'The coolant outlet temperature and the heat balance both look healthy: they average over the whole jacket. Cooling is lost locally, and a bulk number cannot see it.',
      notice: 'The jacket ΔP against the cold flow, before any fire; then TC-803 against the reference run in the first second of the burn.',
      abort: 'A genuine hazard: a starved zone goes to film boiling and burns through. The throat redline was right; firing again before the jacket is cleared would not be.',
      expert: 'Flow-check every zone of a new jacket before it sees fire. The integral numbers — total ΔP, total heat — cannot find a blocked zone; a thermal-transient check can.',
    }) },
  { id: 'jkt-coked', component: 'JKT-2', mode: 'coking', category: 'system', hazard: true, onset: 'start',
    params: rng => ({ r: 1.4e-5 + rng.uniform(0, 0.8e-5) }),
    apply: (S, p) => { for (const sg of S.model.jacket.seg) sg.coke = p.r * (sg.id === 'th' ? 1.6 : sg.id === 'cv' ? 1.3 : 1); },
    evidence: ['TC-803', 'TC-802', 'TC-728', 'Q-JKT', 'jacket-xray', 'heat-balance'],
    inspect: { 'jacket-xray': (S, p) => ({ lines: [['Coolant-side deposit, throat zone', `≈ ${(p.r * 1.6 * 0.25 * 1e6).toFixed(0)} µm`, '< 1 µm'],
      ['Coolant-side deposit, barrel', `≈ ${(p.r * 0.25 * 1e6).toFixed(0)} µm`, '< 1 µm']],
      text: 'A layer of carbonaceous deposit on the coolant side of the liner — the jacket was flowed hot, at low flow, on an earlier engine program.' }) },
    story: p => ({
      what: 'The coolant side of the liner was coated with a coke deposit from earlier hot running. The deposit is a thermal insulator: the liner ran hotter for the same heat flux, and the coolant picked up a little LESS heat.',
      indicators: 'TC-802 and TC-803 hotter than the reference run at the same Pc and MR; TC-728 slightly cooler; the jacket heat balance (Q-JKT) a few per cent low. Walls up, coolant down: heat is being stopped between them.',
      misleading: 'A cooler coolant outlet looks like more margin. It is less: the heat that did not reach the fuel is in the wall.',
      notice: 'Wall temperature per unit Pc, trended run to run. Coking grows slowly and then fast, because a hotter wall cokes faster.',
      abort: 'A hazard building over runs rather than within one. Continuing the campaign would have walked the throat into its redline — or past it.',
      expert: 'Keep the coolant-side wall below the fuel\'s coking temperature at every operating point, and trend the evidence. Coke is cleaned chemically or not at all.',
    }) },
  { id: 'liner-crack', component: 'BPE-2', alt: ['JKT-2'], mode: 'crack', category: 'system', hazard: true, onset: 'start',
    params: rng => ({ a: 2.5e-7 + rng.uniform(0, 1.5e-7) }),
    apply: (S, p) => { S.model.line('fu').jacketLeak = p.a; },
    evidence: ['FT-724', 'PT-725', 'DP-JKT', 'CSTAR-C', 'jacket-leak', 'borescope-liner'],
    inspect: { 'jacket-leak': () => ({ lines: [['Jacket pressure decay, 300 psig N₂, injector blanked', 'falls to zero in 40 s', '< 0.5 psi/min'], ['Snoop inside the chamber', 'bubbles along a line in the barrel', 'none']],
      text: 'The jacket does not hold pressure, and the leak is into the chamber.' }),
      'borescope-liner': () => ({ lines: [['Liner, barrel', 'axial crack ≈ 9 mm long, streaked downstream', 'no cracks'], ['Throat', 'normal heat tint', 'normal']], text: 'A thermal-fatigue crack between two channels.' }) },
    story: () => ({
      what: 'The liner had a thermal-fatigue crack between two cooling channels. Fuel leaked from the jacket straight into the chamber, bypassing the injector: it burned poorly along the wall, the injector got less fuel than the meter said, and c* efficiency fell.',
      indicators: 'FT-724 higher than the fuel injector ΔP accounts for (the injector\'s apparent CdA rose); PT-725 low against PT-729 — a bigger jacket ΔP for the flow; c* efficiency down a few per cent; a fuel-rich streak in the plume.',
      misleading: 'More fuel flow and lower performance look like an injector or mixture-ratio problem. The meter is right: the fuel went somewhere the injector did not send it.',
      notice: 'Flow and pressure must close around every component: the fuel meter, the jacket ΔP and the injector ΔP should tell one story. Here they did not.',
      abort: 'A hazard: a crack grows, and fuel against a hot wall in a fuel-rich streak is how liners burn through. Stop and leak-check.',
      expert: 'Pressure-decay check the jacket, injector blanked, before every campaign on a liner that has seen thermal cycles. Cracks are a life limit, not a surprise.',
    }) },
  { id: 'hot-fuel', component: 'T-720', mode: 'temp', category: 'system', hazard: true, onset: 'start',
    params: rng => ({ dT: 42 + rng.uniform(0, 18) }),
    apply: (S, p) => { S.model.fuelTempOffset = p.dT; },
    evidence: ['TC-727', 'TC-728', 'TSAT-M', 'go-no-go', 'fuel-temp'],
    inspect: { 'fuel-temp': (S, p) => ({ lines: [['FU-1 temperature, hand probe in the tank', C(S.def.physics.ambient.T + p.dT), '15–30 °C'], ['Conditioning skid log', 'heater stuck on for 6 h overnight', 'off']],
      text: 'The propellant conditioning skid\'s heater contactor welded shut overnight.' }) },
    story: p => ({
      what: `FU-1 was loaded about ${p.dT.toFixed(0)} K hotter than usual: the conditioning skid's heater had stuck on. The fuel is the coolant, and every degree it starts warmer is a degree less margin to boiling at the hottest point of the jacket.`,
      indicators: 'TC-727 (fuel in the tank) well above ambient before anything flowed — a static reading, there for anyone to see. In the burn, TC-728 (coolant out) high and the boiling margin (TSAT-M) small, with Pc, flows and thrust all normal.',
      misleading: 'The engine performs perfectly. Nothing about Pc, MR, c* or thrust says anything is wrong.',
      notice: 'The go/no-go PROP item for the coolant inlet temperature, before arming.',
      abort: 'A hazard. With little margin a throttle change or a small disturbance boils the coolant at the wall. NO-GO before firing was the right call; the boiling-margin redline is the backstop.',
      expert: 'Know your coolant\'s state at the inlet as well as its flow: temperature is half of the margin.',
    }) },
  { id: 'tc728-bias', component: 'TC-728', mode: 'bias', category: 'sensor', hazard: false, onset: 'start',
    params: rng => ({ b: 22 + rng.uniform(0, 12) }),
    apply: (S, p) => { S.daq.sensor('TC-728').bias = p.b; },
    evidence: ['TC-728', 'TC-727', 'Q-JKT', 'static-agreement', 'reference-tc'],
    inspect: { 'reference-tc': (S, p) => ({ lines: [['TC-728 vs reference probe, jacket at rest', `reads ${p.b.toFixed(1)} K high`, '± 1 K'], ['TC-727 vs reference', 'reads 0.3 K high', '± 1 K']],
      text: 'TC-728 was wired with copper extension wire instead of thermocouple-grade extension: a second junction at the connector, at its own temperature.' }) },
    story: p => ({
      what: `TC-728 read about ${p.b.toFixed(0)} K high: the wrong extension wire made a second junction at a warm connector. The coolant was fine.`,
      indicators: 'At rest, with everything at room temperature, TC-728 disagreed with TC-727 and the cell — an impossible difference for a jacket full of fuel that has not flowed. In the burn, the heat balance (Q-JKT) came out higher than the reference run while every wall temperature was normal.',
      misleading: 'A high coolant outlet temperature is exactly what a cooling problem looks like, and the boiling-margin channel is computed from it.',
      notice: 'Static agreement: with nothing flowing, every thermocouple in the cell should read the same.',
      abort: 'Not a hazard, but it could abort a good run through the boiling-margin redline. Fix the instrument; do not retune the limit.',
      expert: 'Every derived channel inherits the error of its inputs. Check the inputs at rest before trusting a margin computed from them.',
    }) },
];

export const REGEN_INSPECTIONS = [
  { id: 'jacket-flow', group: 'Cooling jacket', label: 'Water-flow the jacket and thermal-check each zone', needs: 'vented', dry: true, dur: 300,
    run: S => {
      const l = S.model.line('fu'), J = S.model.jacket;
      const a = l.CdAjacket * (1 - 0.6 * l.jacketBlockage) * (1 + S.rng.gauss() * 0.004);
      const low = J.seg.filter(sg => sg.block > 0.1);
      return { lines: [['Jacket CdA, water, 100 psid', `${(a * 1e6).toFixed(2)} mm²`, `${(l.CdAjacket * 1e6).toFixed(2)} mm² (acceptance)`],
        ['Thermal-transient zone check', low.length ? low.map(sg => `${segName[sg.id]} ${Math.round(100 * (1 - sg.block))} %`).join(', ') : 'all zones 97–103 % of nominal flow', 'all zones 95–105 %']] };
    } },
  { id: 'jacket-leak', group: 'Cooling jacket', label: 'Pressure-decay the jacket (injector blanked)', needs: 'vented', dry: true, dur: 240,
    run: S => {
      const leak = S.model.line('fu').jacketLeak > 0;
      return { lines: [['Jacket pressure decay, 300 psig N₂', leak ? 'falls fast — leaking' : `${(0.1 + Math.abs(S.rng.gauss()) * 0.05).toFixed(2)} psi/min`, '< 0.5 psi/min'],
        ['Snoop inside the chamber', leak ? 'bubbles along a line in the barrel' : 'none', 'none']] };
    } },
  { id: 'jacket-xray', group: 'Cooling jacket', label: 'Radiograph / ultrasonic the jacket (channels and deposit)', needs: 'vented', dry: true, dur: 420,
    run: S => {
      const J = S.model.jacket;
      const dep = sg => sg.coke * 0.25e6;               // µm, at an assumed deposit conductivity
      return { lines: [
        ['Channels', J.seg.some(sg => sg.block > 0.1) ? `obstructed in the ${J.seg.filter(sg => sg.block > 0.1).map(sg => segName[sg.id]).join(', ')} zone` : 'all clear', 'all clear'],
        ['Coolant-side deposit, throat', `${dep(J.seg_('th')).toFixed(1)} µm`, '< 1 µm'],
        ['Coolant-side deposit, barrel', `${dep(J.seg_('c2')).toFixed(1)} µm`, '< 1 µm'],
        ['Liner', J.breached || S.model.line('fu').jacketLeak > 0 ? 'indication of a through-crack in the barrel' : J.damage > 0.2 ? 'local thinning at the throat' : 'sound', 'sound']] };
    } },
  { id: 'borescope-liner', group: 'Cooling jacket', label: 'Borescope the liner (hot side)', needs: 'vented', dry: true, dur: 120,
    run: S => {
      const J = S.model.jacket, crack = J.breached || S.model.line('fu').jacketLeak > 0;
      return { lines: [
        ['Liner, barrel', crack ? 'axial crack, streaked downstream' : 'even light tint', 'no cracks'],
        ['Throat', J.damage > 0.5 ? 'blistered and eroded — overheated' : J.damage > 0.05 ? 'dark heat tint, slight roughening' : J.peakTwg > degC(350) ? 'heat tint' : 'light tint', 'light tint'],
        ['Hottest the liner has been (temper colour)', `≈ ${C(Math.round(J.peakTwg / 25) * 25)}`, '< 400 °C']] };
    } },
  { id: 'fuel-temp', group: 'Cooling jacket', label: 'Hand-probe the fuel temperature; check the conditioning log', needs: 'cell', dur: 30,
    run: S => ({ lines: [['FU-1 temperature, hand probe', C(S.def.physics.ambient.T + (S.model.fuelTempOffset || 0) + S.rng.gauss() * 0.3), '15–30 °C'],
      ['Conditioning skid log', (S.model.fuelTempOffset || 0) > 10 ? 'heater ON overnight' : 'normal', 'normal']] }) },
  { id: 'reference-tc', group: 'Instrumentation', label: 'Compare cell thermocouples with a reference probe (at rest)', needs: 'cell', dur: 60,
    run: S => {
      const amb = S.def.physics.ambient.T;
      return { lines: ['TC-727', 'TC-728', 'TC-802', 'TC-803'].map(id => {
        const v = S.daq.latest(id), truth = { 'TC-727': amb + (S.model.fuelTempOffset || 0), 'TC-728': S.model.jacket.Tout, 'TC-802': S.model.chamber.walls.ch, 'TC-803': S.model.chamber.walls.th }[id];
        return [`${id} vs reference`, `${(v - truth >= 0 ? '+' : '')}${(v - truth).toFixed(1)} K`, '± 1 K'];
      }) };
    } },
];

export const REGEN_DIAGNOSIS = {
  modes: [...FAILURE_MODES.filter(m => m[0] !== 'film-cooling'),
    ['coking', 'Coolant-side deposit (coking)', 'cooling'],
    ['crack', 'Liner crack (coolant leaking into the chamber)', 'cooling'],
    ['temp', 'Propellant temperature out of limits', 'cooling']],
  actions: ACTIONS,
  rightAction: { ...RIGHT_ACTION, coking: ['clean', 'repair'], crack: ['repair'], temp: ['config'] },
  checks: [...CHECKS, ['heat-balance', 'Coolant heat balance (Q-JKT) against the reference'], ['boiling-margin', 'Boiling margin (TSAT-M)']],
  categories: { ...CATEGORIES, cooling: 'Regenerative cooling' },
};
