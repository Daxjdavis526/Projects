// Draw figures produced by atlas.plot (the Python plotting bridge) with the
// Atlas's own plotting surface.

import { h } from '../ui/dom.js';
import { Plot, PALETTE } from '../viz/plot.js';

export function renderFigures(box, figs) {
  box.replaceChildren();
  for (const f of figs) {
    const c = h('canvas', { role: 'img', 'aria-label': f.title || 'Plot from your program' });
    const wrap = h('div.viz-canvas', c);
    box.append(h('div', { style: { padding: '.6rem .8rem 0' } }, f.title ? h('div.small', { style: { fontWeight: 600 } }, f.title) : null), wrap);
    const pts = f.series.flatMap((s) => s.x.map((x, i) => [x, s.y[i]])).filter(([x, y]) => x !== null && y !== null);
    if (!pts.length) continue;
    let [x0, x1] = f.xlim || [Math.min(...pts.map((p) => p[0])), Math.max(...pts.map((p) => p[0]))];
    let [y0, y1] = f.ylim || [Math.min(...pts.map((p) => p[1]), ...f.hlines), Math.max(...pts.map((p) => p[1]), ...f.hlines)];
    if (x0 === x1) { x0 -= 1; x1 += 1; }
    if (y0 === y1) { y0 -= 1; y1 += 1; }
    const py = (y1 - y0) * 0.06, px = f.xlim ? 0 : (x1 - x0) * 0.02;
    const draw = () => {
      const p = new Plot(c, { x: [x0 - px, x1 + px], y: [y0 - py, y1 + py], xlabel: f.xlabel, ylabel: f.ylabel, grid: f.grid });
      p.clear();
      for (const y of f.hlines) p.line(x0 - px, y, x1 + px, y, { color: 'ink3', width: 1, dash: [4, 4] });
      for (const x of f.vlines) p.line(x, y0 - py, x, y1 + py, { color: 'ink3', width: 1, dash: [4, 4] });
      f.series.forEach((s, k) => {
        const color = s.color && !/^[a-z]+$/.test(s.color) ? s.color : PALETTE[k % PALETTE.length];
        if (s.kind === 'scatter') s.x.forEach((x, i) => { if (x !== null && s.y[i] !== null) p.point(x, s.y[i], { color, r: 3 }); });
        else p.path(s.x.map((x, i) => [x, s.y[i]]).map(([a, b]) => [a ?? NaN, b ?? NaN]), { color, width: 2, dash: s.dash ? [6, 5] : [] });
      });
      if (f.legend) {
        let yy = 18;
        f.series.forEach((s, k) => { if (!s.label) return; p.text(`— ${s.label}`, p.R - 8, yy, { screen: true, align: 'right', color: PALETTE[k % PALETTE.length] }); yy += 16; });
      }
    };
    new ResizeObserver(draw).observe(wrap);
  }
}
