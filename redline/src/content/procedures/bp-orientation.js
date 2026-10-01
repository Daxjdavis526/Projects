/* LEVEL 7 — Bipropellant stand orientation.

   Twice the plumbing, and two kinds of fluid. Learn the two feed systems,
   load the tanks, pressurise to the personnel limit, see what purge does,
   and then safe a stand that has more places to trap gas than TS-1 had. */

import { psi } from '../../lib/units.js';
import { near } from './common.js';
import { SYS_PTS } from './bp-common.js';

const click = (id, title, why) => ({
  id: 'K-' + id, kind: 'action', station: 'TC', title, focus: [id],
  text: `Click ${id} on the P&ID and read its card.`, why, check: v => v.inspected.has(id),
});

export function procedure(def) {
  const R = def.ratings;
  return {
    id: 'bp-orientation',
    title: 'OR-BP-001 · Bipropellant stand orientation',
    sections: [
      { id: 'A', title: 'TS-2', steps: [
        { id: 'A1', num: '1.1', kind: 'info', station: 'TC', title: 'A pressure-fed engine stand',
          text: 'TS-2 feeds a small (fictional) bipropellant engine, BPE-1, from two run tanks pushed by nitrogen. There is no pump: the tank pressure IS the feed pressure. This level runs it cold: the tanks hold water and nothing burns. Hot fires come later (Level 9).',
          why: 'Every hot fire is preceded by cold flows. The plumbing, the instruments and the procedure are the same; only the consequences are different.' },
        { id: 'A2', num: '1.2', kind: 'info', station: 'TC', title: 'Read the P&ID',
          text: 'Top: the pressurant header from the K-bottle to three regulators — oxidiser tank, fuel tank, purge. Middle: the two run tanks, each with a vent, a relief and a scale under it. Bottom: two liquid lines (drawn thicker) through the main valves and flowmeters to the injector. Right: the purge system, which can blow gas into either manifold.',
          why: 'Two of everything means two of every mistake: the right setpoint on the wrong regulator, the right valve on the wrong side.' },
      ] },
      { id: 'K', label: 'A', title: 'The hardware', steps: [
        click('N2-K', 'The pressurant bottle', 'The energy source for both tanks and the purge.'),
        click('PR-610', 'The oxidiser tank regulator', 'In a pressure-fed engine, the regulator sets the injector flow. Droop here is flow lost at the engine.'),
        click('CV-611', 'A pressurant check valve', 'Keeps the two tanks from talking to each other through the shared header.'),
        click('T-710', 'The oxidiser run tank', 'Its scale is the independent measurement of how much left.'),
        click('MOV-713', 'The main oxidiser valve', 'Sequencer-only. How fast it moves decides how hard the liquid hammers when it stops.'),
        click('PV-631', 'A purge valve', 'Clears the manifold before and after a flow, and in an abort.'),
        click('BPE-1', 'The engine', 'Its injector\'s flow coefficients are on the drawing. Whether they are true is what a cold flow finds out.'),
      ].map((st, i) => ({ ...st, num: `1.${3 + i}` })) },
      { id: 'B', title: 'Instruments', steps: [
        { id: 'B1', num: '3.1', kind: 'action', station: 'DAQ', title: 'Power up the DAQ', text: 'Console ▸ DAQ ▸ Power ON.', check: v => v.daq.online },
        { id: 'B2', num: '3.2', kind: 'action', station: 'DAQ', title: 'Zero the pressure transducers', text: 'Console ▸ DAQ ▸ ZERO PTs. Everything is vented.',
          check: v => v.has(e => e.zero) },
        { id: 'B3', num: '3.3', kind: 'action', station: 'DAQ', title: 'Tare the tank scales while the tanks are EMPTY',
          text: 'Console ▸ DAQ ▸ TARE (tank scales). WT-716 and WT-726 read 0.00 kg.',
          why: 'From now on the scales read liquid on board. Tare them full and they would say empty.',
          check: v => v.has(e => e.tare && e.tare.some(o => o.id === 'WT-716')) && Math.abs(v.ch('WT-716')) < 0.05 },
      ] },
      { id: 'C', title: 'Load', steps: [
        { id: 'C1', num: '4.1', kind: 'action', station: 'PROP', title: 'Technician: load both tanks with water',
          text: 'FACILITY ▸ Technician ▸ Load water (the vents are open). Watch the scales.',
          why: 'Filling displaces gas: the vent must be open.', check: v => v.ch('WT-716') > 5 && v.ch('WT-726') > 4 },
      ] },
      { id: 'D', title: 'Pressurise (≤ 50 psig)', steps: [
        { id: 'D1', num: '5.1', kind: 'action', station: 'PROP', title: 'Technician: open HV-600', text: 'Watch PT-601.', check: v => v.ch('PT-601') > psi(1000) },
        { id: 'D2', num: '5.2', kind: 'action', station: 'PROP', title: 'Close VV-601, VV-711 and VV-721; open IV-601',
          text: 'Header and both tanks now able to hold pressure; PT-602 at supply.',
          check: v => ['VV-601', 'VV-711', 'VV-721'].every(id => v.cmd(id) === 0) && v.ch('IV-601-ZSO') === 1 },
        { id: 'D3', num: '5.3', kind: 'action', station: 'PROP', title: 'PR-610 and PR-620 → 40 psig',
          text: 'Watch PT-710 and PT-720 lock up. Then look at WT-716: it moved a little, though no water went anywhere.',
          why: 'Pressure tare: the pressurised flex lines push on the tank\'s load cells. A scale reading taken at a different pressure from its tare is wrong by this much. It is small here and it is not small when you are looking for a 1 % flowmeter error.',
          check: v => near(v.ch('PT-710'), psi(40), psi(4)) && near(v.ch('PT-720'), psi(40), psi(4)) },
        { id: 'D4', num: '5.4', kind: 'action', station: 'PROP', title: 'Purge regulator PR-630 → 40 psig, then open PV-631 for a few seconds',
          text: 'Watch PT-715 (the ox manifold) rise as purge gas flows through it and out of the injector into the chamber — and listen. Close PV-631 again.',
          why: 'This is the purge path: regulator, valve, check valve, manifold, injector. Before a flow it keeps the manifold dry; after a flow it blows out the liquid left behind.',
          check: v => v.has(e => e.cat === 'CMD' && e.text === 'PV-631 OPEN') && v.cmd('PV-631') === 0 && near(v.sp['PR-630'], psi(40), psi(1)) },
      ] },
      { id: 'E', title: 'Safe it — and find the trapped gas', steps: [
        { id: 'E1', num: '6.1', kind: 'action', station: 'PROP', title: 'All three regulators → 0; close IV-601',
          check: v => ['PR-610', 'PR-620', 'PR-630'].every(id => v.sp[id] === 0) && v.ch('IV-601-ZSC') === 1 },
        { id: 'E2', num: '6.2', kind: 'action', station: 'PROP', title: 'Open both tank vents',
          text: 'VV-711 and VV-721. Watch the tanks fall.', check: v => v.cmd('VV-711') === 1 && v.cmd('VV-721') === 1 && v.ch('PT-710') < R.VENTED },
        { id: 'E3', num: '6.3', kind: 'verify', station: 'PROP', title: 'Is the system vented?',
          text: 'Check every pressure channel. Confirm only when every section downstream of IV-601 is below 3 psig.',
          why: 'Two sections are still pressurised: the header between IV-601 and three shut regulators (PT-602 — vent it with VV-601), and the purge line between PR-630 and the shut purge valves (PT-630 — it has no vent; open a purge valve).',
          check: v => SYS_PTS.every(id => v.ch(id) < R.VENTED),
          failMsg: 'Something is trapped. PT-602? Open VV-601. PT-630? Open PV-631 briefly.' },
        { id: 'E4', num: '6.4', kind: 'info', station: 'TC', title: 'Orientation complete',
          text: 'The tanks still hold water, at atmospheric pressure. Next: Level 8, a cold-flow characterisation of the injector.', why: '' },
      ] },
    ],
  };
}

export default {
  id: 'bp-orient',
  title: 'Bipropellant stand orientation',
  objective: 'Orientation — no flow',
  request: () => ({ oxP: psi(40), fuP: psi(40), duration: 0, title: 'Orientation', text: 'Learn TS-2 and its instruments. No flow.' }),
  procedure,
};
