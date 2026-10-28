// The B–H hysteresis loop of a real magnetic material — soft iron, Alnico 5
// or NdFeB — drawn from a smooth model fitted to its saturation, remanence and
// coercivity. Drive mode: set the applied H and the branch (coming down from
// positive saturation, or up from negative) and read B, μ₀M and the apparent
// permeability B/μ₀H; Cycle sweeps H round the whole loop. Magnet mode: a
// permanent magnet shaped as an ellipsoid with demagnetizing factor N sits on
// its load line B = −μ₀(1 − N)/N · H; the operating point is where the line
// meets the falling branch, with its energy product BH. The dashed curve is
// the intrinsic curve μ₀M = B − μ₀H. Model in model/em3h-loop.js (tested in
// test/em3h-loop.test.mjs).
//
//   { type: 'em3h-loop', params: {
//       material: 'ndfeb',      // iron | alnico | ndfeb
//       materials: null,        // a list to offer as a choice (e.g. ['iron', 'ndfeb'])
//       mode: 'drive',          // drive | magnet
//       H: 0,                   // drive: the applied H, in the material's unit (A/m for iron, kA/m otherwise)
//       branch: 'down',         // drive: down (from + saturation) | up (from − saturation)
//       N: 0.33,                // magnet: the demagnetizing factor (0.02–0.95)
//       quadrant: false,        // zoom on the second quadrant (the demagnetization curve)
//       intrinsic: true,        // the dashed μ₀M curve
//       cycle: true,            // drive: a Cycle button that sweeps H round the loop
//       controls: null,         // true, false, or a list of: material H branch N intrinsic
//       readout: true,
//       hide: [],               // readouts shown as “?”: B J mu Br Hc BH loss
//   } }

import { Plot } from '../plot.js';
import * as L from '../model/em3h-loop.js';

export const defaults = {
  material: 'ndfeb', materials: null, mode: 'drive', H: 0, branch: 'down', N: 0.33, quadrant: false,
  intrinsic: true, cycle: true, controls: null, readout: true, hide: [],
};
const CONTROLS = ['material', 'H', 'branch', 'N', 'intrinsic'];
const HIDE = ['B', 'J', 'mu', 'Br', 'Hc', 'BH', 'loss'];
const f3 = (x) => (Math.abs(x) < 5e-4 ? '0' : String(+x.toPrecision(3)));
const big = (v) => { if (v === 0) return '0'; const e = Math.floor(Math.log10(Math.abs(v))); return Math.abs(e) < 4 ? String(+v.toPrecision(3)) : `${+(v / 10 ** e).toFixed(2)}\\times10^{${e}}`; };

