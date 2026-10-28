// The electromagnetic spectrum on one logarithmic strip, from long radio
// waves to gamma rays: wavelength along the top, frequency and photon energy
// along the bottom, the conventional bands in colour, real sources at their
// measured frequencies, and things about one wavelength across. Slide the
// marker (or click a source) to read off λ = c/f, the photon energy hf and the
// band. Data and physics in model/em-light.js (tested in test/em-light.test.mjs).
//
//   { type: 'em-spectrum', params: {
//       f: 5.45e14,                 // the marker's frequency in Hz; null hides the marker
//       marks: null,                // source ids to label (see SOURCES in the model); default all that fit; [] none
//       controls: true,             // the frequency slider (none when compact)
//       readouts: null,             // a list of: f lambda E band size (readout: false hides the bar)
//       bands: true,                // write the band names (false: colours only)
//       axes: ['lambda', 'f', 'E'], // the scales drawn
//       sizes: true,                // the row of things one wavelength across
//       range: [3, 22.5],           // log₁₀ of the frequencies drawn, in Hz
//   } }

import { themeColors } from '../plot.js';
import * as M from '../model/em-light.js';

export const defaults = { f: 5.45e14, marks: null, controls: null, readout: null, readouts: null, bands: true, axes: ['lambda', 'f', 'E'], sizes: true, range: [3, 22.5] };
const READOUTS = ['f', 'lambda', 'E', 'band', 'size'];
const LOG_C = Math.log10(M.C), LOG_HE = Math.log10(M.H / M.E_CHARGE);
const SHORT = { radio: 'radio', microwave: 'µwave', infrared: 'IR', ultraviolet: 'UV', xray: 'X', gamma: 'γ' };

const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const FREQ_PRE = [[1e21, 'Z'], [1e18, 'E'], [1e15, 'P'], [1e12, 'T'], [1e9, 'G'], [1e6, 'M'], [1e3, 'k'], [1, '']];
const LEN_PRE = [[1e3, 'km'], [1, 'm'], [1e-2, 'cm'], [1e-3, 'mm'], [1e-6, 'µm'], [1e-9, 'nm'], [1e-12, 'pm'], [1e-15, 'fm']];
const EV_PRE = [[1e6, 'MeV'], [1e3, 'keV'], [1, 'eV'], [1e-3, 'meV'], [1e-6, 'µeV'], [1e-9, 'neV']];
const withPre = (x, table, n = 3) => { const [f, u] = table.find(([v]) => Math.abs(x) >= v * 0.9995) || table[table.length - 1]; return [+(x / f).toPrecision(n), u]; };
const plainF = (f, n = 3) => { const [v, p] = withPre(f, FREQ_PRE, n); return `${v} ${p}Hz`; };
const plainL = (l, n = 3) => { const [v, u] = withPre(l, LEN_PRE, n); return `${v} ${u}`; };
const plainE = (e, n = 3) => { const [v, u] = withPre(e, EV_PRE, n); return `${v} ${u}`; };
const texOf = (s) => s.replace(/^(\S+) (\S+)$/, (m, v, u) => `${v}\\,\\mathrm{${u.replace('µ', '\\mu ')}}`);

