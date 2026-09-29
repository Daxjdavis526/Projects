/* TS-1 P&ID layout. Pure geometry: which symbol sits where, which line
   segment belongs to which gas volume, where each instrument bubble is and
   where it taps the process. The renderer (ui/panels/pid.js) draws symbols
   by type and colours each segment from the INSTRUMENT on it — never from
   the physics — exactly as a real HMI can only show what its sensors say.

   Coordinates are in a 1280 × 460 drawing space; the main process line runs
   at y = 230, flow left to right. */

const Y = 230;

export default {
  viewBox: [0, 0, 1280, 460],
  main: Y,
  segments: [
    { vol: 'tank', pts: [[120, Y], [150, Y]] },
    { vol: 'sup', pts: [[180, Y], [290, Y]] },
    { vol: 'hp', pts: [[320, Y], [475, Y]] },
    { vol: 'hp', pts: [[395, Y], [395, 168]] },
    { vol: 'lp', pts: [[505, Y], [695, Y]] },
    { vol: 'lp', pts: [[630, Y], [630, 172]] },
    { vol: 'feed', pts: [[725, Y], [935, Y]] },
    { vol: 'feed', pts: [[880, Y], [880, 168]] },
    { vol: 'chamber', pts: [[965, Y], [1020, Y]] },
    { vol: 'dome', pts: [[490, 168], [490, 212]], thin: true },
    // vent header (always atmospheric; shows flow when anything vents)
    { vol: 'vent', from: 'VV-101', pts: [[395, 132], [395, 70]] },
    { vol: 'vent', from: 'RV-201', pts: [[630, 128], [630, 70]] },
    { vol: 'vent', from: 'VV-201', pts: [[880, 132], [880, 70]] },
    { vol: 'vent', pts: [[395, 70], [1150, 70], [1150, 40]] },
  ],
  symbols: [
    { id: 'N2-K', type: 'bottle', x: 80, y: 240, w: 76, h: 250 },
    { id: 'HV-100', type: 'handValve', x: 165, y: Y },
    { id: 'IV-101', type: 'ballValve', x: 305, y: Y, actuator: 'pneumatic' },
    { id: 'VV-101', type: 'solenoidValve', x: 395, y: 150, vertical: true, vent: true },
    { id: 'PR-101', type: 'regulator', x: 490, y: Y },
    { id: 'EPC-101', type: 'epc', x: 490, y: 146 },
    { id: 'RV-201', type: 'relief', x: 630, y: 150 },
    { id: 'F-201', type: 'filter', x: 710, y: Y },
    { id: 'VV-201', type: 'solenoidValve', x: 880, y: 150, vertical: true, vent: true },
    { id: 'SV-301', type: 'solenoidValve', x: 950, y: Y, fire: true },
    { id: 'CGT-1', type: 'thruster', x: 1020, y: Y },
    { id: 'LC-501', type: 'thrustStand', x: 1010, y: Y },
  ],
  instruments: [
    { id: 'PT-101', x: 235, y: 300, tap: [235, Y] },
    { id: 'PT-102', x: 440, y: 300, tap: [440, Y] },
    { id: 'PT-201', x: 560, y: 300, tap: [560, Y] },
    { id: 'PT-301', x: 770, y: 300, tap: [770, Y] },
    { id: 'TC-301', x: 830, y: 300, tap: [830, Y] },
    { id: 'PT-401', x: 993, y: 158, tap: [993, Y] },
    { id: 'TC-401', x: 1048, y: 158, tap: [1044, 214] },
    { id: 'TC-101', x: 80, y: 410, tap: [80, 366] },
    { id: 'SV-301-I', x: 930, y: 158, tap: [950, 214], tag: ['IT', '301'] },
    { id: 'LC-501', x: 905, y: 392, tap: [908, 280], tag: ['WT', '501'] },
  ],
  labels: [
    { text: 'HIGH PRESSURE · 4000 psig CLASS', x: 332, y: 212 },
    { text: 'LOW PRESSURE · MAWP 300 psig', x: 518, y: 212 },
    { text: 'TO VENT STACK', x: 1162, y: 44, anchor: 'start' },
    { text: 'THRUST STAND', x: 1070, y: 350 },
    { text: 'EXHAUST', x: 1210, y: 262 },
  ],
  exhaust: { x: 1100, y: Y },
};
