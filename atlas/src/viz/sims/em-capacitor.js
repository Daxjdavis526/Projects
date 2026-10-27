// A parallel-plate capacitor seen edge-on: plate area and gap you can change,
// a battery that can be connected (V held fixed) or switched out (Q held
// fixed), and a dielectric slab you slide in. Free charges sit on the plates,
// bound charges appear on the slab's faces, field lines run between the plates
// at a density that follows E, and the gap can be shaded by its energy
// density. The physics is model/em-capacitor.js (tested headlessly in
// test/em-capacitor.test.mjs); fringing at the edges is ignored.
//
//   { type: 'em-capacitor', params: {
//       A: 0.01, d: 2e-3,              // plate area (m²) and gap (m)
//       V: 12,                         // the battery's emf (V)
//       material: 'paper', kappa: null, // the slab: a key of DIELECTRICS (vacuum air teflon polystyrene mylar nylon paper
//                                      //   pyrex neoprene water srtio3), or a bare κ
//       f: 0,                          // fraction of the plate area the slab fills (it fills the whole gap)
//       connected: true, Q: null,      // the battery connected; or isolated holding charge Q (C)
//       gap: 'vacuum',                 // what fills the rest of the gap: 'vacuum' or 'air' (air can break down)
//       controls: true,                // or a list of: A d V f material connected (none when compact)
//       show: { charges, field, bound, energy, values },   // layers drawn
//       readouts: ['C', 'Q', 'V', 'E', 'U'],               // any of C Q V E U u sigma
//       hide: [],                      // labels in the picture to print as “?”: A d V Q
//   } }

import { themeColors } from '../plot.js';
import * as M from '../model/em-capacitor.js';

export const defaults = {
  A: 0.01, d: 2e-3, V: 12, material: 'paper', kappa: null, f: 0, connected: true, Q: null, gap: 'vacuum',
  controls: null, show: null, readouts: ['C', 'Q', 'V', 'E', 'U'], hide: [],
};
const CONTROLS = ['A', 'd', 'V', 'f', 'material', 'connected'];
const READOUTS = ['C', 'Q', 'V', 'E', 'U', 'u', 'sigma'];
const SLAB_CHOICES = ['teflon', 'paper', 'pyrex', 'water', 'srtio3'];

// numbers with SI prefixes, plain text and TeX
const PRE = [[1e9, 'G'], [1e6, 'M'], [1e3, 'k'], [1, ''], [1e-3, 'm'], [1e-6, 'µ'], [1e-9, 'n'], [1e-12, 'p']];
function eng(x, unit, n = 3) {
  if (!Number.isFinite(x)) return '—';
  if (Math.abs(x) < 1e-30) return `0 ${unit}`;
  const [f, p] = PRE.find(([s]) => Math.abs(x) >= s * 0.9995) || PRE[PRE.length - 1];
  return `${(x / f).toPrecision(n).replace(/e\+?(-?\d+)/, 'e$1')} ${p}${unit}`;
}
const tex = (s) => s.replace(/ ([GMkmµnp]?)([A-Za-z/³²]+)$/, (m, p, u) => `\\,\\mathrm{${p === 'µ' ? '\\mu ' : p}${u.replace('³', '^3').replace('²', '^2')}}`);

