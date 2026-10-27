// Integration by parts as a picture. Plot the curve (u(t), v(t)) in the u–v
// plane. The area between the curve and the v-axis is ∫u dv; the area between
// the curve and the u-axis is ∫v du. Together they fill the big rectangle
// u(b)v(b) minus the small one u(a)v(a) — which is the formula
//     ∫ u dv = uv | − ∫ v du.

import { Plot } from '../plot.js';
import { simpson } from '../model/numeric.js';

const PAIRS = {
  xcos: { short: 'x cos x', label: '$\\int x\\cos x\\,dx$', u: (t) => t, v: (t) => Math.sin(t), du: () => 1, dv: (t) => Math.cos(t), a: 0, bMax: Math.PI / 2, b: 1.3, uTeX: 'x', vTeX: '\\sin x', view: [[-0.15, 1.75], [-0.12, 1.2]] },
  xexp: { short: 'x eˣ', label: '$\\int x e^{x}\\,dx$', u: (t) => t, v: (t) => Math.exp(t), du: () => 1, dv: (t) => Math.exp(t), a: 0, bMax: 1.6, b: 1.2, uTeX: 'x', vTeX: 'e^{x}', view: [[-0.15, 1.75], [-0.3, 5.2]] },
  lnx: { short: 'ln x', label: '$\\int \\ln x\\,dx$', u: (t) => Math.log(t), v: (t) => t, du: (t) => 1 / t, dv: () => 1, a: 1, bMax: 4, b: 3, uTeX: '\\ln x', vTeX: 'x', view: [[-0.1, 1.5], [-0.2, 4.3]] },
};

export const defaults = { pair: 'xcos' };

export function mount(F, params) {
  const { canvas } = F.canvas({ label: 'The curve (u, v) with the two areas whose sum is the rectangle uv' });
  const plot = new Plot(canvas, { equal: false, xlabel: 'u', ylabel: 'v', pad: { l: 44, r: 16, t: 14, b: 36 } });
  F.choice({ key: 'pair', label: 'Integral', options: Object.entries(PAIRS).map(([k, p]) => [k, `∫ ${p.short} dx`]), value: params.pair, explain: 'Each choice fixes $u$ and $dv$.' });
  let P = PAIRS[params.pair];
  const bCtl = F.slider({ key: 'b', label: 'Upper limit $b$', min: P.a + 0.05, max: P.bMax, step: 0.01, value: P.b, unit: '', explain: 'Slide to grow both areas; their sum always equals $uv$ evaluated between the limits.' });

  F.onChange((key) => {
    if (key === 'pair') {
      P = PAIRS[F.params.pair];
      const inp = bCtl.node.querySelector('input');
      inp.min = P.a + 0.05; inp.max = P.bMax; bCtl.set(P.b);
    }
    draw();
  });

  function draw() {
    const b = Math.min(F.params.b, P.bMax);
    plot.setView(...P.view);
    plot.clear();
    const n = 160;
    const curve = [];
    for (let i = 0; i <= n; i++) { const t = P.a + ((b - P.a) * i) / n; curve.push([P.u(t), P.v(t)]); }
    // ∫ u dv: region between the curve and the v-axis
    plot.path([[0, P.v(P.a)], ...curve, [0, P.v(b)]], { close: true, fill: 'accent', fillAlpha: 0.28, stroke: false });
    // ∫ v du: region between the curve and the u-axis
    plot.path([[P.u(P.a), 0], ...curve, [P.u(b), 0]], { close: true, fill: 'warn', fillAlpha: 0.28, stroke: false });
    // the full curve beyond b, faint
    plot.curve(P.u, P.v, P.a, P.bMax, { color: 'ink3', width: 1.2, dash: [4, 4] });
    plot.path(curve, { color: 'ink', width: 2.4 });
    plot.rect(0, 0, P.u(b), P.v(b), { fill: false, stroke: 'ink2', width: 1 });
    if (P.u(P.a) !== 0 && P.v(P.a) !== 0) plot.rect(0, 0, P.u(P.a), P.v(P.a), { fill: false, stroke: 'ink3', width: 1 });
    plot.point(P.u(b), P.v(b), { color: 'accent2', label: `(u(b), v(b))` });
    const Iudv = simpson((t) => P.u(t) * P.dv(t), P.a, b, 200);
    const Ivdu = simpson((t) => P.v(t) * P.du(t), P.a, b, 200);
    const uvb = P.u(b) * P.v(b) - P.u(P.a) * P.v(P.a);
    const mid = curve[Math.floor(n * 0.55)];
    plot.text('∫ u dv', mid[0] * 0.42, mid[1] * 0.95, { color: 'accent2', weight: 650 });
    plot.text('∫ v du', mid[0] * 0.8, mid[1] * 0.3, { color: 'warn', weight: 650 });
    F.readout([
      [`$u = ${P.uTeX}$, $v = ${P.vTeX}$`, ''],
      ['blue $\\int u\\,dv$', Iudv.toFixed(4)],
      ['amber $\\int v\\,du$', Ivdu.toFixed(4)],
      ['sum', (Iudv + Ivdu).toFixed(4)],
      ['$uv\\big|_a^b$', uvb.toFixed(4)],
    ]);
  }
  F.draw(draw);
  F.caption('Exact picture for these choices: $u$ and $v$ both increase, so the two regions tile the rectangle. Areas are computed by Simpson’s rule.');
}
