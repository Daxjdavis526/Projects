/* The P&ID — an HMI mimic, not a picture of the physics.

   Every colour on it is derived from what the control system can know:
   a line segment is coloured from the pressure transducer on it; a valve is
   drawn from its limit switches if it has them, otherwise from its command
   (and marked 'C' — command-only indication); a line animates as flowing
   when the indicated valve positions and measured pressures say gas must
   be moving. If a transducer lies, so does this drawing. That is not a bug:
   it is the lesson. */

import { h, s, clear } from '../dom.js';
import { fmt, psi, unitLabel } from '../../lib/units.js';

const lerp = (a, b, t) => a + (b - a) * t;
function pressureColor(pg) {
  // log scale from 3 psig (dim) to 3000 psig (bright)
  const t = Math.max(0, Math.min(1, Math.log10(Math.max(pg, psi(3)) / psi(3)) / 3));
  const c0 = [43, 83, 102], c1 = [143, 208, 238];
  return `rgb(${c0.map((c, i) => Math.round(lerp(c, c1[i], t))).join(',')})`;
}

const MAIN_LINE = new Set(['HV-100', 'IV-101', 'PR-101', 'F-201', 'SV-301', 'NZ-401']);

export class PID {
  constructor(host, app) {
    this.app = app;
    this.host = host;
    this.selected = null;
    this.focus = new Set();
    this.build();
  }

  get session() { return this.app.session; }

