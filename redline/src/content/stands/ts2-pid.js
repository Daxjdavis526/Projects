/* TS-2 P&ID layout. Geometry only (see ts1-pid.js for the conventions).

   Pressurant runs along the top; the two run tanks hang off it, each with
   its regulator and check valve; the purge regulator feeds both manifolds
   from the right. Liquid runs along the bottom to the engine: oxidiser on
   the lower line, entering the injector from below, fuel on the upper line,
   entering from above. Segments flagged `liquid` are drawn as liquid lines
   (they carry water in phase 6). */

const H = 50;           // pressurant header
const B = 128;          // regulator branches
const OX = 440;         // oxidiser run line
const FU = 392;         // fuel run line

export default {
  viewBox: [0, 0, 1280, 520],
  legend: 'bottom',          // the top-left is busy with the header and vents
  main: H,
  mainLine: ['HV-600', 'IV-601', 'PR-610', 'PR-620', 'PR-630', 'CV-611', 'CV-621', 'PV-631', 'PV-632', 'CV-633', 'CV-634', 'MOV-713', 'MFV-723'],
  segments: [
    { vol: 'tank', pts: [[92, 262], [104, 262]] },
    { vol: 'sup', pts: [[132, 262], [170, 262]] },
    { vol: 'hp', pts: [[200, 262], [232, 262], [232, H], [990, H]] },
    // header vent
    { vol: 'hp', pts: [[320, H], [320, 76]] },
    { vol: 'vent', from: 'VV-601', pts: [[320, 100], [320, 118]] },
    // oxidiser pressurant branch
    { vol: 'hp', pts: [[372, H], [372, B], [392, B]] },
    { vol: 'oxreg', pts: [[436, B], [478, B]] },
    { vol: 'oxu', pts: [[502, B], [540, B], [540, 168]] },
    { vol: 'vent', from: 'VV-711', pts: [[575, 112], [575, 94]] },
    { vol: 'oxu', pts: [[575, 168], [575, 136]] },
    // fuel pressurant branch
    { vol: 'hp', pts: [[652, H], [652, B], [672, B]] },
    { vol: 'fureg', pts: [[716, B], [758, B]] },
    { vol: 'fuu', pts: [[782, B], [820, B], [820, 168]] },
    { vol: 'vent', from: 'VV-721', pts: [[855, 112], [855, 94]] },
    { vol: 'fuu', pts: [[855, 168], [855, 136]] },
    // purge
    { vol: 'hp', pts: [[990, H], [990, B], [1006, B]] },
    { vol: 'purge', pts: [[1050, B], [1252, B]] },
    { vol: 'purge', pts: [[1060, B], [1060, 158]] },
    { vol: 'fupl', pts: [[1060, 206], [1060, 230]] },
    { vol: 'fuman', pts: [[1060, 272], [1060, FU]] },
    { vol: 'purge', pts: [[1252, B], [1252, 158]] },
    { vol: 'oxpl', pts: [[1252, 206], [1252, 230]] },
    { vol: 'oxman', pts: [[1252, 272], [1252, 488], [1010, 488], [1010, OX]] },
    // oxidiser liquid
    { vol: 'oxline', liquid: true, pts: [[540, 322], [540, OX], [640, OX]] },
    { vol: 'oxman', liquid: true, pts: [[684, OX], [1100, OX], [1100, 318], [1120, 318]] },
    // fuel liquid
    { vol: 'fuline', liquid: true, pts: [[820, 322], [820, FU], [908, FU]] },
    { vol: 'fuman', liquid: true, pts: [[952, FU], [1060, FU]] },
    { vol: 'fuman', liquid: true, pts: [[1060, FU], [1080, FU], [1080, 290], [1120, 290]] },
  ],
  symbols: [
    { id: 'N2-K', type: 'bottle', x: 60, y: 262, w: 60, h: 220, port: 262, gas: 'N₂', size: '49 L' },
    { id: 'HV-600', type: 'handValve', x: 118, y: 262 },
    { id: 'IV-601', type: 'ballValve', x: 185, y: 262, actuator: 'pneumatic' },
    { id: 'VV-601', type: 'solenoidValve', x: 320, y: 88, vertical: true, vent: true },
    { id: 'PR-610', type: 'regulator', x: 414, y: B },
    { id: 'EPC-610', type: 'epc', x: 414, y: 86, channel: 'EPC-610', reg: 'PR-610' },
    { id: 'CV-611', type: 'checkValve', x: 490, y: B },
    { id: 'T-710', type: 'tank', x: 540, y: 245, w: 84, h: 154, scale: 'WT-716', capacity: 12, label: 'OX', sub: 'T-710 · 12 L' },
    { id: 'VV-711', type: 'solenoidValve', x: 575, y: 124, vertical: true, vent: true },
    { id: 'RV-712', type: 'relief', x: 506, y: 196, set: '660' },
    { id: 'PR-620', type: 'regulator', x: 694, y: B },
    { id: 'EPC-620', type: 'epc', x: 694, y: 86, channel: 'EPC-620', reg: 'PR-620' },
    { id: 'CV-621', type: 'checkValve', x: 770, y: B },
    { id: 'T-720', type: 'tank', x: 820, y: 245, w: 84, h: 154, scale: 'WT-726', capacity: 10, label: 'FUEL', sub: 'T-720 · 10 L' },
    { id: 'VV-721', type: 'solenoidValve', x: 855, y: 124, vertical: true, vent: true },
    { id: 'RV-722', type: 'relief', x: 786, y: 196, set: '660' },
    { id: 'PR-630', type: 'regulator', x: 1028, y: B },
    { id: 'EPC-630', type: 'epc', x: 1028, y: 86, channel: 'EPC-630', reg: 'PR-630' },
    { id: 'PV-632', type: 'solenoidValve', x: 1060, y: 182, vertical: true },
    { id: 'CV-634', type: 'checkValve', x: 1060, y: 251, vertical: true },
    { id: 'PV-631', type: 'solenoidValve', x: 1252, y: 182, vertical: true },
    { id: 'CV-633', type: 'checkValve', x: 1252, y: 251, vertical: true },
    { id: 'MOV-713', type: 'ballValve', x: 662, y: OX, actuator: 'pneumatic', zs: 'MOV-713', below: true },
    { id: 'MFV-723', type: 'ballValve', x: 930, y: FU, actuator: 'pneumatic', zs: 'MFV-723', below: true },
    { id: 'BPE-1', type: 'engine', x: 1120, y: 304 },
    { id: 'IGN-901', type: 'igniter', x: 1000, y: 215, to: [1134, 280] },
    { id: 'LC-901', type: 'thrustStand', x: 1120, y: 304, span: [1104, 1240], lc: [1090, 352] },
  ],
  instruments: [
    { id: 'PT-601', x: 150, y: 318, tap: [150, 262], lab: 'below' },
    { id: 'PT-602', x: 196, y: 150, tap: [232, 150], lab: 'left' },
    { id: 'PT-710', x: 470, y: 268, tap: [498, 268], lab: 'below' },
    { id: 'WT-716', x: 470, y: 340, tap: [498, 310], tag: ['WT', '716'], lab: 'below' },
    { id: 'PT-720', x: 750, y: 268, tap: [778, 268], lab: 'below' },
    { id: 'WT-726', x: 750, y: 340, tap: [778, 310], tag: ['WT', '726'], lab: 'below' },
    { id: 'PT-713', x: 600, y: 478, tap: [600, OX], lab: 'below' },
    { id: 'FT-714', x: 760, y: 478, tap: [760, OX], lab: 'below' },
    { id: 'PT-715', x: 880, y: 478, tap: [880, OX], lab: 'below' },
    { id: 'PT-723', x: 872, y: 352, tap: [872, FU], lab: 'left' },
    { id: 'FT-724', x: 990, y: 418, tap: [990, FU], lab: 'right' },
    { id: 'PT-725', x: 1040, y: 352, tap: [1040, FU], lab: 'above' },
    { id: 'PT-630', x: 1150, y: 166, tap: [1150, B], lab: 'below' },
    { id: 'PT-801', x: 1150, y: 262, tap: [1132, 282], lab: 'above' },
    // engine instruments, hot fire: along the bottom, under the stand
    { id: 'TC-802', x: 1040, y: 470, tap: [1150, 318], lab: 'below' },
    { id: 'TC-803', x: 1100, y: 470, tap: [1196, 312], lab: 'below' },
    { id: 'VIB-805', x: 1160, y: 470, tap: [1140, 326], tag: ['VIB', '805'], lab: 'below' },
    { id: 'OD-804', x: 1220, y: 470, tap: [1236, 304], tag: ['OD', '804'], lab: 'below' },
  ],
  labels: [
    { text: 'PRESSURANT HEADER · 4000 psig CLASS', x: 800, y: 38, anchor: 'middle' },
    { text: 'PURGE', x: 1150, y: 116, anchor: 'middle' },
    { text: 'OXIDISER', x: 560, y: OX - 6, anchor: 'start' },
    { text: 'FUEL', x: 826, y: FU + 16, anchor: 'start' },
    { text: 'VENT', x: 320, y: 132, anchor: 'middle' },
    { text: 'VENT', x: 575, y: 88, anchor: 'middle' },
    { text: 'VENT', x: 855, y: 88, anchor: 'middle' },
    { text: 'CATCH AREA', x: 1226, y: 404, anchor: 'end' },
  ],
  exhaust: { x: 1200, y: 304, channel: 'PT-801', spray: ['PT-715', 'PT-725'] },
};
