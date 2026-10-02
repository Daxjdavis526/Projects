/* TS-3 P&ID layout. Geometry only (see ts1-pid.js for the conventions).

   Gas along the top: the bottle bank, the header, the two tank pressure
   branches and, on the right, the turbine drive branch. The run tanks hang
   off the header with their pumps directly beneath them; the turbopump's
   shaft runs left to right through the ox pump, the fuel pump and the
   turbine. The two discharge lines run along the bottom to the catch tank:
   fuel on the upper line, ox on the lower. */

const H = 50;            // supply header
const B = 128;           // regulator branches
const SH = 400;          // the shaft
const FU = 470;          // fuel discharge line
const OX = 530;          // ox discharge line
const XO = 540, XF = 820, XT = 1100;   // ox pump, fuel pump, turbine
const CT = 1238;         // catch tank

export default {
  viewBox: [0, 0, 1280, 580],
  legend: 'bottom',
  main: H,
  mainLine: ['HV-300', 'IV-301', 'PR-410', 'PR-420', 'PR-330', 'CV-411', 'CV-421', 'TSV-332', 'TNZ-337'],
  flowMeters: { ox: 'FT-416', fu: 'FT-426' },
  speedChannel: 'SPD',
  segments: [
    { vol: 'tank', pts: [[92, 262], [104, 262]] },
    { vol: 'sup', pts: [[132, 262], [170, 262]] },
    { vol: 'hp', pts: [[200, 262], [232, 262], [232, H], [960, H]] },
    // header vent
    { vol: 'hp', pts: [[300, H], [300, 76]] },
    { vol: 'vent', from: 'VV-301', pts: [[300, 100], [300, 118]] },
    // ox-side tank pressurisation
    { vol: 'hp', pts: [[372, H], [372, B], [392, B]] },
    { vol: 'oxreg', pts: [[436, B], [478, B]] },
    { vol: 'oxu', pts: [[502, B], [XO, B], [XO, 168]] },
    { vol: 'vent', from: 'VV-413', pts: [[575, 112], [575, 94]] },
    { vol: 'oxu', pts: [[575, 168], [575, 136]] },
    // fuel-side tank pressurisation
    { vol: 'hp', pts: [[652, H], [652, B], [672, B]] },
    { vol: 'fureg', pts: [[716, B], [758, B]] },
    { vol: 'fuu', pts: [[782, B], [XF, B], [XF, 168]] },
    { vol: 'vent', from: 'VV-423', pts: [[855, 112], [855, 94]] },
    { vol: 'fuu', pts: [[855, 168], [855, 136]] },
    // turbine drive
    { vol: 'hp', pts: [[960, H], [960, B], [963, B]] },
    { vol: 'treg', pts: [[1007, B], [1128, B]] },
    { vol: 'treg', pts: [[1030, B], [1030, 178]] },
    { vol: 'treg', pts: [[1075, B], [1075, 184]] },
    { vol: 'vent', from: 'VV-338', pts: [[1075, 208], [1075, 226]] },
    { vol: 'tin', pts: [[1162, B], [1180, B], [1180, 352], [XT + 22, 352], [XT + 22, 376]] },
    // turbine exhaust to the stack
    { vol: 'vent', from: 'TNZ-337', pts: [[XT + 32, SH], [1250, SH], [1250, 300]] },
    // suction lines
    { vol: 'oxsuc', liquid: true, pts: [[XO, 322], [XO, SH - 22]] },
    { vol: 'fusuc', liquid: true, pts: [[XF, 322], [XF, SH - 22]] },
    // fuel discharge
    { vol: 'fudis', liquid: true, pts: [[XF, SH + 22], [XF, FU], [870, FU]] },
    { vol: 'fuman', liquid: true, pts: [[906, FU], [1132, FU]] },
    { vol: 'vent', from: 'THR-FUG', liquid: true, pts: [[1168, FU], [CT - 22, FU]] },
    // ox discharge
    { vol: 'oxdis', liquid: true, pts: [[XO, SH + 22], [XO, OX], [600, OX]] },
    { vol: 'oxman', liquid: true, pts: [[636, OX], [1132, OX]] },
    { vol: 'vent', from: 'THR-OXG', liquid: true, pts: [[1168, OX], [CT - 22, OX]] },
  ],
  symbols: [
    { id: 'N2-B', type: 'bottle', x: 60, y: 262, w: 60, h: 220, port: 262, gas: 'N₂', size: '6 × K' },
    { id: 'HV-300', type: 'handValve', x: 118, y: 262 },
    { id: 'IV-301', type: 'ballValve', x: 185, y: 262, actuator: 'pneumatic' },
    { id: 'VV-301', type: 'solenoidValve', x: 300, y: 88, vertical: true, vent: true },
    { id: 'PR-410', type: 'regulator', x: 414, y: B },
    { id: 'EPC-410', type: 'epc', x: 414, y: 86, channel: 'EPC-410', reg: 'PR-410' },
    { id: 'CV-411', type: 'checkValve', x: 490, y: B },
    { id: 'T-410', type: 'tank', x: XO, y: 245, w: 84, h: 154, scale: 'WT-411', capacity: 60, label: 'OX SIDE', sub: 'T-410 · 60 L · water' },
    { id: 'VV-413', type: 'solenoidValve', x: 575, y: 124, vertical: true, vent: true },
    { id: 'RV-412', type: 'relief', x: 506, y: 196, set: '150' },
    { id: 'PR-420', type: 'regulator', x: 694, y: B },
    { id: 'EPC-420', type: 'epc', x: 694, y: 86, channel: 'EPC-420', reg: 'PR-420' },
    { id: 'CV-421', type: 'checkValve', x: 770, y: B },
    { id: 'T-420', type: 'tank', x: XF, y: 245, w: 84, h: 154, scale: 'WT-421', capacity: 60, label: 'FUEL SIDE', sub: 'T-420 · 60 L · water' },
    { id: 'VV-423', type: 'solenoidValve', x: 855, y: 124, vertical: true, vent: true },
    { id: 'RV-422', type: 'relief', x: 786, y: 196, set: '150' },
    { id: 'PR-330', type: 'regulator', x: 985, y: B },
    { id: 'EPC-330', type: 'epc', x: 985, y: 86, channel: 'EPC-330', reg: 'PR-330' },
    { id: 'RV-331', type: 'relief', x: 1030, y: 200, set: '500', labBelow: true },
    { id: 'VV-338', type: 'solenoidValve', x: 1075, y: 196, vertical: true, vent: true, nc: true, labRight: true },
    { id: 'TSV-332', type: 'ballValve', x: 1145, y: B, actuator: 'pneumatic' },
    // the turbopump
    { id: 'TPA-1', type: 'shaft', x: XO, y: SH, x1: XT - 22, label: 'TPA-1' },
    { id: 'P-OX', type: 'pump', x: XO, y: SH, label: 'OX' },
    { id: 'P-FU', type: 'pump', x: XF, y: SH, label: 'FUEL' },
    { id: 'TURB', type: 'turbine', x: XT, y: SH },
    // discharge
    { id: 'DV-424', type: 'ballValve', x: 888, y: FU, actuator: 'pneumatic', zs: 'DV-424', below: true },
    { id: 'FCV-428', type: 'throttle', x: 1150, y: FU, pos: 'ZT-428' },
    { id: 'DV-414', type: 'ballValve', x: 618, y: OX, actuator: 'pneumatic', zs: 'DV-414', below: true },
    { id: 'FCV-418', type: 'throttle', x: 1150, y: OX, pos: 'ZT-418' },
    { id: 'CATCH', type: 'catch', x: CT + 8, y: (FU + OX) / 2 },
  ],
  instruments: [
    { id: 'PT-301', x: 150, y: 318, tap: [150, 262], lab: 'below' },
    { id: 'PT-302', x: 196, y: 150, tap: [232, 150], lab: 'left' },
    { id: 'PT-410', x: 470, y: 268, tap: [498, 268], lab: 'below' },
    { id: 'WT-411', x: 612, y: 300, tap: [582, 300], tag: ['WT', '411'], lab: 'right' },
    { id: 'PT-420', x: 750, y: 268, tap: [778, 268], lab: 'below' },
    { id: 'WT-421', x: 892, y: 300, tap: [862, 300], tag: ['WT', '421'], lab: 'right' },
    { id: 'PT-413', x: 500, y: 360, tap: [XO, 360], lab: 'left' },
    { id: 'PT-423', x: 780, y: 360, tap: [XF, 360], lab: 'left' },
    { id: 'VIB-345', x: 680, y: 356, tap: [680, SH], tag: ['VIB', '345'], lab: 'above' },
    { id: 'SE-341', x: 950, y: 356, tap: [950, SH], tag: ['SE', '341'], lab: 'above' },
    { id: 'SE-342', x: 1010, y: 356, tap: [1010, SH], tag: ['SE', '342'], lab: 'right' },
    { id: 'PT-414', x: 490, y: 470, tap: [XO, 470], lab: 'left' },
    { id: 'PT-424', x: 770, y: 490, tap: [XF, 462], lab: 'left' },
    { id: 'FT-416', x: 720, y: 560, tap: [720, OX], lab: 'right' },
    { id: 'PT-417', x: 1060, y: 560, tap: [1060, OX], lab: 'left' },
    { id: 'FT-426', x: 960, y: 436, tap: [960, FU], lab: 'right' },
    { id: 'PT-427', x: 1010, y: 502, tap: [1010, FU], lab: 'left' },
    { id: 'PT-336', x: 1000, y: 262, tap: [1012, B], lab: 'below' },
    { id: 'PT-333', x: 1225, y: 200, tap: [1180, 200], lab: 'below' },
    { id: 'TT-335', x: 1218, y: 362, tap: [1250, 362], tag: ['TT', '335'], lab: 'above' },
  ],
  labels: [
    { text: 'SUPPLY HEADER · 4000 psig CLASS', x: 640, y: 38, anchor: 'middle' },
    { text: 'TURBINE DRIVE', x: 1075, y: 108, anchor: 'middle' },
    { text: 'VENT', x: 300, y: 132, anchor: 'middle' },
    { text: 'VENT', x: 575, y: 88, anchor: 'middle' },
    { text: 'VENT', x: 855, y: 88, anchor: 'middle' },
    { text: 'EXHAUST → STACK', x: 1250, y: 290, anchor: 'end' },
    { text: 'FUEL-SIDE DISCHARGE', x: 935, y: FU - 8, anchor: 'start' },
    { text: 'OX-SIDE DISCHARGE', x: 760, y: OX - 8, anchor: 'start' },
  ],
};