export function mount(F, P0) {
  const P = { ...defaults, ...P0 };
  const compact = F.compact;
  const [lo, hi] = P.range;
  const hasMarker = P.f !== null && P.f !== undefined;
  const wantCtl = hasMarker && (P.controls === true || (P.controls === null && !compact));
  if (wantCtl) F.slider({ key: 'f', label: 'Frequency $f$', min: 10 ** lo, max: 10 ** Math.min(hi, 22), value: P.f, logScale: true, unit: '', fmt: (v) => texOf(plainF(v)), explain: 'Slide along the spectrum, or click a labelled source. Every point is the same kind of wave, travelling at $c$ in a vacuum — only the frequency differs.' });
  const fNow = () => (F.params.f ?? P.f);

  const { canvas, box } = F.canvas({ aspect: 'wide', label: P.alt || 'The electromagnetic spectrum on a logarithmic scale, with wavelength, frequency, photon energy, the bands and real sources' });
  const ctx = canvas.getContext('2d');
  let C = themeColors(), W = 600, H = 300, FS = 12, X = () => 0, srcHits = [], fits = 0, lastW = 0;

  function text(s, x, y, o = {}) {
    ctx.save();
    ctx.font = `${o.weight || 600} ${o.size || FS}px Inter, system-ui, sans-serif`;
    ctx.textAlign = o.align || 'center'; ctx.textBaseline = o.base || 'middle';
    if (o.halo !== false) { ctx.lineWidth = 3.5; ctx.strokeStyle = C.bg; ctx.globalAlpha = 0.9; ctx.strokeText(s, x, y); ctx.globalAlpha = 1; }
    ctx.fillStyle = o.color || C.ink; ctx.fillText(s, x, y);
    ctx.restore();
  }
  function measure(s, o = {}) { ctx.save(); ctx.font = `${o.weight || 600} ${o.size || FS}px Inter, system-ui, sans-serif`; const w = ctx.measureText(s).width; ctx.restore(); return w; }
  function line(x0, y0, x1, y1, col, w = 1.2, dash = []) { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.setLineDash(dash); ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); ctx.restore(); }
  const sup = (k) => `10${String(k).replace('-', '⁻').replace(/\d/g, (d) => SUP[d])}`;

  function draw() {
    C = themeColors();
    const dpr = Math.min(2, devicePixelRatio || 1);
    W = canvas.clientWidth || 600; H = canvas.clientHeight || 300;
    if (W !== lastW) { lastW = W; fits = 0; }
    const narrow = W < 520;
    FS = compact || narrow ? 10.5 : 12;
    const padL = 12, padR = 12;
    X = (lf) => padL + ((lf - lo) / (hi - lo)) * (W - padL - padR);
    const axes = P.axes || [];
    const marks = (P.marks ?? M.SOURCES.map((s) => s.id)).map((id) => M.SOURCES.find((s) => s.id === id)).filter(Boolean).filter((s) => Math.log10(s.f) >= lo && Math.log10(s.f) <= hi);
    const rowH = FS + 5, maxRows = 4;
    // ── lay the source labels out first (greedy rows), to know how tall the picture must be ──
    const placed = [], ends = new Array(maxRows).fill(-Infinity);
    for (const sr of marks) {
      const x = X(Math.log10(sr.f)), w = measure(sr.short, { size: FS - 1 });
      let row = -1;
      for (let r = 0; r < maxRows; r++) if (x - w / 2 > ends[r] + 7 && x + w / 2 < W - 2 && x - w / 2 > 2) { row = r; break; }
      if (row >= 0) ends[row] = x + w / 2;
      placed.push({ s: sr, x, w, row });
    }
    const rowsUsed = Math.max(0, ...placed.map((q) => q.row + 1));
    // ── vertical layout ──
    let y = 6;
    const yLam = axes.includes('lambda') ? y + 8 : null;
    if (yLam !== null) y += 22;
    const yStrip0 = y, stripH = narrow ? 34 : 40, yStrip1 = y + stripH;
    y = yStrip1 + (marks.length ? 10 : 6);
    const ySrc0 = y;
    y += rowsUsed * rowH + (rowsUsed ? 6 : 0);
    const yF = axes.includes('f') ? y + 4 : null;
    if (yF !== null) y += 26;
    const yE = axes.includes('E') ? y + 4 : null;
    if (yE !== null) y += 26;
    const ySize = P.sizes ? y + 8 : null;
    if (ySize !== null) y += 2 * (FS + 3) + 10;
    const need = Math.round(y + 6);
    if (Math.abs(need - H) > 3 && fits < 4) { fits++; box.style.aspectRatio = `${Math.round(W)} / ${need}`; requestAnimationFrame(draw); return; }
    if (canvas.width !== Math.round(W * dpr) || canvas.height !== Math.round(H * dpr)) { canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr); }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    // ── the band strip ──
    const xm = hasMarker ? X(Math.log10(fNow())) : null;
    for (const b of M.BANDS) {
      const x0 = X(Math.max(lo, Math.log10(b.from))), x1 = X(Math.min(hi, Math.log10(b.to)));
      if (x1 <= x0) continue;
      if (b.id === 'visible') {
        const g = ctx.createLinearGradient(x0, 0, x1, 0);
        ['#ff2020', '#ff9020', '#ffee20', '#30d040', '#2080ff', '#8030ff'].forEach((c, k, arr) => g.addColorStop(k / (arr.length - 1), c));
        ctx.save(); ctx.fillStyle = g; ctx.fillRect(x0, yStrip0, x1 - x0, stripH); ctx.restore();
      } else {
        ctx.save(); ctx.fillStyle = b.color; ctx.globalAlpha = 0.32; ctx.fillRect(x0, yStrip0, x1 - x0, stripH); ctx.restore();
      }
      line(x1, yStrip0, x1, yStrip1, C.bg, 1.5);
      if (!P.bands) continue;
      const w = measure(b.name, { size: FS });
      if (b.id === 'visible') {
        ctx.save(); ctx.translate((x0 + x1) / 2, (yStrip0 + yStrip1) / 2); ctx.rotate(-Math.PI / 2);
        ctx.font = `700 ${FS - 2.5}px Inter, system-ui, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(0,0,0,.55)'; ctx.strokeText('visible', 0, 0.5); ctx.fillStyle = '#fff'; ctx.fillText('visible', 0, 0.5); ctx.restore();
      } else {
        // the name, kept clear of the marker when there is room beside it; else the short name
        const o = { size: FS, color: C.ink, weight: 650 }, sh = SHORT[b.id];
        const clear = (wd) => {
          if (wd + 6 > x1 - x0) return null;
          const c0 = (x0 + x1) / 2;
          if (xm === null || Math.abs(xm - c0) >= wd / 2 + 9) return c0;
          const L = xm - 9 - x0, R = x1 - (xm + 9);
          if (L >= R && L >= wd + 4) return x0 + L / 2;
          if (R > L && R >= wd + 4) return xm + 9 + R / 2;
          return null;
        };
        let cx = clear(w), name = b.name;
        if (cx === null && sh) { cx = clear(measure(sh, o)); name = sh; }
        if (cx === null && xm === null && sh && measure(sh, o) + 4 < x1 - x0) { cx = (x0 + x1) / 2; name = sh; }
        // (no room beside the marker: leave the band unnamed rather than half-hidden; the readout names it)
        if (cx !== null) text(name, cx, (yStrip0 + yStrip1) / 2, o);
      }
    }
    ctx.save(); ctx.strokeStyle = C.line3; ctx.lineWidth = 1; ctx.strokeRect(X(lo) + 0.5, yStrip0 + 0.5, X(hi) - X(lo) - 1, stripH - 1); ctx.restore();

    // ── wavelength scale (top) ──
    if (yLam !== null) {
      text('wavelength', padL, yLam, { align: 'left', size: FS - 1.5, color: C.ink3, weight: 600 });
      const nameEnd = padL + measure('wavelength', { size: FS - 1.5 }) + 10;
      const kMax = Math.floor(LOG_C - lo), kMin = Math.ceil(LOG_C - hi);
      for (let k = kMin; k <= kMax; k++) {
        const x = X(LOG_C - k), major = ((k % 3) + 3) % 3 === 0;
        line(x, yStrip0 - (major ? 7 : 4), x, yStrip0, C.ink3, 1);
        const lab = plainL(10 ** k, 1), wl = measure(lab, { size: FS - 1 });
        if (major && x - wl / 2 > nameEnd && x + wl / 2 < W - padR) text(lab, x, yLam, { size: FS - 1, color: C.ink2, weight: 550 });
      }
    }
    // ── sources ──
    srcHits = [];
    for (const q of placed) {
      ctx.save(); ctx.fillStyle = C.ink; ctx.beginPath(); ctx.moveTo(q.x, yStrip1 - 1); ctx.lineTo(q.x - 4, yStrip1 + 6); ctx.lineTo(q.x + 4, yStrip1 + 6); ctx.closePath(); ctx.fill(); ctx.restore();
      if (q.row < 0) continue;
      const yl = ySrc0 + q.row * rowH + rowH / 2;
      if (q.row > 0) line(q.x, yStrip1 + 7, q.x, yl - rowH / 2 + 3, C.ink4, 1, [2, 2]);
      text(q.s.short, q.x, yl, { size: FS - 1, color: C.ink, weight: 600 });
      srcHits.push({ x: q.x, y: yl, w: q.w, s: q.s });
    }
    // ── frequency and photon-energy scales (bottom) ──
    const scale = (yy, name, offset, fmtK) => {
      line(X(lo), yy, X(hi), yy, C.line3, 1);
      text(name, padL, yy + 12, { align: 'left', size: FS - 1.5, color: C.ink3, weight: 600 });
      const nameEnd = padL + measure(name, { size: FS - 1.5 }) + 10;
      for (let k = Math.ceil(lo + offset); k <= Math.floor(hi + offset); k++) {
        const x = X(k - offset), major = ((k % 3) + 3) % 3 === 0;
        line(x, yy, x, yy + (major ? 5 : 3), C.ink3, 1);
        const lab = fmtK(k), wl = measure(lab, { size: FS - 1 });
        if (major && x - wl / 2 > nameEnd && x + wl / 2 < W - padR) text(lab, x, yy + 12, { size: FS - 1, color: C.ink2, weight: 550 });
      }
    };
    if (yF !== null) scale(yF, 'frequency', 0, (k) => plainF(10 ** k, 1));
    if (yE !== null) scale(yE, 'photon energy', LOG_HE, (k) => plainE(10 ** k, 1));   // log₁₀(hf/eV) = log₁₀ f + log₁₀(h/e)
    // ── things one wavelength across ──
    if (ySize !== null) {
      text('about one wavelength across:', padL, ySize, { align: 'left', size: FS - 2, color: C.ink3, weight: 500 });
      const titleEnd = padL + measure('about one wavelength across:', { size: FS - 2, weight: 500 }) + 8;
      const last = [-Infinity, -Infinity];
      for (const sz of M.SIZES) {
        const lf = LOG_C - Math.log10(sz.l);
        if (lf < lo || lf > hi) continue;
        const x = X(lf), label = sz.text.replace(/^an? /, ''), w = measure(label, { size: FS - 1.5, weight: 500 });
        if (x + w / 2 > W - 2) continue;
        const row = x - w / 2 > Math.max(last[0] + 5, titleEnd) ? 0 : x - w / 2 > last[1] + 5 && x - w / 2 > 2 ? 1 : -1;
        if (row < 0) continue;
        last[row] = x + w / 2;
        text(label, x, ySize + row * (FS + 3), { size: FS - 1.5, color: C.ink3, weight: 500 });
      }
    }
    // ── the marker ──
    if (hasMarker) {
      const f = fNow(), x = X(Math.log10(f));
      line(x, yStrip0 - 2, x, Math.min(H - 4, (ySize !== null ? ySize + FS + 6 : y)), C.gold, 1.6, [4, 3]);
      ctx.save(); ctx.fillStyle = C.gold; ctx.strokeStyle = C.bg; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, (yStrip0 + yStrip1) / 2, 6, 0, 2 * Math.PI); ctx.fill(); ctx.stroke(); ctx.restore();
      if (P.readout ?? !compact) {
        const lam = M.lambdaOf(f), e = M.photonEV(f), band = M.bandOf(f), size = M.sizeOf(lam);
        const rows = {
          f: ['frequency $f$', texOf(plainF(f))],
          lambda: ['wavelength $\\lambda = c/f$', texOf(plainL(lam))],
          E: ['photon energy $hf$', texOf(plainE(e))],
          band: ['band', `\\text{${band.name}}`],
          size: ['about the size of', size ? `\\text{${size.text}}` : '\\text{—}'],
        };
        F.readout((P.readouts || READOUTS).map((k) => rows[k]).filter(Boolean));
      }
    }
  }
  // a click on a source label moves the marker there
  canvas.addEventListener('click', (ev) => {
    if (!wantCtl) return;
    const r = canvas.getBoundingClientRect(), x = ev.clientX - r.left, y = ev.clientY - r.top;
    const hit = srcHits.find((h) => Math.abs(x - h.x) <= h.w / 2 + 4 && Math.abs(y - h.y) <= 9);
    if (hit) F.set('f', hit.s.f);
  });
  F.onChange(() => draw());
  F.draw(draw);
  F.caption(P.caption ?? 'A logarithmic scale: each tick is ten times the last. The band edges are conventions, not physics — X-rays and gamma rays overlap in energy and are named for their source. All of it travels at c in a vacuum.');
  return { get: (k) => F.params[k] };
}

/** Node-side check used by the content tests. */
export function validate(P0) {
  const P = { ...defaults, ...P0 }, p = [];
  const [lo, hi] = P.range || [];
  if (!(lo < hi)) p.push('range is [log₁₀ fmin, log₁₀ fmax]');
  if (P.f !== null && !(P.f > 0)) p.push('f is the marker frequency in Hz (or null)');
  if (P.f !== null && P.f > 0 && !(Math.log10(P.f) >= lo && Math.log10(P.f) <= hi)) p.push('f lies outside the range drawn');
  for (const id of P.marks || []) if (!M.SOURCES.some((s) => s.id === id)) p.push(`unknown source “${id}” (use ${M.SOURCES.map((s) => s.id).join(', ')})`);
  for (const a of P.axes || []) if (!['lambda', 'f', 'E'].includes(a)) p.push(`unknown axis “${a}” (use lambda, f, E)`);
  for (const k of P0.readouts || []) if (!READOUTS.includes(k)) p.push(`unknown readout “${k}” (use ${READOUTS.join(', ')})`);
  return p;
}
