/* The test cell on CCTV: a 2D side view of the physical stand.

   Unlike the P&ID, this is a camera, so it shows the physical world: the
   actuator's position flag, the jet, frost, the vent stack puffing, people
   in the cell. A camera is a legitimate source of evidence in a real
   control room — and a coarse one: it will show you a jet, not a number. */

import { s, h, clear } from '../dom.js';
import { fmtClock } from '../../lib/units.js';

export class StandView {
  constructor(host, app) {
    this.app = app;
    this.host = host;
    this.build();
  }
  get S() { return this.app.session; }

  build() {
    clear(this.host);
    const svg = s('svg', { viewBox: '0 0 1280 460', preserveAspectRatio: 'xMidYMid meet' });
    const defs = s('defs', {},
      s('linearGradient', { id: 'cyl', x1: 0, x2: 1 }, s('stop', { offset: 0, 'stop-color': '#2b3136' }), s('stop', { offset: 0.45, 'stop-color': '#59626a' }), s('stop', { offset: 1, 'stop-color': '#1e2327' })),
      s('linearGradient', { id: 'jet', x1: 0, x2: 1 }, s('stop', { offset: 0, 'stop-color': '#e8f6ff', 'stop-opacity': 0.8 }), s('stop', { offset: 0.5, 'stop-color': '#bfe3f5', 'stop-opacity': 0.25 }), s('stop', { offset: 1, 'stop-color': '#bfe3f5', 'stop-opacity': 0 })),
      s('radialGradient', { id: 'beam' }, s('stop', { offset: 0, 'stop-color': '#fff', 'stop-opacity': 0.5 }), s('stop', { offset: 1, 'stop-color': '#fff', 'stop-opacity': 0 })),
      s('filter', { id: 'blur2' }, s('feGaussianBlur', { stdDeviation: 2.5 })),
      s('filter', { id: 'grain' }, s('feTurbulence', { type: 'fractalNoise', baseFrequency: 0.9, numOctaves: 1, seed: 3 }), s('feColorMatrix', { values: '0 0 0 0 0.5  0 0 0 0 0.55  0 0 0 0 0.5  0 0 0 0.06 0' })));
    svg.append(defs);
    // cell
    svg.append(s('rect', { x: 0, y: 0, width: 1280, height: 460, fill: '#0e1113' }));
    for (let x = 0; x < 1280; x += 160) svg.append(s('path', { d: `M${x},0 L${x},400`, stroke: '#14181b', 'stroke-width': 2 }));
    svg.append(s('path', { d: 'M0,120 L1280,120', stroke: '#14181b' }));
    svg.append(s('rect', { x: 0, y: 400, width: 1280, height: 60, fill: '#15191c' }));
    svg.append(s('path', { d: 'M0,400 L1280,400', stroke: '#2a3035', 'stroke-width': 2 }));
    // door
    this.door = s('rect', { x: 18, y: 200, width: 60, height: 200, fill: '#1c2226', stroke: '#394148' });
    svg.append(s('rect', { x: 14, y: 196, width: 68, height: 204, fill: '#0a0c0e' }), this.door);
    svg.append(s('text', { x: 48, y: 190, fill: '#556', 'font-size': 10, 'text-anchor': 'middle', 'font-family': 'var(--mono)' }, 'CELL DOOR'));
    // beacon
    this.beaconGlow = s('circle', { cx: 120, cy: 60, r: 40, fill: 'url(#beam)', opacity: 0 });
    this.beacon = s('rect', { x: 112, y: 52, width: 16, height: 16, rx: 3, fill: '#333' });
    svg.append(this.beaconGlow, s('rect', { x: 108, y: 66, width: 24, height: 6, fill: '#22282c' }), this.beacon);
    // vent stack
    svg.append(s('rect', { x: 600, y: 0, width: 16, height: 150, fill: '#242a2f', stroke: '#394148' }));
    svg.append(s('text', { x: 624, y: 20, fill: '#556', 'font-size': 10, 'font-family': 'var(--mono)' }, 'VENT STACK'));
    this.ventPuff = s('ellipse', { cx: 608, cy: 6, rx: 22, ry: 10, fill: '#cfe6f2', opacity: 0, filter: 'url(#blur2)' });
    svg.append(this.ventPuff);
    // bottle
    svg.append(s('rect', { x: 190, y: 150, width: 64, height: 250, rx: 18, fill: 'url(#cyl)', stroke: '#3a4248' }));
    svg.append(s('rect', { x: 212, y: 128, width: 20, height: 24, fill: '#50585f' }));
    this.hvHandle = s('rect', { x: 206, y: 118, width: 32, height: 6, fill: '#8a6a2c', 'transform-origin': '222px 121px' });
    svg.append(this.hvHandle);
    svg.append(s('path', { d: 'M186,230 L258,230 M186,330 L258,330', stroke: '#4d555b', 'stroke-width': 2, 'stroke-dasharray': '4 3' }));
    svg.append(s('text', { x: 222, y: 280, fill: '#9aa3a9', 'font-size': 13, 'text-anchor': 'middle', 'font-family': 'var(--sans)', 'font-weight': 700 }, 'N₂'));
    // pigtail to panel
    svg.append(s('path', { d: 'M232,124 C270,90 300,110 300,170', fill: 'none', stroke: '#8d969c', 'stroke-width': 3 }));
    // panel
    svg.append(s('rect', { x: 290, y: 160, width: 290, height: 170, fill: '#1a1f23', stroke: '#394148' }));
    svg.append(s('text', { x: 300, y: 176, fill: '#556', 'font-size': 9.5, 'font-family': 'var(--mono)' }, 'GAS PANEL TS-1'));
    svg.append(s('path', { d: 'M300,240 L570,240', stroke: '#8d969c', 'stroke-width': 3 }));
    // IV-101 with actuator & position flag
    svg.append(s('rect', { x: 330, y: 228, width: 30, height: 24, fill: '#3b444b', stroke: '#5f6970' }));
    svg.append(s('rect', { x: 322, y: 188, width: 46, height: 30, fill: '#2e5c86', stroke: '#4f7da8' }));
    this.ivFlag = s('rect', { x: 331, y: 180, width: 28, height: 6, fill: '#e3b341', 'transform-origin': '345px 183px' });
    svg.append(this.ivFlag, s('text', { x: 345, y: 268, fill: '#667', 'font-size': 9, 'text-anchor': 'middle', 'font-family': 'var(--mono)' }, 'IV-101'));
    // regulator
    svg.append(s('rect', { x: 430, y: 226, width: 26, height: 28, fill: '#4a4f54', stroke: '#6a7075' }));
    svg.append(s('ellipse', { cx: 443, cy: 212, rx: 22, ry: 14, fill: '#6b7176', stroke: '#8a9095' }));
    svg.append(s('text', { x: 443, y: 268, fill: '#667', 'font-size': 9, 'text-anchor': 'middle', 'font-family': 'var(--mono)' }, 'PR-101'));
    // vents to stack
    svg.append(s('path', { d: 'M390,240 L390,140 L600,140', fill: 'none', stroke: '#8d969c', 'stroke-width': 2 }));
    svg.append(s('path', { d: 'M540,240 L540,150 L600,150', fill: 'none', stroke: '#8d969c', 'stroke-width': 2 }));
    svg.append(s('rect', { x: 382, y: 196, width: 16, height: 16, fill: '#2d3338', stroke: '#566' }));
    svg.append(s('rect', { x: 532, y: 196, width: 16, height: 16, fill: '#2d3338', stroke: '#566' }));
    // filter
    svg.append(s('rect', { x: 496, y: 230, width: 22, height: 38, rx: 4, fill: '#454b50', stroke: '#6a7075' }));
    // feed line to stand (flexible loop)
    svg.append(s('path', { d: 'M570,240 C640,240 640,330 720,330 C800,330 780,290 842,290', fill: 'none', stroke: '#6f777c', 'stroke-width': 4 }));
    // DAQ rack
    svg.append(s('rect', { x: 660, y: 300, width: 60, height: 100, fill: '#15191c', stroke: '#394148' }));
    for (let i = 0; i < 5; i++) svg.append(s('rect', { x: 666, y: 308 + i * 17, width: 48, height: 12, fill: '#1f2529', stroke: '#2c3338' }));
    this.daqLed = s('circle', { cx: 708, cy: 314, r: 2.5, fill: '#333' });
    svg.append(this.daqLed, s('text', { x: 690, y: 296, fill: '#556', 'font-size': 9, 'text-anchor': 'middle', 'font-family': 'var(--mono)' }, 'DAQ'));
    // wiring
    for (const [x, y] of [[345, 250], [443, 254], [520, 262], [900, 312], [960, 300], [860, 290]]) {
      svg.append(s('path', { d: `M${x},${y} Q${(x + 690) / 2},${Math.max(y, 330) + 50} 690,392`, fill: 'none', stroke: '#2b4a3a', 'stroke-width': 1 }));
    }
    // thrust stand
    svg.append(s('rect', { x: 800, y: 380, width: 330, height: 20, fill: '#262c30', stroke: '#394148' }));
    svg.append(s('rect', { x: 812, y: 300, width: 16, height: 80, fill: '#30373c' }));  // reaction block
    this.lc = s('rect', { x: 828, y: 292, width: 20, height: 16, fill: '#6d5a2b', stroke: '#8a7440' });
    this.platform = s('g');
    this.platform.append(
      s('rect', { x: 850, y: 318, width: 240, height: 8, fill: '#3b4348', stroke: '#566' }),
      s('rect', { x: 870, y: 326, width: 4, height: 54, fill: '#6b7479' }),
      s('rect', { x: 1066, y: 326, width: 4, height: 54, fill: '#6b7479' }),
      s('rect', { x: 850, y: 290, width: 30, height: 28, fill: '#3b444b', stroke: '#5f6970' }),   // SV-301
      s('rect', { x: 856, y: 276, width: 18, height: 14, fill: '#2d3338', stroke: '#566' }),
      s('rect', { x: 880, y: 286, width: 70, height: 32, fill: '#6f777c', stroke: '#8d969c' }),    // thruster body
      s('path', { d: 'M950,290 L962,297 L1000,288 L1000,316 L962,307 L950,314 Z', fill: '#7d868b', stroke: '#9aa3a8' }));
    this.frost = s('path', { d: 'M950,290 L962,297 L1000,288 L1000,316 L962,307 L950,314 Z', fill: '#e6f4ff', opacity: 0 });
    this.platform.append(this.frost);
    svg.append(this.lc, this.platform);
    // jet
    this.jet = s('path', { d: 'M1000,292 L1260,262 L1260,342 L1000,312 Z', fill: 'url(#jet)', opacity: 0 });
    this.jetCore = s('path', { d: 'M1000,296 L1080,300 L1000,308 Z', fill: '#f4fbff', opacity: 0, filter: 'url(#blur2)' });
    svg.append(this.jet, this.jetCore);
    svg.append(s('text', { x: 1250, y: 380, fill: '#556', 'font-size': 10, 'text-anchor': 'end', 'font-family': 'var(--mono)' }, 'EXHAUST DUCT →'));
    // people
    this.people = s('g');
    const person = (x) => s('g', { transform: `translate(${x},0)` },
      s('circle', { cx: 0, cy: 318, r: 8, fill: '#3a4a58' }),
      s('rect', { x: -9, y: 328, width: 18, height: 40, rx: 4, fill: '#2f3d49' }),
      s('rect', { x: -8, y: 366, width: 6, height: 34, fill: '#253039' }), s('rect', { x: 2, y: 366, width: 6, height: 34, fill: '#253039' }),
      s('rect', { x: -9, y: 310, width: 18, height: 5, fill: '#c9a227' }));
    this.p1 = person(150); this.p2 = person(760);
    this.people.append(this.p1, this.p2);
    svg.append(this.people);
    svg.append(s('rect', { x: 0, y: 0, width: 1280, height: 460, filter: 'url(#grain)', 'pointer-events': 'none' }));
    this.host.append(svg);
    this.cap = h('div.cctv', 'CAM 2 · TS-1 CELL');
    this.host.append(this.cap);
  }

