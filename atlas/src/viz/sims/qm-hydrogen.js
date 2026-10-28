// Hydrogen’s energy levels and its spectrum. On the left, the levels
// E_n = −13.6 eV/n² drawn to scale, with the jumps of one series as arrows
// (down for emission, up for absorption). On the right, the spectrum those
// jumps make — bright lines on black, or dark lines on a continuous
// spectrum — in approximate true colour, and a picture of the atom in its
// upper level: either Bohr’s 1913 orbit (a historical stepping stone) or the
// quantum-mechanical cloud of where the electron may be found. Physics in
// model/qm-hydrogen.js (tested in test/qm-hydrogen.test.mjs).
//
//   { type: 'qm-hydrogen', params: {
//       mode: 'emission',     // 'emission' or 'absorption'
//       series: 2,            // the lower level: 1 Lyman (ultraviolet), 2 Balmer (mostly visible), 3 Paschen (infrared)
//       n: 3,                 // the upper level of the highlighted jump, 2–7
//       picture: 'cloud',     // the atom panel: 'cloud', 'orbit', or 'none'
//       picN: null,           // the level the atom panel shows (default: the upper level of the jump)
//       controls: null,       // true, false, or a list of: mode series n picture
//       readout: true,
//       hide: [],             // 'lambda' hides the highlighted line’s wavelength and energy; 'levels' hides the level energies;
//                             // 'strip' leaves out the spectrum (its wavelength scale would answer a question about the photon)
//   } }

import { themeColors } from '../plot.js';
import * as Hy from '../model/qm-hydrogen.js';
import { wavelengthToRGB, isVisible, bandOf } from '../model/qm-light.js';

export const defaults = { mode: 'emission', series: 2, n: 3, picture: 'cloud', picN: null, controls: null, readout: true, hide: [] };
const CONTROLS = ['mode', 'series', 'n', 'picture'];
const TOP = 7;
const RANGES = { 1: [88, 126, 10], 2: [355, 675, 50], 3: [780, 1900, 200] };   // strip ranges (nm) and tick steps

