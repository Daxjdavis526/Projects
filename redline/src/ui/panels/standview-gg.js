/* TS-3G on CCTV: the gas-generator engine cell. What a camera would show —
   the sight glasses, the valve flags, the shaft's blur, the gas generator's
   can going dull red, the turbine exhaust at the top of its duct (white fog
   on start gas, a sooty orange afterburning flame once the gas generator
   has lit: its gas is fuel-rich and finishes burning in the air), and BPE-3
   on its thrust stand with its plume — never a number. */

import { s, h, clear } from '../dom.js';
import { fmtClock } from '../../lib/units.js';

export class StandViewGG {
  constructor(host, app) {
    this.app = app;
    this.host = host;
    this.build();
  }
  get S() { return this.app.session; }

  build() {
    clear(this.host);
    const svg = s('svg', { viewBox: '0 0 1280 460', preserveAspectRatio: 'xMidYMid meet' });
    svg.append(s('defs', {},
      s('linearGradient', { id: 'cylG', x1: 0, x2: 1 }, s('stop', { offset: 0, 'stop-color': '#2b3136' }), s('stop', { offset: 0.45, 'stop-color': '#59626a' }), s('stop', { offset: 1, 'stop-color': '#1e2327' })),
      s('linearGradient', { id: 'tankG', x1: 0, x2: 1 }, s('stop', { offset: 0, 'stop-color': '#3a4045' }), s('stop', { offset: 0.5, 'stop-color': '#79828a' }), s('stop', { offset: 1, 'stop-color': '#2e3439' })),
      s('linearGradient', { id: 'caseG', x1: 0, x2: 0, y1: 0, y2: 1 }, s('stop', { offset: 0, 'stop-color': '#8a939a' }), s('stop', { offset: 1, 'stop-color': '#4c555c' })),
      s('linearGradient', { id: 'sprayG', x1: 0, x2: 1 }, s('stop', { offset: 0, 'stop-color': '#e9f7ff', 'stop-opacity': 0.85 }), s('stop', { offset: 1, 'stop-color': '#bfe3f5', 'stop-opacity': 0 })),
      s('linearGradient', { id: 'flameG', x1: 0, x2: 1 }, s('stop', { offset: 0, 'stop-color': '#fff6d8', 'stop-opacity': 0.95 }), s('stop', { offset: 0.25, 'stop-color': '#ffb347', 'stop-opacity': 0.85 }),
        s('stop', { offset: 0.7, 'stop-color': '#ff6a2b', 'stop-opacity': 0.35 }), s('stop', { offset: 1, 'stop-color': '#7a3cff', 'stop-opacity': 0 })),
      // the turbine exhaust burning at the top of its duct: rich, sooty, orange
      s('linearGradient', { id: 'stackG', x1: 0, x2: 0, y1: 1, y2: 0 }, s('stop', { offset: 0, 'stop-color': '#ffd27a', 'stop-opacity': 0.9 }), s('stop', { offset: 0.45, 'stop-color': '#ff7a22', 'stop-opacity': 0.7 }),
        s('stop', { offset: 1, 'stop-color': '#a8321a', 'stop-opacity': 0 })),
      s('radialGradient', { id: 'glowG' }, s('stop', { offset: 0, 'stop-color': '#ffb347', 'stop-opacity': 0.45 }), s('stop', { offset: 1, 'stop-color': '#ffb347', 'stop-opacity': 0 })),
      s('radialGradient', { id: 'beamG' }, s('stop', { offset: 0, 'stop-color': '#fff', 'stop-opacity': 0.5 }), s('stop', { offset: 1, 'stop-color': '#fff', 'stop-opacity': 0 })),
      s('filter', { id: 'blurG' }, s('feGaussianBlur', { stdDeviation: 3.5 })),
      s('filter', { id: 'grainG' }, s('feTurbulence', { type: 'fractalNoise', baseFrequency: 0.9, numOctaves: 1, seed: 9 }), s('feColorMatrix', { values: '0 0 0 0 0.5  0 0 0 0 0.55  0 0 0 0 0.5  0 0 0 0.06 0' }))));
    const T = (x, y, txt, a = 'middle') => s('text', { x, y, fill: '#667', 'font-size': 9.5, 'text-anchor': a, 'font-family': 'var(--mono)' }, txt);
    const flagValve = (x, y, id, label = true) => {
      const flag = s('rect', { x: x - 11, y: y - 13, width: 22, height: 5, fill: '#e3b341', 'transform-origin': `${x}px ${y - 11}px` });
      svg.append(s('rect', { x: x - 11, y: y - 7, width: 22, height: 15, fill: '#3b444b', stroke: '#5f6970' }), flag);
      if (label) svg.append(T(x, y + 20, id));
      return { flag, id };
    };
    svg.append(s('rect', { x: 0, y: 0, width: 1280, height: 460, fill: '#0e1113' }));
    for (let x = 0; x < 1280; x += 160) svg.append(s('path', { d: `M${x},0 L${x},400`, stroke: '#14181b', 'stroke-width': 2 }));
    svg.append(s('rect', { x: 0, y: 400, width: 1280, height: 60, fill: '#15191c' }), s('path', { d: 'M0,400 L1280,400', stroke: '#2a3035', 'stroke-width': 2 }));
    // door, beacon
    this.door = s('rect', { x: 18, y: 200, width: 60, height: 200, fill: '#1c2226', stroke: '#394148' });
    svg.append(s('rect', { x: 14, y: 196, width: 68, height: 204, fill: '#0a0c0e' }), this.door, T(48, 190, 'CELL DOOR'));
    this.beaconGlow = s('circle', { cx: 120, cy: 60, r: 40, fill: 'url(#beamG)', opacity: 0 });
    this.beacon = s('rect', { x: 112, y: 52, width: 16, height: 16, rx: 3, fill: '#333' });
    svg.append(this.beaconGlow, s('rect', { x: 108, y: 66, width: 24, height: 6, fill: '#22282c' }), this.beacon);
    // the bottle bank and the gas panel
    for (let i = 0; i < 3; i++) svg.append(s('rect', { x: 130 + i * 30, y: 190, width: 26, height: 210, rx: 9, fill: 'url(#cylG)', stroke: '#3a4248' }));
    this.hvHandle = s('rect', { x: 150, y: 172, width: 30, height: 6, fill: '#8a6a2c', 'transform-origin': '165px 175px' });
    svg.append(s('path', { d: 'M135,186 L225,186', stroke: '#8d969c', 'stroke-width': 4 }), this.hvHandle, T(175, 418, 'GN₂ BANK'));
    svg.append(s('path', { d: 'M225,186 C260,150 260,140 280,140', fill: 'none', stroke: '#8d969c', 'stroke-width': 3 }));
    svg.append(s('rect', { x: 270, y: 116, width: 640, height: 56, fill: '#1a1f23', stroke: '#394148' }), T(280, 130, 'GAS PANEL TS-3G', 'start'));
    svg.append(s('path', { d: 'M280,152 L900,152', stroke: '#8d969c', 'stroke-width': 3 }));
    this.ivFlag = s('rect', { x: 309, y: 122, width: 24, height: 5, fill: '#e3b341', 'transform-origin': '321px 124px' });
    svg.append(s('rect', { x: 308, y: 142, width: 26, height: 20, fill: '#3b444b', stroke: '#5f6970' }), this.ivFlag, T(321, 182, 'IV-301'));
    for (const [x, l] of [[400, 'PR-410'], [520, 'PR-420'], [700, 'PR-330'], [860, 'PR-630']]) {
      svg.append(s('ellipse', { cx: x, cy: 142, rx: 16, ry: 10, fill: '#6b7176', stroke: '#8a9095' }), s('rect', { x: x - 9, y: 148, width: 18, height: 14, fill: '#4a4f54' }), T(x, 182, l));
    }
    // run tanks with sight glasses
    this.tanks = [];
    for (const [x, line, lab] of [[400, 'ox', 'OX-1'], [520, 'fu', 'FU-1']]) {
      svg.append(s('path', { d: `M${x - 20},152 L${x - 20},200`, stroke: '#8d969c', 'stroke-width': 2 }));
      svg.append(s('rect', { x: x - 44, y: 200, width: 88, height: 130, rx: 28, fill: 'url(#tankG)', stroke: '#3a4248' }));
      svg.append(s('rect', { x: x + 48, y: 212, width: 8, height: 106, fill: '#0c1216', stroke: '#46525a' }));
      const lv = s('rect', { x: x + 49, y: 318, width: 6, height: 0, fill: line === 'ox' ? '#9ec7e0' : '#c9b56a' });
      svg.append(lv, s('text', { x, y: 270, fill: '#c7ced3', 'font-size': 12, 'text-anchor': 'middle', 'font-weight': 700 }, lab));
      svg.append(s('rect', { x: x - 38, y: 330, width: 76, height: 10, fill: '#30373c' }));
      svg.append(s('path', { d: `M${x},340 L${x},352 L${line === 'ox' ? 640 : 720},352 L${line === 'ox' ? 640 : 720},356`, fill: 'none', stroke: '#6f8c86', 'stroke-width': 6 }));
      this.tanks.push({ lv, line });
    }
    // the turbopump skid
    svg.append(s('rect', { x: 600, y: 392, width: 330, height: 8, fill: '#262c30', stroke: '#394148' }));
    svg.append(s('circle', { cx: 640, cy: 370, r: 22, fill: 'url(#caseG)', stroke: '#9aa3a8' }), s('circle', { cx: 720, cy: 370, r: 24, fill: 'url(#caseG)', stroke: '#9aa3a8' }));
    svg.append(s('rect', { x: 662, y: 366, width: 34, height: 8, fill: '#52595f' }), s('rect', { x: 744, y: 366, width: 90, height: 8, fill: '#52595f' }));
    this.blur = s('rect', { x: 750, y: 360, width: 70, height: 20, fill: '#c8d1d7', opacity: 0, filter: 'url(#blurG)' });
    svg.append(s('rect', { x: 748, y: 356, width: 74, height: 28, fill: 'none', stroke: '#c9a227', 'stroke-width': 2, 'stroke-dasharray': '4 3' }), this.blur, T(785, 350, 'COUPLING GUARD'));
    this.turb = s('path', { d: 'M834,352 L886,340 L886,400 L834,388 Z', fill: 'url(#caseG)', stroke: '#9aa3a8' });
    svg.append(this.turb, T(720, 425, 'TPA-1'), T(860, 425, 'TURBINE'));
    // the gas generator: a small can on the turbine manifold
    svg.append(s('path', { d: 'M700,162 L700,232 L900,232 L900,262', fill: 'none', stroke: '#8d969c', 'stroke-width': 4 }));   // start gas
    this.tsv = flagValve(800, 232, 'TSV-332');
    this.ggCan = s('rect', { x: 886, y: 262, width: 28, height: 52, rx: 6, fill: '#6f777c', stroke: '#9aa3a8' });
    this.ggHeat = s('rect', { x: 886, y: 262, width: 28, height: 52, rx: 6, fill: '#ff5a1f', opacity: 0, filter: 'url(#blurG)' });
    svg.append(this.ggCan, this.ggHeat, s('path', { d: 'M900,314 L900,330 L872,346', fill: 'none', stroke: '#8d969c', 'stroke-width': 7 }), T(930, 290, 'GG', 'start'));
    this.ggSpark = s('circle', { cx: 900, cy: 300, r: 4, fill: '#cfe3ff', opacity: 0, filter: 'url(#blurG)' });
    svg.append(this.ggSpark);
    // the GG taps and their valves, from the pump discharges
    svg.append(s('path', { d: 'M640,392 L640,410 L938,410 L938,276 L914,276', fill: 'none', stroke: '#7d9fb0', 'stroke-width': 2.5 }));
    svg.append(s('path', { d: 'M720,394 L720,404 L928,404 L928,290 L914,290', fill: 'none', stroke: '#b7a76a', 'stroke-width': 2.5 }));
    this.ggv = [flagValve(928, 330, 'GFV', false), flagValve(938, 362, 'GOV', false)];
    svg.append(T(976, 334, 'GFV', 'start'), T(976, 366, 'GOV', 'start'));
    // exhaust duct up the wall to the berm: what comes out is the show
    svg.append(s('path', { d: 'M886,384 L960,384 L960,0', fill: 'none', stroke: '#565f66', 'stroke-width': 18 }), T(976, 24, 'TURBINE EXHAUST', 'start'));
    this.soot = s('path', { d: 'M886,384 L960,384 L960,40', fill: 'none', stroke: '#141414', 'stroke-width': 18, opacity: 0 });
    this.stackFlame = s('path', { d: 'M950,30 Q940,10 944,-30 L976,-30 Q980,10 970,30 Z', fill: 'url(#stackG)', opacity: 0, filter: 'url(#blurG)' });
    this.smoke = s('ellipse', { cx: 960, cy: 0, rx: 36, ry: 16, fill: '#2a2a2a', opacity: 0, filter: 'url(#blurG)' });
    this.fog = s('ellipse', { cx: 960, cy: 8, rx: 34, ry: 16, fill: '#e6f1f7', opacity: 0, filter: 'url(#blurG)' });
    svg.append(this.soot, this.fog, this.smoke, this.stackFlame);
    // main lines to the engine, with the main valve flags
    svg.append(s('path', { d: 'M640,392 L640,420 L1014,420 L1014,326 L1060,326', fill: 'none', stroke: '#7d9fb0', 'stroke-width': 5 }));
    svg.append(s('path', { d: 'M720,394 L720,414 L1004,414 L1004,296 L1060,296', fill: 'none', stroke: '#b7a76a', 'stroke-width': 5 }));
    this.mv = [flagValve(1014, 388, 'MOV-414', false), flagValve(1004, 356, 'MFV-424', false)];
    svg.append(T(1030, 392, 'MOV', 'start'), T(1030, 360, 'MFV', 'start'));
    // BPE-3 on its thrust stand: steel case over the ablative, a phenolic exit lip
    svg.append(s('rect', { x: 1034, y: 270, width: 12, height: 50, fill: '#30373c' }));
    this.lc = s('rect', { x: 1046, y: 296, width: 12, height: 14, fill: '#6d5a2b', stroke: '#8a7440' });
    this.engine = s('g');
    this.engine.append(
      s('rect', { x: 1060, y: 340, width: 150, height: 8, fill: '#3b4348', stroke: '#566' }),
      s('rect', { x: 1074, y: 348, width: 4, height: 52, fill: '#6b7479' }), s('rect', { x: 1190, y: 348, width: 4, height: 52, fill: '#6b7479' }),
      s('rect', { x: 1060, y: 288, width: 12, height: 46, fill: '#5f686e', stroke: '#8d969c' }),
      s('rect', { x: 1072, y: 292, width: 54, height: 38, fill: '#7a8288', stroke: '#9aa3a8' }),
      s('path', { d: 'M1126,294 L1140,305 L1186,296 L1186,326 L1140,317 L1126,328 Z', fill: '#585f64', stroke: '#9aa3a8' }),
      s('path', { d: 'M1180,297 L1186,296 L1186,326 L1180,325 Z', fill: '#2a241e' }),
      s('text', { x: 1099, y: 315, fill: '#1a1f23', 'font-size': 10, 'text-anchor': 'middle', 'font-weight': 700 }, 'BPE-3'));
    svg.append(this.lc, this.engine);
    this.caseHeat = s('rect', { x: 1072, y: 292, width: 54, height: 38, fill: '#ff4d1a', opacity: 0, filter: 'url(#blurG)' });
    svg.append(this.caseHeat);
    this.spray = s('path', { d: 'M1186,300 L1280,270 L1280,350 L1186,322 Z', fill: 'url(#sprayG)', opacity: 0 });
    this.puff = s('ellipse', { cx: 1210, cy: 311, rx: 26, ry: 12, fill: '#dfeff7', opacity: 0, filter: 'url(#blurG)' });
    svg.append(this.spray, this.puff);
    this.glow = s('ellipse', { cx: 1230, cy: 311, rx: 220, ry: 150, fill: 'url(#glowG)', opacity: 0 });
    this.flame = s('path', { d: 'M1186,298 C1220,292 1250,284 1290,276 L1290,346 C1250,338 1220,330 1186,324 Z', fill: 'url(#flameG)', opacity: 0 });
    this.diamonds = s('g', { opacity: 0 }, ...[1202, 1224, 1246].map((x, i) => s('path', { d: `M${x},311 l9,-${6 - i} l9,${6 - i} l-9,${6 - i} Z`, fill: '#fff3c4', opacity: 0.8 - 0.2 * i })));
    this.sparkFx = s('circle', { cx: 1170, cy: 304, r: 5, fill: '#cfe3ff', opacity: 0, filter: 'url(#blurG)' });
    svg.append(this.glow, this.flame, this.diamonds, this.sparkFx);
    // DAQ rack
    svg.append(s('rect', { x: 520, y: 360, width: 50, height: 40, fill: '#15191c', stroke: '#394148' }), T(545, 354, 'DAQ'));
    this.daqLed = s('circle', { cx: 558, cy: 372, r: 2.5, fill: '#333' });
    svg.append(this.daqLed);
    // people
    this.people = s('g');
    const person = x => s('g', { transform: `translate(${x},0)` },
      s('circle', { cx: 0, cy: 318, r: 8, fill: '#3a4a58' }), s('rect', { x: -9, y: 328, width: 18, height: 40, rx: 4, fill: '#2f3d49' }),
      s('rect', { x: -8, y: 366, width: 6, height: 34, fill: '#253039' }), s('rect', { x: 2, y: 366, width: 6, height: 34, fill: '#253039' }),
      s('rect', { x: -9, y: 310, width: 18, height: 5, fill: '#c9a227' }));
    this.p1 = person(110); this.p2 = person(470);
    this.people.append(this.p1, this.p2);
    svg.append(this.people, s('rect', { x: 0, y: 0, width: 1280, height: 460, filter: 'url(#grainG)', 'pointer-events': 'none' }));
    this.host.append(svg);
    this.cap = h('div.cctv', 'CAM 1 · TS-3G CELL');
    this.host.append(this.cap);
    this.sootK = 0;
  }

