/* The control room: procedure left; schematic, plots and log centre;
   channels, console and fire control right. */
import { h, btn } from '../dom.js';
import { PID } from '../panels/pid.js';
import { StandView } from '../panels/standview.js';
import { StandViewBP } from '../panels/standview-bp.js';
import { Inspector } from '../panels/inspector.js';
import { PlotStack, eventMarkers, limitLines } from '../panels/plots.js';
import { ChannelTable } from '../panels/channels.js';
import { Console, FireControl } from '../panels/console.js';
import { ProcedurePanel } from '../panels/procedure.js';
import { EventLogPanel } from '../panels/eventlog.js';
import { AbortBanner, whatHappened } from '../panels/dialogs.js';
import { store } from '../store.js';

export const DEFAULT_LAYOUT = () => ([
  { channels: ['PT-201', 'PT-301', 'PT-401', 'SV-301-CMD'] },
  { channels: ['LC-501', 'SV-301-CMD'] },
  { channels: ['PT-101', 'PT-102', 'IV-101-ZSO'] },
]);

export class ControlView {
  constructor(host, app) {
    this.app = app;
    this.host = host;
    const S = app.session;
    const root = h('div.control');
    // left
    const procP = h('div.panel', { style: { flex: '1' } });
    root.append(h('div.col', procP));
    // centre
    const top = h('div.panel.center-top');
    this.viewTabs = h('div.tabs');
    const tabHead = h('div.ph', this.viewTabs, h('span.sp'), h('span.sub', `${S.def.article} · FICTIONAL`));
    this.pidWrap = h('div.pid-wrap');
    this.standWrap = h('div.stand-wrap.hidden');
    const stage = h('div', { style: { position: 'relative', flex: '1', minHeight: 0, display: 'flex' } }, this.pidWrap, this.standWrap);
    top.append(tabHead, stage);
    for (const [k, lbl] of [['pid', 'Schematic'], ['stand', 'Test cell (CCTV)']]) this.viewTabs.append(h('button', { dataset: { k }, onclick: () => this.showStage(k) }, lbl));
    const plotsP = h('div.panel.center-plots');
    const logP = h('div.panel.center-log');
    root.append(h('div.col', top, plotsP, logP));
    // right
    const chP = h('div.panel', { style: { flex: '1 1 0', minHeight: '140px' } });
    const conP = h('div.panel', { style: { flex: '0 0 auto', maxHeight: '44%' } });
    const fireP = h('div.panel.firectl');
    root.append(h('div.col', chP, conP, fireP));
    host.append(root);

    // panels
    this.pid = new PID(this.pidWrap, app);
    this.stand = S.def.physics.model === 'biprop' ? new StandViewBP(this.standWrap, app) : new StandView(this.standWrap, app);
    this.inspector = new Inspector(stage, app);
    this.abort = new AbortBanner(stage, app);
    const key = S.def.id;
    const layout = store.data.layouts[key] || (S.def.plots ? S.def.plots.map(c => ({ channels: [...c] })) : DEFAULT_LAYOUT());
    this.plots = new PlotStack(plotsP, app, {
      layout,
      window: 30,
      channels: () => S.daq.channels,
      source: () => S.daq.store,
      timeRef: () => this._timeRef(),
      events: eventMarkers(S),
      limits: limitLines(S),
      clockBase: S.clockStart,
      onLayout: l => { store.data.layouts[key] = l.map(p => ({ channels: p.channels, colors: p.colors })); store.save(); },
    });
    plotsP.prepend(h('div.ph', h('span.t', 'Strip charts'), h('span.sub.hint', 'wheel: zoom time · shift+wheel: zoom y · drag: pan · dbl-click: reset'), h('span.sp'),
      this.plots.toolbar(), btn('+ PLOT', () => this.plots.configure(), 'sm ghost')));
    // the panel-body order: header must be first
    plotsP.append(this.plots.body);
    app.plotStack = this.plots;
    chP.append(h('div.ph', h('span.t', 'Channels'), h('span.sp'), h('span.sub', `${S.daq.channels.length} ch`)));
    const chBody = h('div.pb'); chP.append(chBody);
    this.channels = new ChannelTable(chBody, app);
    this.console = new Console(conP, app);
    this.fire = new FireControl(fireP, app);
    this.proc = new ProcedurePanel(procP, app);
    this.log = new EventLogPanel(logP, app);
    this.showStage('pid');
    this.acc = {};
    // a firing is read on a 10-second window; switch to it at FIRE if the
    // operator is watching live on something wider
    // after an abort has driven the stand safe, ask the operator what happened
    S.controller.on('abortComplete', a => setTimeout(() => { if (app.session === S && !a.reset) whatHappened(app, a); }, 1500));
    S.controller.on('sequence', e => {
      if (e.state === 'COUNTDOWN' && this.plots.axis.live && this.plots.axis.window > 10) this.plots.axis.setWindow(10);
    });
  }

  showStage(k) {
    this.stage = k;
    for (const b of this.viewTabs.children) b.classList.toggle('on', b.dataset.k === k);
    this.pidWrap.classList.toggle('hidden', k !== 'pid');
    this.standWrap.classList.toggle('hidden', k !== 'stand');
  }

  _timeRef() {
    const S = this.app.session, c = S.controller;
    if (c.seq) return c.seq.tFire;
    const ax = this.plots.axis;
    const items = S.log.items;
    for (let i = items.length - 1; i >= 0; i--) {
      const e = items[i];
      if (e.cat === 'SEQ' && e.text === 'T-0') return e.t >= ax.t0 - 120 ? e.t : null;
    }
    return null;
  }

  every(key, ms, fn) {
    const n = performance.now();
    if (!this.acc[key] || n - this.acc[key] >= ms) { this.acc[key] = n; fn(); }
  }

  update() {
    const S = this.app.session;
    this.every('pid', 66, () => { if (this.stage === 'pid') this.pid.update(); });
    this.every('stand', 50, () => { if (this.stage === 'stand') this.stand.update(); });
    this.every('ch', 120, () => this.channels.update());
    this.every('con', 150, () => this.console.update());
    this.every('fire', 100, () => this.fire.update());
    this.every('proc', 200, () => this.proc.update());
    this.every('log', 250, () => this.log.update());
    this.every('insp', 150, () => this.inspector.update());
    this.every('abort', 150, () => this.abort.update());
    this.every('plots', 33, () => this.plots.draw(S.daq.online ? S.daq.store.tLast : S.t, t => S.daq.latest(t.id)));
  }

  destroy() { this.plots.charts.forEach(c => c.destroy()); this.host.innerHTML = ''; }
}
