// A floating-point number taken apart: the 64 bits of a float64 (or the 32 of
// a float32) coloured by field — sign, exponent, fraction — with the decoded
// value, the exact decimal number the bits hold, and a number-line
// microscope showing the float's neighbours, the gap between them and, for a
// preset such as 0.1 whose true value is known, where that real number falls
// between the floats (its rounding error, in gaps). Click a bit to flip it.
//
//   { type: 'num-float', params: {
//       value: 0.1,              // the number shown (rounded into the format)
//       format: 'f64',           // 'f64' (binary64) or 'f32' (binary32)
//       controls: true,          // false: a still picture (no slider, presets or buttons)
//       formats: true,           // show the float64 / float32 choice
//       presets: null,           // [[key, label, value, [num, den] | null], …] or null for the built-in set
//       preset: null,            // the key of the preset to start on (its exact value is then marked)
//       exact: null,             // [num, den]: the real number the value stands for, if not a preset
//                                //   (integers, or strings of digits for integers beyond 2⁵³)
//       decode: true,            // false hides the readout and the field values on the picture (for a question)
//       microscope: true,        // the number line of neighbouring floats
//       flip: true,              // clicking a bit flips it
//   } }
//
// The arithmetic is model/num-float.js, tested in test/num-float.test.mjs.

import { Plot } from '../plot.js';
import * as M from '../model/num-float.js';

const PRESETS = [
  ['one', '1', 1, [1, 1]],
  ['tenth', '0.1', 0.1, [1, 10]],
  ['third', '1/3', 1 / 3, [1, 3]],
  ['c', 'c (m/s)', 299792458, [299792458, 1]],
  ['big', '2⁵³ + 1', 2 ** 53, ['9007199254740993', 1]],
  ['tiny', '10⁻³¹⁰', 1e-310, null],
];

export const defaults = { value: 0.1, format: 'f64', controls: true, formats: true, presets: null, preset: null, exact: null, decode: true, microscope: true, flip: true };

const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const sup = (n) => String(n).replace('-', '⁻').replace(/\d/g, (d) => SUP[d]);
// a number as TeX: plain when moderate, otherwise m × 10ⁿ
function texNum(x, digits = 6) {
  if (!Number.isFinite(x)) return Number.isNaN(x) ? '\\text{not a number}' : (x > 0 ? '+\\infty' : '-\\infty');
  if (x === 0) return '0';
  const a = Math.abs(x);
  if (a >= 1e-3 && a < 1e7) return String(+x.toPrecision(digits));
  const e = Math.floor(Math.log10(a)), m = +(x / 10 ** e).toPrecision(digits);
  return `${m === 1 ? '' : m === -1 ? '-' : `${m}\\times `}10^{${e}}`;
}
// the same, as plain text for the canvas
function txtNum(x, digits = 3) {
  if (!Number.isFinite(x)) return String(x);
  if (x === 0) return '0';
  const a = Math.abs(x);
  if (a >= 1e-3 && a < 1e7) return String(+x.toPrecision(digits));
  const e = Math.floor(Math.log10(a)), m = +(x / 10 ** e).toPrecision(digits);
  return `${m}×10${sup(e)}`;
}
// a power of two as TeX or text
const pow2TeX = (k) => `2^{${k}}`;

/** Where the real number p/q lies relative to the float x, in units of the gap above x. */
function offsetInGaps(x, pq, fmt) {
  if (!pq || !Number.isFinite(x) || x === 0) return null;
  const [p, q] = pq.map(BigInt);
  // floats are m·2^s; the gap is 2^u (u ≤ s)
  const { m, q: s } = M.exactParts(x);
  const g = M.ulp(x, fmt);
  const u = Math.round(Math.log2(g));
  let num;
  if (-u >= 0) num = p * 2n ** BigInt(-u) - q * m * 2n ** BigInt(s - u);
  else num = (p - q * m * 2n ** BigInt(s)) / 2n ** BigInt(u);
  return Number(num) / Number(q);
}

