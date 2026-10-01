/* The inspection workbench for TS-2. Same contract as TS-1's: results are
   measurements and observations with the expected value beside them, never a
   verdict. Nominal hardware reads nominal, with a real measurement's scatter.

   needs:  'rack' | 'cell' | 'vented' (as TS-1), and
           dry: true — the engine or a meter comes off the stand, which
           nobody does with propellants in the tanks. */

import { psi, degC } from '../../lib/units.js';

const mm2 = x => `${(x * 1e6).toFixed(3)} mm²`;
const C = k => `${(k - 273.15).toFixed(0)} °C`;

export const INSPECTIONS = [
  /* ---- engine ---------------------------------------------------------- */
  { id: 'inspect-injector', group: 'Engine', label: 'Remove and inspect the injector face', needs: 'vented', dry: true, dur: 180,
    run: S => {
      const ox = S.model.line('ox'), fu = S.model.line('fu'), C8 = S.model.chamber;
      return { lines: [
        ['Oxidiser orifices (16)', ox.injBlockage > 0.02 ? `${Math.max(1, Math.round(ox.injBlockage * 16))} partly obstructed` : 'all clear, sharp-edged', 'all clear'],
        ['Fuel orifices (12)', fu.CdAinj > fu.spec.CdAinj * 1.1 ? 'entrances rounded, bores oversize' : 'all clear, sharp-edged', 'all clear'],
        ['Film-cooling ring (24)', C8.film > 1.1 ? 'several holes blocked with deposit' : 'all clear', 'all clear'],
        ['Face condition', C8.peak.hf > 0.05 ? 'erosion and heat tint near the outer elements' : C8.peak.P > psi(450) + S.def.physics.ambient.P ? 'face slightly dished — overpressure' : 'clean', 'clean'],
      ] };
    } },
  { id: 'flow-bench', group: 'Engine', label: 'Water-flow the injector on the bench (each side)', needs: 'vented', dry: true, dur: 300,
    run: S => {
      const D = S.def.design, side = (l, draw) => {
        const a = l.CdAinj * (1 - l.injBlockage) * (1 + S.rng.gauss() * 0.004);
        return [`${l.id === 'ox' ? 'Oxidiser' : 'Fuel'} side CdA at 100 psid`, mm2(a), `${mm2(draw)} drawing; your cold flow is the reference`];
      };
      return { lines: [side(S.model.line('ox'), D.CdAox), side(S.model.line('fu'), D.CdAfu)],
        text: 'Each side flowed alone into a catch tank, timed and weighed. This is the same measurement as a cold flow, without the stand.' };
    } },
  { id: 'inspect-chamber', group: 'Engine', label: 'Borescope the chamber and gauge the throat', needs: 'vented', dry: true, dur: 120,
    run: S => {
      const C8 = S.model.chamber, d = C8.spec.throatDia * (1 + S.rng.gauss() * 2e-4);
      return { lines: [
        ['Chamber wall', C8.peak.hf > 0.05 ? 'local erosion in a ring near the injector' : C8.peak.Tth > degC(500) ? 'even heat tint, darker toward the throat' : C8.peak.Tth > degC(100) ? 'light even heat tint' : 'bright copper', 'even tint'],
        ['Throat diameter', `${(d * 1e3).toFixed(2)} mm`, `${(C8.spec.throatDia * 1e3).toFixed(2)} mm`],
        ['Throat surface', C8.peak.Tth > degC(650) ? 'surface softened and slightly rippled — over-temperature' : 'smooth', 'smooth'],
        ['Hottest the throat has been (temper colour)', `≈ ${C(Math.round(C8.peak.Tth / 25) * 25)}`, '< 600 °C'],
      ] };
    } },
  { id: 'inspect-igniter', group: 'Engine', label: 'Pull and inspect the igniter plug', needs: 'vented', dry: true, dur: 60,
    run: S => ({ lines: [['Plug electrode gap', `${(1.0 + S.rng.gauss() * 0.03).toFixed(2)} mm`, '1.0 ± 0.1 mm'], ['Insulator', 'clean', 'clean'], ['HT lead connector', 'seated, locked', 'seated, locked']] }) },
  { id: 'spark-check', group: 'Engine', label: 'Spark check (technician watches through the nozzle)', needs: 'cell', dur: 20,
    run: S => {
      const ig = S.model.chamber.igniter;
      S.controller.sparkChecked = true;
      return { lines: [
        ['Exciter current', ig.open ? '0.0 A' : `${(1.8 + S.rng.gauss() * 0.03).toFixed(2)} A`, '≈ 1.8 A'],
        ['Spark at the plug', ig.open ? 'none — exciter dead' : ig.fail ? 'none (exciter buzzing)' : 'regular, strong, blue', 'regular, strong, blue']],
        text: 'Purge flowing, propellant valves shut, everyone else clear of the nozzle.' };
    } },

  /* ---- feed system ----------------------------------------------------- */
  { id: 'check-regulator', group: 'Feed system', label: 'Bench-check PR-610 and PR-620: lock-up, droop, seat', needs: 'vented', dur: 180,
    run: S => {
      const r = id => S.model.element(id), line = id => [
        [`${id} lock-up, dome 400 psig`, r(id).creepCdA > 0 ? 'does not lock up' : `${(400 + r(id).setBias / psi(1) + S.rng.gauss() * 0.3).toFixed(1)} psig`, '400 ± 5 psig'],
        [`${id} droop at test flow`, r(id).stuckAt !== null ? 'cannot pass the flow' : `${(1.3 * r(id).droopScale + S.rng.gauss() * 0.2).toFixed(1)} psi`, '≤ 8 psi']];
      return { lines: [...line('PR-610'), ...line('PR-620')] };
    } },
  { id: 'valve-stroke', group: 'Feed system', label: 'Time the main-valve strokes (stand vented)', needs: 'vented', dur: 60,
    run: S => {
      const v = id => S.model.element(id), t = id => (v(id).strokeOpen * v(id).strokeScale * (1 + S.rng.gauss() * 0.02)).toFixed(2);
      return { lines: [['MOV-713 open stroke', `${t('MOV-713')} s`, '0.25 ± 0.05 s'], ['MFV-723 open stroke', `${t('MFV-723')} s`, '0.25 ± 0.05 s'],
        ['Actuator supply', v('MFV-723').strokeScale > 1.5 || v('MOV-713').strokeScale > 1.5 ? 'one actuator regulator reads low' : '80 psig', '80 psig']] };
    } },
  { id: 'meter-bench', group: 'Instrumentation', label: 'Bench-check FT-714 and FT-724 K-factors (water)', needs: 'vented', dry: true, dur: 240,
    run: S => {
      const k = id => ((S.daq.sensor(id).chainGain - 1) * 100 + S.rng.gauss() * 0.15).toFixed(1);
      return { lines: [['FT-714 against its certificate', `${k('FT-714')} %`, '± 0.5 %'], ['FT-724 against its certificate', `${k('FT-724')} %`, '± 0.5 %']],
        text: 'Each meter on the water bench against a weigh tank. This checks the meter and the K-factor in the DAQ — not the density the DAQ uses for a propellant, which is the operator\'s setting.' };
    } },

  /* ---- instruments ----------------------------------------------------- */
  { id: 'reference-gauge', group: 'Instrumentation', label: 'Compare PTs with a reference gauge (system at rest)', needs: 'cell', dur: 60,
    run: S => {
      const Pa = S.def.physics.ambient.P, lines = [];
      for (const [id, vol] of [['PT-710', 'oxu'], ['PT-720', 'fuu'], ['PT-715', 'oxman'], ['PT-725', 'fuman'], ['PT-801', 'chamber']]) {
        const ref = (S.model.net.vol(vol).P - Pa) / psi(1) + S.rng.gauss() * 0.1;
        const pt = S.daq.latest(id) / psi(1);
        lines.push([`${id}`, `reference ${ref.toFixed(1)} · PT ${Number.isFinite(pt) ? pt.toFixed(1) : '----'} psig`, 'agree within 0.5 psi']);
      }
      return { lines, text: 'A calibrated test gauge on each transducer\'s spare port in turn. PT-801 is compared with the open chamber — the cell.' };
    } },
  { id: 'continuity', group: 'Instrumentation', label: 'Loop / continuity check from the rack', needs: 'rack', dur: 30,
    run: S => {
      const lines = [];
      for (const s of S.daq.sensors) {
        if (s.kind === 'TC') lines.push([`${s.id} loop`, s.open ? 'OPEN' : `${(12 + S.rng.gauss() * 0.3).toFixed(1)} Ω`, '≈ 12 Ω']);
        if (['PT-801', 'LC-901'].includes(s.id)) lines.push([`${s.id} bridge`, s.open ? 'OPEN' : `${(350 + S.rng.gauss() * 0.8).toFixed(0)} Ω`, '350 ± 5 Ω']);
      }
      lines.push(['IGN-901 exciter primary', `${(4.2 + S.rng.gauss() * 0.05).toFixed(1)} Ω`, '≈ 4.2 Ω']);
      lines.push(['IGN-901 HT circuit (insulation tester)', S.model.chamber.igniter.open ? 'OPEN — no load on the HT side' : 'continuous', 'continuous']);
      return { lines };
    } },
  { id: 'inspect-tc', group: 'Instrumentation', label: 'Inspect the chamber thermocouples', needs: 'cell', dur: 40,
    run: S => ({ lines: ['TC-802', 'TC-803'].map(id => [`${id} junction and lead`, S.daq.sensor(id).open ? 'broken lead' : 'intact, clamped', 'intact']) }) },
  { id: 'electrical', group: 'Instrumentation', label: 'Inspect connectors, cables and shields', needs: 'cell', dur: 60,
    run: () => ({ lines: [['Connectors', 'all seated and locked', 'seated, locked'], ['Shields', 'terminated at the DAQ end', 'terminated'], ['Routing', 'signal cables clear of the igniter HT lead', 'separated']] }) },
];
