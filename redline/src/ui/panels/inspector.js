/* The faceplate that opens when a component or instrument is clicked.

   It tells you what the drawing and the data sheet would: identity,
   function, ratings, the instruments on it, their live readings, and the
   commands you can give it. It never tells you whether the hardware is
   healthy — the whole point is that you work that out from the data. */

import { h, btn, clear, setText } from '../dom.js';
import { fmt, unitLabel, fromDisplay, toDisplay, DISPLAY } from '../../lib/units.js';
import { act } from '../modal.js';

const KIND_TEXT = {
  PT: 'Strain-gauge pressure transducer, sealed gauge. Output through a bridge amplifier; response well under a millisecond.',
  TC: 'Type-K thermocouple. Reads the temperature of its own junction, which lags the gas (or wall) it is in.',
  LC: 'Strain-gauge load cell in the thrust stand load path. Reads whatever the flexure-mounted platform pushes on it — including its own ringing.',
  FB: 'Controller feedback signal (not an independent transducer).',
  I: 'Coil-current monitor on the valve driver (shunt resistor).',
  ZS: 'Limit switch: 1 when the valve is at that end of its travel.',
  FM: 'Coriolis mass flowmeter: measures mass flow directly from the Coriolis force on a vibrating tube. Accurate in steady flow; its output is filtered, so it is slow — it cannot follow a start transient or a short pulse.',
};

export class Inspector {
  constructor(host, app) {
    this.app = app;
    this.el = h('div.inspector.hidden');
    host.append(this.el);
    this.live = [];
  }
  get session() { return this.app.session; }

  hide() { this.el.classList.add('hidden'); this.id = null; }

  show(id, kind) {
    this.id = id; this.kind = kind;
    clear(this.el);
    this.live = [];
    if (!id) return this.hide();
    this.el.classList.remove('hidden');
    if (kind === 'channel') this._channel(id); else this._component(id);
  }

  _header(tag, name, kindText) {
    return h('div.ih', h('b', tag), h('span.muted', name), kindText ? h('span.tag', kindText) : null,
      h('button.x', { onclick: () => this.app.inspect(null), title: 'Close' }, '×'));
  }

  _component(id) {
    const S = this.session, def = S.def, info = def.components[id];
    if (!info) return this.hide();
    this.el.append(this._header(info.tag, info.name, null));
    this.el.append(h('div.sec', h('div.muted', { style: { fontSize: '11px', marginBottom: '4px' } }, info.kind), h('p', info.text)));
    // commands
    const cmd = this._commands(id, info);
    if (cmd) this.el.append(h('div.sec', h('h4', 'Commands'), cmd));
    // instruments on it
    const sens = def.componentSensors[id] || [];
    if (sens.length) {
      const kv = h('div.kv');
      for (const sid of sens) {
        const ch = S.daq.channel(sid);
        const v = h('span.v', '----');
        kv.append(h('span.k', h('a', { href: '#', onclick: e => { e.preventDefault(); this.app.inspect(sid, 'channel'); } }, sid)), v);
        this.live.push(() => setText(v, S.daq.online ? `${fmt(S.daq.latest(sid), ch.quantity)} ${unitLabel(ch.quantity, ch.gauge)}` : '----'));
      }
      this.el.append(h('div.sec', h('h4', 'Instruments'), kv));
    }
    const specs = h('div.kv');
    for (const [k, v] of Object.entries(info.specs || {})) specs.append(h('span.k', k), h('span.v', v));
    this.el.append(h('div.sec', h('h4', 'Data sheet'), specs));
    if (info.ref?.length) {
      this.el.append(h('div.sec', h('h4', 'Reference'),
        h('div', info.ref.map(r => h('a', { href: '#', style: { marginRight: '10px' }, onclick: e => { e.preventDefault(); this.app.showRef(r); } }, this.app.refTitle(r))))));
    }
    this.update();
  }

