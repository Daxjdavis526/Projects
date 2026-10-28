// Blackbody radiation: the spectrum of a perfect absorber and emitter at
// temperature T. Planck’s law (solid) against the classical Rayleigh–Jeans
// law — which runs off to infinity at short wavelengths, the “ultraviolet
// catastrophe” — and Wien’s 1896 law (both dashed, on request). Three views:
// radiance per unit wavelength, per unit frequency (whose peak is NOT at
// c/λ_max), or both axes logarithmic, where every temperature from the
// CMB to a blue supergiant fits on one plot and the peaks slide along a line
// of slope −5. The peak, the visible band, an approximate colour, and real
// objects as presets. Physics in model/mp-blackbody.js (tested in
// test/mp-blackbody.test.mjs).
//
//   { type: 'mp-blackbody', params: {
//       T: 5772,               // temperature in K (2.5–30 000)
//       axis: 'lambda',        // 'lambda' (B_λ against λ), 'nu' (B_ν against ν), 'log' (log B_λ against log λ)
//       curves: ['planck'],    // any of: planck rj wien
//       compare: [],           // more temperatures (K) or object keys (cmb body lava lamp betelgeuse sun sirius rigel), drawn faint
//       band: true,            // the visible band, 380–750 nm
//       peak: true,            // mark the peak
//       swatch: true,          // the approximate colour of the glow
//       numbers: true,         // false hides the wavelength (or frequency) numbers on the axis
//       controls: null,        // true, false, or a list of: T object axis curves
//       readout: true,
//       hide: [],              // any of: T (the temperature), peak (λ_max and ν_max), power (σT⁴), visible (the visible share)
//   } }

import { Plot, pow10Label, themeColors } from '../plot.js';
import * as B from '../model/mp-blackbody.js';
import { wavelengthToRGB } from '../model/qm-light.js';

export const defaults = { T: 5772, axis: 'lambda', curves: ['planck'], compare: [], band: true, peak: true, swatch: true, numbers: true, controls: null, readout: true, hide: [] };
const CONTROLS = ['T', 'object', 'axis', 'curves'];
const AXES = ['lambda', 'nu', 'log'];
const CURVES = ['planck', 'rj', 'wien'];
const HIDE = ['T', 'peak', 'power', 'visible'];
const TMIN = 2.5, TMAX = 30000;
const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };

/** The smallest 1–2–5 × 10ⁿ that is at least x. */
function nice125(x) {
  const e = Math.floor(Math.log10(x));
  for (const m of [1, 2, 5, 10]) if (m * 10 ** e >= x * (1 - 1e-12)) return m * 10 ** e;
  return 10 ** (e + 1);
}
/** A temperature as plain text: 2.725, 306, 5772, 12 100. */
const plainT = (T) => (T < 10 ? String(+T.toPrecision(4)) : T < 1e4 ? String(Math.round(T)) : String(Math.round(T)).replace(/\B(?=(\d{3})+(?!\d))/g, ' '));
/** A length in metres as plain text with a sensible unit. */
function plainLen(m, n = 3) {
  const [f, u] = m < 1e-6 ? [1e9, 'nm'] : m < 1e-3 ? [1e6, 'μm'] : m < 1e-2 ? [1e3, 'mm'] : [1e2, 'cm'];
  return `${+(m * f).toPrecision(n)} ${u}`;
}
function plainFreq(hz, n = 3) {
  const [f, u] = hz < 1e12 ? [1e-9, 'GHz'] : hz < 1e15 ? [1e-12, 'THz'] : [1e-15, 'PHz'];
  return `${+(hz * f).toPrecision(n)} ${u}`;
}
/** n significant figures as TeX, with ×10ⁿ when large. */
function texSci(x, n = 3) {
  if (!(x > 0)) return '0';
  const e = Math.floor(Math.log10(x));
  if (e >= -2 && e < 5) return String(+x.toPrecision(n));
  const m = +(x / 10 ** e).toPrecision(n);
  return m === 10 ? `10^{${e + 1}}` : `${m}\\times10^{${e}}`;
}
const texUnit = (s) => s.replace(/^(\S+) (\S+)$/, (m, v, u) => `${v}\\,\\mathrm{${u.replace('μ', '\\mu ')}}`);
/** Resolve a compare entry (a number or an object key) to { T, name }. */
const resolve = (c) => (typeof c === 'number' ? { T: c, name: `${plainT(c)} K` } : B.OBJECTS[c] ? { T: B.OBJECTS[c].T, name: B.OBJECTS[c].label } : null);

