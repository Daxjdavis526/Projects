/* ============================================================================
   ui/hud.js — scale ruler, context breadcrumb, focus readout
   ========================================================================== */
import { fmtLen, niceFloor } from '../scale.js';
import { CONTEXTS } from '../data.js';

const $ = s => document.querySelector(s);

export class Hud {
  constructor() {
    this.crumb = $('#crumb');
    this.focusName = $('#focusName');
    this.focusDist = $('#focusDist');
    this.ruler = $('#ruler');
    this.rulerLabel = $('#rulerLabel');
    this.enh = $('#enh');
    this._lastCrumb = '';
  }
  update(ctx, focusLabel) {
    // context ladder
    let idx = CONTEXTS.findIndex(c => ctx.S < c.upTo);
    if (idx < 0) idx = CONTEXTS.length - 1;
    const trail = [];
    if (idx < CONTEXTS.length - 1) trail.push(CONTEXTS[idx + 1].name);
    const html =
      (idx > 0 ? `<span class="trail" style="opacity:.45">${CONTEXTS[idx - 1].name}</span><span class="sep">‹</span>` : '') +
      `<b>${CONTEXTS[idx].name}</b>` +
      (trail.length ? `<span class="sep">›</span><span class="trail" style="opacity:.45">${trail[0]}</span>` : '');
    if (html !== this._lastCrumb) { this.crumb.innerHTML = html; this._lastCrumb = html; }

    // focus + camera distance
    this.focusName.textContent = focusLabel.toUpperCase();
    this.focusDist.textContent = 'camera · ' + fmtLen(ctx.S) + ' out';

    // ruler: meters per CSS pixel at the focus plane
    const mpp = ctx.S / ctx.pxPerUnitCSS;
    const target = 220 * mpp;
    const len = niceFloor(target);
    this.ruler.style.width = (len / mpp).toFixed(1) + 'px';
    this.rulerLabel.textContent = fmtLen(len, len / mpp > 100 ? 0 : undefined);

    this.enh.classList.toggle('on', ctx.logS > 9.5);
  }
}
