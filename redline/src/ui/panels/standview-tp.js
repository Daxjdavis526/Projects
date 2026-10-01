/* TS-3 on CCTV: the turbopump cell. A camera shows the physical world — the
   sight glasses on the run tanks, the valves' position flags, the shaft's
   blur, the fog of cold nitrogen leaving the turbine exhaust, frost forming
   on the duct, water into the catch tank — never a number. */

import { s, h, clear } from '../dom.js';
import { fmtClock } from '../../lib/units.js';

export class StandViewTP {
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
      s('linearGradient', { id: 'cylT', x1: 0, x2: 1 }, s('stop', { offset: 0, 'stop-color': '#2b3136' }), s('stop', { offset: 0.45, 'stop-color': '#59626a' }), s('stop', { offset: 1, 'stop-color': '#1e2327' })),
      s('linearGradient', { id: 'tankT', x1: 0, x2: 1 }, s('stop', { offset: 0, 'stop-color': '#3a4045' }), s('stop', { offset: 0.5, 'stop-color': '#79828a' }), s('stop', { offset: 1, 'stop-color': '#2e3439' })),
      s('linearGradient', { id: 'caseT', x1: 0, x2: 0, y1: 0, y2: 1 }, s('stop', { offset: 0, 'stop-color': '#8a939a' }), s('stop', { offset: 1, 'stop-color': '#4c555c' })),
      s('linearGradient', { id: 'jetT', x1: 0, x2: 1 }, s('stop', { offset: 0, 'stop-color': '#e9f7ff', 'stop-opacity': 0.85 }), s('stop', { offset: 1, 'stop-color': '#bfe3f5', 'stop-opacity': 0.1 })),
      s('radialGradient', { id: 'beamT' }, s('stop', { offset: 0, 'stop-color': '#fff', 'stop-opacity': 0.5 }), s('stop', { offset: 1, 'stop-color': '#fff', 'stop-opacity': 0 })),
      s('filter', { id: 'blurT' }, s('feGaussianBlur', { stdDeviation: 4 })),
      s('filter', { id: 'grainT' }, s('feTurbulence', { type: 'fractalNoise', baseFrequency: 0.9, numOctaves: 1, seed: 7 }), s('feColorMatrix', { values: '0 0 0 0 0.5  0 0 0 0 0.55  0 0 0 0 0.5  0 0 0 0.06 0' }))));
    const T = (x, y, txt, a = 'middle') => s('text', { x, y, fill: '#667', 'font-size': 9.5, 'text-anchor': a, 'font-family': 'var(--mono)' }, txt);
    svg.append(s('rect', { x: 0, y: 0, width: 1280, height: 460, fill: '#0e1113' }));
    for (let x = 0; x < 1280; x += 160) svg.append(s('path', { d: `M${x},0 L${x},400`, stroke: '#14181b', 'stroke-width': 2 }));
    svg.append(s('rect', { x: 0, y: 400, width: 1280, height: 60, fill: '#15191c' }), s('path', { d: 'M0,400 L1280,400', stroke: '#2a3035', 'stroke-width': 2 }));
    // door, beacon
    this.door = s('rect', { x: 18, y: 200, width: 60, height: 200, fill: '#1c2226', stroke: '#394148' });
    svg.append(s('rect', { x: 14, y: 196, width: 68, height: 204, fill: '#0a0c0e' }), this.door, T(48, 190, 'CELL DOOR'));
    this.beaconGlow = s('circle', { cx: 120, cy: 60, r: 40, fill: 'url(#beamT)', opacity: 0 });
    this.beacon = s('rect', { x: 112, y: 52, width: 16, height: 16, rx: 3, fill: '#333' });
    svg.append(this.beaconGlow, s('rect', { x: 108, y: 66, width: 24, height: 6, fill: '#22282c' }), this.beacon);
    // the bottle bank
    for (let i = 0; i < 3; i++) svg.append(s('rect', { x: 130 + i * 30, y: 190, width: 26, height: 210, rx: 9, fill: 'url(#cylT)', stroke: '#3a4248' }));
    this.hvHandle = s('rect', { x: 150, y: 172, width: 30, height: 6, fill: '#8a6a2c', 'transform-origin': '165px 175px' });
    svg.append(s('path', { d: 'M135,186 L225,186', stroke: '#8d969c', 'stroke-width': 4 }), this.hvHandle, T(175, 418, 'GN₂ BANK'));
    // gas panel
    svg.append(s('path', { d: 'M225,186 C260,150 260,140 280,140', fill: 'none', stroke: '#8d969c', 'stroke-width': 3 }));
    svg.append(s('rect', { x: 270, y: 116, width: 470, height: 56, fill: '#1a1f23', stroke: '#394148' }), T(280, 130, 'GAS PANEL TS-3', 'start'));
    svg.append(s('path', { d: 'M280,152 L1010,152', stroke: '#8d969c', 'stroke-width': 3 }));
    this.ivFlag = s('rect', { x: 309, y: 122, width: 24, height: 5, fill: '#e3b341', 'transform-origin': '321px 124px' });
    svg.append(s('rect', { x: 308, y: 142, width: 26, height: 20, fill: '#3b444b', stroke: '#5f6970' }), this.ivFlag, T(321, 182, 'IV-301'));
    for (const [x, l] of [[420, 'PR-410'], [560, 'PR-420'], [900, 'PR-330']]) {
      svg.append(s('ellipse', { cx: x, cy: 142, rx: 16, ry: 10, fill: '#6b7176', stroke: '#8a9095' }), s('rect', { x: x - 9, y: 148, width: 18, height: 14, fill: '#4a4f54' }), T(x, 182, l));
    }
    // run tanks with sight glasses
    this.tanks = [];
    for (const [x, line, lab] of [[440, 'ox', 'OX SIDE'], [600, 'fu', 'FUEL SIDE']]) {
      svg.append(s('path', { d: `M${x - 20},152 L${x - 20},200`, stroke: '#8d969c', 'stroke-width': 2 }));
      svg.append(s('rect', { x: x - 50, y: 200, width: 100, height: 130, rx: 30, fill: 'url(#tankT)', stroke: '#3a4248' }));
      svg.append(s('rect', { x: x + 55, y: 212, width: 8, height: 106, fill: '#0c1216', stroke: '#46525a' }));
      const lv = s('rect', { x: x + 56, y: 318, width: 6, height: 0, fill: '#5fc6d8' });
      svg.append(lv, s('text', { x, y: 270, fill: '#c7ced3', 'font-size': 12, 'text-anchor': 'middle', 'font-weight': 700 }, lab));
      svg.append(s('rect', { x: x - 44, y: 330, width: 88, height: 10, fill: '#30373c' }));
      // suction line down to the skid
      svg.append(s('path', { d: `M${x},340 L${x},352 L${line === 'ox' ? 720 : 800},352 L${line === 'ox' ? 720 : 800},356`, fill: 'none', stroke: '#6f8c86', 'stroke-width': 6 }));
      this.tanks.push({ lv, line });
    }
    // the turbopump skid: ox pump, fuel pump, shaft and coupling guard, turbine
    svg.append(s('rect', { x: 680, y: 392, width: 330, height: 8, fill: '#262c30', stroke: '#394148' }));
    svg.append(s('circle', { cx: 720, cy: 370, r: 22, fill: 'url(#caseT)', stroke: '#9aa3a8' }), s('circle', { cx: 800, cy: 370, r: 24, fill: 'url(#caseT)', stroke: '#9aa3a8' }));
    svg.append(s('rect', { x: 742, y: 366, width: 34, height: 8, fill: '#52595f' }), s('rect', { x: 824, y: 366, width: 90, height: 8, fill: '#52595f' }));
    this.blur = s('rect', { x: 830, y: 360, width: 70, height: 20, fill: '#c8d1d7', opacity: 0, filter: 'url(#blurT)' });
    svg.append(s('rect', { x: 828, y: 356, width: 74, height: 28, fill: 'none', stroke: '#c9a227', 'stroke-width': 2, 'stroke-dasharray': '4 3' }), this.blur, T(865, 350, 'COUPLING GUARD'));
    this.turb = s('path', { d: 'M914,352 L966,340 L966,400 L914,388 Z', fill: 'url(#caseT)', stroke: '#9aa3a8' });
    svg.append(this.turb, T(800, 425, 'TPA-1'), T(940, 425, 'TURBINE'));
    // drive line and the turbine start valve
    svg.append(s('path', { d: 'M900,162 L900,250 L990,250 L990,346 L966,346', fill: 'none', stroke: '#8d969c', 'stroke-width': 4 }));
    this.tsvFlag = s('rect', { x: 978, y: 222, width: 24, height: 5, fill: '#e3b341', 'transform-origin': '990px 224px' });
    svg.append(s('rect', { x: 977, y: 240, width: 26, height: 20, fill: '#3b444b', stroke: '#5f6970' }), s('rect', { x: 974, y: 228, width: 32, height: 12, fill: '#2e5c86', stroke: '#4f7da8' }), this.tsvFlag, T(1030, 254, 'TSV-332', 'start'));
    // exhaust duct up to the stack: frosts over after a cold run
    this.duct = s('path', { d: 'M966,372 L1040,372 L1040,0', fill: 'none', stroke: '#565f66', 'stroke-width': 18 });
    this.frost = s('path', { d: 'M966,372 L1040,372 L1040,40', fill: 'none', stroke: '#e8f2f8', 'stroke-width': 18, opacity: 0 });
    svg.append(this.duct, this.frost, T(1058, 30, 'EXHAUST STACK', 'start'));
    this.fog = s('ellipse', { cx: 1040, cy: 8, rx: 40, ry: 18, fill: '#e6f1f7', opacity: 0, filter: 'url(#blurT)' });
    this.fogLow = s('ellipse', { cx: 1000, cy: 380, rx: 50, ry: 12, fill: '#e6f1f7', opacity: 0, filter: 'url(#blurT)' });
    svg.append(this.fog, this.fogLow);
    // discharge lines with valve flags to the catch tank
    this.dv = [];
    for (const [y, id] of [[410, 'DV-414'], [440, 'DV-424']]) {
      svg.append(s('path', { d: `M${id === 'DV-414' ? 720 : 800},${id === 'DV-414' ? 392 : 394} L${id === 'DV-414' ? 720 : 800},${y} L1180,${y}`, fill: 'none', stroke: '#6f8c86', 'stroke-width': 5 }));
      const flag = s('rect', { x: 1066, y: y - 14, width: 22, height: 5, fill: '#e3b341', 'transform-origin': `1077px ${y - 12}px` });
      svg.append(s('rect', { x: 1066, y: y - 8, width: 22, height: 16, fill: '#3b444b', stroke: '#5f6970' }), flag);
      this.dv.push({ flag, id });
    }
    svg.append(s('rect', { x: 1180, y: 300, width: 80, height: 150, fill: '#1c2226', stroke: '#394148' }), T(1220, 296, 'CATCH TANK'));
    this.jet = s('path', { d: 'M1180,404 Q1210,404 1230,446 L1222,446 Q1206,416 1180,416 Z', fill: 'url(#jetT)', opacity: 0 });
    this.jet2 = s('path', { d: 'M1180,434 Q1200,434 1214,446 L1208,446 Q1196,440 1180,446 Z', fill: 'url(#jetT)', opacity: 0 });
    this.catchLv = s('rect', { x: 1182, y: 448, width: 76, height: 0, fill: '#2f6f74', opacity: 0.7 });
    svg.append(this.catchLv, this.jet, this.jet2);
    // DAQ rack
    svg.append(s('rect', { x: 600, y: 360, width: 50, height: 40, fill: '#15191c', stroke: '#394148' }), T(625, 354, 'DAQ'));
    this.daqLed = s('circle', { cx: 638, cy: 372, r: 2.5, fill: '#333' });
    svg.append(this.daqLed);
    // people
    this.people = s('g');
    const person = x => s('g', { transform: `translate(${x},0)` },
      s('circle', { cx: 0, cy: 318, r: 8, fill: '#3a4a58' }), s('rect', { x: -9, y: 328, width: 18, height: 40, rx: 4, fill: '#2f3d49' }),
      s('rect', { x: -8, y: 366, width: 6, height: 34, fill: '#253039' }), s('rect', { x: 2, y: 366, width: 6, height: 34, fill: '#253039' }),
      s('rect', { x: -9, y: 310, width: 18, height: 5, fill: '#c9a227' }));
    this.p1 = person(110); this.p2 = person(560);
    this.people.append(this.p1, this.p2);
    this.skid = s('g');
    svg.append(this.people, s('rect', { x: 0, y: 0, width: 1280, height: 460, filter: 'url(#grainT)', 'pointer-events': 'none' }));
    this.host.append(svg);
    this.cap = h('div.cctv', 'CAM 1 · TS-3 CELL');
    this.host.append(this.cap);
    this.catchKg = 0;
    this.frostK = 0;
  }

  update() {
    const S = this.S, m = S.model, c = S.controller, f = c.facility, net = m.net, tp = m.tp;
    const open = f.area === 'OPEN';
    this.door.setAttribute('x', open ? 70 : 18);
    this.door.setAttribute('opacity', open ? 0.5 : 1);
    this.people.style.display = open ? '' : 'none';
    const tech = c.tech?.task;
    this.p1.setAttribute('transform', `translate(${tech === 'openHV' || tech === 'closeHV' ? 200 : tech === 'fillTanks' || tech === 'drainTanks' ? 520 : 110},0)`);
    this.p2.setAttribute('transform', `translate(${tech === 'turnRotor' || tech === 'inspection' || tech === 'walkdown' || tech === 'inspect' ? 870 : 560},0)`);
    const col = { GREEN: '#2fb344', AMBER: '#f2b21c', RED: '#e5484d' }[f.beacon];
    const blink = f.beacon === 'RED' ? (Math.floor(performance.now() / 400) % 2) : 1;
    this.beacon.setAttribute('fill', blink ? col : '#3a2222');
    this.beaconGlow.setAttribute('fill', col);
    this.beaconGlow.setAttribute('opacity', blink ? 0.25 : 0.05);
    this.hvHandle.setAttribute('transform', `rotate(${net.el('HV-300').pos * 90})`);
    this.ivFlag.setAttribute('transform', `rotate(${net.el('IV-301').pos * 90})`);
    this.tsvFlag.setAttribute('transform', `rotate(${net.el('TSV-332').pos * 90})`);
    for (const v of this.dv) v.flag.setAttribute('transform', `rotate(${m.element(v.id).pos * 90})`);
    this.daqLed.setAttribute('fill', S.daq.online ? '#2fb344' : S.daq.powered ? '#f2b21c' : '#333');
    for (const t of this.tanks) {
      const l = m.line(t.line), fr = Math.min(1, l.mL / (l.Vtank * l.rho));
      t.lv.setAttribute('y', (318 - 106 * fr).toFixed(1)); t.lv.setAttribute('height', (106 * fr).toFixed(1));
    }
    // the shaft through the coupling guard: a blur that thickens with speed;
    // the skid shakes with the vibration
    const n = tp.n, now = performance.now();
    this.blur.setAttribute('opacity', Math.min(0.75, n * 0.8).toFixed(3));
    const sh = Math.min(3, tp.vib * 0.25) * Math.sin(now / 11);
    this.turb.setAttribute('transform', `translate(${sh.toFixed(2)},0)`);
    // the cold exhaust: fog at the stack, frost on the duct that lingers
    const md = Math.max(0, net.el('TNZ-337').mdot), cold = Math.max(0, 260 - tp.Texh) / 80;
    this.fog.setAttribute('opacity', Math.min(0.85, md * 7 * (0.4 + cold)).toFixed(3));
    this.fog.setAttribute('rx', (40 + Math.min(60, md * 400)).toFixed(1));
    this.fogLow.setAttribute('opacity', Math.min(0.4, md * 3 * cold).toFixed(3));
    this.frostK = Math.max(0, Math.min(1, this.frostK + (md > 0.02 && tp.Texh < 230 ? 0.004 : -0.0004)));
    this.frost.setAttribute('opacity', (0.6 * this.frostK).toFixed(3));
    // water into the catch tank
    const qo = m.line('ox').mdotInj, qf = m.line('fu').mdotInj;
    this.jet.setAttribute('opacity', Math.min(0.9, qo * 2).toFixed(3));
    this.jet2.setAttribute('opacity', Math.min(0.9, qf * 2).toFixed(3));
    this.catchKg = Math.min(140, this.catchKg + (qo + qf) * 0.016);
    this.catchLv.setAttribute('y', (448 - this.catchKg).toFixed(1)); this.catchLv.setAttribute('height', this.catchKg.toFixed(1));
    this.cap.textContent = `CAM 1 · TS-3 CELL · ${fmtClock(S.clock)}${S.daq.recording ? '  ● REC' : ''}`;
  }
}
