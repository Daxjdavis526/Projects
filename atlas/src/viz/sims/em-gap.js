// Ampère's law, repaired: a capacitor with circular plates charging through
// straight wires, seen from the side, with an Amperian loop around the axis
// and a surface spanning it. The current I flows in the wires; between the
// plates no charge moves, but the electric field grows. Choose the loop's
// place (round the wire, or between the plates), its radius, and the surface
// (a flat disc, or a bag that bulges into the gap). The readout counts, for
// that surface, the conduction current through it and Maxwell's displacement
// current ε₀ dΦ_E/dt through it: their sum always equals the loop's
// ∮B·dl/μ₀, whatever the surface. ⊙ and ⊗ mark B coming out of and going into
// the page, sized by its strength. Physics in model/em-light.js
// (chargingGap; tested in test/em-light.test.mjs). Fringing is ignored.
//
//   { type: 'em-gap', params: {
//       I: 2,                  // charging current, A
//       R: 5,                  // plate radius, cm
//       at: 'wire',            // where the loop is: 'wire' (around the left wire) | 'gap' (between the plates)
//       r: 3,                  // loop radius, cm
//       surface: 'flat',       // 'flat' | 'bag' (the bag only around the wire: it bulges past the plate into the gap)
//       controls: true,        // or a list of: at surface r I (none when compact)
//       readouts: null,        // a list of: Ic Id sum circ B (default all; readout: false hides the bar)
//       t: null,               // a still picture t seconds into the charging (the picture loops every 8 s)
//       labels: true,
//       steady: false,         // the capacitor fully charged and disconnected: no current, a steady field, no B
//   } }

import { themeColors } from '../plot.js';
import * as M from '../model/em-light.js';

export const defaults = { I: 2, R: 5, at: 'wire', r: 3, surface: 'flat', controls: null, readouts: null, readout: null, t: null, labels: true, steady: false };
const CONTROLS = ['at', 'surface', 'r', 'I'];
const READOUTS = ['Ic', 'Id', 'sum', 'circ', 'B'];
const LOOP_X = { wire: -8.5, gap: 0 };

const tA = (x) => `${(+x.toPrecision(3)).toString()}\\,\\mathrm{A}`;
const tB = (x) => (x >= 1e-3 ? `${+(x * 1e3).toPrecision(3)}\\,\\mathrm{mT}` : `${+(x * 1e6).toPrecision(3)}\\,\\mathrm{\\mu T}`);