export function mount(F, P0) {
  const P = { ...defaults, ...P0 };
  const compact = F.compact;
  const show = { charges: true, field: true, bound: true, energy: false, values: true, ...(P.show || {}) };
  const wanted = P.controls === true || (P.controls === null && !compact) ? CONTROLS : Array.isArray(P.controls) ? P.controls : [];
  const kappaOf = (m) => (P.kappa ?? M.DIELECTRICS[m]?.kappa ?? 1);
  // controls, in convenient units
  if (wanted.includes('A')) F.slider({ key: 'A', label: 'Plate area $A$', min: 10, max: 400, step: 5, value: P.A * 1e4, unit: '\\mathrm{cm^2}', explain: 'Bigger plates hold more charge at the same voltage: $C \\propto A$.' });
  if (wanted.includes('d')) F.slider({ key: 'd', label: 'Gap $d$', min: 0.5, max: 10, step: 0.1, value: P.d * 1e3, unit: '\\mathrm{mm}', explain: 'Closer plates: a stronger field for the same voltage, so more charge: $C \\propto 1/d$.' });
  if (wanted.includes('V')) F.slider({ key: 'V', label: 'Battery emf $V_0$', min: 0, max: Math.max(24, P.V), step: 0.5, value: P.V, unit: '\\mathrm{V}', explain: 'Sets the capacitor’s voltage while the battery is connected.' });
  if (wanted.includes('material') && P.kappa === null) {
    const list = SLAB_CHOICES.includes(P.material) ? SLAB_CHOICES : [P.material, ...SLAB_CHOICES];
    F.choice({ key: 'material', label: 'Slab material', options: list.map((m) => [m, `${M.DIELECTRICS[m].label} (κ = ${M.DIELECTRICS[m].kappa})`]), value: P.material, explain: 'The dielectric constant $\\kappa$: how much the material’s polarization weakens the field of a given free charge.' });
  }
  if (wanted.includes('f')) F.slider({ key: 'f', label: 'Slab pushed in', min: 0, max: 100, step: 1, value: P.f * 100, unit: '\\%', explain: 'The fraction of the plate area the slab fills. It always fills the whole gap where it is.' });
  if (wanted.includes('connected')) F.toggle({ key: 'connected', label: 'Battery connected', value: P.connected && P.Q === null, explain: 'Connected: the battery holds the voltage fixed and supplies or takes back charge. Disconnected: the charge on the plates has nowhere to go, so $Q$ stays fixed.' });

  const S = { Qiso: P.Q, connected: P.connected && P.Q === null };
  const params = () => ({
    A: F.params.A !== undefined ? F.params.A * 1e-4 : P.A,
    d: F.params.d !== undefined ? F.params.d * 1e-3 : P.d,
    V: F.params.V ?? P.V,
    kappa: kappaOf(F.params.material ?? P.material),
    material: F.params.material ?? P.material,
    f: F.params.f !== undefined ? F.params.f / 100 : P.f,
  });
  const stateNow = () => {
    const p = params();
    return { p, s: M.state({ ...p, mode: S.connected ? 'battery' : 'isolated', V: p.V, Q: S.Qiso ?? 0 }) };
  };
  if (!S.connected && S.Qiso === null) S.Qiso = M.state({ ...params(), mode: 'battery' }).Q;
  // references fixed at the start, so the pictures grow and shrink with the physics
  const ref0 = stateNow().s;
  const sigRef = Math.max(Math.abs(ref0.Q) / params().A, 1e-30), Eref = Math.max(Math.abs(ref0.E), 1e-30), uRef = Math.max(ref0.uDiel, ref0.uVac, 1e-30);

  F.onChange((key) => {
    if (key === 'connected') {
      if (!F.params.connected) S.Qiso = stateNow().s.Q;       // disconnecting traps the charge it has now
      S.connected = !!F.params.connected;
    }
    draw();
  });

  const { canvas, box } = F.canvas({ aspect: 'wide', label: P.alt || 'A parallel-plate capacitor seen edge-on, with a battery and a dielectric slab' });
  const ctx = canvas.getContext('2d');

  function draw() {
    const C = themeColors();
    const dpr = Math.min(2, devicePixelRatio || 1);
    const W = canvas.clientWidth || 600, H = canvas.clientHeight || 300;
    const want = W < 520 ? '4 / 3' : '';          // a phone gets a taller picture
    if (box.style.aspectRatio !== want) { box.style.aspectRatio = want; requestAnimationFrame(draw); return; }
    if (canvas.width !== Math.round(W * dpr) || canvas.height !== Math.round(H * dpr)) { canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr); }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    const { p, s } = stateNow();
    const narrow = W < 520, fs = compact || narrow ? 11 : 12.5;
    const txt = (t, x, y, o = {}) => {
      ctx.save(); ctx.font = `${o.w || 600} ${o.size || fs}px Inter, system-ui, sans-serif`; ctx.textAlign = o.align || 'center'; ctx.textBaseline = o.base || 'middle';
      if (o.halo !== false) { ctx.lineWidth = 3.5; ctx.strokeStyle = C.bg; ctx.globalAlpha = 0.9; ctx.strokeText(t, x, y); ctx.globalAlpha = 1; }
      ctx.fillStyle = o.color || C.ink; ctx.fillText(t, x, y); ctx.restore();
    };
    const line = (x0, y0, x1, y1, col, w = 2.4, dash = []) => { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.setLineDash(dash); ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); ctx.restore(); };
    const hid = (k) => P.hide.includes(k);

    // geometry: the plates' length follows √A, the gap follows d (two different scales)
    const left = narrow ? 96 : 150, right = W - (narrow ? 14 : 30);
    const Lmax = right - left - 20;
    const Lp = Lmax * (0.4 + 0.6 * Math.min(1, Math.sqrt(p.A / 0.04)));
    const x0 = left + 20 + (Lmax - Lp) / 2, x1 = x0 + Lp;
    const gmax = H - 104, gap = Math.max(24, Math.min(gmax, gmax * (0.3 + 0.7 * Math.min(1, p.d / 10e-3))));
    const yc = H / 2 + 4, yt = yc - gap / 2, yb = yc + gap / 2, th = 7;
    const xs = x1 - p.f * Lp;            // the slab's left edge

    // energy density
    if (show.energy) {
      const a = (u) => Math.min(0.75, 0.08 + 0.55 * (u / uRef));
      ctx.save(); ctx.fillStyle = C.gold;
      ctx.globalAlpha = a(s.uVac); ctx.fillRect(x0, yt, xs - x0, gap);
      ctx.globalAlpha = a(s.uDiel); ctx.fillRect(xs, yt, x1 - xs, gap);
      ctx.restore();
    }
    // the slab: between the plates from xs to x1, the rest of it sticking out on the right
    if (p.f > 0) {
      const out = Math.min(40, (1 - p.f) * Lp);
      ctx.save(); ctx.fillStyle = C.teal; ctx.globalAlpha = 0.2; ctx.fillRect(xs, yt + 1, x1 - xs + out, gap - 2); ctx.globalAlpha = 1;
      ctx.strokeStyle = C.teal; ctx.lineWidth = 1.5; ctx.strokeRect(xs, yt + 1, x1 - xs + out, gap - 2); ctx.restore();
      const lab = P.kappa !== null ? `κ = ${P.kappa}` : `${M.DIELECTRICS[p.material].label}, κ = ${p.kappa}`;
      txt(lab, narrow ? (x0 + x1) / 2 : (xs + x1) / 2, yb + th + (narrow ? 46 : 26), { color: C.teal, size: fs - 0.5 });
    }
    // field lines, at a spacing that shrinks as E grows
    if (show.field && Math.abs(s.E) > 1e-12) {
      const sp = Math.max(9, Math.min(80, 30 * (Eref / Math.abs(s.E))));
      const n = Math.floor((x1 - x0) / sp);
      const off = (x1 - x0 - (n - 1) * sp) / 2;
      for (let k = 0; k < n; k++) {
        const x = x0 + off + k * sp;
        line(x, yt + 5, x, yb - 5, C.violet, 1.4);
        const ym = yc + 4;
        ctx.save(); ctx.fillStyle = C.violet; ctx.beginPath(); ctx.moveTo(x, ym + 4); ctx.lineTo(x - 3.6, ym - 4); ctx.lineTo(x + 3.6, ym - 4); ctx.closePath(); ctx.fill(); ctx.restore();
      }
    }
    // plates
    ctx.save(); ctx.fillStyle = C.ink2;
    ctx.fillRect(x0, yt - th, x1 - x0, th); ctx.fillRect(x0, yb, x1 - x0, th); ctx.restore();
    // free charges: marks per length follow the surface charge density, separately where the slab is
    if (show.charges && Math.abs(s.Q) > 1e-30) {
      const marks = (xa, xb, sigma) => {
        if (xb - xa < 4) return;
        const sp = Math.max(7, Math.min(64, 24 * (sigRef / Math.abs(sigma))));
        const n = Math.max(1, Math.floor((xb - xa) / sp));
        for (let k = 0; k < n; k++) {
          const x = xa + ((k + 0.5) * (xb - xa)) / n;
          txt('+', x, yt - th - 8, { color: C.bad, w: 700, size: fs + 1 });
          txt('−', x, yb + th + 8, { color: C.accent, w: 700, size: fs + 1 });
        }
      };
      marks(x0, xs, s.sigmaVac);
      marks(xs, x1, s.sigmaDiel);
    }
    // bound charges on the slab's faces
    if (show.bound && p.f > 0 && s.sigmaBound > 0) {
      const sp = Math.max(7, Math.min(64, 24 * (sigRef / s.sigmaBound)));
      const n = Math.max(1, Math.floor((x1 - xs) / sp));
      for (let k = 0; k < n; k++) {
        const x = xs + ((k + 0.5) * (x1 - xs)) / n;
        txt('−', x, yt + 8, { color: C.accent2, w: 800, size: fs, halo: false });
        txt('+', x, yb - 8, { color: C.warn, w: 800, size: fs, halo: false });
      }
    }
    // the battery and its switch, on the left
    const bx = narrow ? 64 : 84, cy = yc;
    const wireCol = C.ink3;
    line(x0 + 4, yt - th / 2, bx, yt - th / 2, wireCol, 2); line(bx, yt - th / 2, bx, cy - 26, wireCol, 2);
    line(x0 + 4, yb + th / 2, bx, yb + th / 2, wireCol, 2); line(bx, yb + th / 2, bx, cy + 14, wireCol, 2);
    // switch in the top lead
    const sx0 = bx + (x0 - bx) * 0.35, sx1 = sx0 + 26;
    ctx.save(); ctx.fillStyle = C.bg; ctx.fillRect(sx0 + 1, yt - th / 2 - 4, 24, 8); ctx.restore();
    const closed = S.connected;
    line(sx0, yt - th / 2, closed ? sx1 : sx0 + 22, closed ? yt - th / 2 : yt - th / 2 - 13, C.ink2, 2.6);
    for (const x of [sx0, sx1]) { ctx.save(); ctx.fillStyle = C.panel; ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, yt - th / 2, 3, 0, 2 * Math.PI); ctx.fill(); ctx.stroke(); ctx.restore(); }
    // cell: long + plate on top
    line(bx - 15, cy - 26, bx + 15, cy - 26, C.ink, 2.6); line(bx - 8, cy - 18, bx + 8, cy - 18, C.ink, 5);
    line(bx, cy - 18, bx, cy + 14, wireCol, 2);
    txt(hid('V') ? 'V₀ = ?' : `V₀ = ${+p.V.toFixed(2)} V`, bx - 12, cy - 22, { align: 'right', color: C.ink2, size: fs - 0.5 });
    txt('+', bx + 22, cy - 30, { color: C.ink3, size: fs - 1 });
    txt(closed ? 'connected' : 'disconnected', (sx0 + sx1) / 2, yt - th / 2 - 24, { color: closed ? C.ink3 : C.warn, size: fs - 1.5, w: 500 });

    // labels
    if (show.values) {
      txt(hid('Q') ? '+Q = ?' : `+Q = ${eng(s.Q, 'C')}`, x1 - 4, yt - th - 25, { align: 'right', color: C.bad });
      txt(hid('Q') ? '−Q' : `−Q`, x1 - 4, yb + th + 25, { align: 'right', color: C.accent });
      // the gap, dimensioned on the left of the plates
      const dx = x0 - 10;
      line(dx, yt + 2, dx, yb - 2, C.ink3, 1.2);
      line(dx - 4, yt + 2, dx + 4, yt + 2, C.ink3, 1.2); line(dx - 4, yb - 2, dx + 4, yb - 2, C.ink3, 1.2);
      txt(hid('d') ? 'd = ?' : `d = ${+(p.d * 1e3).toPrecision(3)} mm`, dx - 6, yc, { align: 'right', color: C.ink2, size: fs - 0.5 });
      txt(hid('A') ? 'A = ?' : `A = ${+(p.A * 1e4).toPrecision(3)} cm²`, x0 + 4, yb + th + 26, { align: 'left', color: C.ink2, size: fs - 0.5 });
      if (show.field && Math.abs(s.E) > 1e-12) txt('E', x0 + 12, yc - 12, { color: C.violet, w: 700 });
    }
    // breakdown
    const gapStrength = P.gap === 'air' ? M.DIELECTRICS.air.strength : null;
    const slabStrength = p.f > 0 && P.kappa === null ? M.DIELECTRICS[p.material]?.strength : null;
    const broke = (gapStrength && p.f < 1 && Math.abs(s.E) > gapStrength) || (slabStrength && Math.abs(s.E) > slabStrength);
    if (broke) txt('E exceeds the dielectric strength: it would break down and spark', (x0 + x1) / 2, 14, { color: C.bad, size: fs - 0.5, w: 650 });

    // readout
    const rows = [];
    const R = new Set(P.readouts || []);
    if (R.has('C')) rows.push(['capacitance $C$', tex(eng(s.C, 'F'))]);
    if (R.has('Q')) rows.push(['charge $Q$', tex(eng(s.Q, 'C'))]);
    if (R.has('V')) rows.push(['voltage $V$', tex(eng(s.V, 'V'))]);
    if (R.has('E')) rows.push(['field $E = V/d$', tex(eng(s.E, 'V/m'))]);
    if (R.has('U')) rows.push(['stored energy $U$', tex(eng(s.U, 'J'))]);
    if (R.has('u')) rows.push(['energy density $u$', p.f > 0 && p.f < 1 ? `${tex(eng(s.uVac, 'J/m³'))}\\text{ (empty)},\\ ${tex(eng(s.uDiel, 'J/m³'))}\\text{ (slab)}` : tex(eng(p.f >= 1 ? s.uDiel : s.uVac, 'J/m³'))]);
    if (R.has('sigma')) rows.push(['free charge density $\\sigma$', tex(eng(p.f >= 1 ? s.sigmaDiel : s.sigmaVac, 'C/m²'))]);
    F.readout(rows);
  }
  F.draw(draw);
  F.caption(`Fringing at the plate edges is ignored, so the field between the plates is uniform; the plate length and the gap are drawn on different scales (a real gap is far thinner than the plates are wide). Marks show charge density, not individual charges.${P.f > 0 || wanted.includes('f') ? ' The slab fills the whole gap where it is.' : ''}`);
  return { get: (k) => F.params[k] };
}