  _commands(id, info) {
    const S = this.session;
    if (info.commandable === 'remote') {
      const seg = h('div.seg2');
      const bo = h('button', { onclick: () => act(S, 'valve', { id, open: true }) }, 'OPEN');
      const bc = h('button', { onclick: () => act(S, 'valve', { id, open: false }) }, 'CLOSE');
      seg.append(bo, bc);
      const st = h('span.ind');
      this.live.push(() => {
        const c = S.controller.cmd[id];
        bo.classList.toggle('on', c === 1); bc.classList.toggle('on', c === 0);
        const ind = this.app.indication(id);
        st.className = 'ind ' + ind.st;
        setText(st, ind.text);
      });
      return h('div.cmds', seg, st, h('div.note', 'Commanded state is highlighted; the indication to the right is what the hardware reports.'));
    }
    if (info.commandable === 'setpoint') {
      // the regulator this card is for (an EPC card commands its regulator)
      const rg = (S.def.regulators || [{ id: S.def.regulator, epc: 'EPC-101' }]).find(r => r.id === id || r.epc === id) || { id: S.def.regulator, epc: 'EPC-101' };
      const inp = h('input.in', { type: 'number', step: '1', style: { width: '80px' }, value: toDisplay(S.controller.sp[rg.id], 'pressure').toFixed(0) });
      const go = () => act(S, 'regSet', { id: rg.id, value: fromDisplay(Number(inp.value) || 0, 'pressure') });
      inp.addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
      const fb = h('span.mono.muted');
      this.live.push(() => setText(fb, `${rg.id} cmd ${fmt(S.controller.sp[rg.id], 'pressure')} · ${rg.epc} fb ${S.daq.online ? fmt(S.daq.latest(rg.epc), 'pressure') : '----'} ${unitLabel('pressure', true)}`));
      return h('div', h('div.cmds', h('span.muted', 'Setpoint'), inp, h('span.faint', unitLabel('pressure', true)), btn('SET', go, 'sm primary')), h('div.note', fb));
    }
    if (info.commandable === 'tech') {
      return h('div.cmds', btn('Technician: open', () => act(S, 'tech', { task: 'openHV' }), 'sm'),
        btn('Technician: close', () => act(S, 'tech', { task: 'closeHV' }), 'sm'),
        h('div.note', 'Manual valve. Only a technician in the open cell can work it.'));
    }
    if (info.commandable === 'sequencer') return h('div.note', 'Opened only by the firing sequencer, only when the fire circuit is armed. See FIRE CONTROL.');
    return null;
  }

  _channel(id) {
    const S = this.session, ch = S.daq.channel(id);
    if (!ch) return this.hide();
    const sensor = ch.sensor;
    this.el.append(this._header(id, ch.desc, ch.kind === 'derived' ? 'derived' : ch.kind === 'command' ? 'command' : sensor?.kind));
    const kv = h('div.kv');
    const val = h('span.v'), stats = h('span.v'), zero = h('span.v');
    kv.append(h('span.k', 'Value'), val);
    if (ch.kind === 'analog') kv.append(h('span.k', 'Last 2 s'), stats);
    if (sensor) {
      kv.append(h('span.k', 'Range'), h('span.v', `${fmt(sensor.range[0], ch.quantity, 0)} … ${fmt(sensor.range[1], ch.quantity, 0)} ${unitLabel(ch.quantity, ch.gauge)}`));
      if (sensor.tau) kv.append(h('span.k', 'Response lag'), h('span.v', sensor.tau >= 0.1 ? `${sensor.tau.toFixed(1)} s` : `${(sensor.tau * 1e3).toFixed(2)} ms`));
      if (sensor.zeroable) kv.append(h('span.k', 'Zero correction'), zero);
    }
    kv.append(h('span.k', 'Sample rate'), h('span.v', `${S.daq.rate} Hz (anti-alias ${Math.round(S.daq.fc)} Hz)`));
    this.el.append(h('div.sec', kv));
    const txt = ch.kind === 'derived'
      ? `Calculated by the DAQ from ${ch.inputs.join(', ')}. ${id === 'MDOT-C' ? 'Assumes the nominal throat diameter and discharge coefficient and a choked throat. If the throat is not what the drawing says, this channel is wrong and looks perfectly healthy.' : ''}`
      : ch.kind === 'command' ? 'What the controller commanded — not what the hardware did.' : KIND_TEXT[sensor?.kind] || '';
    this.el.append(h('div.sec', h('p', txt)));
    const plots = this.app.plotStack;
    if (plots) {
      this.el.append(h('div.sec', h('h4', 'Plot'), h('div.cmds', plots.charts.map((c, i) => btn(`Add to plot ${i + 1}`, () => plots.addChannel(i, id), 'sm ghost')))));
    }
    this.live.push(() => {
      setText(val, S.daq.online ? `${fmt(S.daq.latest(id), ch.quantity)} ${unitLabel(ch.quantity, ch.gauge)}` : '----');
      if (ch.kind === 'analog') {
        const st = S.daq.store.stats(id, 2);
        setText(stats, st ? `mean ${fmt(st.mean, ch.quantity)} · σ ${fmt(st.std, ch.quantity, 3)} · p-p ${fmt(st.max - st.min, ch.quantity, 3)}` : '----');
      }
      if (sensor?.zeroable) setText(zero, sensor.zeroCorr ? `${fmt(-sensor.zeroCorr, ch.quantity, 2)} ${unitLabel(ch.quantity)}` : 'none applied');
    });
    this.update();
  }

  update() { if (this.id) for (const f of this.live) f(); }
}