export function mount(F, P) {
  const presets = P.presets || PRESETS;
  const fmt0 = P.format;
  const { canvas } = F.canvas({ aspect: 'wide', label: 'The bits of a floating-point number, coloured by field, with its neighbouring floats on a number line' });
  const plot = new Plot(canvas, { x: [0, 1], y: [0, 1], grid: false, axes: false, pad: { l: 0, r: 0, t: 0, b: 0 } });
  const S = { value: M.toFormat(P.value, fmt0), exact: P.exact || null };
  if (P.preset) { const pr = presets.find((p) => p[0] === P.preset); if (pr) { S.value = M.toFormat(pr[2], fmt0); S.exact = pr[3]; } }
  F.params.format = fmt0;

  if (P.controls !== false) {
    if (P.formats !== false) F.choice({ key: 'format', label: 'Format', options: [['f64', 'float64'], ['f32', 'float32']], value: fmt0, explain: 'float64 (Python’s `float`): 1 sign, 11 exponent and 52 fraction bits. float32: 1, 8 and 23.' });
    F.choice({ key: 'preset', label: 'Start from', options: presets.map(([k, label]) => [k, label]), value: P.preset || '', explain: 'Each is rounded to the nearest float; where its true value is known, the red tick on the number line marks it.' });
    F.slider({ key: 'mag', label: 'Or slide the value', min: 1e-3, max: 1e9, value: Math.min(1e9, Math.max(1e-3, Math.abs(S.value) || 1)), logScale: true, explain: 'Any positive number from $10^{-3}$ to $10^{9}$ (logarithmic slider). Watch the exponent field count powers of two.' });
    F.button({ label: '◀ next float down', onClick: () => { S.value = M.nextDown(S.value, F.params.format); S.exact = null; draw(); } });
    F.button({ label: 'next float up ▶', onClick: () => { S.value = M.nextUp(S.value, F.params.format); S.exact = null; draw(); } });
  }

  F.onChange((key) => {
    const fmt = F.params.format;
    if (key === 'preset') { const pr = presets.find((p) => p[0] === F.params.preset); if (pr) { S.value = M.toFormat(pr[2], fmt); S.exact = pr[3]; } }
    else if (key === 'mag') { S.value = M.toFormat(F.params.mag, fmt); S.exact = null; }
    else if (key === 'format') {
      // keep the same real number where one is known, else re-round the value
      S.value = M.toFormat(S.exact ? S.exact[0] / S.exact[1] : S.value, fmt);
      if (!Number.isFinite(S.value) && fmt === 'f32') S.value = M.toFormat(3.4e38, fmt);
    }
    draw();
  });

  // flipping a bit by clicking it
  let cells = [];
  if (P.flip !== false && P.controls !== false) {
    canvas.style.cursor = 'pointer';
    canvas.addEventListener('pointerdown', (e) => {
      const r = canvas.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top;
      const c = cells.find((k) => px >= k.x && px <= k.x + k.w && py >= k.y && py <= k.y + k.h);
      if (!c) return;
      const fmt = F.params.format;
      const b = M.bitsOf(S.value, fmt).split('');
      b[c.i] = b[c.i] === '1' ? '0' : '1';
      S.value = M.fromBits(b.join(''), fmt); S.exact = null;
      draw();
    });
  }

  F.draw(draw);
  draw();

  function draw() {
    const fmt = F.params.format, Fm = M.FORMATS[fmt];
    const x = S.value, d = M.decode(x, fmt);
    plot.clear();
    const g = plot.ctx, W = plot.w, H = plot.h, C = plot.col;
    const show = P.decode !== false;

    // ── the bits ──
    const n = Fm.bits, margin = 12;
    const oneRow = (W - 2 * margin) / n >= 14;
    const perRow = oneRow ? n : n / 2;
    const cw = Math.min(26, (W - 2 * margin) / perRow), ch = Math.min(26, cw * 1.6 + 4);
    const x0 = (W - cw * perRow) / 2;
    const top = P.microscope === false ? Math.max(30, H / 2 - (oneRow ? ch : 2 * ch + 22) / 2 - 10) : 30;
    const rowGap = 22;
    const field = (i) => (i === 0 ? 'bad' : i <= Fm.ebits ? 'gold' : 'accent');
    cells = [];
    g.save();
    g.font = `600 ${Math.max(8.5, Math.min(14, cw * 0.62))}px ui-monospace, SFMono-Regular, Menlo, monospace`;
    g.textAlign = 'center'; g.textBaseline = 'middle';
    for (let i = 0; i < n; i++) {
      const row = Math.floor(i / perRow), col = i % perRow;
      const cx = x0 + col * cw, cy = top + row * (ch + rowGap);
      g.fillStyle = C[field(i)]; g.globalAlpha = d.bits[i] === '1' ? 0.55 : 0.16;
      g.fillRect(cx + 0.5, cy, cw - 1, ch);
      g.globalAlpha = 1;
      g.fillStyle = C.ink;
      g.fillText(d.bits[i], cx + cw / 2, cy + ch / 2 + 0.5);
      cells.push({ i, x: cx, y: cy, w: cw, h: ch });
    }
    g.restore();
    // field labels above the first row, under the second when split
    const span = (i0, i1) => {
      const r0 = Math.floor(i0 / perRow), r1 = Math.floor((i1 - 1) / perRow);
      return r0 === r1 ? [[r0, x0 + (i0 % perRow) * cw, x0 + (((i1 - 1) % perRow) + 1) * cw]] : [[r0, x0 + (i0 % perRow) * cw, x0 + perRow * cw], [r1, x0, x0 + (((i1 - 1) % perRow) + 1) * cw]];
    };
    const label = (i0, i1, text, color) => {
      const parts = span(i0, i1);
      const [r, a, b] = parts.reduce((best, p) => (p[2] - p[1] > best[2] - best[1] ? p : best));
      const y = top + r * (ch + rowGap) - 9;
      plot.text(text, (a + b) / 2, y, { screen: true, align: 'center', color, size: 11.5, weight: 650 });
    };
    const eTxt = show ? (d.kind === 'normal' ? ` = ${d.stored} → 2${sup(d.e)}` : d.kind === 'subnormal' || d.kind === 'zero' ? ' = 0 → subnormal' : ' all ones → ∞/NaN') : '';
    label(0, 1, oneRow || cw * 3 > 34 ? 'sign' : 's', 'bad');
    label(1, 1 + Fm.ebits, `exponent${eTxt}`, 'gold');
    label(1 + Fm.ebits, n, `fraction: ${Fm.fbits} bits`, 'accent');

    // ── the microscope: neighbouring floats on a number line ──
    if (P.microscope !== false && Number.isFinite(x)) {
      const yL = top + (oneRow ? ch : 2 * ch + rowGap) + Math.max(48, (H - top - (oneRow ? ch : 2 * ch + rowGap)) * 0.55);
      const L = 28, R = W - 28;
      const lo2 = M.nextDown(M.nextDown(x, fmt), fmt), hi2 = M.nextUp(M.nextUp(x, fmt), fmt);
      const pts = [lo2, M.nextDown(x, fmt), x, M.nextUp(x, fmt), hi2].filter(Number.isFinite);
      // positions in units of the gap above x (exact: neighbours differ by whole gaps)
      const gUp = M.ulp(x, fmt), gDown = x - M.nextDown(x, fmt);
      const pos = (v) => (v - x) / gUp;
      const lo = Math.min(-2.6, pos(pts[0]) - 0.5), hi = Math.max(2.6, pos(pts[pts.length - 1]) + 0.5);
      const X = (t) => L + ((t - lo) / (hi - lo)) * (R - L);
      plot.line(plot.ix(L), plot.iy(yL), plot.ix(R), plot.iy(yL), { color: 'ink3', width: 1.4 });
      for (const v of pts) {
        const px = X(pos(v)), me = v === x;
        plot.line(plot.ix(px), plot.iy(yL - (me ? 13 : 9)), plot.ix(px), plot.iy(yL + (me ? 13 : 9)), { color: me ? 'accent' : 'ink2', width: me ? 3 : 1.6 });
      }
      plot.text('this float', X(0), yL + 24, { screen: true, align: 'center', color: 'accent', size: 11.5, weight: 650 });
      const gapTxt = `gap ${txtNum(gUp)}`;
      plot.text(gapTxt, X(0.5), yL - 22, { screen: true, align: 'center', color: 'ink2', size: 11.5 });
      if (gDown !== gUp) plot.text(`gap ${txtNum(gDown)}`, X(-0.5), yL - 22, { screen: true, align: 'center', color: 'gold', size: 11.5 });
      plot.text('neighbouring floats: nothing in between exists', (L + R) / 2, H - 10, { screen: true, align: 'center', color: 'ink3', size: 11 });
      // the real number the value stands for
      const off = S.exact ? offsetInGaps(x, S.exact, fmt) : null;
      if (off !== null && Math.abs(off) > 1e-12 && Math.abs(off) < 2.4) {
        const px = X(off);
        plot.line(plot.ix(px), plot.iy(yL - 16), plot.ix(px), plot.iy(yL + 16), { color: 'bad', width: 2.4 });
        plot.text('true value', px, yL + 40, { screen: true, align: 'center', color: 'bad', size: 11.5, weight: 650 });
      }
    }

    // ── the readout ──
    if (!show) { F.readout([]); return; }
    const ex = M.exactDecimal(x, 24);
    const exTeX = !Number.isFinite(x) ? texNum(x) : ex.sig.length <= 1 && !ex.cut
      ? (ex.exp10 >= -4 && ex.exp10 < 16 ? ex.text : `${ex.neg ? '-' : ''}${ex.sig}\\times 10^{${ex.exp10}}`)
      : ex.exp10 >= -4 && ex.exp10 < 16 && !ex.cut ? ex.text
        : `${ex.neg ? '-' : ''}${ex.sig[0]}.${ex.sig.slice(1)}${ex.cut ? '\\ldots' : ''}\\times 10^{${ex.exp10}}`;
    const fracShown = d.fracBits.slice(0, 12) + (d.fracBits.length > 12 ? '\\ldots' : '');
    const rows = [
      ['value', texNum(x, 17)],
      ['stored exactly', exTeX + (ex.cut ? `\\;(${ex.digits}\\text{ digits})` : '')],
      Number.isFinite(x) && x !== 0 ? ['bits mean', `${d.sign ? '-' : '+'}(${d.lead}.${fracShown})_2\\times ${pow2TeX(d.e)}`] : null,
      Number.isFinite(x) ? ['gap to the next float', `${texNum(M.ulp(x, fmt), 4)}${M.ulp(x, fmt) > 0 ? ` = ${pow2TeX(Math.round(Math.log2(M.ulp(x, fmt))))}` : ''}`] : null,
      Number.isFinite(x) && x !== 0 ? ['gap ÷ |value|', texNum(M.ulp(x, fmt) / Math.abs(x), 3)] : null,
    ];
    const off = S.exact && Number.isFinite(x) ? offsetInGaps(x, S.exact, fmt) : null;
    if (off !== null) {
      const tru = S.exact[0] / S.exact[1];
      rows.push(['rounding error', off === 0 ? '0\\ (\\text{exact})' : `${texNum(Math.abs(off), 3)}\\text{ gap} \\approx ${texNum(Math.abs(off) * M.ulp(x, fmt) / Math.abs(tru), 3)}\\text{ relative}`]);
    }
    F.readout(rows);
  }

  return { get: (k) => (k === 'value' ? S.value : F.params[k]) };
}

export function validate(P) {
  const out = [];
  if (typeof P.value !== 'number' || Number.isNaN(P.value)) out.push('num-float: value must be a number');
  if (!M.FORMATS[P.format]) out.push(`num-float: format must be 'f64' or 'f32', not ${P.format}`);
  if (P.presets && !(Array.isArray(P.presets) && P.presets.every((p) => Array.isArray(p) && p.length >= 3 && typeof p[2] === 'number'))) out.push('num-float: presets are [key, label, value, [num, den] | null]');
  if (P.preset && !(P.presets || PRESETS).some((p) => p[0] === P.preset)) out.push(`num-float: no preset ${P.preset}`);
  const isInt = (v) => Number.isInteger(v) || (typeof v === 'string' && /^-?\d+$/.test(v));
  if (P.exact && !(Array.isArray(P.exact) && P.exact.length === 2 && P.exact.every(isInt) && Number(P.exact[1]) !== 0)) out.push('num-float: exact is [numerator, denominator], integers');
  return out;
}
