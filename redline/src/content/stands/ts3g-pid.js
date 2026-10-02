/* TS-3G P&ID layout. Geometry only (see ts1-pid.js for the conventions).

   The top half is TS-3's: the bank, the header, the two tank branches, and
   the start gas branch on the right — which now ends in the GAS GENERATOR
   instead of the turbine. The shaft runs left to right through the ox pump,
   the fuel pump and the turbine, with the gas generator beside the turbine
   and its exhaust going up to the berm. Below the shaft, the two GG taps
   (fuel above, oxidiser below — the oxidiser tap passes behind the fuel
   pump's discharge, drawn broken), then the two main discharge lines
   through the main valves to BPE-3 at the bottom right. The purge
   regulator is top right; its line to the main injector manifolds is drawn
   as off-page connectors. */

const H = 50;            // supply header
const B = 128;           // regulator branches
const SH = 380;          // the shaft
const XO = 540, XF = 820, XT = 1000;   // ox pump, fuel pump, turbine
const TF = 430, TO = 480;             // GG taps: fuel, oxidiser
const FU = 560, OX = 650;             // main discharge lines
const GX = 1150;                      // gas generator
const EX = 1040, EY = 610;            // BPE-3 injector face

export default {
  viewBox: [0, 0, 1280, 720],
  legend: 'bottom',
  main: H,
  mainLine: ['HV-300', 'IV-301', 'PR-410', 'PR-420', 'PR-330', 'PR-630', 'CV-411', 'CV-421', 'TSV-332', 'PV-635'],
  flowMeters: { ox: 'FT-416', fu: 'FT-426' },
  speedChannel: 'SPD',
  sparks: { 'IGN-501': 'IGN-I', 'IGN-502': 'IGG-I' },
  segments: [
    { vol: 'tank', pts: [[92, 262], [104, 262]] },
    { vol: 'sup', pts: [[132, 262], [170, 262]] },
    { vol: 'hp', pts: [[200, 262], [232, 262], [232, H], [1178, H]] },
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
    // start gas → the gas generator
    { vol: 'hp', pts: [[930, H], [930, B], [941, B]] },
    { vol: 'treg', pts: [[977, B], [1058, B]] },
    { vol: 'treg', pts: [[985, B], [985, 174]] },
    { vol: 'treg', pts: [[1040, B], [1040, 185]] },
    { vol: 'vent', from: 'VV-338', pts: [[1040, 207], [1040, 222]] },
    { vol: 'ggc', pts: [[1102, B], [GX, B], [GX, SH - 28]] },
    // the gas generator's outlet is the turbine manifold
    { vol: 'ggc', pts: [[GX - 20, SH], [XT + 32, SH]] },
    // turbine exhaust, up to the berm (lit while the turbine manifold holds gas)
    { vol: 'vent', flowIf: ['PT-333', 15], pts: [[1020, SH - 24], [1020, 300]] },
    // purge
    { vol: 'hp', pts: [[1178, H], [1178, B], [1188, B]] },
    { vol: 'purge', pts: [[1232, B], [1250, B], [1250, 279]] },
    { vol: 'ggc', pts: [[1250, 301], [1250, SH], [GX + 20, SH]] },
    // suction lines
    { vol: 'oxsuc', liquid: true, pts: [[XO, 322], [XO, SH - 22]] },
    { vol: 'fusuc', liquid: true, pts: [[XF, 322], [XF, SH - 22]] },
    // the gas generator's fuel tap, off the fuel pump's discharge
    { vol: 'fudis', liquid: true, pts: [[XF, SH + 22], [XF, FU], [850, FU]] },
    { vol: 'fudis', liquid: true, meter: 'GGF-FU', pts: [[XF, TF], [858, TF]] },
    { vol: 'ggc', liquid: true, meter: 'GGF-FU', pts: [[902, TF], [GX - 8, TF], [GX - 8, SH + 28]] },
    // the oxidiser tap, behind the fuel discharge
    { vol: 'oxdis', liquid: true, pts: [[XO, SH + 22], [XO, OX], [596, OX]] },
    { vol: 'oxdis', liquid: true, meter: 'GGF-OX', pts: [[XO, TO], [608, TO]] },
    { vol: 'ggc', liquid: true, meter: 'GGF-OX', pts: [[652, TO], [XF - 7, TO]] },
    { vol: 'ggc', liquid: true, meter: 'GGF-OX', pts: [[XF + 7, TO], [GX + 8, TO], [GX + 8, SH + 28]] },
    // main fuel: MFV-424, FT-426, the manifold, the injector
    { vol: 'fuman', liquid: true, pts: [[894, FU], [1015, FU], [1015, EY - 14], [EX, EY - 14]] },
    // main oxidiser: MOV-414, FT-416, the manifold, the injector
    { vol: 'oxman', liquid: true, pts: [[640, OX], [1025, OX], [1025, EY + 14], [EX, EY + 14]] },
    // main purges (from PR-630, off-page)
    { vol: 'purge', pts: [[948, 498], [990, 498], [990, 509]] },
    { vol: 'fuman', pts: [[990, 531], [990, FU]] },
    { vol: 'purge', pts: [[922, 702], [960, 702], [960, 691]] },
    { vol: 'oxman', pts: [[960, 669], [960, OX]] },
  ],
  symbols: [
    { id: 'N2-B', type: 'bottle', x: 60, y: 262, w: 60, h: 220, port: 262, gas: 'N₂', size: '6 × K' },
    { id: 'HV-300', type: 'handValve', x: 118, y: 262 },
    { id: 'IV-301', type: 'ballValve', x: 185, y: 262, actuator: 'pneumatic' },
    { id: 'VV-301', type: 'solenoidValve', x: 300, y: 88, vertical: true, vent: true },
    { id: 'PR-410', type: 'regulator', x: 414, y: B },
    { id: 'EPC-410', type: 'epc', x: 414, y: 86, channel: 'EPC-410', reg: 'PR-410' },
    { id: 'CV-411', type: 'checkValve', x: 490, y: B },
    { id: 'T-410', type: 'tank', x: XO, y: 245, w: 84, h: 154, scale: 'WT-411', capacity: 70, label: 'OXIDISER', sub: 'T-410 · 60 L' },
    { id: 'VV-413', type: 'solenoidValve', x: 575, y: 124, vertical: true, vent: true },
    { id: 'RV-412', type: 'relief', x: 506, y: 196, set: '150' },
    { id: 'PR-420', type: 'regulator', x: 694, y: B },
    { id: 'EPC-420', type: 'epc', x: 694, y: 86, channel: 'EPC-420', reg: 'PR-420' },
    { id: 'CV-421', type: 'checkValve', x: 770, y: B },
    { id: 'T-420', type: 'tank', x: XF, y: 245, w: 84, h: 154, scale: 'WT-421', capacity: 50, label: 'FUEL', sub: 'T-420 · 60 L' },
    { id: 'VV-423', type: 'solenoidValve', x: 855, y: 124, vertical: true, vent: true },
    { id: 'RV-422', type: 'relief', x: 786, y: 196, set: '150' },
    // start gas
    { id: 'PR-330', type: 'regulator', x: 955, y: B },
    { id: 'EPC-330', type: 'epc', x: 955, y: 86, channel: 'EPC-330', reg: 'PR-330' },
    { id: 'RV-331', type: 'relief', x: 985, y: 196, set: '500' },
    { id: 'VV-338', type: 'solenoidValve', x: 1040, y: 196, vertical: true, vent: true, nc: true, labRight: true },
    { id: 'TSV-332', type: 'ballValve', x: 1080, y: B, actuator: 'pneumatic' },
    // purge
    { id: 'PR-630', type: 'regulator', x: 1210, y: B },
    { id: 'EPC-630', type: 'epc', x: 1210, y: 86, channel: 'EPC-630', reg: 'PR-630' },
    { id: 'PV-635', type: 'solenoidValve', x: 1250, y: 290, vertical: true },
    // the turbopump and the gas generator
    { id: 'TPA-1', type: 'shaft', x: XO, y: SH, x1: XT - 22, label: 'TPA-1' },
    { id: 'P-OX', type: 'pump', x: XO, y: SH, label: 'OX' },
    { id: 'P-FU', type: 'pump', x: XF, y: SH, label: 'FUEL' },
    { id: 'TURB', type: 'turbine', x: XT, y: SH },
    { id: 'GG', type: 'gg', x: GX, y: SH, channel: 'TT-334' },
    { id: 'IGN-502', type: 'igniter', x: 1215, y: 448, to: [GX + 20, 396] },
    // GG taps
    { id: 'GFV-426', type: 'ballValve', x: 880, y: TF, actuator: 'pneumatic' },
    { id: 'GCV-427', type: 'throttle', x: 950, y: TF, pos: 'ZT-427' },
    { id: 'GOV-416', type: 'ballValve', x: 630, y: TO, actuator: 'pneumatic' },
    { id: 'GCV-417', type: 'throttle', x: 710, y: TO, pos: 'ZT-417' },
    // main valves, purges, the engine
    { id: 'MFV-424', type: 'ballValve', x: 872, y: FU, actuator: 'pneumatic' },
    { id: 'MOV-414', type: 'ballValve', x: 618, y: OX, actuator: 'pneumatic' },
    { id: 'PV-632', type: 'solenoidValve', x: 990, y: 520, vertical: true, labRight: true },
    { id: 'PV-631', type: 'solenoidValve', x: 960, y: 680, vertical: true },
    { id: 'BPE-3', type: 'engine', x: EX, y: EY, ablative: true },
    { id: 'IGN-501', type: 'igniter', x: 1110, y: 545, to: [1068, EY - 26] },
    { id: 'LC-501', type: 'thrustStand', x: EX, y: EY + 14, span: [EX + 10, EX + 120], lc: [EX - 6, EY + 58] },
  ],
  instruments: [
    { id: 'PT-301', x: 150, y: 318, tap: [150, 262], lab: 'below' },
    { id: 'PT-302', x: 196, y: 150, tap: [232, 150], lab: 'left' },
    { id: 'PT-410', x: 470, y: 268, tap: [498, 268], lab: 'below' },
    { id: 'WT-411', x: 612, y: 300, tap: [582, 300], tag: ['WT', '411'], lab: 'right' },
    { id: 'PT-420', x: 750, y: 268, tap: [778, 268], lab: 'below' },
    { id: 'WT-421', x: 892, y: 300, tap: [862, 300], tag: ['WT', '421'], lab: 'right' },
    { id: 'PT-413', x: 500, y: 340, tap: [XO, 340], lab: 'left' },
    { id: 'PT-423', x: 780, y: 340, tap: [XF, 340], lab: 'left' },
    { id: 'VIB-345', x: 680, y: 340, tap: [680, SH], tag: ['VIB', '345'], lab: 'above' },
    { id: 'SE-341', x: 900, y: 336, tap: [900, SH], tag: ['SE', '341'], lab: 'above' },
    { id: 'SE-342', x: 950, y: 336, tap: [950, SH], tag: ['SE', '342'], lab: 'below' },
    { id: 'PT-336', x: 950, y: 280, tap: [1012, B], lab: 'left' },
    { id: 'PT-333', x: 1100, y: 262, tap: [GX, 262], lab: 'above' },
    { id: 'TT-334', x: 1085, y: 330, tap: [1085, SH], tag: ['TT', '334'], lab: 'above' },
    { id: 'TT-335', x: 1062, y: 292, tap: [1020, 300], tag: ['TT', '335'], lab: 'right' },
    { id: 'PT-414', x: 490, y: 560, tap: [XO, 560], lab: 'left' },
    { id: 'PT-424', x: 770, y: 520, tap: [XF, 520], lab: 'left' },
    { id: 'FT-416', x: 720, y: 690, tap: [720, OX], lab: 'right' },
    { id: 'PT-415', x: 860, y: 690, tap: [860, OX], lab: 'left' },
    { id: 'FT-426', x: 930, y: 604, tap: [930, FU], lab: 'right' },
    { id: 'PT-425', x: 940, y: 520, tap: [960, FU], lab: 'left' },
    { id: 'PT-501', x: 1112, y: 690, tap: [1080, EY + 26], lab: 'right' },
    { id: 'TC-503', x: 1185, y: 550, tap: [1090, EY - 22], tag: ['TC', '503'], lab: 'right' },
  ],
  labels: [
    { text: 'SUPPLY HEADER · 4000 psig CLASS', x: 640, y: 38, anchor: 'middle' },
    { text: 'START GAS', x: 996, y: 112, anchor: 'start' },
    { text: 'PURGE', x: 1248, y: 112, anchor: 'start' },
    { text: 'VENT', x: 300, y: 132, anchor: 'middle' },
    { text: 'VENT', x: 575, y: 88, anchor: 'middle' },
    { text: 'VENT', x: 855, y: 88, anchor: 'middle' },
    { text: 'TURBINE EXHAUST ↑', x: 1010, y: 252, anchor: 'end' },
    { text: 'GG FUEL TAP', x: 1036, y: TF - 8, anchor: 'start' },
    { text: 'GG OX TAP', x: 760, y: TO - 8, anchor: 'start' },
    { text: 'MAIN FUEL', x: 640, y: FU - 8, anchor: 'start' },
    { text: 'MAIN OXIDISER', x: 760, y: OX - 8, anchor: 'start' },
    { text: 'PURGE ▸', x: 944, y: 502, anchor: 'end' },
    { text: 'PURGE ▸', x: 918, y: 706, anchor: 'end' },
  ],
  exhaust: { x: EX + 112, y: EY, channel: 'PT-501', len: 100, spray: ['PT-415', 'PT-425'] },
  stack: { x: 1020, y: 300, channel: 'TT-335', lo: 420, hi: 760 },
};
