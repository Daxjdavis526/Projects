/* The inspection workbench for TS-3. Same contract as the other stands:
   results are measurements and observations with the expected value beside
   them, never a verdict, and they read the hardware's actual condition (the
   fault hooks), with a real measurement's scatter.

   needs: 'rack' (from the control room) | 'cell' (in the cell, stand as it
   is) | 'vented' (the turbopump or a valve is opened up). Nothing is opened
   while the rotor turns. */

const C = k => `${(k - 273.15).toFixed(0)} °C`;
const rpmOf = S => S.model.tp.rpm;

export const INSPECTIONS = [
  /* ---- the turbopump --------------------------------------------------- */
  { id: 'bearing-check', group: 'Turbopump', label: 'Open the pump-end bearing housing and inspect the bearings', needs: 'vented', dur: 600,
    run: S => {
      const T = S.model.tp, bad = T.brgFactor > 1.4;
      return { lines: [
        ['Pump-end bearing races', bad ? 'spalling on the inner race, discoloured cage' : 'smooth, light running track', 'smooth running track'],
        ['Turbine-end bearing races (borescope)', 'smooth, light running track', 'smooth running track'],
        ['Coolant passages to the bearings', bad ? 'partly blocked with fibrous debris' : 'clear', 'clear'],
        ['Radial play, pump end', `${((bad ? 0.045 : 0.012) + S.rng.gauss() * 0.002).toFixed(3)} mm`, '0.008–0.018 mm'],
      ] };
    } },
  { id: 'wear-rings', group: 'Turbopump', label: 'Measure the impeller wear-ring clearances (both pumps)', needs: 'vented', dur: 480,
    run: S => {
      const o = S.model.tp.pumps.ox, f = S.model.tp.pumps.fu;
      const cl = p => (0.10 + 2.6 * p.headLoss + S.rng.gauss() * 0.004).toFixed(3);
      return { lines: [
        ['Ox impeller front wear ring, radial clearance', `${cl(o)} mm`, '0.08–0.12 mm'],
        ['Fuel impeller front wear ring, radial clearance', `${cl(f)} mm`, '0.08–0.12 mm'],
        ['Rub marks on the rings', S.model.tp.rub > 0 ? 'bright rub band all round the ox ring' : 'none', 'none'],
      ] };
    } },
  { id: 'inducer-borescope', group: 'Turbopump', label: 'Borescope both inducers through the pump inlets', needs: 'vented', dur: 300,
    run: S => {
      const line = p => (p.npshScale > 1.2 ? 'two blade leading edges chipped and bent, pitting behind them' : 'leading edges sharp and undamaged');
      return { lines: [
        ['Ox inducer blades', line(S.model.tp.pumps.ox), 'sharp, undamaged'],
        ['Fuel inducer blades', line(S.model.tp.pumps.fu), 'sharp, undamaged'],
      ] };
    } },
  { id: 'turbine-borescope', group: 'Turbopump', label: 'Borescope the turbine nozzles and blade row', needs: 'vented', dur: 360,
    run: S => {
      const T = S.model.tp, noz = S.model.net.el('TNZ-337'), nom = S.def.physics.elements.find(e => e.id === 'TNZ-337').CdA;
      const blocked = noz.CdA0 < 0.9 * nom;
      return { lines: [
        ['Nozzle passages (8)', blocked ? `${Math.round(8 * (1 - noz.CdA0 / nom))} of 8 partly or wholly blocked — white crystalline deposit` : 'all 8 clear', 'all clear'],
        ['Blade tips', T.turbEff < 0.92 ? 'several tips curled and missing, rub marks on the shroud' : 'square, no rub', 'square, no rub'],
        ['Disc rim', 'no cracks visible', 'no cracks visible'],
      ] };
    } },
  { id: 'rotor-runout', group: 'Turbopump', label: 'Dial-indicate the rotor: shaft runout and axial float', needs: 'vented', dur: 240,
    run: S => {
      const T = S.model.tp;
      return { lines: [
        ['Shaft runout at the turbine end (TIR)', `${(0.008 + 0.02 * (T.imbalance - 1) + S.rng.gauss() * 0.001).toFixed(3)} mm`, '≤ 0.015 mm'],
        ['Axial float', `${(0.10 + S.rng.gauss() * 0.005).toFixed(2)} mm`, '0.08–0.14 mm'],
        ['Breakaway torque (torque wrench)', `${((S.def.physics.turbopump.bearings.c0 * T.brgFactor + (T.rub > 0 ? 0.02 : 0)) * 1000 * (1 + S.rng.gauss() * 0.04)).toFixed(0)} N·mm`, '8–12 N·mm'],
      ] };
    } },
  /* ---- instruments ------------------------------------------------------ */
  { id: 'pickup-check', group: 'Instruments', label: 'Check both speed pickups: gap, wiring, signal (scope, rotor turned by drill)', needs: 'cell', dur: 240,
    run: S => {
      const a = S.daq.sensor('SE-341'), b = S.daq.sensor('SE-342');
      const gap = s => (s.intermittent > 0 ? 'connector backshell loose; signal drops out when the cable is flexed' : 'clean pulses, 6 per revolution');
      return { lines: [
        ['SE-341 air gap', `${(0.50 + S.rng.gauss() * 0.02).toFixed(2)} mm`, '0.4–0.6 mm'],
        ['SE-342 air gap', `${(0.50 + S.rng.gauss() * 0.02).toFixed(2)} mm`, '0.4–0.6 mm'],
        ['SE-341 signal on the scope', gap(a), 'clean pulses, 6 per revolution'],
        ['SE-342 signal on the scope', gap(b), 'clean pulses, 6 per revolution'],
      ] };
    } },
  { id: 'daq-speed-config', group: 'Instruments', label: 'Review the DAQ speed-channel configuration (teeth per revolution, scaling)', needs: 'rack', dur: 60,
    run: S => {
      const a = S.daq.sensor('SE-341'), b = S.daq.sensor('SE-342');
      const teeth = s => (Math.abs(s.chainGain - 1) > 0.02 ? Math.round(6 / s.chainGain) : 6);
      return { lines: [
        ['SE-341 teeth per revolution (configured)', String(teeth(a)), '6 (the wheel on TPA-1)'],
        ['SE-342 teeth per revolution (configured)', String(teeth(b)), '6'],
        ['SC-330 feedback', 'mean of SE-341 and SE-342', 'mean of SE-341 and SE-342'],
      ] };
    } },
  { id: 'meter-check', group: 'Instruments', label: 'Check the flowmeter K-factors against their calibration certificates', needs: 'rack', dur: 120,
    run: S => {
      const k = id => (S.daq.sensor(id).chainGain * (1 + S.rng.gauss() * 0.001)).toFixed(4);
      return { lines: [
        ['FT-416 K-factor in the DAQ ÷ certificate', k('FT-416'), '1.0000 ± 0.0010'],
        ['FT-426 K-factor in the DAQ ÷ certificate', k('FT-426'), '1.0000 ± 0.0010'],
      ] };
    } },
  /* ---- the stand -------------------------------------------------------- */
  { id: 'reg-bench', group: 'Stand', label: 'Bench-check the tank regulators PR-410 / PR-420 (relief seats)', needs: 'vented', dur: 420,
    run: S => {
      const a = S.model.net.el('PR-410V'), b = S.model.net.el('PR-420V');
      // standard litres per minute of nitrogen through the leak at 50 psig (choked)
      const slpm = a => a * (S.def.physics.ambient.P + 344738) * 0.685 / Math.sqrt(296.8 * 293) / 1.165 * 60000;
      const seat = e => (e.leakCdA > 0 ? `${slpm(e.leakCdA).toFixed(2)} sL/min past the relief seat at 50 psig — seat scored` : 'bubble-tight');
      return { lines: [['PR-410 relief seat', seat(a), 'bubble-tight'], ['PR-420 relief seat', seat(b), 'bubble-tight']] };
    } },
  { id: 'dv-stroke', group: 'Stand', label: 'Stroke DV-414 and DV-424 and measure their travel', needs: 'vented', dur: 180,
    run: S => {
      const t = id => S.model.element(id);
      const tr = v => `${Math.round(100 * (v.maxOpen ?? 1))} % of full travel`;
      return { lines: [['DV-414 travel', tr(t('DV-414')), '100 %'], ['DV-424 travel', tr(t('DV-424')), '100 %'],
        ['Actuator air supply', '85 psig', '80–90 psig']] };
    } },
];
