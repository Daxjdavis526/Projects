/* ============================================================================
   ui/panel.js — object info panel
   ========================================================================== */
import { fmtLen, LY, MPC } from '../scale.js';

const $ = s => document.querySelector(s);

export class Panel {
  constructor(actions) {
    this.el = $('#panel');
    this.obj = null;
    $('#pClose').onclick = () => this.hide();
    $('#pFocus').onclick = () => this.obj && actions.focus(this.obj);
    $('#pReturn').onclick = () => actions.returnToEarth();
  }
  show(obj, ctx) {
    this.obj = obj;
    $('#pName').textContent = obj.name;
    $('#pCls').textContent = obj.cls ?? '';
    const rows = [];
    if (obj.radius && obj.kind !== 'region')
      rows.push(['Diameter', fmtLen(obj.radius * 2)]);
    else if (obj.radius)
      rows.push(['Extent', '~' + fmtLen(obj.radius * 2)]);
    if (obj.distLy !== undefined)
      rows.push(['Distance', obj.distLy >= 1e6
        ? (obj.distLy / 1e6).toPrecision(3) + ' million ly'
        : obj.distLy.toPrecision(3) + ' ly']);
    else if (obj.distMpc !== undefined)
      rows.push(['Distance', obj.distMpc.toPrecision(3) + ' Mpc · ' + (obj.distMpc * 3.262).toPrecision(3) + ' Mly']);
    else if (ctx) {
      const e = ctx.earthPos, p = obj.pos(ctx);
      const d = Math.hypot(p[0]-e[0], p[1]-e[1], p[2]-e[2]);
      if (d > 1e7) rows.push(['From Earth', fmtLen(d)]);
    }
    $('#pRows').innerHTML = rows.map(r =>
      `<div class="row"><span>${r[0]}</span><span>${r[1]}</span></div>`).join('');
    $('#pBlurb').textContent = obj.blurb ?? '';
    this.el.classList.add('on');
  }
  hide() { this.obj = null; this.el.classList.remove('on'); }
}
