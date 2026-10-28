// Compton scattering: a photon strikes a free electron at rest and comes
// away at angle θ with a longer wavelength, while the electron recoils. On
// the left, the collision (the two waves drawn with their true wavelength
// ratio); on the right, the momentum triangle to scale, p = p′ + pₑ; below,
// the shift Δλ = (h/mₑc)(1 − cos θ) against angle. Physics in
// model/qm-compton.js (tested in test/qm-compton.test.mjs).
//
//   { type: 'qm-compton', params: {
//       source: 'mo',           // mo (Mo Kα X-rays, 71.07 pm) | cs (Cs-137, 662 keV) | ann (511 keV) | green (532 nm light)
//       lambda: null,           // or the incoming wavelength in pm (overrides source)
//       theta: 90,              // scattering angle, degrees
//       graph: true,            // the Δλ–θ graph under the picture
//       controls: null,         // true, false, or a list of: theta source
//       readout: true,
//       hide: [],               // any of: lam2 (λ′ and Δλ), E2 (E′), K (electron energy), phi (electron angle)
//   } }

import { Plot, themeColors } from '../plot.js';
import * as M from '../model/qm-compton.js';
import { wavelengthToRGB } from '../model/qm-light.js';

export const defaults = { source: 'mo', lambda: null, theta: 90, graph: true, controls: null, readout: true, hide: [] };
const CONTROLS = ['theta', 'source'];
const DEG = Math.PI / 180;
const fmt = (x, n = 4) => (Math.abs(x) < 1e-12 ? '0' : Math.abs(x) >= 1e5 || Math.abs(x) < 1e-3 ? x.toExponential(n - 1).replace(/e\+?(-?\d+)/, '×10^$1') : String(+x.toPrecision(n)));
const texNum = (x, n = 4) => fmt(x, n).replace(/×10\^(-?\d+)/, '\\times10^{$1}');

