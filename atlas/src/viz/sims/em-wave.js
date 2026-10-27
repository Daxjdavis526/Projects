// A plane electromagnetic wave travelling through empty space, in 3D. Along a
// line through the wave, violet arrows are the electric field and teal arrows
// the magnetic field; the wave moves along the gold arrow. E and B are at right
// angles to each other and to the direction of travel, they rise and fall
// together (in phase), and B = E/c. A marked point carries the triad E, B and
// the direction of travel, E × B. Rotate the picture by dragging. The numbers
// (B₀, intensity, radiation pressure) come from model/em-light.js, tested in
// test/em-light.test.mjs.
//
//   { type: 'em-wave', params: {
//       E0: 1000,               // electric amplitude, V/m (the readouts; the picture is not to scale)
//       f: 5.45e14,             // frequency, Hz (the readouts: λ = c/f; the picture always shows 2½ wavelengths)
//       theta: 0,               // polarization: the angle of E from vertical, degrees
//       showB: true,            // draw the magnetic field
//       probe: 0.36,            // where the E, B, travel triad sits, as a fraction of the length shown; null hides it
//       phase: null,            // a still picture at this phase, in degrees; null animates
//       controls: true,         // or a list of: theta E0 showB (none when compact)
//       readouts: null,         // a list of: lambda B0 I p (default all; readout: false hides the bar)
//       labels: true,           // E, B and "travel" written on the triad
//       hide: [],               // 'B': leave the magnetic field out entirely (a question about it); 'E' likewise
//       speed: 2,               // seconds of animation per period
//       yaw: 0.42, pitch: 0.3,  // camera
//   } }

import { View3D } from '../three-d.js';
import * as M from '../model/em-light.js';

export const defaults = { E0: 1000, f: 5.45e14, theta: 0, showB: true, probe: 0.36, phase: null, controls: null, readouts: null, readout: null, labels: true, hide: [], speed: 2, yaw: 0.42, pitch: 0.3 };
const CONTROLS = ['theta', 'E0', 'showB'];
const READOUTS = ['lambda', 'B0', 'I', 'p'];

// numbers with SI prefixes, as TeX
const PRE = [[1e9, 'G'], [1e6, 'M'], [1e3, 'k'], [1, ''], [1e-3, 'm'], [1e-6, '\\mu '], [1e-9, 'n'], [1e-12, 'p'], [1e-15, 'f']];
function tx(x, unit, n = 3) {
  if (!Number.isFinite(x)) return '\\text{—}';
  if (x === 0) return `0\\,\\mathrm{${unit}}`;
  const [f, p] = PRE.find(([s]) => Math.abs(x) >= s * 0.9995) || PRE[PRE.length - 1];
  return `${(x / f).toPrecision(n)}\\,\\mathrm{${p}${unit}}`;
}

/** plain text with an SI prefix: 545 THz */
function plainSI(x, unit) {
  const P = [[1e18, 'E'], [1e15, 'P'], [1e12, 'T'], [1e9, 'G'], [1e6, 'M'], [1e3, 'k'], [1, '']];
  const [f, p] = P.find(([v]) => x >= v * 0.9995) || [1, ''];
  return `${+(x / f).toPrecision(3)} ${p}${unit}`;
}
/** plain text in scientific notation with superscripts: 1.1 × 10¹⁵ */
function sci(x) {
  if (x < 1e4) return String(+x.toPrecision(2));
  const e = Math.floor(Math.log10(x)), m = +(x / 10 ** e).toPrecision(2);
  return `${m === 1 ? '' : `${m} × `}10${String(e).split('').map((d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[d]).join('')}`;
}