  update() {
    const S = this.S, m = S.model, c = S.controller, f = c.facility, net = m.net, tp = m.tp, G = m.gg, C = m.chamber;
    const open = f.area === 'OPEN', now = performance.now();
    this.door.setAttribute('x', open ? 70 : 18);
    this.door.setAttribute('opacity', open ? 0.5 : 1);
    this.people.style.display = open ? '' : 'none';
    const tech = c.tech?.task;
    this.p1.setAttribute('transform', `translate(${tech === 'openHV' || tech === 'closeHV' ? 200 : tech === 'fillTanks' || tech === 'drainTanks' || tech === 'loadPropellants' ? 460 : 110},0)`);
    this.p2.setAttribute('transform', `translate(${tech === 'turnRotor' ? 790 : tech === 'inspection' || tech === 'walkdown' || tech === 'inspect' ? 1140 : 470},0)`);
    const col = { GREEN: '#2fb344', AMBER: '#f2b21c', RED: '#e5484d' }[f.beacon];
    const blink = f.beacon === 'RED' ? (Math.floor(now / 400) % 2) : 1;
    this.beacon.setAttribute('fill', blink ? col : '#3a2222');
    this.beaconGlow.setAttribute('fill', col);
    this.beaconGlow.setAttribute('opacity', blink ? 0.25 : 0.05);
    this.hvHandle.setAttribute('transform', `rotate(${net.el('HV-300').pos * 90})`);
    this.ivFlag.setAttribute('transform', `rotate(${net.el('IV-301').pos * 90})`);
    for (const v of [this.tsv, ...this.mv]) v.flag.setAttribute('transform', `rotate(${m.element(v.id).pos * 90})`);
    this.ggv[0].flag.setAttribute('transform', `rotate(${m.element('GFV-426').pos * 90})`);
    this.ggv[1].flag.setAttribute('transform', `rotate(${m.element('GOV-416').pos * 90})`);
    this.daqLed.setAttribute('fill', S.daq.online ? '#2fb344' : S.daq.powered ? '#f2b21c' : '#333');
    for (const t of this.tanks) {
      const l = m.line(t.line), fr = Math.min(1, l.mL / (l.Vtank * l.rho));
      t.lv.setAttribute('y', (318 - 106 * fr).toFixed(1)); t.lv.setAttribute('height', (106 * fr).toFixed(1));
    }
    // the shaft and the skid
    this.blur.setAttribute('opacity', Math.min(0.75, tp.n * 0.8).toFixed(3));
    const sh = Math.min(3, tp.vib * 0.25) * Math.sin(now / 11);
    this.turb.setAttribute('transform', `translate(${sh.toFixed(2)},0)`);
    // the gas generator: its can glows with the gas inside; its spark
    const Tg = G.Tgas || 300;
    this.ggHeat.setAttribute('opacity', (G.burning ? Math.min(0.75, Math.max(0, (Tg - 500) / 700)) : 0).toFixed(3));
    this.ggSpark.setAttribute('opacity', G.igniter.on && !G.burning ? (Math.floor(now / 60) % 2 ? 0.9 : 0.2) : 0);
    // the turbine exhaust at the top of the duct: start gas is a cold white
    // fog; the gas generator's fuel-rich gas finishes burning in the air —
    // an orange flame and black smoke, and soot on the duct
    const md = Math.max(0, G.mdotOut || 0), hot = G.burning && tp.Texh > 500;
    const flick = 0.85 + 0.15 * Math.sin(now / 37) + 0.08 * Math.sin(now / 13);
    this.fog.setAttribute('opacity', hot ? 0 : Math.min(0.8, md * 9).toFixed(3));
    this.fog.setAttribute('rx', (34 + Math.min(60, md * 500)).toFixed(1));
    this.stackFlame.setAttribute('opacity', hot ? (Math.min(1, md * 25) * flick).toFixed(3) : 0);
    this.stackFlame.setAttribute('transform', `translate(960,30) scale(${(0.9 + 0.2 * flick).toFixed(3)},${(0.8 + Math.min(1.2, md * 22) * flick).toFixed(3)}) translate(-960,-30)`);
    this.smoke.setAttribute('opacity', hot ? Math.min(0.7, md * 14).toFixed(3) : 0);
    this.smoke.setAttribute('rx', (36 + Math.min(50, md * 700)).toFixed(1));
    this.sootK = Math.max(0, Math.min(1, this.sootK + (hot ? 0.0015 : 0)));
    this.soot.setAttribute('opacity', (0.55 * this.sootK).toFixed(3));
    // the main chamber
    const lit = !!C.burning;
    const q = m.lines.reduce((a, l) => a + l.mdotInj, 0);
    const k = lit ? 0 : Math.min(1, q / 0.5), fl = 0.88 + 0.12 * Math.sin(now / 19);
    this.spray.setAttribute('opacity', (k * 0.8 * fl).toFixed(3));
    const kp = lit ? Math.min(1.2, C.P / C.spec.Pnom) : 0;
    const rough = 1 + 3 * C.chug.A * Math.sin(now / 9) + 0.08 * Math.sin(now / 23) + 6 * C.hf.A * Math.sin(now / 3);
    this.flame.setAttribute('opacity', (Math.min(1, kp) * Math.max(0.3, Math.min(1, rough))).toFixed(3));
    this.flame.setAttribute('transform', `translate(1186,311) scale(${(0.6 + 0.5 * kp).toFixed(3)},${(0.8 + 0.3 * kp).toFixed(3)}) translate(-1186,-311)`);
    this.diamonds.setAttribute('opacity', (kp > 0.6 ? 0.7 * Math.min(1, (kp - 0.6) / 0.3) : 0).toFixed(3));
    this.glow.setAttribute('opacity', (0.9 * Math.min(1, kp) * (0.92 + 0.08 * Math.sin(now / 31))).toFixed(3));
    this.sparkFx.setAttribute('opacity', C.igniter.on && !lit ? (Math.floor(now / 60) % 2 ? 0.9 : 0.2) : 0);
    // a hot case shows on a camera as a dull glow only well past 400 °C — so,
    // on a healthy ablative, never
    this.caseHeat.setAttribute('opacity', Math.min(0.6, Math.max(0, (C.walls.ch - 670) / 400)).toFixed(3));
    const g = Math.max(0, net.el('INJ-OXG').mdot) + Math.max(0, net.el('INJ-FUG').mdot);
    this.puff.setAttribute('opacity', Math.min(0.7, g * 120).toFixed(3));
    const dx = -Math.max(-2, Math.min(6, m.stand.y * 0.2));
    this.engine.setAttribute('transform', `translate(${dx.toFixed(2)},0)`);
    this.cap.textContent = `CAM 1 · TS-3G CELL · ${fmtClock(S.clock)}${S.daq.recording ? '  ● REC' : ''}`;
  }
}