export function mount(F, P0) {
  const P = { ...defaults, ...P0 };
  const hide = new Set(P.hide || []);
  const wanted = P.controls === true || (P.controls === null && !F.compact) ? CONTROLS : Array.isArray(P.controls) ? P.controls : [];
  if (wanted.includes('theta')) F.slider({ key: 'theta', label: 'Scattering angle $\\theta$', min: 0, max: 180, step: 1, value: P.theta, unit: '^\\circ', explain: 'The angle between the incoming photon’s direction and the scattered photon’s.' });
  else F.params.theta = P.theta;
  if (wanted.includes('source') && P.lambda === null) F.choice({ key: 'source', label: 'Incoming photons', options: Object.entries(M.SOURCES).map(([k, s]) => [k, s.label]), value: P.source, explain: 'The shift is the same few picometres for every source; only its size compared with λ changes.' });
  else F.params.source = P.source;

  const { canvas, box } = F.canvas({ aspect: 'wide', label: P.alt || 'A photon scattering off an electron, and the momentum triangle' });
  const ctx = canvas.getContext('2d');
  const gcan = P.graph !== false ? F.canvas({ aspect: 'wide', label: 'The Compton shift against scattering angle' }) : null;
  const plot = gcan ? new Plot(gcan.canvas, { x: [0, 180], y: [0, 5.4], xlabel: 'scattering angle θ (degrees)', ylabel: 'shift Δλ (pm)', xticks: 6 }) : null;

  const now = () => {
    const pm = P.lambda ?? M.SOURCES[F.params.source]?.pm ?? M.SOURCES.mo.pm;
    return { pm, th: F.params.theta, ...M.scatter(pm, F.params.theta) };
  };

  function wave(x0, y0, ang, len, lamPx, col, width = 2.2) {
    // a sine wave of wavelength lamPx (pixels) along direction ang (radians, screen), amplitude 6 px
    const ux = Math.cos(ang), uy = Math.sin(ang), A = 6;
    ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = width; ctx.beginPath();
    for (let s = 0; s <= len; s += 1.5) {
      const w = A * Math.sin((2 * Math.PI * s) / lamPx) * Math.min(1, s / 10, (len - s) / 10);
      const x = x0 + ux * s - uy * w, y = y0 + uy * s + ux * w;
      if (s === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke(); ctx.restore();
  }
  function arrow(x0, y0, x1, y1, col, w = 2.4) {
    const L = Math.hypot(x1 - x0, y1 - y0); if (L < 2) return;
    const ux = (x1 - x0) / L, uy = (y1 - y0) / L, hd = Math.min(10, L * 0.4);
    ctx.save(); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1 - ux * hd * 0.6, y1 - uy * hd * 0.6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - ux * hd - uy * hd * 0.45, y1 - uy * hd + ux * hd * 0.45); ctx.lineTo(x1 - ux * hd + uy * hd * 0.45, y1 - uy * hd - ux * hd * 0.45); ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  function drawScene() {
    const C = themeColors();
    const W = canvas.clientWidth || 600, H = canvas.clientHeight || 300, dpr = Math.min(2, devicePixelRatio || 1);
    const narrow = W < 520;
    const want = narrow ? '3 / 4' : '';
    if (box.style.aspectRatio !== want) { box.style.aspectRatio = want; requestAnimationFrame(drawAll); return; }
    if (canvas.width !== Math.round(W * dpr) || canvas.height !== Math.round(H * dpr)) { canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr); }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    const S = now(), fs = narrow ? 10.5 : 12;
    const txt = (s, x, y, o = {}) => {
      ctx.save(); ctx.font = `${o.w || 600} ${o.size || fs}px Inter, system-ui, sans-serif`; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle';
      ctx.lineWidth = 3.5; ctx.strokeStyle = C.bg; ctx.globalAlpha = 0.9; ctx.strokeText(s, x, y); ctx.globalAlpha = 1;
      ctx.fillStyle = o.color || C.ink; ctx.fillText(s, x, y); ctx.restore();
    };
    const visible = S.pm >= 380e3 && S.pm <= 750e3;
    const colIn = visible ? `rgb(${wavelengthToRGB(S.pm / 1000).join(', ')})` : C.violet, colOut = visible ? colIn : C.warn;
    // the collision
    const sw = narrow ? W : W * 0.6, sh = narrow ? H * 0.58 : H;
    const cx = sw * 0.42, cy = sh * 0.52, len = Math.min(sw * 0.5, sh * 0.85);
    const lamPx = (cx - 16) / 6.5, lamPx2 = lamPx * (S.lam2 / S.lam);
    ctx.save(); ctx.strokeStyle = C.ink4; ctx.setLineDash([4, 5]); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + len * 0.9, cy); ctx.stroke(); ctx.restore();
    wave(8, cy, 0, cx - 18, lamPx, colIn);
    arrow(cx - 40, cy - 16, cx - 14, cy - 16, colIn, 2);
    const th = S.th * DEG, back = S.th > 168 ? 9 : 0;
    wave(cx + 10 * Math.cos(th), cy - 10 * Math.sin(th) - back, -th, len, lamPx2, colOut);
    // the electron and its recoil
    const ph = S.phi * DEG, pel = Math.max(0, Math.min(len * 0.8, (S.peMag / S.E) * len * 0.55));
    if (pel > 4) arrow(cx, cy, cx + pel * Math.cos(ph), cy + pel * Math.sin(ph), C.accent, 2.6);
    ctx.save(); ctx.fillStyle = C.accent; ctx.beginPath(); ctx.arc(cx, cy, 6, 0, 2 * Math.PI); ctx.fill(); ctx.restore();
    // the angle
    if (S.th > 2) {
      ctx.save(); ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.arc(cx, cy, 30, -th, 0); ctx.stroke(); ctx.restore();
      txt(`θ = ${Math.round(S.th)}°`, cx + 46 * Math.cos(th / 2), cy - 46 * Math.sin(th / 2), { color: C.ink2, size: fs });
    }
    txt(hide.has('lam2') ? 'incoming photon' : `incoming: λ = ${fmt(S.lam, 4)} pm`, 10, cy - 26, { align: 'left', color: colIn });
    // the scattered photon's label sits beside the far end of its wave, on the outer side
    const ox = cx + (len + 4) * Math.cos(th), oy = cy - (len + 4) * Math.sin(th) - back, rightSide = Math.cos(th) > -0.35;
    // near the left edge (wide angles), anchor the label at the edge and lift it above the wave
    const edge = !rightSide && ox - 10 < 150;
    txt(hide.has('lam2') ? 'scattered photon' : `scattered: λ′ = ${fmt(S.lam2, 4)} pm`, edge ? Math.max(6, ox) : Math.min(sw - 6, Math.max(6, ox + (rightSide ? 10 : -10))), Math.max(12, Math.min(sh - 12, oy - (edge ? 18 : 0))), { align: edge || rightSide ? 'left' : 'right', color: colOut });
    if (pel > 4) txt(hide.has('K') ? 'electron recoils' : `electron: K = ${fmt(S.K, 3)} keV`, Math.min(sw - 6, cx + pel * Math.cos(ph) + 6), Math.min(sh - 10, cy + pel * Math.sin(ph) + 14), { align: 'right', color: C.accent });
    txt('electron, at rest before', cx - 12, cy + 24, { align: 'right', color: C.ink3, w: 500, size: fs - 1 });
    // the momentum triangle, to scale: p = p′ + pₑ, fitted inside its panel
    const px0 = narrow ? W * 0.08 : W * 0.63, pw = narrow ? W * 0.84 : W * 0.34;
    const ty0 = narrow ? H * 0.9 : H * 0.7, room = narrow ? H * 0.22 : H * 0.55;
    const xmin = Math.min(0, S.p2[0]), span = S.E - xmin;
    const sc = Math.min(pw / span, room / Math.max(1e-9, S.p2[1]));
    const tx0 = px0 + (pw - span * sc) / 2 - xmin * sc;
    // nearly straight back or straight on, the triangle is flat: lift p and drop pₑ a little so the three arrows can be told apart
    const flat = Math.abs(Math.sin(th)) < 0.25, up = flat ? 9 : 0;
    const P1 = [tx0 + S.E * sc, ty0], P2 = [tx0 + S.p2[0] * sc, ty0 - S.p2[1] * sc];
    txt('momentum, to scale', px0 + pw / 2, narrow ? H * 0.62 : H * 0.06, { color: C.ink2 });
    arrow(tx0, ty0 - up, P1[0], P1[1] - up, colIn, 2.6);
    arrow(tx0, ty0, P2[0], P2[1], colOut, 2.6);
    arrow(P2[0], P2[1] + up, P1[0], P1[1] + up, C.accent, 2.4);
    txt('photon in: p', (tx0 + P1[0]) / 2, ty0 - up + (flat ? -14 : 14), { color: colIn });
    txt('photon out: p′', (tx0 + P2[0]) / 2 + (flat ? 0 : -6), (ty0 + P2[1]) / 2 + (flat ? -14 : -10), { color: colOut, align: flat ? 'center' : 'right' });
    if (Math.hypot(P1[0] - P2[0], P1[1] - P2[1]) > 14) txt('electron: pₑ', (P1[0] + P2[0]) / 2 + (flat ? 0 : 8), (P1[1] + P2[1]) / 2 + (flat ? up + 14 : 0), { color: C.accent, align: flat ? 'center' : 'left' });
  }

  function drawGraph() {
    if (!plot) return;
    const S = now();
    plot.clear();
    plot.fn((d) => M.shiftPm(d), { color: 'accent', width: 2.6, domain: [0, 180] });
    plot.line(0, M.LAMBDA_C_PM, 180, M.LAMBDA_C_PM, { color: 'ink3', width: 1, dash: [4, 4] });
    plot.text('h/mₑc = 2.43 pm', 4, M.LAMBDA_C_PM, { color: 'ink3', dy: -10, size: 11.5 });
    plot.point(S.th, S.dlam, { color: 'gold', r: 5.5, label: hide.has('lam2') ? 'Δλ = ?' : `Δλ = ${fmt(S.dlam, 3)} pm`, ldx: S.th > 120 ? -10 : 10, ldy: -12, lalign: S.th > 120 ? 'right' : 'left' });
  }

  let last = '';
  function readout() {
    if (P.readout === false) return;
    const S = now(), key = `${S.pm},${S.th}`;
    if (key === last) return;
    last = key;
    F.readout([
      ['$\\lambda$', `${texNum(S.lam)}\\,\\mathrm{pm}`],
      ["$\\lambda'$", hide.has('lam2') ? '?' : `${texNum(S.lam2)}\\,\\mathrm{pm}`],
      ['$\\Delta\\lambda$', hide.has('lam2') ? '?' : `${texNum(S.dlam, 4)}\\,\\mathrm{pm}`],
      ['$E$', `${texNum(S.E)}\\,\\mathrm{keV}`],
      ["$E'$", hide.has('E2') ? '?' : `${texNum(S.E2)}\\,\\mathrm{keV}`],
      ['electron $K$', hide.has('K') || hide.has('E2') ? '?' : `${texNum(S.K, 3)}\\,\\mathrm{keV}`],
      ['electron angle $\\phi$', hide.has('phi') ? '?' : `${S.phi.toFixed(1)}^\\circ`],
    ]);
  }
  function drawAll() { readout(); drawScene(); drawGraph(); }
  F.onChange(drawAll);
  F.draw(drawAll);
  F.caption(P.caption || 'The incoming and scattered waves are drawn with their true ratio of wavelengths, though hugely magnified; the momentum arrows are to scale. The electron is taken as free and at rest, which is a good approximation for X-rays and gamma rays striking the outer electrons of light atoms.');
  return { get: (k) => F.params[k] };
}

export function validate(P) {
  const p = [];
  if (P.lambda === null && !M.SOURCES[P.source]) p.push(`qm-compton: unknown source “${P.source}”`);
  if (P.lambda !== null && !(P.lambda > 0)) p.push('qm-compton: lambda is a wavelength in pm');
  if (!(P.theta >= 0 && P.theta <= 180)) p.push('qm-compton: theta must lie in 0–180 degrees');
  for (const h of P.hide || []) if (!['lam2', 'E2', 'K', 'phi'].includes(h)) p.push(`qm-compton: unknown hide “${h}”`);
  if (Array.isArray(P.controls)) for (const c of P.controls) if (!CONTROLS.includes(c)) p.push(`qm-compton: unknown control “${c}”`);
  return p;
}
