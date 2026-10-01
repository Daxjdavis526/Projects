/* The inspection workbench for TS-1: things a technician can do to the
   hardware, and what they would find. Results are measurements and
   observations, with the expected value beside them where there is one —
   never a verdict. Nominal hardware reads nominal (with the scatter of a real
   measurement); a fault changes the reading either because it changed the
   physics (these inspections read the hardware itself) or through the
   fault's own `inspect` entry for things physics does not capture (a kinked
   tube, a loose connector).

   needs:  'rack'   done from the DAQ rack in the control room
           'cell'   a technician in the open cell
           'vented' in the cell with the test system vented (hardware opened)
           'lowP'   in the cell with the low-pressure side held at 20–50 psig */

import { psi } from '../../lib/units.js';

const mm = (x, dp = 2) => `${(x * 1e3).toFixed(dp)} mm`;

export const INSPECTIONS = [
  { id: 'visual-nozzle', group: 'Thruster', label: 'Inspect nozzle (light and mirror)', needs: 'vented', dur: 30,
    run: S => {
      const n = S.model.nozzleEl.nozzle, Tw = S.model.net.vol('chamber').Tw - 273.15;
      return { lines: [
        ['Part marking', n.spec.part || 'N-02', 'N-02'],
        ['Throat edge', n.spec.eroded ? 'rounded and polished; fine grooves in the convergent section' : 'sharp, clean', 'sharp'],
        ['Bore', n.blockage > 0 ? 'foreign material in the throat — a white sliver' : 'clear', 'clear'],
        ['Exterior', Tw < 2 ? 'frosted' : 'no damage', 'no damage'],
      ] };
    } },
  { id: 'measure-throat', group: 'Thruster', label: 'Measure throat (pin gauges)', needs: 'vented', dur: 45,
    run: S => {
      const n = S.model.nozzleEl.nozzle;
      if (n.blockage > 0) {
        const d = n.throatDia * Math.sqrt(1 - n.blockage);
        return { lines: [['2.50 mm go-pin', 'does not enter', 'enters, 2.51 does not'], ['Largest pin that passes', mm(Math.floor(d * 1e5) / 1e5), '2.50 mm']],
          text: 'Something in the throat stops the larger pins partway in.' };
      }
      const d = Math.floor((n.throatDia + S.rng.gauss() * 3e-6) * 1e5) / 1e5;
      return { lines: [['Largest pin that passes', mm(d), '2.50 mm (drawing, +0.01/−0.00)']] };
    } },
  { id: 'measure-exit', group: 'Thruster', label: 'Measure nozzle exit (calipers)', needs: 'vented', dur: 20,
    run: S => ({ lines: [['Exit diameter', mm(S.model.nozzleEl.nozzle.exitDia + S.rng.gauss() * 1e-5), '3.55 mm ± 0.02']] }) },
  { id: 'inspect-filter', group: 'Feed system', label: 'Remove and inspect F-201 element', needs: 'vented', dur: 60,
    run: S => ({ lines: [['Element', S.model.element('F-201').blockage > 0.3 ? 'loaded — pleats bridged with particulate' : 'clean', 'clean']] }) },
  { id: 'inspect-plumbing', group: 'Feed system', label: 'Walk the feed line and fittings', needs: 'cell', dur: 40,
    run: () => ({ lines: [['Tubing', 'supported, no kinks, no chafe', 'no damage'], ['Fittings', 'torque stripes intact', 'intact']] }) },
  { id: 'leak-test', group: 'Feed system', label: 'Snoop-test every fitting (low pressure)', needs: 'lowP', dur: 60,
    run: S => {
      const lines = [];
      lines.push(['All fittings', S.model.element('LK-301').CdA0 > 0 ? 'bubbles at the SV-301 inlet B-nut' : 'no bubbles', 'no bubbles']);
      lines.push(['Nozzle exit (film)', S.model.element('SV-301').leakCdA > 0 ? 'film bulges — gas passing the fire valve' : 'no flow', 'no flow']);
      return { lines };
    } },
  { id: 'check-valve', group: 'Fire valve', label: 'SV-301 check: coil, stroke, seat', needs: 'vented', dur: 90,
    run: S => {
      const v = S.model.element('SV-301');
      const moves = !v.failClosed && !v.coilOpen && !v.stuck;
      return { lines: [
        ['Coil resistance', v.coilOpen ? 'OPEN' : `${(24 + S.rng.gauss() * 0.15).toFixed(1)} Ω`, '24 ± 1 Ω'],
        ['Energised at 28 V', moves ? 'clean click' : v.coilOpen ? 'no current, no click' : 'current normal, no click', 'click'],
        ['Stroke length', moves ? `${(0.70 * v.maxOpen).toFixed(2)} mm` : '0.00 mm', '0.70 mm'],
        ['Stroke time', moves ? `${(2.2 * v.strokeScale).toFixed(1)} ms` : '—', '≈ 2.2 ms'],
        ['Seat leak (150 psig, bench)', v.leakCdA > 0 ? `≈ ${Math.round(v.leakCdA / 2e-10)} sccm` : '< 1 sccm', '< 1 sccm'],
      ] };
    } },
  { id: 'check-regulator', group: 'Regulator', label: 'PR-101 bench check: lock-up, droop, seat', needs: 'vented', dur: 120,
    run: S => {
      const r = S.model.element('PR-101');
      return { lines: [
        ['Lock-up with dome at 150 psig', r.creepCdA > 0 ? 'does not lock up' : `${(150 + r.setBias / psi(1) + 0.3).toFixed(1)} psig`, '150 ± 3 psig'],
        ['Droop at 12 g/s', r.stuckAt !== null ? 'cannot pass 12 g/s' : `${(5.1 * r.droopScale).toFixed(1)} psi`, '≤ 8 psi'],
        ['Seat leak at lock-up', r.creepCdA > 0 ? 'outlet creeps toward inlet' : 'none', 'none'],
      ] };
    } },
  { id: 'check-iv', group: 'Supply', label: 'Stroke IV-101 and check the limit switches', needs: 'cell', dur: 40,
    run: S => {
      const v = S.model.element('IV-101');
      return { lines: [
        ['Ball position at full stroke (flag)', `${(90 * v.maxOpen).toFixed(0)}°`, '90°'],
        ['Open limit switch trips at', `${(90 * (v.zsoAt ?? 0.98)).toFixed(0)}°`, '88°'],
        ['Actuator supply air', v.maxOpen < 0.9 ? '32 psig' : '80 psig', '80 psig'],
      ] };
    } },
  { id: 'bottle-gauge', group: 'Supply', label: 'Read the bottle dial gauge and tag', needs: 'cell', dur: 15,
    run: S => {
      const P = S.model.net.vol('tank').P - S.def.physics.ambient.P;
      return { lines: [['Bottle dial gauge', `≈ ${Math.round(P / psi(50)) * 50} psig`, '≥ 800 psig for a test']] };
    } },
  { id: 'electrical', group: 'Instrumentation', label: 'Inspect connectors, cables and shields', needs: 'cell', dur: 60,
    run: () => ({ lines: [['Connectors', 'all seated and locked', 'seated, locked'], ['Shields', 'terminated at the DAQ end', 'terminated'], ['Routing', 'signal cables separated from the valve driver', 'separated']] }) },
  { id: 'continuity', group: 'Instrumentation', label: 'Loop / continuity check from the rack', needs: 'rack', dur: 30,
    run: S => {
      const d = S.daq, lines = [];
      for (const s of d.sensors) {
        if (s.kind === 'PT' || s.kind === 'LC') lines.push([`${s.id} bridge`, s.open ? 'OPEN' : `${(350 + S.rng.gauss() * 0.8).toFixed(0)} Ω`, '350 ± 5 Ω']);
        if (s.kind === 'TC') lines.push([`${s.id} loop`, s.open ? 'OPEN' : `${(12 + S.rng.gauss() * 0.3).toFixed(1)} Ω`, '≈ 12 Ω']);
      }
      lines.push(['SV-301 coil circuit', S.model.element('SV-301').coilOpen ? 'OPEN' : `${(24 + S.rng.gauss() * 0.15).toFixed(1)} Ω`, '24 ± 1 Ω']);
      return { lines };
    } },
  { id: 'reference-gauge', group: 'Instrumentation', label: 'Compare PTs with a calibrated reference gauge', needs: 'lowP', dur: 60,
    run: S => {
      const Pa = S.def.physics.ambient.P, lines = [];
      for (const [id, vol] of [['PT-102', 'hp'], ['PT-201', 'lp'], ['PT-301', 'feed'], ['PT-401', 'chamber']]) {
        const ref = (S.model.net.vol(vol).P - Pa) / psi(1) + S.rng.gauss() * 0.1;
        const pt = S.daq.latest(id) / psi(1);
        lines.push([`${id} port`, `reference ${ref.toFixed(1)} · PT ${Number.isFinite(pt) ? pt.toFixed(1) : '----'} psig`, 'agree within 0.5 psi']);
      }
      return { lines, text: 'A calibrated test gauge fitted to each transducer\'s spare port in turn — an independent measurement.' };
    } },
  { id: 'deadweight-lc', group: 'Thrust stand', label: 'Dead-weight check of the thrust stand', needs: 'cell', dur: 90,
    run: S => {
      const s = S.daq.sensor('LC-501'), k = s.mechGain * s.chainGain;
      return { lines: [2, 5, 10].map(F => [`Applied ${F.toFixed(3)} N`, `${(F * k + S.rng.gauss() * 0.004).toFixed(3)} N`, `${F.toFixed(3)} N`]),
        text: 'Calibrated weights over a pulley on the thrust axis, through the stand as rigged.' };
    } },
  { id: 'inspect-loadcell', group: 'Thrust stand', label: 'Inspect load cell, flexures and load path', needs: 'cell', dur: 40,
    run: () => ({ lines: [['Flexures', 'undamaged', 'undamaged'], ['Feed-line loop across the stand', 'free', 'free'], ['Load-cell body', 'ambient temperature, thermal shield fitted', 'shield fitted']] }) },
];

export const inspectionById = id => INSPECTIONS.find(i => i.id === id);