export function mount(F, P0) {
  const P = { ...defaults, ...P0 };
  const compact = F.compact;
  const still = P.t !== null && P.t !== undefined;
  const wanted = P.controls === true || (P.controls === null && !compact) ? CONTROLS : Array.isArray(P.controls) ? P.controls : [];
  if (wanted.includes('at')) F.choice({ key: 'at', label: 'The loop goes', options: [['wire', 'round the wire'], ['gap', 'between the plates']], value: P.at, explain: 'Between the plates no charge flows — only the electric field changes.' });
  if (wanted.includes('surface')) F.choice({ key: 'surface', label: 'Surface spanning the loop', options: [['flat', 'flat disc'], ['bag', 'bag into the gap']], value: P.surface, explain: 'Ampère’s law lets you use any surface whose edge is the loop. The bag slips past the plate’s edge, so no wire pierces it.' });
  if (wanted.includes('r')) F.slider({ key: 'r', label: 'Loop radius $r$', min: 0.5, max: 9, step: 0.1, value: P.r, unit: '\\mathrm{cm}', explain: 'Between the plates a small loop encloses only part of the changing flux; once it is wider than the plates it encloses all of it.' });
  if (wanted.includes('I')) F.slider({ key: 'I', label: 'Charging current $I$', min: 0.2, max: 5, step: 0.1, value: P.I, unit: '\\mathrm{A}', explain: 'The current in the wires; it is also how fast charge piles up on the plates, $dQ/dt$.' });
  const now = () => ({ at: F.params.at ?? P.at, surface: F.params.surface ?? P.surface, r: F.params.r ?? P.r, I: F.params.I ?? P.I, R: P.R });

  const { canvas, box } = F.canvas({ aspect: 'wide', label: P.alt || 'A charging capacitor seen from the side, with an Amperian loop and a surface spanning it' });
  const ctx = canvas.getContext('2d');
  let C = themeColors();
  const S = { t: still ? P.t : 0, phase: 0, playing: false };

  function draw() {
    C = themeColors();
    const dpr = Math.min(2, devicePixelRatio || 1);
    const W = canvas.clientWidth || 600, H = canvas.clientHeight || 300;
    const narrow = W < 520;
    const want = narrow ? '4 / 3.2' : '';
    if (box.style.aspectRatio !== want) { box.style.aspectRatio = want; requestAnimationFrame(draw); return; }
    if (canvas.width !== Math.round(W * dpr) || canvas.height !== Math.round(H * dpr)) { canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr); }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    const FS = compact || narrow ? 11 : 12.5;
    const p = now(), R = p.R, half = 1.3;                         // display: the gap drawn 2.6 cm wide
    // world (cm) → screen: x in [−14, 14], y in [−10, 10], equal scales
    const sc = Math.min((W - 16) / 28, (H - 10) / 21.5), cx = W / 2, cy = H / 2 + 6;
    const xEnd = (W / 2 - 6) / sc;                                // the wires run to the edges
    const X = (x) => cx + x * sc, Y = (y) => cy - y * sc;
    const line = (x0, y0, x1, y1, col, w = 2, dash = []) => { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.setLineDash(dash); ctx.beginPath(); ctx.moveTo(X(x0), Y(y0)); ctx.lineTo(X(x1), Y(y1)); ctx.stroke(); ctx.restore(); };
    const text = (s, x, y, o = {}) => { ctx.save(); ctx.font = `${o.w || 600} ${o.size || FS}px Inter, system-ui, sans-serif`; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle'; ctx.lineWidth = 3.5; ctx.strokeStyle = C.bg; ctx.globalAlpha = 0.9; ctx.strokeText(s, X(x) + (o.dx || 0), Y(y) + (o.dy || 0)); ctx.globalAlpha = 1; ctx.fillStyle = o.color || C.ink; ctx.fillText(s, X(x) + (o.dx || 0), Y(y) + (o.dy || 0)); ctx.restore(); };
    const g = M.chargingGap({ I: p.I, R: R / 100 });
    const Bref = g.Bwire(0.02);
    // the surface (behind everything)
    const lx = LOOP_X[p.at], rr = p.r, ex = 0.75;              // the loop, as an ellipse seen in perspective
    const bag = p.at === 'wire' && p.surface === 'bag';
    ctx.save(); ctx.fillStyle = C.gold; ctx.globalAlpha = 0.16; ctx.strokeStyle = C.gold; ctx.lineWidth = 1.4; ctx.setLineDash([5, 4]);
    ctx.beginPath();
    if (bag) {
      const top = R + 1.6;
      ctx.moveTo(X(lx), Y(rr));
      ctx.bezierCurveTo(X(lx + 3), Y(rr + 0.2), X(-4), Y(top), X(-1.6), Y(top));
      ctx.lineTo(X(0), Y(top)); ctx.lineTo(X(0), Y(-top)); ctx.lineTo(X(-1.6), Y(-top));
      ctx.bezierCurveTo(X(-4), Y(-top), X(lx + 3), Y(-rr - 0.2), X(lx), Y(-rr));
      ctx.closePath();
    } else ctx.ellipse(X(lx), Y(0), ex * sc, rr * sc, 0, 0, 2 * Math.PI);
    ctx.fill(); ctx.globalAlpha = 0.8; ctx.stroke(); ctx.restore();
    // wires and plates
    const wcol = C.ink2;
    line(-xEnd, 0, -half, 0, wcol, 2.6); line(half, 0, xEnd, 0, wcol, 2.6);
    line(-half, -R, -half, R, C.ink, 4); line(half, -R, half, R, C.ink, 4);
    // the charge so far (loops every 8 s of animation) and the field between the plates
    const tq = P.steady ? 1 : still ? Math.min(1, S.t / 8) : (S.t % 8) / 8, f = 0.08 + 0.92 * tq;
    const nE = Math.max(1, Math.round(9 * f));
    for (let k = 0; k < nE; k++) {
      const y = -R + ((k + 0.5) * 2 * R) / nE;
      line(-half + 0.75, y, half - 0.75, y, C.violet, 1.6);
      ctx.save(); ctx.fillStyle = C.violet; ctx.beginPath(); const xa = X(0.3), ya = Y(y); ctx.moveTo(xa + 4, ya); ctx.lineTo(xa - 3, ya - 3.5); ctx.lineTo(xa - 3, ya + 3.5); ctx.closePath(); ctx.fill(); ctx.restore();
    }
    const nQ = Math.max(1, Math.round(6 * f));
    // the charge sits on the plates’ inner faces, facing each other
    for (let k = 0; k < nQ; k++) { const y = -R + ((k + 0.5) * 2 * R) / nQ; text('+', -half + 0.38, y, { color: C.bad, w: 800, size: FS }); text('−', half - 0.38, y, { color: C.accent, w: 800, size: FS }); }
    // moving charges in the wires
    if (!still && !P.steady) {
      ctx.save(); ctx.fillStyle = C.ink;
      const sp = 1.6, ph = (S.phase % sp + sp) % sp;
      for (let x = -xEnd + ph; x < -half - 0.2; x += sp) { ctx.beginPath(); ctx.arc(X(x), Y(0), 2.4, 0, 2 * Math.PI); ctx.fill(); }
      for (let x = half + 0.2 + ph; x < xEnd; x += sp) { ctx.beginPath(); ctx.arc(X(x), Y(0), 2.4, 0, 2 * Math.PI); ctx.fill(); }
      ctx.restore();
    }
    // the magnetic field: ⊙ above the axis, ⊗ below (current to the right), sized by B
    const mark = (x, y, B) => {
      const s = Math.max(1.8, Math.min(8.5, 8.5 * Math.sqrt(B / Bref)));
      const px = X(x), py = Y(y), out = y > 0;
      ctx.save(); ctx.strokeStyle = C.teal; ctx.fillStyle = C.teal; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.arc(px, py, s, 0, 2 * Math.PI); ctx.stroke();
      if (out) { ctx.beginPath(); ctx.arc(px, py, Math.max(1, s * 0.3), 0, 2 * Math.PI); ctx.fill(); }
      else { const d = s * 0.62; ctx.beginPath(); ctx.moveTo(px - d, py - d); ctx.lineTo(px + d, py + d); ctx.moveTo(px - d, py + d); ctx.lineTo(px + d, py - d); ctx.stroke(); }
      ctx.restore();
    };
    if (!P.steady) {
      for (const x of [-12, -5, 5, 12]) for (const y of [2, 4.4, 6.6, 8.6]) { mark(x, y, g.Bwire(y / 100)); mark(x, -y, g.Bwire(y / 100)); }
      for (const y of [1.6, 3.3, 5, 6.8, 8.6]) { const B = g.Bgap(y / 100); mark(0, y, B); mark(0, -y, B); }
    }
    // the loop itself, in front
    ctx.save(); ctx.strokeStyle = C.gold; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.ellipse(X(lx), Y(0), ex * sc, rr * sc, 0, -Math.PI / 2, Math.PI / 2, false); ctx.stroke(); ctx.globalAlpha = 0.55; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.ellipse(X(lx), Y(0), ex * sc, rr * sc, 0, Math.PI / 2, 1.5 * Math.PI, false); ctx.stroke(); ctx.restore();
    // labels
    if (P.labels) {
      // current arrows on the wires
      if (!P.steady) for (const x0 of [-12.8, 9.2]) { line(x0, 0.9, x0 + 2.2, 0.9, C.accent, 2.4); ctx.save(); ctx.fillStyle = C.accent; ctx.beginPath(); ctx.moveTo(X(x0 + 2.6), Y(0.9)); ctx.lineTo(X(x0 + 2.0), Y(0.9) - 4.5); ctx.lineTo(X(x0 + 2.0), Y(0.9) + 4.5); ctx.closePath(); ctx.fill(); ctx.restore(); text('I', x0 + 1.1, 1.75, { color: C.accent, w: 700 }); }
      text('loop', lx, rr + 1.0, { color: C.gold, w: 700, size: FS - 1 });
      text(bag ? 'bag surface' : 'flat surface', bag ? -3.5 : lx, bag ? -(R + 2.6) : -rr - 1.1, { color: C.gold, w: 600, size: FS - 1.5 });
      if (!P.steady) text('B: ⊙ out of the page, ⊗ into it', xEnd - 0.3, 10.2, { color: C.teal, align: 'right', size: FS - 2, w: 600 });
      text('E between the plates', xEnd - 0.3, -10.2, { color: C.violet, align: 'right', size: FS - 2, w: 600 });
    }
    // readout: what crosses the surface, and the loop's circulation
    if (P.readout ?? !compact) {
      const rm = rr / 100, inGap = p.at === 'gap';
      const Ic = inGap || bag ? 0 : p.I;
      const Id = inGap ? g.Id(rm) : bag ? p.I : 0;
      const B = inGap ? g.Bgap(rm) : g.Bwire(rm), circ = (B * 2 * Math.PI * rm) / M.MU0;
      const rows = {
        Ic: ['conduction current through the surface', tA(Ic)],
        Id: ['displacement current $\\varepsilon_0\\,d\\Phi_E/dt$ through it', tA(Id)],
        sum: ['their sum', tA(Ic + Id)],
        circ: ['$\\oint\\vec B\\cdot d\\vec l\\,/\\mu_0$ round the loop', tA(circ)],
        B: ['$B$ on the loop', tB(B)],
      };
      F.readout((P.readouts || READOUTS).map((k) => rows[k]).filter(Boolean));
    }
  }

  if (!still) {
    const reduced = () => document.documentElement.getAttribute('data-motion') === 'reduce' || !!globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    S.playing = !reduced();
    const step = (dt) => { if (!S.playing) return; S.t += dt; S.phase += dt * 1.2 * (now().I / 2); draw(); };
    let anim = F.animate(step);
    const btn = F.button({ label: S.playing ? 'Pause' : 'Play', onClick: () => { S.playing = !S.playing; btn.textContent = S.playing ? 'Pause' : 'Play'; anim.stop(); if (S.playing) anim = F.animate(step, { force: true }); } });
  }
  F.onChange(() => draw());
  F.draw(draw);
  F.caption(P.caption ?? 'Side view, not to scale: the gap is drawn far wider than in a real capacitor, and fringing at the plate edges is ignored. The field lines between the plates multiply as the charge builds (the picture starts again every few seconds); the B markers keep their size because a steady charging current gives a steady B. Marker size grows with B.');
  return { get: (k) => F.params[k] };
}

/** Node-side check used by the content tests. */
export function validate(P0) {
  const P = { ...defaults, ...P0 }, p = [];
  if (!(P.I > 0)) p.push('I is the charging current in A (> 0)');
  if (!(P.R > 0 && P.R <= 8)) p.push('R is the plate radius in cm (0 < R ≤ 8)');
  if (!['wire', 'gap'].includes(P.at)) p.push('at is wire or gap');
  if (!['flat', 'bag'].includes(P.surface)) p.push('surface is flat or bag');
  if (!(P.r > 0 && P.r <= 9.5)) p.push('r is the loop radius in cm (0 < r ≤ 9.5)');
  if (Array.isArray(P0.controls)) for (const k of P0.controls) if (!CONTROLS.includes(k)) p.push(`unknown control “${k}” (use ${CONTROLS.join(', ')})`);
  if (Array.isArray(P0.readouts)) for (const k of P0.readouts) if (!READOUTS.includes(k)) p.push(`unknown readout “${k}” (use ${READOUTS.join(', ')})`);
  return p;
}