  update() {
    const S = this.S, m = S.model, c = S.controller, f = c.facility;
    const net = m.net;
    // door and people
    const open = f.area === 'OPEN';
    this.door.setAttribute('x', open ? 70 : 18);
    this.door.setAttribute('opacity', open ? 0.5 : 1);
    this.people.style.display = open ? '' : 'none';
    const tech = c.tech?.task;
    this.p1.setAttribute('transform', `translate(${tech === 'openHV' || tech === 'closeHV' ? 272 : 150},0)`);
    this.p2.setAttribute('transform', `translate(${tech === 'walkdown' || tech === 'inspect' ? 1030 : 760},0)`);
    // beacon
    const col = { GREEN: '#2fb344', AMBER: '#f2b21c', RED: '#e5484d' }[f.beacon];
    const blink = f.beacon === 'RED' ? (Math.floor(performance.now() / 400) % 2) : 1;
    this.beacon.setAttribute('fill', blink ? col : '#3a2222');
    this.beaconGlow.setAttribute('fill', col);
    this.beaconGlow.setAttribute('opacity', blink ? 0.25 : 0.05);
    // valves (the camera sees the real hardware)
    const hv = net.el('HV-100').pos, iv = net.el('IV-101').pos;
    this.hvHandle.setAttribute('transform', `rotate(${hv * 90})`);
    this.ivFlag.setAttribute('transform', `rotate(${iv * 90})`);
    // DAQ
    this.daqLed.setAttribute('fill', S.daq.online ? '#2fb344' : S.daq.powered ? '#f2b21c' : '#333');
    // jet: physical flow, so the camera sees what the gas does
    const nz = m.nozzleEl;
    const F = nz.F;
    const k = Math.min(1, F / 8);
    const flick = 0.9 + 0.1 * Math.sin(performance.now() / 23);
    this.jet.setAttribute('opacity', (k * 0.75 * flick).toFixed(3));
    this.jetCore.setAttribute('opacity', (k * 0.9).toFixed(3));
    // stand deflection (exaggerated ×400: real deflection is microns)
    const dx = -Math.max(-2, Math.min(6, m.stand.y * 0.5));
    this.platform.setAttribute('transform', `translate(${dx.toFixed(2)},0)`);
    // frost on a cold nozzle
    const Tw = net.vol('chamber').Tw - 273.15;
    this.frost.setAttribute('opacity', Tw < 3 ? Math.min(0.7, (3 - Tw) / 12).toFixed(2) : 0);
    // vent stack
    let vent = 0;
    for (const id of ['VV-101', 'VV-201', 'RV-201']) vent += Math.max(0, net.el(id).mdot);
    this.ventPuff.setAttribute('opacity', Math.min(0.8, vent * 60).toFixed(3));
    this.ventPuff.setAttribute('rx', (18 + Math.min(40, vent * 3000)).toFixed(1));
    this.cap.textContent = `CAM 2 · TS-1 CELL · ${fmtClock(S.clock)}${S.daq.recording ? '  ● REC' : ''}`;
  }
}
