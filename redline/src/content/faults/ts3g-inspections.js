/* The inspection workbench for TS-3G. Measurements and observations with
   the expected value beside them, never a verdict; they read the hardware's
   actual condition (the fault hooks), with a real measurement's scatter.

   needs: 'rack' | 'cell' | 'vented'. dry: true — the propellant system is
   opened (drain first). */

const C = k => `${(k - 273.15).toFixed(0)} °C`;
const mm2 = x => `${(x * 1e6).toFixed(3)} mm²`;

export const INSPECTIONS = [
  /* ---- the engine ------------------------------------------------------ */
  { id: 'spark-check', group: 'Engine', label: 'Spark-check both igniters (main through the nozzle, GG through its inspection port)', needs: 'cell', dur: 40,
    run: S => {
      const m = S.model, a = m.chamber.igniter, b = m.gg.igniter;
      S.controller.sparkChecked = true;
      const spark = ig => (ig.open ? 'none — exciter dead' : ig.fail ? 'none (exciter buzzing)' : ig.weak > 0.1 ? 'irregular, weak, thin orange' : 'regular, strong, blue');
      return { lines: [
        ['IGN-501 exciter current', a.open ? '0.0 A' : `${(1.8 + S.rng.gauss() * 0.03).toFixed(2)} A`, '≈ 1.8 A'],
        ['IGN-501 spark', spark(a), 'regular, strong, blue'],
        ['IGN-502 exciter current', b.open ? '0.0 A' : `${(1.6 + S.rng.gauss() * 0.03).toFixed(2)} A`, '≈ 1.6 A'],
        ['IGN-502 spark', spark(b), 'regular, strong, blue']],
        text: 'Propellant valves shut, both chambers dry, everyone else clear.' };
    } },
  { id: 'inspect-igniter', group: 'Engine', label: 'Pull and inspect both igniter plugs', needs: 'vented', dry: true, dur: 120,
    run: S => {
      const m = S.model;
      const plug = ig => (ig.fail ? 'electrode bridged with soot — fouled' : ig.weak > 0.1 ? 'electrode worn round, gap 1.6 mm' : 'clean, gap 1.0 mm');
      return { lines: [['IGN-501 plug', plug(m.chamber.igniter), 'clean, gap 1.0 ± 0.1 mm'], ['IGN-502 plug', plug(m.gg.igniter), 'clean, gap 1.0 ± 0.1 mm'], ['HT leads', 'seated, locked', 'seated, locked']] };
    } },
  { id: 'liner-ultrasonic', group: 'Engine', label: 'Ultrasonic thickness of the ablative liner (four stations, throat plane)', needs: 'vented', dur: 300,
    run: S => {
      const C8 = S.model.chamber, t = C8.spec.ablative.t - C8.abl.char;
      const r = () => (t * 1000 + S.rng.gauss() * 0.15).toFixed(1) + ' mm';
      return { lines: [['Liner, 0°', r(), '14.0 mm new'], ['Liner, 90°', r(), '14.0 mm new'], ['Liner, 180°', r(), '14.0 mm new'], ['Liner, 270°', r(), '14.0 mm new'],
        ['Char layer (core sample, exit lip)', C8.abl.char > 0.001 ? 'black, firm' : 'none', '—']],
        text: 'The ultrasonic sees the boundary between the char and the virgin liner: what is left is what insulates the case.' };
    } },
  { id: 'throat-gauge', group: 'Engine', label: 'Pin-gauge the throat', needs: 'vented', dry: true, dur: 120,
    run: S => {
      const C8 = S.model.chamber, d = C8.Dt0 + C8.abl.eroded + S.rng.gauss() * 0.00002;
      return { lines: [['Throat diameter', `${(d * 1e3).toFixed(2)} mm`, `${(C8.Dt0 * 1e3).toFixed(2)} mm drawing`], ['Throat surface', C8.abl.eroded > 0.0003 ? 'charred, slightly scalloped' : 'charred, smooth', 'charred, smooth']] };
    } },
  { id: 'gg-orifice-flow', group: 'Gas generator', label: 'Remove the GG orifices and flow them with water on the bench', needs: 'vented', dry: true, dur: 600,
    run: S => {
      const m = S.model, d = S.def.design, o = m.line('ox').tap, f = m.line('fu').tap;
      const cda = (T, k) => T.CdA * (1 + T.erosion) * (1 - T.blockage) * (1 + S.rng.gauss() * 0.004) * k;
      return { lines: [
        ['GG oxidiser orifice CdA', mm2(cda(o, 1)), `${mm2(d.CdAggOx)} drawing`],
        ['GG fuel orifice CdA', mm2(cda(f, 1)), `${mm2(d.CdAggFu)} drawing`],
        ['Ox orifice bore (optical)', o.erosion > 0.05 ? 'edge rounded, bore polished' : 'sharp edge', 'sharp edge'],
        ['Fuel orifice bore (optical)', f.blockage > 0.05 ? 'partly occluded by a dark flake' : 'clear', 'clear']] };
    } },
  { id: 'gg-injector-inspect', group: 'Gas generator', label: 'Borescope the GG injector face and the turbine manifold', needs: 'vented', dry: true, dur: 300,
    run: S => {
      const m = S.model, f = m.line('fu').tap;
      return { lines: [['GG injector face', f.blockage > 0.05 ? 'one fuel element partly blocked; light coking round it' : 'light uniform soot', 'light uniform soot'],
        ['Turbine manifold', m.gg.peak.P > 1.6 * m.gg.spec.Pnom ? 'soot streaks, a scorched gasket' : 'light soot', 'light soot'],
        ['Turbine nozzle vanes', 'intact', 'intact']] };
    } },
  /* ---- the turbopump --------------------------------------------------- */
  { id: 'inducer-borescope', group: 'Turbopump', label: 'Borescope both inducers through the pump inlets', needs: 'vented', dry: true, dur: 300,
    run: S => {
      const P = S.model.tp.pumps;
      const look = p => (p.npshScale > 1.2 ? 'leading-edge nicks on two blades, tips burred' : 'leading edges sharp, no damage');
      return { lines: [['Ox inducer', look(P.ox), 'sharp, undamaged'], ['Fuel inducer', look(P.fu), 'sharp, undamaged']] };
    } },
  { id: 'bearing-check', group: 'Turbopump', label: 'Open the pump-end bearing housing and inspect the bearings', needs: 'vented', dry: true, dur: 600,
    run: S => {
      const T = S.model.tp;
      return { lines: [['Pump-end bearing races', T.brgFactor > 1.3 ? 'spalling on the inner race' : 'clean, no marks', 'clean'], ['Highest bearing temperature this session', C(Math.max(T.brg.pb, T.brg.tb)), '< 90 °C']] };
    } },
  /* ---- the stand ------------------------------------------------------- */
  { id: 'reg-bench', group: 'Stand', label: 'Flow-test the start gas regulator PR-330 (outlet at 0.1 kg/s against its dome)', needs: 'vented', dur: 420,
    run: S => {
      const e = S.model.element('PR-330'), k = e.droopScale ?? 1;
      const at = Math.round(220 - 12 * k + S.rng.gauss() * 1.5);
      return { lines: [['Lock-up at 220 psig dome', `${(220 + S.rng.gauss() * 0.5).toFixed(0)} psig`, '220 ± 3 psig'], ['Outlet at 0.1 kg/s', `${at} psig`, '≥ 205 psig'], ['Dome seal', k > 2 ? 'worn, weeping' : 'good', 'good']] };
    } },
  { id: 'tc-reference', group: 'Instruments', label: 'Check TT-334 and TT-335 against a reference probe in a hot block (600 °C)', needs: 'vented', dur: 240,
    run: S => {
      const s = S.daq.sensor('TT-334'), Tref = 873.15;
      const read = (Tref + s.bias) * s.chainGain;
      return { lines: [['Reference probe', C(Tref), '—'], ['TT-334', C(read + S.rng.gauss() * 0.5), C(Tref)], ['TT-335', C(Tref + S.rng.gauss() * 0.5), C(Tref)],
        ['TT-334 extension wire', s.chainGain < 0.97 ? 'type marking does not match the thermocouple' : 'matches (type K)', 'type K']] };
    } },
  { id: 'meter-check', group: 'Instruments', label: 'Check the flowmeter K-factors against their calibration certificates', needs: 'rack', dur: 120,
    run: S => {
      const k = id => S.daq.sensor(id).chainGain;
      return { lines: [['FT-416 K-factor in the DAQ', k('FT-416') > 1.02 ? 'does not match the certificate (another meter\'s)' : 'matches the certificate', 'matches'], ['FT-426 K-factor in the DAQ', 'matches the certificate', 'matches']] };
    } },
  { id: 'valve-stroke', group: 'Stand', label: 'Stroke the main and GG valves and time them against their limit switches', needs: 'vented', dur: 240,
    run: S => {
      const t = (id, base) => `${Math.round(base * (S.model.element(id).strokeScale ?? 1) * 1000)} ms`;
      return { lines: [['MOV-414', t('MOV-414', 0.3), '≈ 300 ms'], ['MFV-424', t('MFV-424', 0.3), '≈ 300 ms'], ['GOV-416', t('GOV-416', 0.06), '≈ 60 ms'], ['GFV-426', t('GFV-426', 0.06), '≈ 60 ms']] };
    } },
];