  build() {
    const def = this.session.def, L = def.pid;
    clear(this.host);
    const [vx, vy, vw, vh] = L.viewBox;
    const svg = s('svg', { viewBox: `${vx} ${vy} ${vw} ${vh}`, preserveAspectRatio: 'xMidYMid meet' });
    this.svg = svg;
    const defs = s('defs', {},
      s('linearGradient', { id: 'plumeGrad', x1: '0', x2: '1', y1: '0', y2: '0' },
        s('stop', { offset: '0', 'stop-color': '#bfe6f7', 'stop-opacity': '0.55' }),
        s('stop', { offset: '1', 'stop-color': '#bfe6f7', 'stop-opacity': '0' })),
      s('pattern', { id: 'hatch', width: 6, height: 6, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' },
        s('line', { x1: 0, y1: 0, x2: 0, y2: 6, stroke: '#2a333d', 'stroke-width': 1.2 })));
    svg.append(defs);
    // faint drafting grid
    const grid = s('g.pid-grid');
    for (let x = 0; x <= vw; x += 40) grid.append(s('line', { x1: x, y1: 0, x2: x, y2: vh }));
    for (let y = 0; y <= vh; y += 40) grid.append(s('line', { x1: 0, y1: y, x2: vw, y2: y }));
    svg.append(grid);

    // labels
    for (const lb of L.labels) svg.append(s('text.pid-label', { x: lb.x, y: lb.y, 'text-anchor': lb.anchor || 'start' }, lb.text));

    // plume (drawn under the thruster)
    const ex = L.exhaust;
    this.plume = s('path.plume', { d: `M${ex.x},${ex.y - 9} L${ex.x + 110},${ex.y - 30} L${ex.x + 110},${ex.y + 30} L${ex.x},${ex.y + 9} Z` });
    svg.append(this.plume);

    // segments
    this.segs = [];
    const segLayer = s('g'), flowLayer = s('g');
    for (const sg of L.segments) {
      const d = 'M' + sg.pts.map(p => p.join(',')).join(' L');
      const path = s('path.seg' + (sg.thin ? '.thin' : ''), { d });
      const flow = s('path.flow', { d });
      segLayer.append(path); flowLayer.append(flow);
      this.segs.push({ def: sg, path, flow, branchTo: this._branchTarget(sg) });
    }
    svg.append(segLayer, flowLayer);

    // leaders + instruments
    this.insts = new Map();
    const instLayer = s('g');
    for (const it of L.instruments) {
      const [tx, ty] = it.tap;
      instLayer.append(s('path.leader', { d: `M${tx},${ty} L${it.x},${it.y}` }));
      instLayer.append(s('circle', { cx: tx, cy: ty, r: 2, fill: '#56636f' }));
    }
    for (const it of L.instruments) {
      const [a, b] = it.tag || it.id.split('-');
      const g = s('g.inst', { onclick: e => { e.stopPropagation(); this.app.inspect(it.id, 'channel'); } });
      g.append(s('circle', { cx: it.x, cy: it.y, r: 15 }));
      g.append(s('line', { x1: it.x - 15, y1: it.y, x2: it.x + 15, y2: it.y, stroke: '#3f4a56', 'stroke-width': 1 }));
      g.append(s('text.t1', { x: it.x, y: it.y - 4 }, a));
      g.append(s('text.t2', { x: it.x, y: it.y + 10 }, b));
      const lab = it.lab || 'right';
      const pos = lab === 'above' ? { x: it.x, y: it.y - 22, a: 'middle' } : lab === 'below' ? { x: it.x, y: it.y + 33, a: 'middle' } : { x: it.x + 20, y: it.y + 5, a: 'start' };
      const rd = s('text.rd', { x: pos.x, y: pos.y, 'text-anchor': pos.a }, '----');
      const ru = s('tspan.ru', { dx: 3 }, '');
      rd.append(ru);
      g.append(rd);
      instLayer.append(g);
      this.insts.set(it.id, { g, rd, ru });
    }

    // symbols
    this.syms = new Map();
    const symLayer = s('g');
    for (const sy of L.symbols) {
      const g = this._symbol(sy);
      g.addEventListener('click', e => { e.stopPropagation(); this.app.inspect(sy.id, 'component'); });
      symLayer.append(g);
      this.syms.set(sy.id, { g, def: sy });
    }
    svg.append(symLayer, instLayer);
    svg.addEventListener('click', () => this.app.inspect(null));
    this.host.append(svg);
    this.host.append(h('div.pid-legend',
      h('span', h('i', { style: { background: '#8fd0ee' } }), 'pressurised (from PT)'),
      h('span', h('i', { style: { background: '#39424c' } }), 'vented'),
      h('span', h('i', { style: { background: 'repeating-linear-gradient(90deg,#3a2f2f 0 2px,transparent 2px 6px)' } }), 'no data'),
      h('span', h('b', { style: { color: '#9d8cf0', fontFamily: 'var(--mono)', fontSize: '9px', marginRight: '4px' } }, 'C'), 'command-only indication')));
  }

  _branchTarget(sg) {
    if (sg.from) return sg.from;
    // a branch off the main line toward a vent/relief element
    const [[x0, y0], [x1, y1]] = sg.pts;
    if (x0 === x1 && y0 !== y1 && sg.vol !== 'vent' && sg.vol !== 'dome') {
      const sym = this.session.def.pid.symbols.find(q => Math.abs(q.x - x0) < 2 && q.y < y0 && q.y > y1 - 40);
      return sym ? sym.id : null;
    }
    return null;
  }

  /* ---- symbols -------------------------------------------------------- */
  _symbol(sy) {
    const { x, y } = sy;
    const g = s('g.sym', { 'data-id': sy.id });
    const bow = (cx, cy, vertical, r = 11) => vertical
      ? s('path.fillable', { d: `M${cx - r},${cy - r} L${cx + r},${cy - r} L${cx - r},${cy + r} L${cx + r},${cy + r} Z` })
      : s('path.fillable', { d: `M${cx - r - 4},${cy - r} L${cx - r - 4},${cy + r} L${cx + r + 4},${cy - r} L${cx + r + 4},${cy + r} Z` });
    const hl = (w, hh, dx = 0, dy = 0) => s('rect.hl', { x: x - w / 2 + dx, y: y - hh / 2 + dy, width: w, height: hh });
    switch (sy.type) {
      case 'bottle': {
        g.append(s('rect.body', { x: x - sy.w / 2, y: y - sy.h / 2, width: sy.w, height: sy.h, rx: sy.w / 2 }));
        g.append(s('rect', { x: x - 10, y: y - sy.h / 2 - 12, width: 20, height: 12, fill: '#0d1216', stroke: '#7d8a97', 'stroke-width': 1.2 }));
        g.append(s('path', { d: `M${x + sy.w / 2 - 6},${230} L${x + sy.w / 2},${230}`, stroke: '#7d8a97', 'stroke-width': 1.2 }));
        g.append(s('text.lbl', { x, y: y - 10, 'text-anchor': 'middle' }, 'N₂'));
        g.append(s('text.lbl2', { x, y: y + 6, 'text-anchor': 'middle' }, 'K-BOTTLE'));
        g.append(s('text.lbl2', { x, y: y + 18, 'text-anchor': 'middle' }, '49 L'));
        g.append(hl(sy.w + 10, sy.h + 26, 0, -6));
        break;
      }
      case 'handValve': {
        g.append(bow(x, y, false, 10));
        g.append(s('path.act', { d: `M${x},${y} L${x},${y - 20} M${x - 9},${y - 20} L${x + 9},${y - 20}`, 'stroke-width': 1.6 }));
        g.append(s('text.lbl', { x, y: y + 28, 'text-anchor': 'middle' }, sy.id));
        g.append(s('text.cmdmark', { x: x + 12, y: y - 18 }, 'M'));
        g.append(hl(40, 64, 0, 4));
        break;
      }
      case 'ballValve': {
        g.append(bow(x, y, false, 10));
        g.append(s('circle.act', { cx: x, cy: y, r: 4.5 }));
        g.append(s('path.act', { d: `M${x},${y - 5} L${x},${y - 20}` }));
        g.append(s('path.act', { d: `M${x - 13},${y - 20} L${x + 13},${y - 20} A13,11 0 0 0 ${x - 13},${y - 20} Z` }));
        this._zso = s('text.lbl2', { x: x + 17, y: y - 30 }, 'ZSO');
        this._zsc = s('text.lbl2', { x: x + 17, y: y - 20 }, 'ZSC');
        g.append(this._zso, this._zsc);
        g.append(s('text.lbl', { x, y: y + 28, 'text-anchor': 'middle' }, sy.id));
        g.append(s('text.lbl2', { x, y: y + 39, 'text-anchor': 'middle' }, 'FC'));
        g.append(hl(46, 76, 0, 2));
        break;
      }
      case 'solenoidValve': {
        const v = sy.vertical;
        g.append(bow(x, y, v, 10));
        if (v) {
          g.append(s('path.act', { d: `M${x},${y} L${x + 20},${y}` }));
          g.append(s('rect.act', { x: x + 20, y: y - 8, width: 16, height: 16 }));
          g.append(s('text.lbl2', { x: x + 28, y: y + 3.5, 'text-anchor': 'middle' }, 'S'));
          g.append(s('text.lbl', { x: x - 16, y: y + 3, 'text-anchor': 'end' }, sy.id));
          g.append(s('text.lbl2', { x: x - 16, y: y + 14, 'text-anchor': 'end' }, sy.vent ? 'NO' : 'NC'));
          g.append(s('text.cmdmark', { x: x + 40, y: y - 8 }, 'C'));
          g.append(hl(96, 34, -10, 0));
        } else {
          g.append(s('path.act', { d: `M${x},${y} L${x},${y - 20}` }));
          g.append(s('rect.act', { x: x - 8, y: y - 36, width: 16, height: 16 }));
          g.append(s('text.lbl2', { x, y: y - 24.5, 'text-anchor': 'middle' }, 'S'));
          g.append(s('text.lbl', { x, y: y + 28, 'text-anchor': 'middle' }, sy.id));
          g.append(s('text.lbl2', { x, y: y + 39, 'text-anchor': 'middle' }, sy.fire ? 'NC · FIRE' : 'NC'));
          g.append(s('text.cmdmark', { x: x + 11, y: y - 30 }, 'C'));
          g.append(hl(46, 84, 0, 0));
        }
        break;
      }
      case 'regulator': {
        g.append(bow(x, y, false, 10));
        g.append(s('path.act', { d: `M${x},${y} L${x},${y - 14}` }));
        g.append(s('path.act', { d: `M${x - 14},${y - 14} L${x + 14},${y - 14} A14,12 0 0 0 ${x - 14},${y - 14} Z` }));
        g.append(s('path.leader', { d: `M${x + 14},${y - 18} L${x + 30},${y - 18} L${x + 30},${y}` }));
        g.append(s('text.lbl', { x, y: y + 28, 'text-anchor': 'middle' }, sy.id));
        this._regSp = s('text.lbl2', { x, y: y + 39, 'text-anchor': 'middle' }, 'SP 0.0');
        g.append(this._regSp);
        g.append(hl(50, 76, 4, 2));
        break;
      }
      case 'epc': {
        g.append(s('rect.body', { x: x - 34, y: y - 18, width: 68, height: 36 }));
        g.append(s('text.lbl', { x, y: y - 5, 'text-anchor': 'middle' }, 'EPC-101'));
        this._epc = s('text.lbl2', { x, y: y + 9, 'text-anchor': 'middle' }, '----');
        g.append(this._epc);
        g.append(hl(78, 44));
        break;
      }
      case 'relief': {
        g.append(s('path.fillable', { d: `M${x - 10},${y + 22} L${x + 10},${y + 22} L${x},${y + 4} Z` }));
        g.append(s('path.fillable', { d: `M${x - 10},${y - 22} L${x + 10},${y - 22} L${x},${y - 4} Z` }));
        g.append(s('path.act', { d: `M${x},${y - 4} L${x},${y + 4}` }));
        g.append(s('path.act', { d: `M${x + 4},${y} l6,-6 l6,6 l6,-6 l6,6`, fill: 'none' }));
        g.append(s('text.lbl', { x: x - 16, y: y + 3, 'text-anchor': 'end' }, sy.id));
        g.append(s('text.lbl2', { x: x - 16, y: y + 14, 'text-anchor': 'end' }, 'SET 250'));
        g.append(hl(92, 54, -10, 0));
        break;
      }
      case 'filter': {
        g.append(s('path.fillable', { d: `M${x - 15},${y} L${x},${y - 15} L${x + 15},${y} L${x},${y + 15} Z` }));
        g.append(s('path', { d: `M${x},${y - 15} L${x},${y + 15}`, stroke: '#7d8a97', 'stroke-dasharray': '2 2' }));
        g.append(s('text.lbl', { x, y: y + 30, 'text-anchor': 'middle' }, sy.id));
        g.append(s('text.lbl2', { x, y: y + 41, 'text-anchor': 'middle' }, '10 µm'));
        g.append(hl(40, 72, 0, 8));
        break;
      }
      case 'thruster': {
        g.append(s('rect.body', { x, y: y - 15, width: 40, height: 30 }));
        g.append(s('path.body', { d: `M${x + 40},${y - 15} L${x + 52},${y - 5} L${x + 80},${y - 12} L${x + 80},${y + 12} L${x + 52},${y + 5} L${x + 40},${y + 15} Z` }));
        g.append(s('text.lbl', { x: x + 20, y: y + 4, 'text-anchor': 'middle' }, 'CGT-1'));
        g.append(hl(88, 40, 40, 0));
        break;
      }
      case 'thrustStand': {
        const py = y + 34;
        g.append(s('rect', { x: 925, y: py - 3, width: 190, height: 6, fill: '#11171c', stroke: '#56636f', 'stroke-width': 1 }));
        for (const fx of [948, 1092]) g.append(s('path', { d: `M${fx},${py + 3} L${fx},${py + 54}`, stroke: '#56636f', 'stroke-width': 2 }));
        g.append(s('rect', { x: 890, y: py + 54, width: 240, height: 8, fill: 'url(#hatch)', stroke: 'none' }));
        g.append(s('path', { d: `M890,${py + 54} L1130,${py + 54}`, stroke: '#56636f' }));
        g.append(s('rect', { x: 884, y: py - 12, width: 8, height: 66, fill: 'url(#hatch)', stroke: '#56636f', 'stroke-width': 1 }));
        g.append(s('rect.body', { x: 896, y: py - 9, width: 22, height: 18 }));
        g.append(s('text.lbl2', { x: 907, y: py + 3.5, 'text-anchor': 'middle' }, 'LC'));
        g.append(s('path.act', { d: `M892,${py} L896,${py} M918,${py} L925,${py}` }));
        g.append(s('path', { d: `M950,${y + 15} L950,${py - 3} M1040,${y + 15} L1040,${py - 3}`, stroke: '#3f4a56', 'stroke-width': 1.5 }));
        const hlr = s('rect.hl', { x: 880, y: py - 16, width: 44, height: 34 });
        g.append(hlr);
        break;
      }
    }
    return g;
  }

  /* ---- per-frame update ------------------------------------------------ */
  update() {
    const S = this.session, d = S.daq, c = S.controller, def = S.def;
    const Pg = vol => { const id = def.segmentSensors[vol]; return id ? d.latest(id) : NaN; };
    const vented = def.ratings.VENTED;

    // indicated state of each element
    const ind = {};
    for (const e of def.physics.elements) {
      let st;
      if (e.id === def.supplyIso) {
        const o = d.latest('IV-101-ZSO'), cl = d.latest('IV-101-ZSC');
        if (!d.online) st = c.cmd[e.id] ? 'open' : 'closed';
        else st = o === 1 && cl === 0 ? 'open' : cl === 1 && o === 0 ? 'closed' : 'travel';
        const disagree = S.alarms.byId.get('DISAGREE-' + e.id)?.active;
        ind[e.id] = { st, open: st !== 'closed', disagree };
      } else if (e.type === 'valve' || e.type === 'solenoid') {
        st = c.cmd[e.id] ? 'open' : 'closed';
        ind[e.id] = { st, open: st === 'open' };
      } else if (e.type === 'relief') {
        const p = Pg(e.from);
        ind[e.id] = { st: p >= e.set * 0.97 ? 'open' : 'closed', open: p >= e.set * 0.97 };
      } else ind[e.id] = { st: 'open', open: true };
    }
    // HMI flow inference: from each open exit with pressure behind it, walk
    // upstream through open elements while pressure rises.
    const flowing = new Set();
    const P = vol => (vol === 'ambient' ? 0 : Pg(vol));
    const byTo = {};
    for (const e of def.physics.elements) (byTo[e.to] ||= []).push(e);
    const walk = vol => {
      for (const e of byTo[vol] || []) {
        if (flowing.has(e.id) || !ind[e.id].open) continue;
        const pu = P(e.from), pd = P(vol);
        if (!(pu > vented)) continue;
        if (e.type === 'regulator' && !(pu > pd + psi(3))) continue;
        if (e.type !== 'regulator' && !(pu >= pd - psi(1))) continue;
        flowing.add(e.id);
        walk(e.from);
      }
    };
    if (d.online) {
      for (const e of def.physics.elements) {
        if (e.to !== 'ambient' || !ind[e.id].open) continue;
        const pu = P(e.from);
        if (e.type === 'nozzle' ? !(pu > psi(5)) : !(pu > vented)) continue;
        flowing.add(e.id);
        walk(e.from);
      }
    }
    this.flowing = flowing;

    // segments
    for (const sg of this.segs) {
      const vol = sg.def.vol;
      let cls = 'seg', color = null, on = false;
      if (vol === 'vent') {
        cls += ' s-vent';
        on = sg.def.from ? flowing.has(sg.def.from) : ['VV-101', 'VV-201', 'RV-201'].some(id => flowing.has(id));
      } else if (vol === 'tank') {
        cls += ' s-unknown';
        on = flowing.has('HV-100');
      } else {
        const p = vol === 'dome' ? d.latest('EPC-101') : Pg(vol);
        if (!d.online || Number.isNaN(p)) cls += ' s-nodata';
        else if (p < vented) cls += ' s-vent';
        else color = pressureColor(p);
        if (sg.branchTo) on = flowing.has(sg.branchTo);
        else if (vol !== 'dome') {
          on = def.physics.elements.some(e => MAIN_LINE.has(e.id) && (e.from === vol || e.to === vol) && flowing.has(e.id));
        }
        if (vol === 'hp' || vol === 'sup') { if (p > psi(1000)) sg.path.style.strokeWidth = '4'; else sg.path.style.strokeWidth = ''; }
      }
      if (sg.def.thin) cls += ' thin';
      if (sg.path.getAttribute('class') !== cls) sg.path.setAttribute('class', cls);
      sg.path.style.stroke = color || '';
      sg.flow.classList.toggle('on', on);
    }

    // symbols
    const sel = this.app.selected;
    for (const [id, { g, def: sy }] of this.syms) {
      let cls = 'sym';
      const iid = sy.type === 'thrustStand' ? null : id;
      const i = ind[iid];
      if (i) { cls += ' ' + i.st; if (i.disagree) cls += ' disagree'; }
      if (sel === id) cls += ' sel';
      if (this.focus.has(id)) cls += ' focus';
      if (g.getAttribute('class') !== cls) g.setAttribute('class', cls);
    }
    if (this._zso) {
      const o = d.latest('IV-101-ZSO') === 1, cl = d.latest('IV-101-ZSC') === 1;
      this._zso.style.fill = o ? '#8fd0ee' : ''; this._zsc.style.fill = cl ? '#c7d0d8' : '';
    }
    if (this._regSp) this._regSp.textContent = `SP ${fmt(c.regSet, 'pressure')}`;
    if (this._epc) this._epc.textContent = d.online ? `${fmt(d.latest('EPC-101'), 'pressure')} fb` : '----';

    // instruments
    for (const [id, it] of this.insts) {
      const ch = d.channel(id);
      const v = d.latest(id);
      it.rd.firstChild.nodeValue = d.online ? fmt(v, ch.quantity) : '----';
      it.ru.textContent = unitLabel(ch.quantity, ch.gauge);
      const a = S.alarms.list.find(x => x.active && x.channel === id);
      const lvl = a ? (a.level === 'redline' ? ' red' : ' alm') : '';
      const cls = 'inst' + lvl;
      if (it.g.getAttribute('class') !== cls) it.g.setAttribute('class', cls);
    }

    // exhaust glow from measured chamber pressure (an HMI cue, not a camera)
    const pc = d.latest('PT-401');
    const k = d.online && pc > psi(3) ? Math.min(1, pc / psi(160)) : 0;
    this.plume.style.opacity = (0.15 + 0.7 * k) * (k > 0 ? 1 : 0);
  }
}
