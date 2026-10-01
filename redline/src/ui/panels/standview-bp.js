/* TS-2 on CCTV: the bipropellant cell, side view. A camera shows the
   physical world — the sight glasses on the run tanks, the main valves'
   position flags, the water leaving the injector, the purge gas — never a
   number. */

import { s, h, clear } from '../dom.js';
import { fmtClock } from '../../lib/units.js';

export class StandViewBP {
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
      s('linearGradient', { id: 'cylB', x1: 0, x2: 1 }, s('stop', { offset: 0, 'stop-color': '#2b3136' }), s('stop', { offset: 0.45, 'stop-color': '#59626a' }), s('stop', { offset: 1, 'stop-color': '#1e2327' })),
      s('linearGradient', { id: 'tankB', x1: 0, x2: 1 }, s('stop', { offset: 0, 'stop-color': '#3a4045' }), s('stop', { offset: 0.5, 'stop-color': '#79828a' }), s('stop', { offset: 1, 'stop-color': '#2e3439' })),
      s('linearGradient', { id: 'sprayB', x1: 0, x2: 1 }, s('stop', { offset: 0, 'stop-color': '#e9f7ff', 'stop-opacity': 0.85 }), s('stop', { offset: 1, 'stop-color': '#bfe3f5', 'stop-opacity': 0 })),
      s('linearGradient', { id: 'flameB', x1: 0, x2: 1 }, s('stop', { offset: 0, 'stop-color': '#fff6d8', 'stop-opacity': 0.95 }), s('stop', { offset: 0.25, 'stop-color': '#ffb347', 'stop-opacity': 0.85 }),
        s('stop', { offset: 0.7, 'stop-color': '#ff6a2b', 'stop-opacity': 0.35 }), s('stop', { offset: 1, 'stop-color': '#7a3cff', 'stop-opacity': 0 })),
      s('radialGradient', { id: 'glowB' }, s('stop', { offset: 0, 'stop-color': '#ffb347', 'stop-opacity': 0.45 }), s('stop', { offset: 1, 'stop-color': '#ffb347', 'stop-opacity': 0 })),
      s('radialGradient', { id: 'beamB' }, s('stop', { offset: 0, 'stop-color': '#fff', 'stop-opacity': 0.5 }), s('stop', { offset: 1, 'stop-color': '#fff', 'stop-opacity': 0 })),
      s('filter', { id: 'blurB' }, s('feGaussianBlur', { stdDeviation: 3 })),
      s('filter', { id: 'grainB' }, s('feTurbulence', { type: 'fractalNoise', baseFrequency: 0.9, numOctaves: 1, seed: 5 }), s('feColorMatrix', { values: '0 0 0 0 0.5  0 0 0 0 0.55  0 0 0 0 0.5  0 0 0 0.06 0' }))));
    const T = (x, y, txt, a = 'middle') => s('text', { x, y, fill: '#667', 'font-size': 9.5, 'text-anchor': a, 'font-family': 'var(--mono)' }, txt);
    svg.append(s('rect', { x: 0, y: 0, width: 1280, height: 460, fill: '#0e1113' }));
    for (let x = 0; x < 1280; x += 160) svg.append(s('path', { d: `M${x},0 L${x},400`, stroke: '#14181b', 'stroke-width': 2 }));
    svg.append(s('rect', { x: 0, y: 400, width: 1280, height: 60, fill: '#15191c' }), s('path', { d: 'M0,400 L1280,400', stroke: '#2a3035', 'stroke-width': 2 }));
    // door, beacon
    this.door = s('rect', { x: 18, y: 200, width: 60, height: 200, fill: '#1c2226', stroke: '#394148' });
    svg.append(s('rect', { x: 14, y: 196, width: 68, height: 204, fill: '#0a0c0e' }), this.door, T(48, 190, 'CELL DOOR'));
    this.beaconGlow = s('circle', { cx: 120, cy: 60, r: 40, fill: 'url(#beamB)', opacity: 0 });
    this.beacon = s('rect', { x: 112, y: 52, width: 16, height: 16, rx: 3, fill: '#333' });
    svg.append(this.beaconGlow, s('rect', { x: 108, y: 66, width: 24, height: 6, fill: '#22282c' }), this.beacon);
    // vent stack
    svg.append(s('rect', { x: 700, y: 0, width: 16, height: 120, fill: '#242a2f', stroke: '#394148' }), T(724, 20, 'VENT STACK', 'start'));
    this.ventPuff = s('ellipse', { cx: 708, cy: 6, rx: 22, ry: 10, fill: '#cfe6f2', opacity: 0, filter: 'url(#blurB)' });
    svg.append(this.ventPuff);
    // pressurant bottle and panel
    svg.append(s('rect', { x: 150, y: 170, width: 56, height: 230, rx: 16, fill: 'url(#cylB)', stroke: '#3a4248' }));
    svg.append(s('rect', { x: 168, y: 148, width: 20, height: 24, fill: '#50585f' }));
    this.hvHandle = s('rect', { x: 162, y: 138, width: 32, height: 6, fill: '#8a6a2c', 'transform-origin': '178px 141px' });
    svg.append(this.hvHandle, s('text', { x: 178, y: 290, fill: '#9aa3a9', 'font-size': 13, 'text-anchor': 'middle', 'font-weight': 700 }, 'N₂'));
    svg.append(s('path', { d: 'M188,144 C230,100 250,110 250,140', fill: 'none', stroke: '#8d969c', 'stroke-width': 3 }));
    svg.append(s('rect', { x: 240, y: 130, width: 420, height: 64, fill: '#1a1f23', stroke: '#394148' }), T(250, 145, 'PRESSURANT / PURGE PANEL TS-2', 'start'));
    svg.append(s('path', { d: 'M250,172 L650,172', stroke: '#8d969c', 'stroke-width': 3 }));
    svg.append(s('rect', { x: 280, y: 162, width: 26, height: 20, fill: '#3b444b', stroke: '#5f6970' }), s('rect', { x: 274, y: 140, width: 38, height: 18, fill: '#2e5c86', stroke: '#4f7da8' }));
    this.ivFlag = s('rect', { x: 281, y: 134, width: 24, height: 5, fill: '#e3b341', 'transform-origin': '293px 136px' });
    svg.append(this.ivFlag, T(293, 206, 'IV-601'));
    for (const [x, l] of [[380, 'PR-610'], [470, 'PR-620'], [580, 'PR-630']]) {
      svg.append(s('ellipse', { cx: x, cy: 160, rx: 16, ry: 10, fill: '#6b7176', stroke: '#8a9095' }), s('rect', { x: x - 9, y: 166, width: 18, height: 14, fill: '#4a4f54' }), T(x, 206, l));
    }
    // tanks: physical liquid level in a sight glass
    this.tanks = [];
    for (const [x, id, line, lab] of [[400, 'T-710', 'ox', 'OX'], [560, 'T-720', 'fu', 'FUEL']]) {
      svg.append(s('path', { d: `M${x - 20},180 L${x - 20},228`, stroke: '#8d969c', 'stroke-width': 2 }));
      svg.append(s('rect', { x: x - 45, y: 228, width: 90, height: 140, rx: 30, fill: 'url(#tankB)', stroke: '#3a4248' }));
      svg.append(s('rect', { x: x + 50, y: 240, width: 8, height: 116, fill: '#0c1216', stroke: '#46525a' }));
      const lv = s('rect', { x: x + 51, y: 356, width: 6, height: 0, fill: '#5fc6d8' });
      svg.append(lv, s('text', { x, y: 300, fill: '#c7ced3', 'font-size': 12, 'text-anchor': 'middle', 'font-weight': 700 }, lab), T(x, 316, id));
      svg.append(s('rect', { x: x - 40, y: 368, width: 80, height: 10, fill: '#30373c' }), T(x, 392, id === 'T-710' ? 'WT-716' : 'WT-726'));
      // run line to the engine
      svg.append(s('path', { d: `M${x},368 L${x},${line === 'ox' ? 384 : 376} L${line === 'ox' ? 905 : 905},${line === 'ox' ? 384 : 376} L905,${line === 'ox' ? 314 : 296} L940,${line === 'ox' ? 314 : 296}`, fill: 'none', stroke: '#6f8c86', 'stroke-width': 4 }));
      this.tanks.push({ lv, line });
    }
    // main valves with position flags
    this.mv = [];
    for (const [x, y, id] of [[760, 384, 'MOV-713'], [820, 376, 'MFV-723']]) {
      svg.append(s('rect', { x: x - 12, y: y - 10, width: 24, height: 20, fill: '#3b444b', stroke: '#5f6970' }), s('rect', { x: x - 16, y: y - 36, width: 32, height: 20, fill: '#2e5c86', stroke: '#4f7da8' }));
      const flag = s('rect', { x: x - 12, y: y - 44, width: 24, height: 5, fill: '#e3b341', 'transform-origin': `${x}px ${y - 41}px` });
      svg.append(flag, T(x, y + 26, id));
      this.mv.push({ flag, id });
    }
    // DAQ rack
    svg.append(s('rect', { x: 620, y: 260, width: 56, height: 96, fill: '#15191c', stroke: '#394148' }), T(648, 254, 'DAQ'));
    this.daqLed = s('circle', { cx: 666, cy: 272, r: 2.5, fill: '#333' });
    svg.append(this.daqLed);
    // engine on its stand
    svg.append(s('rect', { x: 900, y: 380, width: 280, height: 20, fill: '#262c30', stroke: '#394148' }));
    svg.append(s('rect', { x: 912, y: 290, width: 16, height: 90, fill: '#30373c' }));
    this.lc = s('rect', { x: 928, y: 296, width: 14, height: 14, fill: '#6d5a2b', stroke: '#8a7440' });
    this.engine = s('g');
    this.engine.append(
      s('rect', { x: 944, y: 340, width: 170, height: 8, fill: '#3b4348', stroke: '#566' }),
      s('rect', { x: 960, y: 348, width: 4, height: 32, fill: '#6b7479' }), s('rect', { x: 1092, y: 348, width: 4, height: 32, fill: '#6b7479' }),
      s('rect', { x: 944, y: 282, width: 14, height: 48, fill: '#5f686e', stroke: '#8d969c' }),          // injector
      s('rect', { x: 958, y: 286, width: 56, height: 40, fill: '#6f777c', stroke: '#8d969c' }),          // chamber
      s('path', { d: 'M1014,288 L1030,300 L1080,290 L1080,322 L1030,312 L1014,324 Z', fill: '#7d868b', stroke: '#9aa3a8' }),
      s('text', { x: 986, y: 310, fill: '#1a1f23', 'font-size': 10, 'text-anchor': 'middle', 'font-weight': 700 }, 'BPE-1'));
    svg.append(this.lc, this.engine);
    // water spray out of the nozzle and the purge puff
    this.spray = s('path', { d: 'M1080,296 L1250,250 L1250,370 L1080,316 Z', fill: 'url(#sprayB)', opacity: 0 });
    this.drip = s('path', { d: 'M1090,320 Q1150,360 1210,398', fill: 'none', stroke: '#bfe3f5', 'stroke-width': 3, opacity: 0 });
    this.puff = s('ellipse', { cx: 1110, cy: 306, rx: 30, ry: 14, fill: '#dfeff7', opacity: 0, filter: 'url(#blurB)' });
    svg.append(this.spray, this.drip, this.puff);
    // fire: the plume, the light it throws on the cell, shock diamonds, the spark
    this.glow = s('ellipse', { cx: 1150, cy: 306, rx: 260, ry: 160, fill: 'url(#glowB)', opacity: 0 });
    this.flame = s('path', { d: 'M1080,294 C1140,286 1200,272 1270,262 L1270,350 C1200,340 1140,326 1080,318 Z', fill: 'url(#flameB)', opacity: 0 });
    this.diamonds = s('g', { opacity: 0 }, ...[1108, 1134, 1160].map((x, i) => s('path', { d: `M${x},306 l10,-${7 - i} l10,${7 - i} l-10,${7 - i} Z`, fill: '#fff3c4', opacity: 0.8 - 0.2 * i })));
    this.sparkFx = s('circle', { cx: 1060, cy: 300, r: 5, fill: '#cfe3ff', opacity: 0, filter: 'url(#blurB)' });
    svg.append(this.glow, this.flame, this.diamonds, this.sparkFx);
    this.pool = s('ellipse', { cx: 1200, cy: 400, rx: 10, ry: 3, fill: '#5fc6d8', opacity: 0.5 });
    svg.append(this.pool, T(1250, 425, 'CATCH AREA', 'end'));
    // people
    this.people = s('g');
    const person = x => s('g', { transform: `translate(${x},0)` },
      s('circle', { cx: 0, cy: 318, r: 8, fill: '#3a4a58' }), s('rect', { x: -9, y: 328, width: 18, height: 40, rx: 4, fill: '#2f3d49' }),
      s('rect', { x: -8, y: 366, width: 6, height: 34, fill: '#253039' }), s('rect', { x: 2, y: 366, width: 6, height: 34, fill: '#253039' }),
      s('rect', { x: -9, y: 310, width: 18, height: 5, fill: '#c9a227' }));
    this.p1 = person(110); this.p2 = person(860);
    this.people.append(this.p1, this.p2);
    svg.append(this.people, s('rect', { x: 0, y: 0, width: 1280, height: 460, filter: 'url(#grainB)', 'pointer-events': 'none' }));
    this.host.append(svg);
    this.cap = h('div.cctv', 'CAM 1 · TS-2 CELL');
    this.host.append(this.cap);
    this.poolSize = 0;
  }

  update() {
    const S = this.S, m = S.model, c = S.controller, f = c.facility, net = m.net;
    const open = f.area === 'OPEN';
    this.door.setAttribute('x', open ? 70 : 18);
    this.door.setAttribute('opacity', open ? 0.5 : 1);
    this.people.style.display = open ? '' : 'none';
    const tech = c.tech?.task;
    this.p1.setAttribute('transform', `translate(${tech === 'openHV' || tech === 'closeHV' ? 228 : tech === 'fillTanks' || tech === 'drainTanks' || tech === 'loadPropellants' ? 470 : 110},0)`);
    this.p2.setAttribute('transform', `translate(${tech === 'walkdown' || tech === 'inspect' || tech === 'inspection' ? 1140 : 860},0)`);
    const col = { GREEN: '#2fb344', AMBER: '#f2b21c', RED: '#e5484d' }[f.beacon];
    const blink = f.beacon === 'RED' ? (Math.floor(performance.now() / 400) % 2) : 1;
    this.beacon.setAttribute('fill', blink ? col : '#3a2222');
    this.beaconGlow.setAttribute('fill', col);
    this.beaconGlow.setAttribute('opacity', blink ? 0.25 : 0.05);
    this.hvHandle.setAttribute('transform', `rotate(${net.el('HV-600').pos * 90})`);
    this.ivFlag.setAttribute('transform', `rotate(${net.el('IV-601').pos * 90})`);
    for (const v of this.mv) v.flag.setAttribute('transform', `rotate(${m.element(v.id).pos * 90})`);
    this.daqLed.setAttribute('fill', S.daq.online ? '#2fb344' : S.daq.powered ? '#f2b21c' : '#333');
    for (const t of this.tanks) {
      const l = m.line(t.line), fr = Math.min(1, l.mL / (l.Vtank * l.rho));
      t.lv.setAttribute('y', (356 - 116 * fr).toFixed(1)); t.lv.setAttribute('height', (116 * fr).toFixed(1));
    }
    // liquid: what the camera sees leaving the injector — unless it is burning
    const C = m.chamber, lit = !!C?.burning;
    const q = m.lines.reduce((a, l) => a + l.mdotInj, 0);
    const k = lit ? 0 : Math.min(1, q / 0.35), flick = 0.88 + 0.12 * Math.sin(performance.now() / 19);
    this.spray.setAttribute('opacity', (k * 0.8 * flick).toFixed(3));
    if (C) {
      const kp = lit ? Math.min(1.2, C.P / C.spec.Pnom) : 0, tnow = performance.now();
      // a rough engine flickers; a screeching one shakes
      const rough = 1 + 3 * C.chug.A * Math.sin(tnow / 9) + 0.08 * Math.sin(tnow / 23) + 6 * C.hf.A * Math.sin(tnow / 3);
      this.flame.setAttribute('opacity', (Math.min(1, kp) * Math.max(0.3, Math.min(1, rough))).toFixed(3));
      this.flame.setAttribute('transform', `translate(1080,306) scale(${(0.6 + 0.5 * kp).toFixed(3)},${(0.8 + 0.3 * kp).toFixed(3)}) translate(-1080,-306)`);
      this.diamonds.setAttribute('opacity', (kp > 0.6 ? 0.7 * Math.min(1, (kp - 0.6) / 0.3) : 0).toFixed(3));
      this.glow.setAttribute('opacity', (0.9 * Math.min(1, kp) * (0.92 + 0.08 * Math.sin(tnow / 31))).toFixed(3));
      this.sparkFx.setAttribute('opacity', C.igniter.on && !lit ? (Math.floor(tnow / 60) % 2 ? 0.9 : 0.2) : 0);
    }
    this.drip.setAttribute('opacity', (Math.min(1, q / 0.02) * 0.5).toFixed(3));
    this.poolSize = Math.min(60, this.poolSize + q * 0.02);
    this.pool.setAttribute('rx', (10 + this.poolSize).toFixed(1));
    // purge gas through the injector
    const g = Math.max(0, net.el('INJ-OXG').mdot) + Math.max(0, net.el('INJ-FUG').mdot);
    this.puff.setAttribute('opacity', Math.min(0.7, g * 120).toFixed(3));
    const dx = -Math.max(-2, Math.min(6, m.stand.y * 0.2));
    this.engine.setAttribute('transform', `translate(${dx.toFixed(2)},0)`);
    let vent = 0;
    for (const id of S.def.ventElements) vent += Math.max(0, net.el(id).mdot);
    this.ventPuff.setAttribute('opacity', Math.min(0.8, vent * 30).toFixed(3));
    this.ventPuff.setAttribute('rx', (18 + Math.min(40, vent * 1500)).toFixed(1));
    this.cap.textContent = `CAM 1 · TS-2 CELL · ${fmtClock(S.clock)}${S.daq.recording ? '  ● REC' : ''}`;
  }
}