export function mount(F, P0) {
  const P = { ...defaults, ...P0 };
  const hide = new Set(P.hide || []);
  const wanted = P.controls === true || (P.controls === null && !F.compact) ? CONTROLS : Array.isArray(P.controls) ? P.controls : [];
  const curvesOn = new Set(P.curves || []);
  let objCtl = null;

  if (wanted.includes('T')) {
    F.slider({ key: 'T', label: 'Temperature $T$', min: TMIN, max: TMAX, value: P.T, logScale: true, unit: '\\mathrm{K}', fmt: (v) => (v < 10 ? (+v.toPrecision(3)).toString() : String(Math.round(v))), explain: 'The absolute temperature of the radiating body. The slider is logarithmic: each notch multiplies T.' });
  } else F.params.T = P.T;
  if (wanted.includes('object')) {
    const match = Object.entries(B.OBJECTS).find(([, o]) => Math.abs(o.T - P.T) < 1e-9)?.[0] ?? null;
    objCtl = F.choice({ key: 'object', label: 'Real objects', options: Object.entries(B.OBJECTS).map(([k, o]) => [k, o.label]), value: match, explain: 'Each sets T to that object’s (effective) temperature. Stars are only approximately black: their spectra carry absorption lines.' });
  }
  if (wanted.includes('axis')) F.choice({ key: 'axis', label: 'Plot', options: [['lambda', 'per wavelength'], ['nu', 'per frequency'], ['log', 'log–log']], value: P.axis, explain: 'Per wavelength and per frequency describe the same light, but their peaks fall at different photons. Log–log fits every temperature on one plot.' });
  else F.params.axis = P.axis;
  if (wanted.includes('curves')) {
    F.toggle({ key: 'rj', label: 'Rayleigh–Jeans law (classical)', value: curvesOn.has('rj'), explain: 'Equipartition: every mode of the cavity gets $kT$. Right at long wavelengths, absurd at short ones.' });
    F.toggle({ key: 'wien', label: 'Wien’s 1896 law', value: curvesOn.has('wien'), explain: 'An empirical guess with an exponential cutoff: right at short wavelengths, too low at long ones.' });
  } else { F.params.rj = curvesOn.has('rj'); F.params.wien = curvesOn.has('wien'); }

  const { canvas, box } = F.canvas({ aspect: 'wide', label: P.alt || 'The spectrum of blackbody radiation at a chosen temperature' });
  const plot = new Plot(canvas, { x: [0, 1], y: [0, 1], pad: { l: 52, r: 16, t: 14, b: 36 } });
  const compare = (P.compare || []).map(resolve).filter(Boolean);

  F.onChange((key) => {
    if (key === 'object' && F.params.object && B.OBJECTS[F.params.object]) F.set('T', B.OBJECTS[F.params.object].T);
    else if (key === 'T' && objCtl) { const m = Object.entries(B.OBJECTS).find(([, o]) => Math.abs(o.T - F.params.T) < 1e-6 * o.T)?.[0] ?? null; objCtl.set(m); }
    draw();
  });

  function rainbow(x0px, x1px, y0px, y1px, nmAt) {
    const g = plot.ctx;
    g.save();
    for (let px = Math.max(plot.L, Math.floor(Math.min(x0px, x1px))); px <= Math.min(plot.R, Math.ceil(Math.max(x0px, x1px))); px++) {
      const nm = nmAt(px);
      if (!(nm >= 380 && nm <= 750)) continue;
      g.fillStyle = `rgb(${wavelengthToRGB(nm).join(',')})`;
      g.fillRect(px, Math.min(y0px, y1px), 1.2, Math.abs(y1px - y0px));
    }
    g.restore();
  }

  function draw() {
    const T = Math.min(TMAX, Math.max(TMIN, +F.params.T || P.T)), axis = F.params.axis || 'lambda';
    const W = canvas.clientWidth || 600, narrow = W < 520;
    const want = narrow ? '3 / 2' : '';
    if (box.style.aspectRatio !== want) { box.style.aspectRatio = want; requestAnimationFrame(draw); return; }
    const col = themeColors();
    const rgb = B.blackbodyRGB(T), glowCss = `rgb(${rgb.join(',')})`;
    const visible = B.visibleFraction(T) > 1e-7;
    const fs = narrow ? 11 : 12;
    let peakX = null, peakY = null, peakLabel = '';

    if (axis === 'log') {
      plot.o.xfmt = pow10Label; plot.o.yfmt = pow10Label; plot.o.xticks = P.numbers === false ? 0 : 8; plot.o.yticks = 6;
      plot.o.xlabel = 'wavelength (m)'; plot.o.ylabel = 'Bλ (W sr⁻¹ m⁻³)';
      plot.setView([-8, -1], [-8, 18]);
      plot.clear();
      const lg = (f) => (x) => { const v = f(10 ** x); return v > 0 ? Math.log10(v) : NaN; };
      if (P.band !== false) {
        const xa = plot.X(Math.log10(380e-9)), xb = plot.X(Math.log10(750e-9));
        plot.ctx.save(); plot.ctx.globalAlpha = 0.16; rainbow(xa, xb, plot.T, plot.B, (px) => 1e9 * 10 ** plot.ix(px)); plot.ctx.restore();
        rainbow(xa, xb, plot.B - 7, plot.B, (px) => 1e9 * 10 ** plot.ix(px));
      }
      // the locus of the peaks: B_peak ∝ T⁵ and λ_max ∝ 1/T, so a line of slope −5
      const k5 = Math.log10(B.peakBLambda(1) * B.WIEN_B ** 5);
      if (P.peak !== false) {
        plot.fn((x) => k5 - 5 * x, { color: 'ink3', width: 1.2, dash: [5, 5] });
        const xl = -6.9, yl = k5 - 5 * xl;
        if (yl < 17 && yl > -7) plot.text('peaks: λmax T = b', xl, yl, { color: 'ink3', dx: 8, dy: -2, size: fs - 1 });
      }
      for (const c of compare) {
        plot.fn(lg((l) => B.planckLambda(l, c.T)), { color: 'ink3', width: 1.6 });
        const px = Math.log10(B.peakLambda(c.T)), py = Math.log10(B.peakBLambda(c.T));
        if (px > -8 && px < -1.2 && py < 17.5 && py > -7.5) plot.text(c.name, px, py, { color: 'ink2', dy: -11, align: 'center', size: fs - 1 });
      }
      if (F.params.rj) plot.fn(lg((l) => B.rjLambda(l, T)), { color: 'bad', width: 2, dash: [7, 5] });
      if (F.params.wien) plot.fn(lg((l) => B.wienLambda(l, T)), { color: 'violet', width: 2, dash: [3, 4] });
      plot.fn(lg((l) => B.planckLambda(l, T)), { color: 'warn', width: 2.8 });
      if (F.params.rj) {
        const xr = Math.min(-1.6, Math.max(-7.6, Math.log10(B.peakLambda(T)) - 0.9));
        const yr = Math.log10(B.rjLambda(10 ** xr, T));
        if (yr < 17) plot.text('Rayleigh–Jeans', xr, yr, { color: 'bad', dx: 6, dy: -10, size: fs });
      }
      peakX = Math.log10(B.peakLambda(T)); peakY = Math.log10(B.peakBLambda(T));
      peakLabel = hide.has('peak') ? 'peak' : `λmax = ${plainLen(B.peakLambda(T))}`;
      if (P.peak !== false && peakX > -8 && peakX < -1 && peakY < 18) plot.point(peakX, peakY, { color: 'gold', r: 4.5, label: peakLabel, ldx: peakX > -2.6 ? -10 : 10, ldy: -12, lalign: peakX > -2.6 ? 'right' : 'left' });
    } else {
      const isNu = axis === 'nu';
      const pk = isNu ? B.peakNu(T) : B.peakLambda(T);
      const R = nice125(3.2 * pk);
      const [unit, uf] = isNu ? (R <= 5e12 ? ['GHz', 1e9] : R <= 5e15 ? ['THz', 1e12] : ['PHz', 1e15]) : (R <= 2e-6 ? ['nm', 1e-9] : R <= 2e-3 ? ['μm', 1e-6] : ['mm', 1e-3]);
      plot.o.xfmt = undefined; plot.o.yfmt = undefined; plot.o.xticks = P.numbers === false ? 0 : narrow ? 5 : 8; plot.o.yticks = 6;
      plot.o.xlabel = isNu ? `frequency (${unit})` : `wavelength (${unit})`;
      plot.o.ylabel = isNu ? 'Bν (relative to its peak)' : 'Bλ (relative to its peak)';
      plot.setView([0, R / uf], [0, 1.24]);
      plot.clear();
      const peakB = isNu ? B.peakBNu(T) : B.peakBLambda(T);
      const law = (f) => (x) => f(x * uf, T) / peakB;
      const planck = isNu ? B.planckNu : B.planckLambda, rj = isNu ? B.rjNu : B.rjLambda, wien = isNu ? B.wienNu : B.wienLambda;
      // the area under Planck's curve, tinted with the colour of the glow
      plot.area(law(planck), 0, R / uf, { color: visible ? glowCss : 'warn', alpha: visible ? 0.28 : 0.12 });
      if (P.band !== false) {
        const nmAt = isNu ? (px) => (B.C / (plot.ix(px) * uf)) * 1e9 : (px) => (plot.ix(px) * uf) * 1e9;
        const ends = isNu ? [B.C / 750e-9, B.C / 380e-9] : [380e-9, 750e-9];
        const xa = plot.X(ends[0] / uf), xb = plot.X(ends[1] / uf);
        if (xb > plot.L && xa < plot.R) {
          rainbow(xa, xb, plot.Y(0), plot.Y(0) - 8, nmAt);
          if (Math.abs(Math.min(xb, plot.R) - Math.max(xa, plot.L)) > 34) plot.text('visible', (Math.max(xa, plot.L) + Math.min(xb, plot.R)) / 2, plot.Y(0) - 16, { screen: true, align: 'center', color: 'ink3', size: fs - 1.5 });
        }
      }
      for (const c of compare) {
        const f = (x) => planck(x * uf, c.T) / peakB;
        plot.fn(f, { color: 'ink3', width: 1.6, domain: [R / uf / 600, R / uf] });
        const cx = (isNu ? B.peakNu(c.T) : B.peakLambda(c.T)) / uf, cy = f(cx);
        if (cx < (R / uf) * 0.97 && cy < 1.18 && cy > 0.04) plot.text(c.name, cx, cy, { color: 'ink2', dy: -11, align: 'center', size: fs - 1 });
        else if (cy >= 1.18) plot.text(`${c.name} (off the top)`, (R / uf) * 0.98, 1.17, { color: 'ink3', align: 'right', size: fs - 1 });
      }
      if (F.params.rj) {
        plot.fn(law(rj), { color: 'bad', width: 2.2, dash: [7, 5], domain: [R / uf / 400, R / uf] });
        // label where the classical curve leaves the top of the frame
        const xr = isNu ? Math.sqrt((1.12 * peakB * B.C * B.C) / (2 * B.KB * T)) / uf : ((2 * B.C * B.KB * T) / (1.12 * peakB)) ** 0.25 / uf;
        if (xr > 0 && xr < (R / uf) * 0.9) plot.text('Rayleigh–Jeans', xr, 1.12, { color: 'bad', dx: isNu ? -8 : 8, align: isNu ? 'right' : 'left', size: fs });
      }
      if (F.params.wien) {
        plot.fn(law(wien), { color: 'violet', width: 2, dash: [3, 4], domain: [R / uf / 600, R / uf] });
        const xw = isNu ? 0.55 * pk / uf : 2.3 * pk / uf, yw = law(wien)(xw);
        if (xw < (R / uf) * 0.95) plot.text('Wien 1896', xw, yw, { color: 'violet', dx: isNu ? -8 : 8, dy: isNu ? -12 : 12, align: isNu ? 'right' : 'left', size: fs });
      }
      plot.fn(law(planck), { color: 'warn', width: 2.8, domain: [R / uf / 800, R / uf] });
      peakX = pk / uf; peakY = 1;
      peakLabel = hide.has('peak') ? (isNu ? 'νmax' : 'λmax') : isNu ? `νmax = ${plainFreq(pk)}` : `λmax = ${plainLen(pk)}`;
      if (P.peak !== false) {
        plot.line(peakX, 0, peakX, 1, { color: 'gold', width: 1.4, dash: [3, 4] });
        plot.point(peakX, 1, { color: 'gold', r: 4.5 });
        const right = peakX < (R / uf) * 0.55;
        plot.text(peakLabel, peakX, 1, { color: 'gold', dx: right ? 10 : -10, dy: -12, align: right ? 'left' : 'right', size: fs, weight: 650 });
        if (isNu) {
          // where the wavelength peak's photons sit on the frequency axis: c/λ_max is not ν_max
          const xl = B.C / B.peakLambda(T) / uf, yl = law(planck)(xl);
          plot.line(xl, 0, xl, yl, { color: 'ink3', width: 1.2, dash: [2, 3] });
          plot.point(xl, yl, { color: 'ink3', r: 3.5 });
          plot.text('c/λmax', xl, yl, { color: 'ink3', dx: -8, dy: -2, align: 'right', size: fs - 1 });
        }
      }
    }
    // the colour swatch (hue only)
    if (P.swatch !== false) {
      const g = plot.ctx, sw = narrow ? 50 : 64, sh = narrow ? 22 : 26;
      const x = plot.R - sw - 8, y = plot.T + 8;
      g.save();
      if (visible) {
        g.fillStyle = glowCss; g.strokeStyle = col.line3; g.lineWidth = 1;
        g.beginPath(); g.roundRect ? g.roundRect(x, y, sw, sh, 5) : g.rect(x, y, sw, sh); g.fill(); g.stroke();
        plot.text('colour (approx.)', x + sw / 2, y + sh + 10, { screen: true, align: 'center', color: 'ink3', size: fs - 2 });
      } else plot.text('glows only in the infrared', plot.R - 8, y + 8, { screen: true, align: 'right', color: 'ink3', size: fs - 1 });
      g.restore();
    }
    readout(T);
  }

  function readout(T) {
    if (P.readout === false) return;
    const rows = [
      ['$T$', hide.has('T') ? '?' : `${texSci(T, 4)}\\,\\mathrm{K}`],
      ['$\\lambda_{\\max}$', hide.has('peak') ? '?' : texUnit(plainLen(B.peakLambda(T)))],
      ['$\\nu_{\\max}$', hide.has('peak') ? '?' : texUnit(plainFreq(B.peakNu(T)))],
      ['$\\sigma T^4$', hide.has('power') ? '?' : `${texSci(B.exitance(T))}\\,\\mathrm{W/m^2}`],
      ['visible share', hide.has('visible') ? '?' : `${texSci(100 * B.visibleFraction(T), 2).replace(/^0$/, '0')}\\%`],
    ];
    F.readout(rows);
  }

  F.draw(draw);
  F.caption(P.caption || 'A perfect blackbody. Real stars, lamps and people are only approximately black: their spectra carry lines and dips. In the linear views each curve is scaled to its own peak; the log–log view is to scale. Colours are approximate: a screen cannot show the true colour of a glowing body.');
  return { get: (k) => F.params[k] };
}

export function validate(P) {
  const p = [];
  if (!(P.T >= TMIN && P.T <= TMAX)) p.push(`mp-blackbody: T must lie in ${TMIN}–${TMAX} K`);
  if (!AXES.includes(P.axis)) p.push(`mp-blackbody: unknown axis “${P.axis}”`);
  for (const c of P.curves || []) if (!CURVES.includes(c)) p.push(`mp-blackbody: unknown curve “${c}”`);
  for (const c of P.compare || []) if (!resolve(c)) p.push(`mp-blackbody: compare entry “${c}” is neither a temperature nor an object`);
  for (const h of P.hide || []) if (!HIDE.includes(h)) p.push(`mp-blackbody: unknown hide “${h}”`);
  if (Array.isArray(P.controls)) for (const c of P.controls) if (!CONTROLS.includes(c)) p.push(`mp-blackbody: unknown control “${c}”`);
  return p;
}