/** Node-side check used by the content tests. */
export function validate(P0) {
  const P = { ...defaults, ...P0 }, problems = [];
  if (!(P.A > 0 && P.A <= 1)) problems.push('A is the plate area in m² (0 < A ≤ 1)');
  if (!(P.d > 0 && P.d <= 0.05)) problems.push('d is the gap in m (0 < d ≤ 0.05)');
  if (!(P.f >= 0 && P.f <= 1)) problems.push('f is a fraction from 0 to 1');
  if (P.kappa === null && !M.DIELECTRICS[P.material]) problems.push(`unknown material “${P.material}” (use ${Object.keys(M.DIELECTRICS).join(', ')}, or give kappa)`);
  if (P.kappa !== null && !(P.kappa >= 1)) problems.push('kappa must be at least 1');
  if (!['vacuum', 'air'].includes(P.gap)) problems.push('gap must be vacuum or air');
  if (P.Q !== null && !Number.isFinite(P.Q)) problems.push('Q is a charge in coulombs');
  if (Array.isArray(P.controls)) for (const k of P.controls) if (!CONTROLS.includes(k)) problems.push(`unknown control “${k}” (use ${CONTROLS.join(', ')})`);
  for (const k of P.readouts || []) if (!READOUTS.includes(k)) problems.push(`unknown readout “${k}” (use ${READOUTS.join(', ')})`);
  for (const k of P.hide || []) if (!['A', 'd', 'V', 'Q'].includes(k)) problems.push(`hide: unknown “${k}” (use A, d, V, Q)`);
  return problems;
}