export function mount(F, P0) {
  const P = { ...defaults, ...P0 };
  const hide = new Set(P.hide || []);
  const wanted = P.controls === true || (P.controls === null && !F.compact) ? CONTROLS : Array.isArray(P.controls) ? P.controls : [];
  const ctl = (key, make) => (wanted.includes(key) ? make() : (F.params[key] = P[key]));
  ctl('mode', () => F.choice({ key: 'mode', label: 'Spectrum', options: [['emission', 'emission'], ['absorption', 'absorption']], value: P.mode, explain: 'Emission: hot gas glows at its own wavelengths. Absorption: gas in front of a brighter source removes the same wavelengths.' }));
  ctl('series', () => F.choice({ key: 'series', label: 'Series (lower level)', options: [[1, 'Lyman, n = 1'], [2, 'Balmer, n = 2'], [3, 'Paschen, n = 3']], value: P.series, explain: 'All the jumps that end (or, in absorption, start) on one level.' }));
  ctl('n', () => F.slider({ key: 'n', label: 'Upper level $n$', min: 2, max: TOP, step: 1, value: P.n, explain: 'The highlighted jump: from this level down to the series’ lower level.' }));
  ctl('picture', () => F.choice({ key: 'picture', label: 'Picture of the atom', options: [['cloud', 'cloud (quantum)'], ['orbit', 'Bohr orbit (1913)']], value: P.picture, explain: 'Bohr’s orbits give the right energies, but electrons do not follow paths: quantum mechanics replaced them with clouds of probability.' }));

  const { canvas, box } = F.canvas({ aspect: 'wide', label: P.alt || 'Hydrogen energy levels with transitions, its line spectrum and a picture of the atom' });
  const ctx = canvas.getContext('2d');

  const now = () => {
    const nf = +F.params.series, ni = Math.max(nf + 1, Math.min(TOP, Math.round(F.params.n)));
    return { nf, ni, nm: Hy.lineNm(ni, nf), eV: Hy.lineEV(ni, nf), mode: F.params.mode, picture: F.params.picture };
  };

  function draw() {
    const C = themeColors();
    const W = canvas.clientWidth || 600, H = canvas.clientHeight || 300, dpr = Math.min(2, devicePixelRatio || 1);
    const narrow = W < 520, want = narrow ? '3 / 4' : '';
    if (box.style.aspectRatio !== want) { box.style.aspectRatio = want; requestAnimationFrame(draw); return; }
    if (canvas.width !== Math.round(W * dpr) || canvas.height !== Math.round(H * dpr)) { canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr); }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    const S = now(), fs = narrow ? 10 : 11.5;
    const txt = (s, x, y, o = {}) => {
      ctx.save(); ctx.font = `${o.w || 600} ${o.size || fs}px Inter, system-ui, sans-serif`; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle';
      if (o.halo !== false) { ctx.lineWidth = 3.5; ctx.strokeStyle = C.bg; ctx.globalAlpha = 0.9; ctx.strokeText(s, x, y); ctx.globalAlpha = 1; }
      ctx.fillStyle = o.color || C.ink; ctx.fillText(s, x, y); ctx.restore();
    };
    const line = (x0, y0, x1, y1, col, w = 1.5, dash = [], alpha = 1) => { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.setLineDash(dash); ctx.globalAlpha = alpha; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); ctx.restore(); };
    const colourOf = (nm) => (isVisible(nm) ? `rgb(${wavelengthToRGB(nm).join(', ')})` : nm < 380 ? C.violet : C.bad);
    const showPic = S.picture !== 'none' && P.picture !== 'none', showStrip = !hide.has('strip');
    // layout
    const Lb = narrow ? { x0: 6, x1: W * (showPic ? 0.6 : 0.98), y0: H * 0.05, y1: H * (showStrip ? 0.58 : 0.9) } : { x0: 6, x1: W * (showPic || showStrip ? 0.44 : 0.7), y0: H * 0.07, y1: H * 0.93 };
    const Ab = narrow ? { x0: W * 0.62, x1: W - 6, y0: H * 0.05, y1: H * 0.46 } : { x0: W * 0.48, x1: W - 6, y0: H * 0.04, y1: H * 0.56 };
    const Sb = narrow ? { x0: W * 0.06, x1: W * 0.94, y0: H * 0.7, y1: H * 0.82 } : { x0: W * 0.48, x1: W - 10, y0: showPic ? H * 0.68 : H * 0.4, y1: showPic ? H * 0.82 : H * 0.6 };

    // ---- the energy ladder: to scale, except that for the Balmer and Paschen
    // series the levels far below are tucked under a marked break
    const Emin = -14.6, Emax = S.nf === 1 ? 1.2 : S.nf === 2 ? 0.5 : 0.25;
    const Ecut = S.nf === 1 ? Emin : 1.18 * Hy.energy(S.nf), split = S.nf === 1 ? 1 : 0.8;
    const yBreak = Lb.y0 + split * (Lb.y1 - Lb.y0);
    const yE = (E) => (E >= Ecut ? Lb.y0 + ((Emax - E) / (Emax - Ecut)) * (yBreak - Lb.y0) : yBreak + 12 + ((Ecut - E) / (Ecut - Emin)) * (Lb.y1 - yBreak - 12));
    const lx0 = Lb.x0 + 44, lx1 = Lb.x1 - (hide.has('levels') ? 10 : 58);
    line(lx0, yE(0), lx1, yE(0), C.ink3, 1.2, [5, 4]);
    txt('0 eV: ionized', lx1, yE(0) - 10, { align: 'right', color: C.ink3, w: 500, size: fs - 1 });
    for (let n = 1; n <= TOP; n++) {
      const sel = n === S.ni || n === S.nf;
      line(lx0, yE(Hy.energy(n)), lx1, yE(Hy.energy(n)), sel ? C.ink : C.ink3, sel ? 2 : 1.2);
      if (n <= 4) txt(`n = ${n}`, Lb.x0 + 4, yE(Hy.energy(n)), { align: 'left', color: sel ? C.ink : C.ink2, size: fs - 0.5 });
      if ((n <= 3 || (S.nf === 3 && n === 4)) && !hide.has('levels')) txt(`${Hy.energy(n).toFixed(2)} eV`, lx1 + 4, yE(Hy.energy(n)), { align: 'left', color: C.ink3, w: 500, size: fs - 1 });
    }
    if (S.nf === 1) txt('n = 5, 6, 7 …', Lb.x0 + 4, yE(-0.3) + (narrow ? 2 : 4), { align: 'left', color: C.ink3, w: 500, size: fs - 1.5 });
    else {
      for (let n = 5; n <= TOP; n++) if (n === 5 || S.nf === 3) txt(n === 5 && S.nf === 2 ? 'n = 5, 6, 7' : `n = ${n}`, Lb.x0 + 4, yE(Hy.energy(n)), { align: 'left', color: C.ink3, w: 500, size: fs - 1.5 });
      // the break: everything below it is moved up, not to scale
      ctx.save(); ctx.strokeStyle = C.ink3; ctx.lineWidth = 1.4; ctx.beginPath();
      for (let k = 0; k <= 10; k++) { const x = lx0 + (k / 10) * (lx1 - lx0), y = yBreak + 6 + (k % 2 ? -4 : 4); if (k) ctx.lineTo(x, y); else ctx.moveTo(x, y); }
      ctx.stroke(); ctx.restore();
      txt('axis broken: lower levels not to scale', (lx0 + lx1) / 2, yBreak + 20, { color: C.ink3, w: 500, size: fs - 2 });
    }
    // the series’ jumps as arrows
    const lines = Hy.seriesLines(S.nf, TOP), stepX = (lx1 - lx0 - 16) / Math.max(1, lines.length);
    lines.forEach((l, k) => {
      const x = lx0 + 10 + (k + 0.5) * stepX, sel = l.ni === S.ni;
      const [ya, yb] = S.mode === 'emission' ? [yE(Hy.energy(l.ni)), yE(Hy.energy(l.nf))] : [yE(Hy.energy(l.nf)), yE(Hy.energy(l.ni))];
      const col = colourOf(l.nm), w = sel ? 3 : 1.6, dir = yb > ya ? 1 : -1, hd = 7;
      line(x, ya, x, yb - dir * hd, col, w, [], sel ? 1 : 0.7);
      ctx.save(); ctx.fillStyle = col; ctx.globalAlpha = sel ? 1 : 0.7; ctx.beginPath(); ctx.moveTo(x, yb); ctx.lineTo(x - 5, yb - dir * hd * 1.4); ctx.lineTo(x + 5, yb - dir * hd * 1.4); ctx.closePath(); ctx.fill(); ctx.restore();
      if (sel && !hide.has('lambda')) txt(`${S.nm < 1000 ? S.nm.toFixed(1) : S.nm.toFixed(0)} nm`, x, yE(Hy.energy(l.nf)) + 13, { color: col === C.violet || col === C.bad ? col : C.ink, size: fs });
    });
    txt(`${Hy.SERIES[S.nf]} series: ${S.mode === 'emission' ? 'emission (down)' : 'absorption (up)'}`, (Lb.x0 + Lb.x1) / 2, Lb.y1 + (narrow ? 12 : 4) > H - 6 ? H - 6 : Lb.y1 + (narrow ? 12 : 4), { color: C.ink2, size: fs - 0.5 });

    // ---- the spectrum strip
    if (showStrip) {
    const [l0, l1, tick] = RANGES[S.nf];
    const xL = (nm) => Sb.x0 + ((nm - l0) / (l1 - l0)) * (Sb.x1 - Sb.x0);
    if (S.mode === 'emission') { ctx.save(); ctx.fillStyle = '#05060a'; ctx.fillRect(Sb.x0, Sb.y0, Sb.x1 - Sb.x0, Sb.y1 - Sb.y0); ctx.restore(); }
    else for (let px = Sb.x0; px <= Sb.x1; px += 1) {
      const nm = l0 + ((px - Sb.x0) / (Sb.x1 - Sb.x0)) * (l1 - l0);
      ctx.save(); ctx.fillStyle = isVisible(nm) ? `rgb(${wavelengthToRGB(nm).join(', ')})` : nm < 380 ? 'rgb(95, 85, 125)' : 'rgb(110, 70, 70)'; ctx.fillRect(px, Sb.y0, 1.2, Sb.y1 - Sb.y0); ctx.restore();
    }
    ctx.save(); ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.strokeRect(Sb.x0, Sb.y0, Sb.x1 - Sb.x0, Sb.y1 - Sb.y0); ctx.restore();
    const lim = Hy.lineNm(Infinity, S.nf);
    if (lim > l0) { line(xL(lim), Sb.y0 - 4, xL(lim), Sb.y1 + 4, C.ink3, 1, [3, 3]); txt('series limit', xL(lim), Sb.y0 - 12, { color: C.ink3, w: 500, size: fs - 1.5, align: 'left' }); }
    for (const l of Hy.seriesLines(S.nf, 30)) {
      if (l.nm < l0 || l.nm > l1) continue;
      const x = xL(l.nm), sel = l.ni === S.ni;
      if (S.mode === 'emission') line(x, Sb.y0 + 1, x, Sb.y1 - 1, isVisible(l.nm) ? `rgb(${wavelengthToRGB(l.nm).join(', ')})` : 'rgb(210, 210, 225)', sel ? 3.2 : l.ni <= TOP ? 2 : 1, [], l.ni <= TOP ? 1 : 0.5);
      else line(x, Sb.y0 + 1, x, Sb.y1 - 1, '#05060a', sel ? 3.2 : l.ni <= TOP ? 2.2 : 1.2, [], l.ni <= TOP ? 1 : 0.6);
      if (sel && !hide.has('lambda')) txt(`${l.ni} → ${l.nf}`, x, Sb.y0 - 10, { color: C.ink, size: fs - 0.5 });
      else if (sel) txt('?', x, Sb.y0 - 10, { color: C.ink, size: fs });
    }
    for (let v = Math.ceil(l0 / tick) * tick; v <= l1; v += tick) { line(xL(v), Sb.y1, xL(v), Sb.y1 + 4, C.ink3, 1); txt(String(v), xL(v), Sb.y1 + 12, { color: C.ink3, w: 500, size: fs - 1.5 }); }
    txt(`wavelength (nm, vacuum)${S.nf === 2 ? '' : S.nf === 1 ? ' — all ultraviolet' : ' — all infrared'}`, (Sb.x0 + Sb.x1) / 2, Sb.y1 + 26, { color: C.ink2, size: fs - 1 });
    }

    // ---- the atom in its upper level
    if (showPic) {
      // on a narrow screen the atom sits at the top of its panel with a shorter note beneath it
      const R = narrow ? Math.min((Ab.x1 - Ab.x0) * 0.42, (Ab.y1 - Ab.y0) * 0.3) : Math.min((Ab.x1 - Ab.x0) * 0.28, (Ab.y1 - Ab.y0) * 0.46);
      const cx = narrow ? (Ab.x0 + Ab.x1) / 2 : Ab.x0 + (Ab.x1 - Ab.x0) * 0.3, cy = narrow ? Ab.y0 + R + 6 : (Ab.y0 + Ab.y1) / 2;
      const n = P.picN ?? S.ni, rpk = n * n, rmax = n * n + 4 * n + 4, sc = R / rmax;
      if (S.picture === 'orbit') {
        ctx.save(); ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(cx, cy, rpk * sc, 0, 2 * Math.PI); ctx.stroke(); ctx.restore();
        ctx.save(); ctx.fillStyle = C.accent; ctx.beginPath(); ctx.arc(cx + rpk * sc * Math.cos(0.7), cy - rpk * sc * Math.sin(0.7), 4.5, 0, 2 * Math.PI); ctx.fill(); ctx.restore();
      } else {
        for (let k = 90; k >= 1; k--) {
          const r = (k / 90) * rmax, p = Hy.radialP(r, n);   // shading ∝ the probability of each distance, peaking at n² a₀
          ctx.save(); ctx.fillStyle = C.accent; ctx.globalAlpha = Math.min(0.55, 0.5 * p); ctx.beginPath(); ctx.arc(cx, cy, r * sc, 0, 2 * Math.PI); ctx.arc(cx, cy, Math.max(0, ((k - 1) / 90) * rmax * sc), 0, 2 * Math.PI, true); ctx.fill(); ctx.restore();
        }
      }
      ctx.save(); ctx.fillStyle = C.warn; ctx.beginPath(); ctx.arc(cx, cy, 2.5, 0, 2 * Math.PI); ctx.fill(); ctx.restore();
      const nmR = (Hy.bohrRadius(n) * 1e9).toFixed(2), tx = cx + R + 10;
      const lines2 = S.picture === 'orbit'
        ? [`Bohr’s orbit for n = ${n}:`, `radius ${n * n} a₀ = ${nmR} nm`, 'right energies, but electrons', 'do not follow paths']
        : [`n = ${n}: most likely distance`, `${n * n} a₀ = ${nmR} nm, but it`, 'could be found anywhere', 'in the haze — no orbit'];
      if (narrow) {
        const short = S.picture === 'orbit' ? [`Bohr orbit, n = ${n}:`, `radius ${n * n} a₀ = ${nmR} nm`, 'not a real path'] : [`n = ${n}: most likely`, `at ${n * n} a₀ = ${nmR} nm;`, 'no orbit, only haze'];
        short.forEach((s, i) => txt(s, cx, cy + R + 12 + i * (fs + 3), { color: i === 0 ? C.ink : C.ink2, w: i === 0 ? 650 : 500, size: fs - 1 }));
      } else lines2.forEach((s, i) => txt(s, Math.min(tx, Ab.x1 - 4), cy - 22 + i * (fs + 4), { align: tx > Ab.x1 - 120 ? 'right' : 'left', color: i === 0 ? C.ink : C.ink2, w: i === 0 ? 650 : 500, size: fs - 0.5 }));
    }
  }

  let last = '';
  function readout() {
    if (P.readout === false) return;
    const S = now(), key = `${S.nf},${S.ni},${S.mode}`;
    if (key === last) return;
    last = key;
    const air = S.nm > 200 && S.nm < 2000 ? Hy.airNm(S.nm) : null;
    F.readout([
      ['jump', `n = ${S.ni} \\to n = ${S.nf}`],
      ['photon energy $E_{n_i} - E_{n_f}$', hide.has('lambda') ? '?' : `${S.eV.toFixed(3)}\\,\\mathrm{eV}`],
      ['wavelength (vacuum)', hide.has('lambda') ? '?' : `${S.nm.toFixed(2)}\\,\\mathrm{nm}`],
      ['in air', hide.has('lambda') || !air ? '\\text{—}' : `${air.toFixed(2)}\\,\\mathrm{nm}`],
      ['band', `\\text{${bandOf(S.nm)}}`],
    ]);
  }
  F.onChange(() => { readout(); draw(); });
  F.draw(() => { readout(); draw(); });
  F.caption(P.caption || 'Energy levels are drawn to scale above any marked break (fine structure, a few parts in 10⁵, is ignored). Line colours are approximate: screens cannot show pure spectral colours, and ultraviolet and infrared lines are invisible to the eye. Bohr’s orbit is shown only as the historical model; the cloud’s shading shows how likely each distance from the nucleus is (for the state with the most angular momentum at that n).');
  return { get: (k) => F.params[k] };
}

export function validate(P) {
  const p = [];
  if (!['emission', 'absorption'].includes(P.mode)) p.push('qm-hydrogen: mode is emission or absorption');
  if (![1, 2, 3].includes(+P.series)) p.push('qm-hydrogen: series is 1, 2 or 3');
  if (!(Number.isInteger(P.n) && P.n >= 2 && P.n <= TOP)) p.push('qm-hydrogen: n must be an integer 2–7');
  if (P.n <= +P.series) p.push('qm-hydrogen: the upper level n must lie above the series’ lower level');
  if (!['cloud', 'orbit', 'none'].includes(P.picture)) p.push('qm-hydrogen: picture is cloud, orbit or none');
  if (P.picN !== null && !(Number.isInteger(P.picN) && P.picN >= 1 && P.picN <= TOP)) p.push('qm-hydrogen: picN must be an integer 1–7');
  for (const h of P.hide || []) if (!['lambda', 'levels', 'strip'].includes(h)) p.push(`qm-hydrogen: unknown hide “${h}”`);
  if (Array.isArray(P.controls)) for (const c of P.controls) if (!CONTROLS.includes(c)) p.push(`qm-hydrogen: unknown control “${c}”`);
  return p;
}
