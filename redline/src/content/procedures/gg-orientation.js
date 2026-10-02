/* LEVEL 24 — Gas-generator engine stand orientation.

   TS-3 rebuilt as an engine stand: the turbopump from Levels 18–23 now
   feeds BPE-3, and a gas generator drives its turbine. Learn the new
   hardware, read a start sequence on paper, spark-check both igniters and
   push the purge through the engine at the personnel limit. Nothing is
   loaded, nothing spins, nothing burns. */

import { psi } from '../../lib/units.js';
import { near } from './common.js';
import { GG_PTS } from './gg-common.js';

const click = (id, title, why) => ({
  id: 'K-' + id, kind: 'action', station: 'TC', title, focus: [id],
  text: `Click ${id} on the P&ID and read its card.`, why, check: v => v.inspected.has(id),
});
const PURGES = ['PV-631', 'PV-632', 'PV-635'];

export function procedure(def) {
  const R = def.ratings;
  return {
    id: 'gg-orientation',
    title: 'OR-GG-001 · Gas-generator engine stand orientation',
    sections: [
      { id: 'A', title: 'TS-3G', steps: [
        { id: 'A1', num: '1.1', kind: 'info', station: 'TC', title: 'An engine that drives its own pumps',
          text: 'TS-3G is TS-3 with an engine on it. TPA-1 — the turbopump you spun on water and cold nitrogen — now takes OX-1 and FU-1 from tanks at 50 psig and delivers them at about 750 psig to BPE-3\'s main injector. Two small taps off the pump discharges feed a GAS GENERATOR: a little combustor burning about 5 % of the propellant very fuel-rich, at about 850 K, whose gas drives the turbine and is then thrown away through the exhaust duct. That is the GAS-GENERATOR CYCLE.',
          why: 'The loop closes on itself: the gas generator\'s flow depends on the pumps\' pressure, which depends on the turbine\'s power, which depends on the gas generator. Something has to start it.' },
        { id: 'A2', num: '1.2', kind: 'info', station: 'TC', title: 'Bootstrap',
          text: 'The START GAS: nitrogen from PR-330, through the turbine start valve TSV-332, spins the turbine for the first second. The pumps come up; the main valves open and the main chamber lights on pump pressure; the gas generator valves open and the gas generator lights; then TSV-332 shuts and the engine runs on its own gas — it has BOOTSTRAPPED. Too little start gas, or cut too early, and the engine HANGS short of mainstage. Too much, or left on too long, and the turbine has two drives at once: OVERSPEED.',
          why: 'Every gas-generator engine has a start sequence tuned by test. The levels that follow are about finding out whether this one\'s is right.' },
        { id: 'A3', num: '1.3', kind: 'info', station: 'TC', title: 'Read the P&ID',
          text: 'Top: the bank and header, four regulators — the two tank regulators, the purge regulator PR-630 and the start gas regulator PR-330. Middle: the tanks and the pumps below them, the shaft running through both pumps to the turbine. Off each pump discharge, a tap through a GG valve (GOV-416, GFV-426) and a GG throttle (GCV-417, GCV-427) into the gas generator; the gas generator\'s outlet is the turbine manifold. Bottom right: the main valves, the main injector manifolds and BPE-3.',
          why: 'Find the start gas path (PR-330 → TSV-332 → turbine manifold) and the gas generator\'s two feeds. Those are the start.' },
      ] },
      { id: 'K', label: 'A', title: 'The hardware', steps: [
        click('GG', 'The gas generator', 'Its mixture ratio sets its temperature, and its temperature is the turbine\'s redline (TT-334).'),
        click('IGN-502', 'The gas generator igniter', 'A second igniter, in a chamber you cannot see. If it does not light, the turbine gets raw propellant.'),
        click('GOV-416', 'The GG oxidiser valve', 'Opens after the GG fuel valve and shuts before it: an oxidiser-rich gas generator is a hot one.'),
        click('GCV-417', 'A GG throttle', 'The engine\'s throttle. Move both together and the speed moves; move one and the temperature moves.'),
        click('TURB', 'The turbine', 'Its nozzles are the gas generator\'s throat. On 850 K gas it needs a third of the flow it took on cold nitrogen.'),
        click('PR-330', 'The start gas regulator', 'Set by the sequencer, from the plan. The start\'s first knob.'),
        click('TSV-332', 'The turbine start valve', 'Open at T-0, shut at the end of the start. When it shuts, the engine is on its own.'),
        click('MOV-414', 'The main oxidiser valve', 'Opens with the pumps turning on start gas, before they are at speed: they need the load, and the chamber must light at modest pressure.'),
        click('BPE-3', 'The engine', 'An ablative chamber: its liner chars and erodes as it burns. The case thermocouple TC-503 watches what is left.'),
        click('PV-635', 'The gas generator purge', 'Unburned fuel left in the gas generator after a shutdown is the next start\'s hard start.'),
      ].map((st, i) => ({ ...st, num: `1.${4 + i}` })) },
      { id: 'B', title: 'Instruments', steps: [
        { id: 'B1', num: '3.1', kind: 'action', station: 'DAQ', title: 'Power up the DAQ', text: 'Console ▸ DAQ ▸ Power ON.', check: v => v.daq.online },
        { id: 'B2', num: '3.2', kind: 'action', station: 'DAQ', title: 'Zero the pressure transducers', text: 'Console ▸ DAQ ▸ ZERO PTs. Everything is vented.',
          check: v => v.has(e => e.zero) },
        { id: 'B3', num: '3.3', kind: 'action', station: 'DAQ', title: 'Tare the tank scales while the tanks are EMPTY',
          text: 'Console ▸ DAQ ▸ TARE SCALES.', check: v => v.has(e => e.tare && e.tare.some(o => o.id === 'WT-411')) && Math.abs(v.ch('WT-411')) < 0.1 },
      ] },
      { id: 'C', title: 'A start, on paper', steps: [
        { id: 'C1', num: '4.1', kind: 'action', station: 'TC', title: 'Load the standard hot-fire plan',
          text: 'FIRE CONTROL ▸ HOT FIRE, the default start timing ▸ LOAD. Nothing can be armed: the tanks are empty. Read the plan text.',
          check: v => v.plan.mode === 'hot' && v.has(e => e.cat === 'SEQ' && e.text.startsWith('Firing plan loaded')) },
        { id: 'C2', num: '4.2', kind: 'info', station: 'TC', title: 'The sequence, second by second',
          text: 'T−3: start gas regulator up, GG throttles preset. T−2: pre-purge, all three. T−0.5: both igniters on. T0: TSV-332 opens — the turbine spins on nitrogen; the pumps make pressure against shut valves. T+0.45: main valves open — the pumps take their load, the main chamber lights. T+0.72 and T+0.75: GG fuel, then GG oxidiser — the gas generator lights and its gas joins the start gas. T+1.1: TSV-332 shuts. From here the engine drives itself. T+2: igniters off.',
          why: 'Three automatic checks stand guard over it: chamber pressure by T+0.9 (or the main chamber did not light), turbine inlet temperature by T+1.25 (or the gas generator did not), and the speed at 80 % of mainstage by T+2.5 (or the start has hung). Each is an abort.' },
        { id: 'C3', num: '4.3', kind: 'record', station: 'TC', title: 'From the plan text: when does the start gas shut off? (s after T-0)',
          record: { unit: 's', validate: (x, v) => (near(x, v.plan.spinEnd ?? 1.1, 0.01) ? { ok: true, msg: `T+${(v.plan.spinEnd ?? 1.1).toFixed(2)} s — about 0.35 s after the gas generator opens.` } : { ok: false, msg: 'Read the plan text: "start gas … T-0 → T+…".' }) } },
        { id: 'C4', num: '4.4', kind: 'info', station: 'TC', title: 'And the shutdown',
          text: 'GG oxidiser first, GG fuel 30 ms later — the turbine loses its power — then the main valves 250 ms after that, the pumps still turning; then all three purges. A manual CUTOFF and the abort do the same, gas generator first.',
          why: 'Shut the main valves first and the pumps are deadheaded with the turbine still driving them: overspeed. Shut the GG fuel before its oxidiser and the turbine sees a burst of oxidiser-rich, very hot gas.' },
      ] },
      { id: 'D', title: 'Igniters and purges (≤ 50 psig)', steps: [
        { id: 'D1', num: '5.1', kind: 'action', station: 'CTL', title: 'Spark-check both igniters',
          text: 'Console ▸ INSPECT ▸ Spark check. Read both results.',
          check: v => v.sparkChecked },
        { id: 'D2', num: '5.2', kind: 'action', station: 'PROP', title: 'Technician: open HV-300; close VV-301; open IV-301',
          text: 'The header comes up to bank pressure. Leave the tank vents open: the tanks stay at zero today.',
          check: v => v.ch('PT-301') > psi(1500) && v.cmd('VV-301') === 0 && v.ch('IV-301-ZSO') === 1 },
        { id: 'D3', num: '5.3', kind: 'action', station: 'PROP', title: 'PR-630 → 50 psig',
          text: 'The personnel limit: the cell is open. PT-630 locks up.',
          check: v => near(v.sp['PR-630'], psi(50), psi(1)) && near(v.ch('PT-630'), psi(50), psi(5)) },
        { id: 'D4', num: '5.4', kind: 'action', station: 'PROP', title: 'Open all three purges: PV-631, PV-632, PV-635',
          text: 'Watch PT-415 and PT-425 — the main injector manifolds — come up to about a third of the purge pressure, and PT-333 — the gas generator — barely move.',
          why: 'The main manifolds empty through the injector\'s small holes; the gas generator empties through the turbine nozzles, which are large. The purge sweeps the gas generator rather than pressurising it.',
          check: v => PURGES.every(id => v.cmd(id) === 1) && v.ch('PT-415') > psi(8) && v.ch('PT-425') > psi(8) },
        { id: 'D5', num: '5.5', kind: 'action', station: 'PROP', title: 'Close all three purges',
          check: v => PURGES.every(id => v.cmd(id) === 0) },
      ] },
      { id: 'E', title: 'Safe it', steps: [
        { id: 'E1', num: '6.1', kind: 'action', station: 'PROP', title: 'All four regulators → 0; close IV-301',
          check: v => ['PR-410', 'PR-420', 'PR-330', 'PR-630'].every(id => v.sp[id] === 0) && v.ch('IV-301-ZSC') === 1 },
        { id: 'E2', num: '6.2', kind: 'action', station: 'PROP', title: 'Open VV-301',
          check: v => v.cmd('VV-301') === 1 },
        { id: 'E3', num: '6.3', kind: 'verify', station: 'PROP', title: 'Is the system vented?',
          text: 'Every pressure channel downstream of IV-301 below 3 psig.',
          why: 'One is not. The purge regulator does not relieve, and the purge line between it and three shut valves has no vent of its own.',
          check: v => GG_PTS.every(id => v.ch(id) < R.VENTED),
          failMsg: 'Something is still pressurised. Which transducer — and which volume is behind it?' },
        { id: 'E4', num: '6.4', kind: 'info', station: 'TC', title: 'Orientation complete',
          text: 'Next: Level 25, a pump-fed cold flow — the engine\'s feed system on water, the turbine on start gas alone.', why: '' },
      ] },
    ],
  };
}

export default {
  id: 'gg-orient',
  title: 'Gas-generator engine stand orientation',
  objective: 'Orientation — nothing loaded, nothing spins',
  request: () => ({ tankP: psi(50), title: 'Orientation', text: 'Learn TS-3G and BPE-3. Nothing is loaded; nothing spins.' }),
  procedure,
};