export function mount(F, P0) {
  const P = { ...defaults, ...P0 };
  const hide = new Set(P.hide || []);
  const magnet = P.mode === 'magnet';
  const def = P.controls === true || (P.controls === null && !F.compact) ? (magnet ? ['N', 'intrinsic'] : ['H', 'branch', 'intrinsic']) : Array.isArray(P.controls) ? P.controls : [];
  const wanted = [...def, ...(P.materials && P.materials.length > 1 && P.controls !== false && !(Array.isArray(P.controls)) ? ['material'] : [])];
  const ctl = (key, make, value) => (wanted.includes(key) ? make() : (F.params[key] = value));
  const mat = () => L.MATERIALS[F.params.material ?? P.material];
  ctl('material', () => F.choice({ key: 'material', label: 'Material', options: (P.materials || Object.keys(L.MATERIALS)).map((k) => [k, L.MATERIALS[k].name]), value: P.material, explain: 'A soft magnet (iron) has a thin loop; a hard magnet (Alnico, NdFeB) a fat one. Note the very different H scales.' }), P.material);
  // the H slider runs in a fraction of the material's range, so one slider serves every material
  ctl('H', () => F.slider({ key: 'H', label: 'Applied $H$ (fraction of the range)', min: -1, max: 1, step: 0.01, value: P.H / (mat().Hmax / mat().scale), explain: 'The field H in the material, from the free current in a winding; the readout gives it in A/m.' }), P.H / (mat().Hmax / mat().scale));
  ctl('branch', () => F.choice({ key: 'branch', label: 'Coming from', options: [['down', 'positive saturation (falling)'], ['up', 'negative saturation (rising)']], value: P.branch, explain: 'Which way H last swept: a hysteretic material remembers.' }), P.branch);
  ctl('N', () => F.slider({ key: 'N', label: 'Demagnetizing factor $N$', min: 0.02, max: 0.95, step: 0.01, value: P.N, explain: 'Long needle along its axis → 0; sphere ⅓; thin disk across its face → 1.' }), P.N);
  ctl('intrinsic', () => F.toggle({ key: 'intrinsic', label: 'Show $\\mu_0M$ (dashed)', value: P.intrinsic, explain: 'The intrinsic curve: μ₀M = B − μ₀H, the material’s own share of B.' }), P.intrinsic);

  const a = F.canvas({ aspect: F.compact ? 'wide' : '', label: P.alt || 'A B–H hysteresis loop' });
  const plot = new Plot(a.canvas, { x: [-1, 1], y: [-1, 1], axesAt: 'edge', xlabel: 'H', ylabel: 'B (T)' });
  const run = { on: false, t: 0, trail: [] };
  let anim = null;
  if (!magnet && P.cycle !== false && !F.compact && wanted.includes('H')) {
    anim = F.animate((dt) => {
      if (!run.on) return;
      run.t += dt * 0.9;
      const s = Math.sin(run.t), c = Math.cos(run.t);
      F.set('H', +(0.98 * s).toFixed(3));
      F.set('branch', c >= 0 ? 'up' : 'down');
    }, { force: true });
    const btn = F.button({ label: 'Cycle', primary: true, onClick: () => { run.on = !run.on; btn.textContent = run.on ? 'Pause' : 'Cycle'; if (run.on) { run.t = Math.asin(Math.max(-1, Math.min(1, F.params.H / 0.98))); if ((F.params.branch ?? 'down') === 'down') run.t = Math.PI - run.t; anim.start(); } } });
  }

  function draw() {
    const m = mat(), sc = m.scale;
    const Hr = m.Hmax, hc = L.coerciveB(m), br = L.remanence(m);
    // the view, in the material's display unit for H
    let vx, vy;
    if (P.quadrant || magnet) { vx = [(-1.15 * m.Hc) / sc, (0.12 * m.Hc) / sc]; vy = [-0.08 * br, 1.15 * Math.max(br, m.Js)]; }
    else { const top = L.B(m, Hr, 'down') * 1.08; vx = [-Hr / sc, Hr / sc]; vy = [-top, top]; }
    plot.o.xlabel = `H (${m.unit})`;
    plot.setView(vx, vy);
    plot.clear();
    const N = 600, h0 = vx[0] * sc, h1 = vx[1] * sc;
    const branch = (br, fn) => Array.from({ length: N + 1 }, (_, i) => { const H = h0 + ((h1 - h0) * i) / N; return [H / sc, fn(m, H, br)]; });
    if (F.params.intrinsic ?? P.intrinsic) {
      plot.path(branch('down', L.J), { color: 'gold', width: 1.6, dash: [5, 4] });
      if (!magnet && !P.quadrant) plot.path(branch('up', L.J), { color: 'gold', width: 1.6, dash: [5, 4] });
    }
    plot.path(branch('down', L.B), { color: 'accent', width: 2.6 });
    if (!magnet && !P.quadrant) plot.path(branch('up', L.B), { color: 'violet', width: 2.6 });
    const narrow = (a.canvas.clientWidth || 600) < 520, fs = narrow ? 10.5 : 12;
    if (!magnet && !P.quadrant && !narrow) {
      plot.text('falling branch', (0.35 * Hr) / sc, L.B(m, 0.35 * Hr, 'down'), { dx: 6, dy: -14, size: fs, color: 'accent' });
      plot.text('rising branch', (-0.35 * Hr) / sc, L.B(m, -0.35 * Hr, 'up'), { dx: -6, dy: 14, size: fs, color: 'violet', align: 'right' });
    }
    // remanence and coercivity marks
    plot.point(0, br, { r: 4, color: 'accent', label: 'Br', ldx: 8, ldy: -10 });
    plot.point(-hc / sc, 0, { r: 4, color: 'accent', label: 'Hc', ldx: -6, ldy: -12, lalign: 'right' });
    let rows = [];
    const q = (k, v) => (hide.has(k) ? '?' : v);
    if (magnet) {
      const Nd = F.params.N ?? P.N, op = L.operating(m, Nd);
      const hl = vx[0] * sc;
      plot.line(0, 0, hl / sc, (-L.MU0 * op.pc * hl), { color: 'good', width: 2, dash: [7, 4] });
      plot.text('load line', (0.55 * op.H) / sc, 0.55 * op.B, { dx: 10, dy: 0, size: fs, color: 'good' });
      plot.point(op.H / sc, op.B, { r: 6, color: 'warn', label: 'operating point', ldx: 10, ldy: -12 });
      rows = [
        ['$H$ inside (demagnetizing)', q('Hc', `${f3(op.H / sc)}\\,\\text{${m.unit}}`)],
        ['$B$ inside', q('B', `${f3(op.B)}\\,\\text{T}`)],
        ['$\\mu_0M$', q('J', `${f3(op.J)}\\,\\text{T}`)],
        ['energy product $BH$', q('BH', `${f3(op.BH / 1e3)}\\,\\text{kJ/m}^3`)],
      ];
    } else {
      const fr = F.params.H ?? 0, H = fr * Hr, bb = F.params.branch ?? P.branch, Bv = L.B(m, H, bb), Jv = L.J(m, H, bb);
      plot.point(H / sc, Bv, { r: 6.5, color: 'warn' });
      rows = [
        ['$H$', `${f3(H / sc)}\\,\\text{${m.unit}}`],
        ['$B$', q('B', `${f3(Bv)}\\,\\text{T}`)],
        ['$\\mu_0M$', q('J', `${f3(Jv)}\\,\\text{T}`)],
        ['$B/\\mu_0H$', q('mu', Math.abs(H) < 1e-9 * Hr ? '\\text{—}' : big(Bv / (L.MU0 * H)))],
        ['$B_r$', q('Br', `${f3(br)}\\,\\text{T}`)],
        ['$H_c$', q('Hc', `${f3(hc / sc)}\\,\\text{${m.unit}}`)],
        ['loop area (loss per cycle)', q('loss', `${big(L.loss(m))}\\,\\text{J/m}^3`)],
      ];
    }
    F.readout(P.readout === false ? [] : rows);
  }

  F.onChange(() => draw());
  F.draw(draw);
  F.caption(P.caption || 'A smooth model of the major loop fitted to typical values of saturation, remanence and coercivity; real loops differ in detail, minor loops are not drawn, and the numbers vary with grade, heat treatment and temperature.');
  return { get: (k) => F.params[k] };
}