export function mount(F, P0) {
  const P = { ...defaults, ...P0, hide: P0.hide || [] };
  const compact = F.compact;
  const still = P.phase !== null && P.phase !== undefined;
  const wanted = P.controls === true || (P.controls === null && !compact) ? CONTROLS : Array.isArray(P.controls) ? P.controls : [];
  if (wanted.includes('theta')) F.slider({ key: 'theta', label: 'Polarization angle $\\theta$', min: 0, max: 180, step: 5, value: P.theta, unit: '^\\circ', explain: 'The direction the electric field swings in, measured from vertical. The magnetic field turns with it, always at right angles.' });
  if (wanted.includes('E0')) F.slider({ key: 'E0', label: 'Field amplitude $E_0$', min: 1, max: 100000, value: P.E0, unit: '\\mathrm{V/m}', logScale: true, explain: 'Sunlight at Earth has $E_0 \\approx 1000$ V/m; a strong laser focus, many millions. Everything else follows from it: $B_0 = E_0/c$, $I = \\tfrac12c\\varepsilon_0E_0^2$.', fmt: (v) => String(+v.toPrecision(3)) });
  if (wanted.includes('showB') && !P.hide.includes('B')) F.toggle({ key: 'showB', label: 'Show the magnetic field', value: P.showB, explain: 'Hide it to see the electric field alone; it is always there.' });

  const { canvas, box } = F.canvas({ aspect: 'wide', label: P.alt || 'A plane electromagnetic wave in 3D: electric and magnetic fields at right angles, travelling along a line' });
  const LAMBDA = 2.2, CYC = 2.5, LW = LAMBDA * CYC, K = (2 * Math.PI) / LAMBDA, AMP = 1;
  const view = new View3D(canvas, { yaw: P.yaw, pitch: P.pitch, dist: 10, target: [0, LW / 2, 0], scale: 1 });
  view.onChange = () => draw();
  F.onChange(() => draw());
  const S = { ph: still ? (P.phase * Math.PI) / 180 : 0, playing: false };

  function draw() {
    const W = canvas.clientWidth || 600, H = canvas.clientHeight || 300;
    const narrow = W < 520;
    const want = narrow ? '4 / 3' : '';
    if (box.style.aspectRatio !== want) { box.style.aspectRatio = want; requestAnimationFrame(draw); return; }
    // fit the wave's length to the width at the starting distance; zooming changes dist, not scale
    view.scale = ((W * 0.8) / (LW + 1.6)) * 10 / (Math.min(W, H) * 1.1);
    const th = ((F.params.theta ?? P.theta) * Math.PI) / 180;
    const eDir = [Math.sin(th), 0, Math.cos(th)], bDir = [Math.cos(th), 0, -Math.sin(th)];      // B = k̂ × E/c with k̂ = +y
    const showE = !P.hide.includes('E'), showB = !P.hide.includes('B') && (F.params.showB ?? P.showB);
    const at = (y, d, s) => [d[0] * s * AMP, y, d[2] * s * AMP];
    view.begin();
    // the line of travel
    view.line([[0, -0.3, 0], [0, LW + 0.25, 0]], { color: 'ink4', width: 1.2 });
    view.arrow([0, LW + 0.25, 0], [0, LW + 1.0, 0], { color: 'gold', width: 2.6 });
    if (P.labels) view.label([0, LW + 1.0, 0.32], 'travel', { color: 'gold', size: narrow ? 11 : 12 });
    // field samples and their envelopes
    const N = 44, tipsE = [], tipsB = [];
    for (let k = 0; k <= N; k++) {
      const y = (LW * k) / N, s = Math.sin(K * y - S.ph);
      const pe = at(y, eDir, s), pb = at(y, bDir, s);
      tipsE.push(pe); tipsB.push(pb);
      if (k % 2 === 0) {
        if (showE && Math.abs(s) > 0.06) view.line([[0, y, 0], pe], { color: 'violet', width: 1.4 });
        if (showB && Math.abs(s) > 0.06) view.line([[0, y, 0], pb], { color: 'teal', width: 1.4 });
      }
    }
    if (showE) view.line(tipsE, { color: 'violet', width: 2.6 });
    if (showB) view.line(tipsB, { color: 'teal', width: 2.6 });
    // name each field once, beyond its first crest
    if (P.labels) {
      let kc = 0, best = -1;
      for (let k = 0; k <= N * 0.45; k++) { const s = Math.abs(Math.sin(K * ((LW * k) / N) - S.ph)); if (s > best) { best = s; kc = k; } }
      const yc = (LW * kc) / N, sc = Math.sin(K * yc - S.ph), sg = Math.sign(sc) || 1;
      if (showE) view.label(at(yc, eDir, sc + 0.28 * sg), 'E', { color: 'violet', size: narrow ? 13 : 15 });
      if (showB) view.label(at(yc, bDir, sc + 0.28 * sg), 'B', { color: 'teal', size: narrow ? 13 : 15 });
    }
    // the triad at the probe point
    if (P.probe !== null && P.probe !== undefined) {
      const y = P.probe * LW, s = Math.sin(K * y - S.ph);
      view.point([0, y, 0], { color: 'ink', r: 3.5 });
      if (showE && Math.abs(s) > 0.08) view.arrow([0, y, 0], at(y, eDir, s), { color: 'violet', width: 3.2 });
      if (showB && Math.abs(s) > 0.08) view.arrow([0, y, 0], at(y, bDir, s), { color: 'teal', width: 3.2 });
      view.arrow([0, y, 0], [0, y + 0.8, 0], { color: 'gold', width: 2.4 });
    }
    view.end();
    // readouts
    if (P.readout ?? !compact) {
      const E0 = F.params.E0 ?? P.E0, w = M.plane(E0), lam = M.lambdaOf(P.f);
      const rows = {
        lambda: ['wavelength $\\lambda = c/f$', tx(lam, 'm')],
        B0: ['$B_0 = E_0/c$', tx(w.B0, 'T')],
        I: ['intensity $I = \\tfrac12 c\\varepsilon_0E_0^2$', tx(w.I, 'W/m^2')],
        p: ['pressure on an absorber $I/c$', tx(w.pAbs, 'Pa')],
      };
      F.readout((P.readouts || READOUTS).map((k) => rows[k]).filter(Boolean));
    }
  }

  if (!still) {
    const reduced = () => document.documentElement.getAttribute('data-motion') === 'reduce' || !!globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    S.playing = !reduced();
    const step = (dt) => { if (!S.playing) return; S.ph += (dt * 2 * Math.PI) / P.speed; if (S.ph > 2 * Math.PI) S.ph -= 2 * Math.PI; draw(); };
    let anim = F.animate(step);
    const btn = F.button({
      label: S.playing ? 'Pause' : 'Play',
      onClick: () => { S.playing = !S.playing; btn.textContent = S.playing ? 'Pause' : 'Play'; anim.stop(); if (S.playing) anim = F.animate(step, { force: true }); },
    });
  }
  F.draw(draw);
  F.caption(P.caption ?? `One plane wave, drawn along a single line through it — the fields fill all the space around. Not to scale: the magnetic field is drawn c times larger than its value in tesla, so it shows at the same length as the electric field (in a vacuum B = E/c). ${still ? 'A snapshot.' : `Slowed down: one cycle takes ${P.speed} s here, while a wave of ${plainSI(P.f, 'Hz')} goes through ${sci(P.f * P.speed)} cycles in that time.`} Drag to rotate.`);
  return { get: (k) => F.params[k] };
}

/** Node-side check used by the content tests. */
export function validate(P0) {
  const P = { ...defaults, ...P0 }, p = [];
  if (!(P.E0 > 0)) p.push('E0 is the electric amplitude in V/m (> 0)');
  if (!(P.f > 0)) p.push('f is the frequency in Hz (> 0)');
  if (!(P.theta >= 0 && P.theta <= 180)) p.push('theta is an angle from 0 to 180 degrees');
  if (P.probe !== null && !(P.probe >= 0 && P.probe <= 1)) p.push('probe is a fraction from 0 to 1, or null');
  if (Array.isArray(P0.controls)) for (const k of P0.controls) if (!CONTROLS.includes(k)) p.push(`unknown control “${k}” (use ${CONTROLS.join(', ')})`);
  if (Array.isArray(P0.readouts)) for (const k of P0.readouts) if (!READOUTS.includes(k)) p.push(`unknown readout “${k}” (use ${READOUTS.join(', ')})`);
  for (const k of P0.hide || []) if (!['E', 'B'].includes(k)) p.push(`hide: unknown “${k}” (use E, B)`);
  return p;
}