export function validate(P) {
  const p = [];
  if (!L.MATERIALS[P.material]) p.push(`em3h-loop: material is one of ${Object.keys(L.MATERIALS).join(', ')}`);
  if (P.materials !== null && !(Array.isArray(P.materials) && P.materials.every((k) => L.MATERIALS[k]))) p.push('em3h-loop: materials is a list of material keys');
  if (!['drive', 'magnet'].includes(P.mode)) p.push('em3h-loop: mode is drive or magnet');
  if (!['down', 'up'].includes(P.branch)) p.push('em3h-loop: branch is down or up');
  if (!(Number.isFinite(P.N) && P.N >= 0.02 && P.N <= 0.95)) p.push('em3h-loop: N is in 0.02–0.95');
  const m = L.MATERIALS[P.material];
  if (m && !(Number.isFinite(P.H) && Math.abs(P.H) <= m.Hmax / m.scale)) p.push(`em3h-loop: H is within ±${m.Hmax / m.scale} ${m.unit} for ${m.name}`);
  if (Array.isArray(P.controls)) for (const c of P.controls) if (!CONTROLS.includes(c)) p.push(`em3h-loop: unknown control “${c}”`);
  for (const h of P.hide || []) if (!HIDE.includes(h)) p.push(`em3h-loop: unknown hide “${h}”`);
  return p;
}
