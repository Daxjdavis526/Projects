// Interference, diffraction and polarization, computed as sums of phasors.
// The physics is model/optics-waves.js (tested headlessly in
// test/optics-waves.test.mjs against the closed forms). Five modes:
//
//   slits      N slits (N = 1: a single slit; 2: Young's double slit; more: a
//              grating) of width a and spacing d, lit by a laser or white light:
//              the pattern on a screen, the intensity graph with the single-slit
//              envelope, and — at a draggable probe — the phasors from every
//              strip of every slit, added head to tail
//   film       a thin film (soap, a coating, oil on water): the two reflected
//              rays and their phase flips, the reflected spectrum, the colour it
//              shows in white light, and Newton's colour scale against thickness
//   michelson  a Michelson interferometer: move one mirror and watch the rings
//              stream from the centre while the detector counts fringes
//   airy       two stars seen through a circular aperture: their Airy patterns,
//              a cut through both, and the Rayleigh criterion; presets for the
//              eye, Hubble, JWST and an Earth-sized radio dish (the EHT)
//   polar      light through up to three polarizers: the field's direction and
//              Malus's law, I = I₀cos²θ
//
//   { type: 'optics-waves', params: {
//       mode: 'slits',
//       controls: true,            // or false, or a list of the control keys to show
//       readout: true, labels: true, hide: [],
//       // slits:     N 2, a 20 (µm, slit width; 0: very narrow), d 100 (µm, centre spacing), lambda 633 (nm), L 1 (m),
//       //            axis 'y' (screen position, mm) | 'angle' (°), range null (half-width shown, in axis units),
//       //            light 'laser' | 'white', phasors true, envelope true, marks null | 'bright' | 'dark' | 'single',
//       //            probe null (axis units); hide: spacing (no fringe-spacing readout), probe
//       // film:      t 300 (nm), nFilm 1.33, nTop 1, nSub 1 (1: a free film in air), angle 0 (°), design null (nm: mark a
//       //            design wavelength), strip true (Newton's scale); hide: colour, spectrum
//       // michelson: dL 0 (nm, the mirror's displacement), lambda 633 (nm), d0 400 (µm, the arms' starting difference,
//       //            which sets how fine the rings are), maxL 2000 (nm, the slider's range), play true
//       // airy:      preset 'hubble' | 'jwst' | 'eye' | 'eht' | 'custom', D (m), lambda (m), sep (rad: the stars' separation),
//       //            zoom 1 (magnify the picture 1, 4 or 16 times), single false (one star only)
//       // polar:     n 2 (polarizers), angles [0, 45, 90] (° from vertical), input 'unpolarized' or an angle (°)
//   } }

import { Plot } from '../plot.js';
import * as W from '../model/optics-waves.js';

const MODES = ['slits', 'film', 'michelson', 'airy', 'polar'];
export const defaults = { mode: 'slits', controls: true, readout: true, labels: true, hide: [] };
const MODE_DEFAULTS = {
  slits: { N: 2, a: 20, d: 100, lambda: 633, L: 1, axis: 'y', range: null, light: 'laser', phasors: true, envelope: true, marks: null, probe: null },
  film: { t: 300, nFilm: 1.33, nTop: 1, nSub: 1, angle: 0, design: null, strip: true },
  michelson: { dL: 0, lambda: 633, d0: 400, maxL: 2000, play: true },
  airy: { preset: 'hubble', D: null, lambda: null, sep: null, zoom: 1, single: false },
  polar: { n: 2, angles: [0, 45, 90], input: 'unpolarized' },
};
// D (m), λ (m), a separation of 1.4 Rayleigh angles, and a label
const PRESETS = {
  eye: { D: 0.005, lambda: 550e-9, name: 'a human eye (pupil 5 mm), green light' },
  hubble: { D: 2.4, lambda: 500e-9, name: 'Hubble (2.4 m mirror), visible light' },
  jwst: { D: 6.5, lambda: 2e-6, name: 'JWST (6.5 m mirror), infrared 2 µm' },
  eht: { D: 1.07e7, lambda: 1.3e-3, name: 'the Event Horizon Telescope: dishes across the Earth (10 700 km), 1.3 mm radio waves' },
  custom: { D: 1, lambda: 550e-9, name: 'your telescope' },
};
const RAD2AS = 180 / Math.PI * 3600;
const trim = (x, n = 3) => String(+(+x).toPrecision(n));
const deg = (r) => (r * 180) / Math.PI;
const rad = (d) => (d * Math.PI) / 180;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/** An angle (rad) in friendly units: µas, mas, arcsec, arcmin or degrees. */
function angleText(th, tex = false) {
  const a = Math.abs(th) * RAD2AS;
  const u = (s) => (tex ? `\\,\\mathrm{${s}}` : ` ${s}`);
  if (a < 1e-3) return trim(a * 1e6, 3) + (tex ? '\\,\\mu\\mathrm{as}' : ' µas');
  if (a < 1) return trim(a * 1e3, 3) + u('mas');
  if (a < 120) return trim(a, 3) + (tex ? '^{\\prime\\prime}' : '″');
  if (a < 7200) return trim(a / 60, 3) + (tex ? '^{\\prime}' : '′');
  return trim(a / 3600, 3) + (tex ? '^\\circ' : '°');
}
/** A length (m) in friendly units. */
function lengthText(x, tex = false) {
  const a = Math.abs(x), sp = tex ? '\\,' : ' ';
  const pick = a >= 1e5 ? [1e3, 'km'] : a >= 1 ? [1, 'm'] : a >= 1e-2 ? [1e-2, 'cm'] : a >= 1e-3 ? [1e-3, 'mm'] : a >= 1e-6 ? [1e-6, tex ? '\\mu m' : 'µm'] : [1e-9, 'nm'];
  const v = x / pick[0], s = Math.abs(v) >= 1e4 ? Math.round(v).toLocaleString('en-US').replace(/,/g, tex ? '\\,' : ' ') : trim(v, 3);
  return tex ? `${s}${sp}\\mathrm{${pick[1]}}` : `${s}${sp}${pick[1]}`;
}

function lightTheme(col) {
  const m = /^#([0-9a-f]{6})$/i.exec(String(col.bg).trim());
  if (!m) { const r = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(col.bg); return r ? (+r[1] + +r[2] + +r[3]) / 3 > 140 : false; }
  const v = parseInt(m[1], 16);
  return ((v >> 16) + ((v >> 8) & 255) + (v & 255)) / 3 > 140;
}
const laserRGB = (l) => W.wavelengthRGB(l) || [235, 235, 235];
const css = (c, a = 1) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
/** A wavelength's colour for lines drawn on the page (darkened on a light background). */
const lineColor = (col, l, a = 1) => { const c = laserRGB(l); return css(lightTheme(col) ? c.map((v) => Math.round(v * 0.7)) : c, a); };

export async function mount(F, P0) {
  const mode = MODES.includes(P0.mode) ? P0.mode : 'slits';
  const P = { ...defaults, ...MODE_DEFAULTS[mode], ...P0 };
  if (mode === 'airy') {
    const pr = PRESETS[P.preset] || PRESETS.hubble;
    P.D ??= pr.D; P.lambda ??= pr.lambda; P.sep ??= 1.4 * W.rayleigh(P.D, P.lambda);
  }
  if (mode === 'slits' && P0.axis === undefined && P.N >= 5) P.axis = 'angle';
  const hide = new Set(P.hide || []);
  Object.assign(F.params, P);
  let reduced = false;
  try { reduced = (await import('../../ui/state.js')).reducedMotion(); } catch { reduced = true; }
  const shown = (k) => P.controls === true || (Array.isArray(P.controls) && P.controls.includes(k));
  const slider = (o) => (shown(o.key) ? F.slider(o) : ((F.params[o.key] = o.value), null));
  const choice = (o) => (shown(o.key) ? F.choice(o) : ((F.params[o.key] = o.value), null));
  const { canvas } = F.canvas({ aspect: { slits: '', film: '', michelson: '', airy: 'wide', polar: 'wide' }[mode], label: P.alt || {
    slits: 'Light through slits: the pattern on a screen, its intensity graph, and the phasors that add up to it',
    film: 'Light reflecting from the two faces of a thin film, the reflected spectrum and the colour it makes',
    michelson: 'A Michelson interferometer, its ring pattern and the brightness at the detector as a mirror moves',
    airy: 'Two stars seen through a telescope: their diffraction patterns and whether they can be told apart',
    polar: 'Light passing through polarizers, with the direction of its electric field and its intensity',
  }[mode] });
  const ctx = canvas.getContext('2d');
  const S = { t: 0, running: false };
  const off = document.createElement('canvas');

  // ── controls ────────────────────────────────────────────────────────────
  if (mode === 'slits') {
    slider({ key: 'N', label: 'Number of slits $N$', min: 1, max: 20, step: 1, value: P.N, explain: '1: a single slit. 2: Young’s double slit. More: a grating.' });
    slider({ key: 'a', label: 'Slit width $a$', min: 0, max: 200, step: 1, value: P.a, unit: '\\mu\\mathrm{m}', explain: 'Each slit’s own width. 0 means very narrow (no diffraction envelope).' });
    slider({ key: 'd', label: 'Slit spacing $d$', min: 1, max: 1000, value: P.d, logScale: true, fmt: (v) => trim(v, 3), unit: '\\mu\\mathrm{m}', explain: 'Centre to centre (only matters for two or more slits). A grating’s lines are 1–3 µm apart.' });
    slider({ key: 'lambda', label: 'Wavelength $\\lambda$', min: 380, max: 750, step: 1, value: P.lambda, unit: '\\mathrm{nm}', explain: 'The laser’s colour.' });
    if (P.axis === 'y') slider({ key: 'L', label: 'Screen distance $L$', min: 0.2, max: 5, step: 0.05, value: P.L, unit: '\\mathrm{m}', explain: 'From the slits to the screen.' });
    choice({ key: 'light', label: 'Light', options: [['laser', 'Laser'], ['white', 'White']], value: P.light, explain: 'White light: every colour at once, each making its own pattern.' });
  } else if (mode === 'film') {
    slider({ key: 't', label: 'Film thickness $t$', min: 0, max: 1500, step: 1, value: P.t, unit: '\\mathrm{nm}', explain: 'A soap bubble is a few hundred nanometres thick; a coating, about a hundred.' });
    slider({ key: 'nFilm', label: 'Film’s index $n$', min: 1, max: 2.5, step: 0.01, value: P.nFilm, explain: '1.33 soapy water, 1.38 magnesium fluoride, 1.47 oil.' });
    slider({ key: 'nSub', label: 'Index below the film', min: 1, max: 2.5, step: 0.01, value: P.nSub, explain: '1.00: air (a free film, like a bubble). 1.33 water, 1.52 glass, 1.77 sapphire.' });
    slider({ key: 'angle', label: 'Viewing angle', min: 0, max: 60, step: 1, value: P.angle, unit: '^\\circ', explain: 'Tilting shortens the path difference: the colours shift toward blue.' });
  } else if (mode === 'michelson') {
    slider({ key: 'dL', label: 'Mirror moved by $\\Delta L$', min: 0, max: P.maxL, step: 1, value: P.dL, unit: '\\mathrm{nm}', explain: 'The light’s round trip in that arm grows by $2\\Delta L$.' });
    slider({ key: 'lambda', label: 'Wavelength $\\lambda$', min: 400, max: 700, step: 1, value: P.lambda, unit: '\\mathrm{nm}', explain: '633 nm is a helium–neon laser.' });
  } else if (mode === 'airy') {
    choice({ key: 'preset', label: 'Telescope', options: [['eye', 'Eye'], ['hubble', 'Hubble'], ['jwst', 'JWST'], ['eht', 'EHT'], ['custom', 'Custom']], value: P.preset, explain: 'Sets the aperture and the wavelength.' });
    var dCtl = slider({ key: 'D', label: 'Aperture $D$', min: 1e-3, max: 1.3e7, value: P.D, logScale: true, fmt: (v) => lengthText(v, true), explain: 'The diameter of the lens, mirror — or the distance between radio dishes.' });
    var lCtl = slider({ key: 'lambda', label: 'Wavelength $\\lambda$', min: 1e-7, max: 1e-2, value: P.lambda, logScale: true, fmt: (v) => lengthText(v, true), explain: 'Visible light is 400–700 nm; radio waves are millimetres and more.' });
    var sCtl = slider({ key: 'sep', label: 'Separation of the two stars', min: 4.8e-12, max: 5e-3, value: P.sep, logScale: true, fmt: (v) => angleText(v, true), explain: 'The angle between them on the sky.' });
    choice({ key: 'zoom', label: 'Magnify the picture', options: [[1, '×1'], [4, '×4'], [16, '×16']], value: P.zoom, explain: 'Enlarges the image — blur and all.' });
  } else if (mode === 'polar') {
    choice({ key: 'n', label: 'Polarizers', options: [[1, 'One'], [2, 'Two'], [3, 'Three']], value: P.n, explain: 'Ideal polarizers, each passing only the field along its axis.' });
    choice({ key: 'input', label: 'Light in', options: [['unpolarized', 'Unpolarized'], [0, 'Vertical'], [45, 'At 45°']], value: P.input, explain: 'Sunlight and lamps are unpolarized: their field points every which way.' });
    var aCtl = [0, 1, 2].map((i) => slider({ key: `a${i + 1}`, label: `Polarizer ${i + 1}’s axis`, min: 0, max: 180, step: 1, value: (P.angles[i] ?? 0), unit: '^\\circ', explain: i === 0 ? 'Measured from vertical.' : 'Measured from vertical, like the first.' }));
  }
  let playBtn = null;
  const anim = F.animate((dt) => {
    if (!S.running) return;
    S.t += dt;
    if (mode === 'michelson') {
      const v = F.params.dL + dt * 120;                     // nm per second of mirror motion
      F.set('dL', v > F.params.maxL ? 0 : Math.round(v));
      return;                                               // F.set redraws
    }
    draw();
  }, { force: true });
  if ((mode === 'michelson' || mode === 'polar') && P.controls !== false) {
    playBtn = F.button({ label: 'Play', primary: true, onClick: () => {
      S.running = !S.running; playBtn.textContent = S.running ? 'Pause' : 'Play';
      if (S.running) anim.start();
    } });
    if (P.play && !reduced && mode === 'michelson' && false) { S.running = true; playBtn.textContent = 'Pause'; }
  }
  F.onChange((k) => {
    if (mode === 'airy' && k === 'preset') {
      const pr = PRESETS[F.params.preset];
      F.set('D', pr.D); F.set('lambda', pr.lambda); F.set('sep', 1.4 * W.rayleigh(pr.D, pr.lambda));
    }
    draw();
  });

  const A = new Plot(canvas, { x: [0, 1], y: [0, 1], grid: false, axes: false });
  const B = new Plot(canvas, { x: [0, 1], y: [0, 1], grid: true, axes: true });
  const C = new Plot(canvas, { x: [0, 1], y: [0, 1], equal: true, grid: false, axes: false });
  const frame = (pl, pad) => { pl.o.pad = pad; pl.resize(); pl.refreshTheme(); };

  // multi-panel modes stack their panels on a phone, in a taller canvas
  const box = canvas.parentElement;
  function setNarrow() {
    const narrow = (box.clientWidth || 600) < 520;
    const want = narrow && (mode === 'film' || mode === 'michelson' || mode === 'airy') ? '4 / 5' : '';
    if (box.style.aspectRatio !== want) box.style.aspectRatio = want;
    return narrow;
  }
  function blit(img, x, y, w, h, smooth = true) {
    ctx.save(); ctx.imageSmoothingEnabled = smooth; ctx.drawImage(img, x, y, w, h); ctx.restore();
  }

  function draw() {
    setNarrow();
    A.resize(); A.refreshTheme();
    ctx.clearRect(0, 0, A.w, A.h);
    ({ slits: drawSlits, film: drawFilm, michelson: drawMichelson, airy: drawAiry, polar: drawPolar })[mode]();
  }

  // ── slits ───────────────────────────────────────────────────────────────
  // positions on the screen in mm (axis 'y') or angles in degrees (axis 'angle')
  function slitParams() {
    const p = F.params;
    return { N: Math.round(p.N), d: p.d * 1e-6, a: p.a * 1e-6, lambda: p.lambda * 1e-9 };
  }
  const sinOf = (u) => (F.params.axis === 'angle' ? Math.sin(rad(u)) : Math.sin(Math.atan((u * 1e-3) / F.params.L)));
  const uOfSin = (s) => (F.params.axis === 'angle' ? deg(Math.asin(clamp(s, -1, 1))) : F.params.L * Math.tan(Math.asin(clamp(s, -1, 1))) * 1e3);
  let range0 = null;
  function slitRange() {
    if (P.range) return P.range;
    if (range0) return range0;
    const p = slitParams(), lam = p.lambda;
    let s;
    if (p.N === 1) s = 3.3 * lam / Math.max(p.a, 1e-7);
    else if (p.a > 0 && p.N === 2) s = Math.min(2.4 * lam / p.a, 7.5 * lam / p.d);
    else s = p.N >= 5 ? 0.98 : 5.5 * lam / p.d;
    return (range0 = F.params.axis === 'angle' ? deg(Math.asin(Math.min(0.999, s))) : uOfSin(Math.min(0.95, s)));
  }
  let probeU = P.probe;
  function drawSlits() {
    const W0 = A.w, H0 = A.h, p = slitParams(), lam = p.lambda;
    const white = F.params.light === 'white';
    const showPh = P.phasors !== false && W0 > 420 && !hide.has('probe');
    const right = showPh ? Math.round(Math.min(250, W0 * 0.32)) : 0;
    const L0 = 46, R0 = right + 14, top = 22, stripH = Math.round(Math.max(44, H0 * 0.16));
    const range = slitRange();
    const xs = F.params.axis === 'angle' ? 'angle θ (°)' : 'position on the screen y (mm)';
    if (probeU === null || probeU === undefined) {
      // a dark place to start: the first dark fringe of two slits, the first minimum of one, half an order for a grating
      const s0 = p.N >= 2 ? lam / (2 * p.d) : lam / Math.max(p.a, 1e-9);
      const u0 = s0 < 1 ? uOfSin(s0) : NaN;
      probeU = Number.isFinite(u0) && Math.abs(u0) < range ? u0 : 0.3 * range;
    }
    probeU = clamp(probeU, -range, range);
    const lt = lightTheme(A.col);
    // the screen: brightness √I so faint fringes show
    const n = Math.max(2, Math.round(W0 - L0 - R0));
    off.width = n; off.height = 1;
    const g = off.getContext('2d'), img = g.createImageData(n, 1), dd = img.data;
    const lams = white ? Array.from({ length: 31 }, (_, i) => 400 + i * 10) : [F.params.lambda];
    const cols = lams.map((l) => W.wavelengthRGB(l) || [0, 0, 0]);
    let norm = 0;
    if (white) { for (let k = 0; k < lams.length; k++) for (let c = 0; c < 3; c++) norm = Math.max(norm, 0); }
    const acc = new Float64Array(n * 3);
    for (let i = 0; i < n; i++) {
      const s = sinOf(-range + (2 * range * (i + 0.5)) / n);
      for (let k = 0; k < lams.length; k++) {
        const I = W.slitsIntensity({ ...p, lambda: lams[k] * 1e-9 }, s);
        acc[3 * i] += I * cols[k][0]; acc[3 * i + 1] += I * cols[k][1]; acc[3 * i + 2] += I * cols[k][2];
      }
    }
    for (let i = 0; i < acc.length; i++) norm = Math.max(norm, acc[i]);
    for (let i = 0; i < n; i++) for (let c = 0; c < 3; c++) dd[4 * i + c] = Math.round(255 * Math.sqrt(acc[3 * i + c] / (norm || 1)));
    for (let i = 0; i < n; i++) dd[4 * i + 3] = 255;
    g.putImageData(img, 0, 0);
    ctx.save(); ctx.fillStyle = '#05070c'; ctx.fillRect(L0 - 1, top - 1, n + 2, stripH + 2); ctx.restore();
    blit(off, L0, top, n, stripH, true);
    ctx.save(); ctx.strokeStyle = A.col.line3; ctx.strokeRect(L0 - 0.5, top - 0.5, n + 1, stripH + 1); ctx.restore();
    if (P.labels) A.text(W0 < 520 ? (white ? 'the screen, white light (√I)' : 'the screen (brightness ∝ √I)') : white ? 'the screen, in white light (brightness ∝ √intensity)' : 'the screen (brightness ∝ √intensity, so faint fringes show)', L0, top - 10, { screen: true, color: 'ink2', size: 11, weight: 600 });
    // the intensity graph
    frame(B, { l: L0, r: R0, t: top + stripH + 18, b: 34 });
    B.o.xlabel = xs; B.o.ylabel = ''; B.o.yfmt = (v) => (v === 1 ? 'I₀' : v === 0.5 ? '½I₀' : '');
    B.setView([-range, range], [0, 1.12]);
    B.grid(); B.axes();
    const samples = Math.max(600, Math.round(2.4 * (B.R - B.L)) * (p.N > 6 ? 3 : 1));
    if (P.envelope !== false && p.N >= 2 && p.a > 0) B.fn((u) => W.singleSlit(p.a, white ? 550e-9 : lam, sinOf(u)), { color: 'ink3', width: 1.3, dash: [5, 4], samples });
    if (white) {
      for (const [l, c] of [[450, 'violet'], [550, 'good'], [650, 'bad']]) B.fn((u) => W.slitsIntensity({ ...p, lambda: l * 1e-9 }, sinOf(u)), { color: lineColor(A.col, l), width: 1.6, samples });
    } else B.fn((u) => W.slitsIntensity(p, sinOf(u)), { color: lineColor(A.col, F.params.lambda), width: 2.2, samples });
    // marks: bright orders, two-slit dark fringes, or single-slit minima
    if (P.marks) {
      for (let m = -12; m <= 12; m++) {
        let s = NaN, lab = '';
        if (P.marks === 'bright' && p.N >= 2) { s = W.brightSin(m, p.d, lam); lab = `m = ${m}`; }
        if (P.marks === 'dark' && p.N === 2) { s = W.darkSinTwo(m, p.d, lam); lab = ''; }
        if (P.marks === 'single' && m !== 0 && p.a > 0) { s = W.darkSinSingle(m, p.a, lam); lab = `m = ${m}`; }
        if (Number.isNaN(s)) continue;
        const u = uOfSin(s);
        if (Math.abs(u) > range) continue;
        B.line(u, 0, u, 1.05, { color: 'ink3', width: 1, dash: [2, 3] });
        const gap = Math.abs(B.X(uOfSin(P.marks === 'single' ? W.darkSinSingle(1, p.a, lam) : W.brightSin(1, p.d, lam))) - B.X(0));
        if (lab && (gap > 44 || (gap > 20 && m % 2 === 0) || m === 0)) B.text(gap > 44 ? lab : String(m), u, 1.08, { align: 'center', color: 'ink3', size: 10.5 });
      }
    }
    // the probe
    const sP = sinOf(probeU), IP = W.slitsIntensity(p, sP);
    if (showPh) {
      B.line(probeU, 0, probeU, 1.05, { color: 'gold', width: 1.4, dash: [4, 3] });
      B.point(probeU, IP, { color: 'gold', r: 4.5 });
      B.drawHandles();
      // the phasor diagram
      const px0 = W0 - right + 6;
      frame(C, { l: px0, r: 8, t: top + 16, b: 40 });
      C.setView([-0.62, 1.08], [-0.62, 0.62]);
      const per = p.N <= 2 ? (p.a > 0 ? 14 : 1) : p.N <= 6 ? (p.a > 0 ? 6 : 1) : (p.a > 0 ? 3 : 1);
      const chain = W.phasorChain(p, sP, per);
      // a box around the panel
      ctx.save(); ctx.strokeStyle = A.col.line2; ctx.strokeRect(px0 - 4.5, top - 0.5, right - 6, H0 - top - 34); ctx.restore();
      C.text('phasors at the probe', px0 + 2, top + 8, { screen: true, color: 'ink2', size: 11, weight: 600 });
      C.line(-0.6, 0, 1.05, 0, { color: 'ink4', width: 1 });
      C.circle(0, 0, 1, { color: 'ink4', width: 1, dash: [2, 4] });
      const slitCols = ['accent', 'teal', 'violet', 'warn'];
      for (let j = 0; j < p.N; j++) {
        const seg = chain.slice(j * per, (j + 1) * per + 1);
        C.path(seg, { color: slitCols[j % slitCols.length], width: p.N > 6 ? 1.6 : 2.2 });
        if (per === 1 || p.N <= 2) for (let q = 1; q < seg.length; q++) { const a0 = seg[q - 1], b0 = seg[q]; if (Math.hypot(b0[0] - a0[0], b0[1] - a0[1]) > 0.06) C.arrow(a0[0], a0[1], b0[0], b0[1], { color: slitCols[j % slitCols.length], width: 2, head: 7 }); }
      }
      const end = chain[chain.length - 1];
      C.arrow(0, 0, end[0], end[1], { color: 'gold', width: 2.6, head: 9 });
      C.point(0, 0, { color: 'ink2', r: 2.5 });
      const bx = px0 + 2, by = H0 - 46;
      C.text(`sum² = I/I₀ = ${IP < 5e-4 ? '0' : trim(IP, 2)}`, bx, by, { screen: true, color: 'gold', size: 11.5, weight: 650 });
      if (p.N >= 2) C.text(`next slit: ${trim(((p.d * sP) / lam), 3)} λ farther`, bx, by + 15, { screen: true, color: 'ink2', size: 11 });
      else if (p.a > 0) C.text(`edge to edge: ${trim(((p.a * sP) / lam), 3)} λ`, bx, by + 15, { screen: true, color: 'ink2', size: 11 });
    }
    if (P.readout !== false) {
      const rows = [];
      const un = F.params.axis === 'angle' ? '^\\circ' : '\\,\\mathrm{mm}';
      if (p.N >= 2 && !hide.has('spacing')) {
        if (F.params.axis === 'y') rows.push(['fringe spacing $\\lambda L/d$', `${trim((lam * F.params.L / p.d) * 1e3)}\\,\\mathrm{mm}`]);
        const s1 = W.brightSin(1, p.d, lam);
        if (!Number.isNaN(s1)) rows.push(['first order $\\theta_1$', `${trim(deg(Math.asin(s1)))}^\\circ`]);
      }
      if (p.a > 0 && !hide.has('central')) {
        const s1 = W.darkSinSingle(1, p.a, lam);
        if (!Number.isNaN(s1)) rows.push([p.N === 1 ? 'first minimum $\\theta$' : 'envelope’s first zero', `${trim(deg(Math.asin(s1)))}^\\circ`]);
        if (F.params.axis === 'y' && p.N === 1 && !Number.isNaN(s1)) rows.push(['central maximum’s width', `${trim(2 * uOfSin(s1))}\\,\\mathrm{mm}`]);
      }
      if (showPh) rows.push(['probe at', `${trim(probeU)}${un}`]);
      F.readout(rows);
    }
  }

  // ── thin film ───────────────────────────────────────────────────────────
  function drawFilm() {
    const W0 = A.w, H0 = A.h, p = F.params;
    const n0 = p.nTop, n1 = p.nFilm, n2 = p.nSub, t = p.t, th0 = rad(p.angle);
    const lt = lightTheme(A.col);
    const narrow = W0 < 520;
    const leftW = narrow ? W0 : Math.round(W0 * 0.42);
    const crossH = narrow ? Math.round(H0 * 0.38) : H0 - 8;
    // cross-section, drawn with the rays at 25° so the two reflections separate
    frame(A, { l: 8, r: W0 - leftW + 8, t: 8, b: H0 - crossH + 8 });
    A.setView([0, 1], [0, 1]);
    const tv = 0.1 + 0.2 * Math.min(1, t / 1500);                  // drawn thickness
    const yTop = 0.72, yBot = yTop - tv;
    const tint = (n) => Math.min(0.45, 0.04 + 0.24 * (n - 1));
    A.path([[0, yTop], [1, yTop], [1, 1], [0, 1]], { fill: 'accent', fillAlpha: tint(n0), stroke: false, close: true });
    A.path([[0, yBot], [1, yBot], [1, yTop], [0, yTop]], { fill: 'teal', fillAlpha: 0.12 + tint(n1), stroke: false, close: true });
    A.path([[0, 0], [1, 0], [1, yBot], [0, yBot]], { fill: 'accent', fillAlpha: tint(n2), stroke: false, close: true });
    A.line(0, yTop, 1, yTop, { color: 'ink3', width: 1.4 }); A.line(0, yBot, 1, yBot, { color: 'ink3', width: 1.4 });
    const a0 = rad(25), a1 = Math.asin(Math.sin(a0) * n0 / n1);
    const hitX = 0.36, inc = [hitX - 0.32 * Math.tan(a0), yTop + 0.32];
    const xb = hitX + (yTop - yBot) * Math.tan(a1), x2 = xb + (yTop - yBot) * Math.tan(a1);
    const yellow = lt ? '#a47100' : 'gold';
    A.path([inc, [hitX, yTop]], { color: yellow, width: 2.4 });
    A.arrow(inc[0] + (hitX - inc[0]) * 0.4, inc[1] + (yTop - inc[1]) * 0.4, inc[0] + (hitX - inc[0]) * 0.55, inc[1] + (yTop - inc[1]) * 0.55, { color: yellow, width: 2.4, head: 9 });
    A.path([[hitX, yTop], [hitX + 0.3 * Math.tan(a0), yTop + 0.3]], { color: 'accent2', width: 2.2 });
    A.path([[hitX, yTop], [xb, yBot], [x2, yTop], [x2 + 0.3 * Math.tan(a0), yTop + 0.3]], { color: 'violet', width: 2.2 });
    const flip1 = n1 > n0, flip2 = n2 > n1;
    if (P.labels) {
      A.text('1', hitX + 0.3 * Math.tan(a0), yTop + 0.3, { color: 'accent2', size: 12, weight: 700, dx: 4, dy: -4 });
      A.text('2', x2 + 0.3 * Math.tan(a0), yTop + 0.3, { color: 'violet', size: 12, weight: 700, dx: 4, dy: -4 });
      A.text(`n = ${n0.toFixed(2)}`, 0.03, 0.96, { color: 'ink2', size: 11 });
      A.text(`film n = ${n1.toFixed(2)}, t = ${Math.round(t)} nm`, 0.03, (yTop + yBot) / 2, { color: 'ink', size: 11.5, weight: 600 });
      A.text(`n = ${n2.toFixed(2)}`, 0.03, 0.04, { color: 'ink2', size: 11 });
      A.text(`1: top face, ${flip1 ? 'flips by ½ cycle' : 'no flip'}`, 0.03, 0.31, { color: 'accent2', size: 11 });
      A.text(`2: bottom face, ${flip2 ? 'flips by ½ cycle' : 'no flip'}`, 0.03, 0.23, { color: 'violet', size: 11 });
      A.text('ray 2 goes about 2nt farther', 0.03, 0.15, { color: 'ink3', size: 11 });
    }
    // spectrum and colour
    const lams = []; for (let l = 380; l <= 750; l += 2) lams.push(l);
    const R = (l) => W.filmReflectance({ n0, n1, n2, t, lambda: l, theta0: th0 });
    const bare = W.bareReflectance(n0, n2);
    const Rmax = Math.max(...lams.map(R)), top = Math.max(0.02, Rmax, bare) * 1.18;
    const gx = narrow ? 46 : leftW + 46, gw = W0 - gx - 14;
    const specB = narrow ? crossH + 26 : 22, specH = narrow ? Math.round(H0 * 0.27) : Math.round(H0 * 0.52);
    frame(B, { l: gx, r: 14, t: specB, b: H0 - specB - specH });
    B.o.xlabel = 'wavelength (nm)'; B.o.ylabel = ''; B.o.yfmt = (v) => `${trim(v * 100, 2)}%`; B.o.xticks = 5;
    B.setView([380, 750], [0, top]);
    if (!hide.has('spectrum')) {
      for (const l of lams) { const r0 = R(l); B.line(l, 0, l, r0, { color: lineColor(A.col, l, 0.55), width: Math.max(1.2, (B.R - B.L) / lams.length + 0.6) }); }
      B.grid(); B.axes();
      B.fn(R, { color: 'ink', width: 2, domain: [380, 750] });
      if (n2 !== n0) { B.line(380, bare, 750, bare, { color: 'ink3', width: 1.2, dash: [5, 4] }); B.text('no film', 745, bare, { color: 'ink3', size: 10.5, align: 'right', dy: -8 }); }
      if (P.design) { B.line(P.design, 0, P.design, top, { color: 'gold', width: 1.2, dash: [3, 3] }); B.text(`${P.design} nm`, P.design, top * 0.94, { color: 'gold', size: 10.5, dx: 4 }); }
      B.text('reflected fraction R', B.L + 2, B.T - 10, { screen: true, color: 'ink2', size: 11, weight: 600 });
    } else { B.grid(); B.axes(); B.text('spectrum hidden', (B.L + B.R) / 2, (B.T + B.B) / 2, { screen: true, color: 'ink3', align: 'center' }); }
    // the colour, and Newton's scale against thickness
    const sy = specB + specH + 48, sh = Math.max(14, Math.round((H0 - sy - 8) / 2 - 4));
    const sw = Math.max(40, Math.round(Math.min(sh * 1.6, narrow ? 60 : 90)));
    if (!hide.has('colour')) {
      const c = W.filmColor({ n0, n1, n2, t, theta0: th0 });
      ctx.save(); ctx.fillStyle = css(c); ctx.fillRect(gx, sy, sw, sh * 2 + 8); ctx.strokeStyle = A.col.line3; ctx.strokeRect(gx + 0.5, sy + 0.5, sw - 1, sh * 2 + 7); ctx.restore();
      B.text('colour seen', gx, sy - 8, { screen: true, color: 'ink2', size: 11, weight: 600 });
    }
    if (P.strip !== false) {
      const x0 = gx + sw + 14, w = W0 - x0 - 14, n = Math.max(2, Math.round(w));
      const key = `${n0}|${n1}|${n2}|${p.angle}|${n}`;
      if (drawFilm.key !== key) {
        drawFilm.key = key;
        drawFilm.strip = document.createElement('canvas');
        drawFilm.strip.width = n; drawFilm.strip.height = 1;
        const g = drawFilm.strip.getContext('2d'), im = g.createImageData(n, 1);
        for (let i = 0; i < n; i++) { const c = W.filmColor({ n0, n1, n2, t: (1500 * (i + 0.5)) / n, theta0: th0 }); im.data.set([c[0], c[1], c[2], 255], 4 * i); }
        g.putImageData(im, 0, 0);
      }
      blit(drawFilm.strip, x0, sy, w, sh * 2 + 8, false);
      const mx = x0 + (w * t) / 1500;
      ctx.save(); ctx.strokeStyle = A.col.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(mx, sy - 4); ctx.lineTo(mx, sy + sh * 2 + 12); ctx.stroke(); ctx.restore();
      B.text(narrow ? 'colour vs thickness, 0 → 1500 nm' : 'colour against thickness, 0 → 1500 nm', x0, sy - 8, { screen: true, color: 'ink2', size: 11, weight: 600 });
    }
    if (P.readout !== false) {
      const flips = W.phaseFlips(n0, n1, n2);
      const rows = [['phase flips', flips === 1 ? '\\text{one: bright when } 2nt = (m + \\tfrac12)\\lambda' : `\\text{${flips === 0 ? 'none' : 'two'}: bright when } 2nt = m\\lambda`]];
      if (!hide.has('spectrum')) rows.push(['R at 550 nm', `${trim(100 * R(550), 2)}\\%`]);
      if (n2 !== n0) rows.push(['without the film', `${trim(100 * bare, 2)}\\%`]);
      F.readout(rows);
    }
  }

  // ── Michelson ───────────────────────────────────────────────────────────
  function drawMichelson() {
    const W0 = A.w, H0 = A.h, p = F.params, lam = p.lambda * 1e-9;
    const narrow = W0 < 520;
    const leftW = narrow ? Math.round(W0 * 0.56) : Math.round(W0 * 0.46);
    const col = laserRGB(p.lambda), lc = lineColor(A.col, p.lambda);
    // the instrument, from above
    frame(A, { l: 8, r: W0 - leftW + 8, t: 8, b: narrow ? Math.round(H0 * 0.52) : 8 });
    A.setView([-1.25, 1.35], [-1.15, 1.25]);
    A.o.equal = true; A._fit();
    const shift = 0.22 * Math.sin(Math.PI * Math.min(1, p.dL / p.maxL)) * 0 + 0.3 * (p.dL / p.maxL);   // drawn hugely exaggerated
    const mx = 1.0 + shift;
    // beams
    A.line(-1.15, 0, mx, 0, { color: lc, width: 2.2 }); A.line(0, 0, 0, 1.0, { color: lc, width: 2.2 }); A.line(0, 0, 0, -0.95, { color: lc, width: 2.2 });
    // laser, beam splitter, mirrors, detector
    A.rect(-1.2, -0.1, 0.32, 0.2, { color: 'bad', alpha: 0.4 });
    A.line(-0.16, -0.16, 0.16, 0.16, { color: 'ink2', width: 4 });
    A.line(-0.18, 1.02, 0.18, 1.02, { color: 'ink', width: 5 });
    A.line(mx + 0.02, -0.18, mx + 0.02, 0.18, { color: 'ink', width: 5 });
    if (shift > 0.005) A.line(1.02, -0.18, 1.02, 0.18, { color: 'ink3', width: 1.5, dash: [3, 3] });
    A.rect(-0.12, -1.08, 0.24, 0.13, { color: 'good', alpha: 0.5 });
    if (P.labels) {
      A.text('laser', -1.04, 0.16, { color: 'bad', size: 11, align: 'center' });
      A.text('beam splitter', 0.12, -0.2, { color: 'ink2', size: 10.5 });
      A.text('fixed mirror', 0.24, 1.02, { color: 'ink2', size: 10.5 });
      A.text('moving mirror', mx - 0.04, 0.32, { color: 'ink2', size: 10.5, align: 'center' });
      if (shift > 0.03) { A.arrow(1.02, -0.3, mx + 0.02, -0.3, { color: 'gold', width: 1.6, head: 7 }); A.text('ΔL (exaggerated)', (1.02 + mx) / 2, -0.42, { color: 'gold', size: 10.5, align: 'center' }); }
      A.text('detector', 0.16, -1.02, { color: 'good', size: 10.5 });
    }
    // the rings, as on a screen at the detector
    const d = (Math.round((2 * p.d0 * 1e-6) / lam) * lam) / 2 + p.dL * 1e-9;     // the arms start a whole number of half-wavelengths apart
    const thMax = Math.sqrt((7 * lam) / (p.d0 * 1e-6));
    const ringX = narrow ? leftW + 4 : leftW + 10, ringY = narrow ? 30 : 12;
    const size = narrow ? Math.round(Math.min(H0 * 0.4, W0 - leftW - 10)) : Math.round(Math.min(H0 * 0.5, (W0 - leftW) * 0.55));
    const n = Math.min(260, size * 2);
    off.width = n; off.height = n;
    const g = off.getContext('2d'), im = g.createImageData(n, n);
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
      const rx = (i + 0.5) / n * 2 - 1, ry = (j + 0.5) / n * 2 - 1, r = Math.hypot(rx, ry);
      const k = 4 * (j * n + i);
      if (r > 1) { im.data[k + 3] = 0; continue; }
      const I = W.michelsonRing(d, lam, r * thMax);
      im.data[k] = col[0] * I; im.data[k + 1] = col[1] * I; im.data[k + 2] = col[2] * I; im.data[k + 3] = 255;
    }
    g.putImageData(im, 0, 0);
    ctx.save(); ctx.fillStyle = '#05070c'; ctx.beginPath(); ctx.arc(ringX + size / 2, ringY + size / 2, size / 2 + 1, 0, 2 * Math.PI); ctx.fill(); ctx.restore();
    blit(off, ringX, ringY, size, size);
    if (P.labels) A.text(narrow ? 'detector' : 'what the detector sees', narrow ? ringX : ringX + size + 8, narrow ? ringY - 14 : ringY + 10, { screen: true, color: 'ink2', size: 11, weight: 600 });
    const Ic = W.michelson(p.dL * 1e-9, lam);
    const count = Math.floor(W.fringeCount(p.dL * 1e-9, lam) + 1e-9);
    if (P.labels && !narrow) {
      A.text(`fringes counted: ${count}`, ringX + size + 8, ringY + 32, { screen: true, color: 'gold', size: 13, weight: 700 });
      A.text(`centre brightness ${Math.round(100 * Ic)}%`, ringX + size + 8, ringY + 52, { screen: true, color: 'ink2', size: 11 });
    }
    // the centre's brightness against the mirror's displacement
    const gx = narrow ? 46 : leftW + 46;
    frame(B, { l: gx, r: 14, t: narrow ? Math.round(H0 * 0.55) : ringY + size + 22, b: 34 });
    B.o.xticks = narrow ? 4 : 8;
    B.o.xlabel = 'mirror moved ΔL (nm)'; B.o.ylabel = ''; B.o.yfmt = (v) => (v === 1 ? 'max' : v === 0 ? '' : '');
    B.setView([0, p.maxL], [0, 1.1]);
    B.grid(); B.axes();
    B.fn((x) => W.michelson(x * 1e-9, lam), { color: lc, width: 2, samples: 900 });
    B.point(p.dL, Ic, { color: 'gold', r: 5 });
    B.line(p.dL, 0, p.dL, 1.1, { color: 'gold', width: 1, dash: [3, 3] });
    B.text('brightness at the centre', B.L + 2, B.T - 10, { screen: true, color: 'ink2', size: 11, weight: 600 });
    if (P.readout !== false) F.readout([
      ['mirror moved $\\Delta L$', `${Math.round(p.dL)}\\,\\mathrm{nm} = ${trim(p.dL / p.lambda, 3)}\\,\\lambda`],
      ['extra path $2\\Delta L$', `${trim((2 * p.dL) / p.lambda, 3)}\\,\\lambda`],
      ['fringes counted $\\lfloor 2\\Delta L/\\lambda \\rfloor$', String(count)],
    ]);
  }

  // ── resolution: two stars and the Airy pattern ──────────────────────────
  function drawAiry() {
    const W0 = A.w, H0 = A.h, p = F.params;
    const D = p.D, lam = p.lambda, sep = p.sep, zoom = +p.zoom || 1;
    const thR = W.rayleigh(D, lam);
    const narrow = W0 < 520;
    const size = narrow ? Math.round(Math.min(W0 - 12, H0 * 0.56)) : Math.round(Math.min(H0 - 12, W0 * 0.46));
    const ix = narrow ? Math.round((W0 - size) / 2) : 6, iy = narrow ? 6 : Math.round((H0 - size) / 2);
    // the field of view (half-width, rad): enough for both stars and the first rings, divided by the magnification
    const half = Math.max(2.4 * thR, 1.3 * (p.single ? 0 : sep) + 1.6 * thR) / zoom;
    const k = (Math.PI * D) / lam;
    const n = Math.min(300, size * 2);
    off.width = n; off.height = n;
    const g = off.getContext('2d'), im = g.createImageData(n, n);
    const visible = lam >= 380e-9 && lam <= 750e-9;
    const col = visible ? laserRGB(lam * 1e9) : [255, 236, 200];
    const s1 = p.single ? 0 : -sep / 2, s2 = p.single ? null : sep / 2;
    for (let j = 0; j < n; j++) {
      const v = (1 - (2 * (j + 0.5)) / n) * half;
      for (let i = 0; i < n; i++) {
        const u = ((2 * (i + 0.5)) / n - 1) * half;
        let I = W.airyX(k * Math.hypot(u - s1, v));
        if (s2 !== null) I += W.airyX(k * Math.hypot(u - s2, v));
        const b = Math.min(1, Math.sqrt(I / (s2 === null ? 1 : 1.1)));
        const q = 4 * (j * n + i);
        im.data[q] = col[0] * b; im.data[q + 1] = col[1] * b; im.data[q + 2] = col[2] * b; im.data[q + 3] = 255;
      }
    }
    g.putImageData(im, 0, 0);
    blit(off, ix, iy, size, size);
    ctx.save(); ctx.strokeStyle = A.col.line3; ctx.strokeRect(ix + 0.5, iy + 0.5, size - 1, size - 1); ctx.restore();
    if (P.labels) {
      A.text(`picture ${zoom > 1 ? `magnified ×${zoom}, ` : ''}${angleText(2 * half)} across`, ix + 8, iy + 14, { screen: true, color: '#cdd8ea', size: 11, weight: 600, halo: false });
      if (!visible) A.text('false colour: not visible light', ix + 8, iy + size - 10, { screen: true, color: '#cdd8ea', size: 10.5, halo: false });
    }
    // a cut through both stars
    const gx = narrow ? 30 : ix + size + 46;
    frame(B, { l: gx, r: 12, t: narrow ? size + 34 : 24, b: 40 });
    B.o.xticks = narrow ? 4 : 7;
    B.o.xlabel = 'angle along the line through both stars'; B.o.ylabel = ''; B.o.yfmt = () => '';
    B.o.xfmt = (v) => (v < 0 ? '−' : '') + angleText(rad(v / 3600), false);
    const halfAs = half * RAD2AS;
    B.setView([-halfAs, halfAs], [0, 1.25]);
    B.grid(); B.axes();
    const f1 = (u) => W.airyX(k * Math.abs(rad(u / 3600) - s1));
    if (s2 !== null) {
      const f2 = (u) => W.airyX(k * Math.abs(rad(u / 3600) - s2));
      B.fn(f1, { color: 'ink3', width: 1.2, dash: [4, 4], samples: 700 });
      B.fn(f2, { color: 'ink3', width: 1.2, dash: [4, 4], samples: 700 });
      B.fn((u) => f1(u) + f2(u), { color: visible ? lineColor(A.col, lam * 1e9) : 'gold', width: 2.2, samples: 700 });
    } else B.fn(f1, { color: visible ? lineColor(A.col, lam * 1e9) : 'gold', width: 2.2, samples: 700 });
    const ratio = sep / thR;
    let peak = 0;
    if (!p.single) for (let i = 0; i <= 400; i++) peak = Math.max(peak, W.twoSources(D, lam, sep, (sep * i) / 800));
    const dip = p.single ? 0 : Math.max(0, 1 - W.twoSources(D, lam, sep, 0) / peak);
    const verdict = p.single ? '' : ratio >= 1.0 ? (ratio < 1.12 ? 'just resolved: the Rayleigh limit' : 'resolved: two stars') : dip > 0.002 ? 'below the Rayleigh limit: only a faint dip' : 'not resolved: one blob';
    if (P.labels && verdict) B.text(verdict, B.L + 2, B.T - 10, { screen: true, color: ratio >= 1 ? 'good' : dip > 0.002 ? 'warn' : 'bad', size: 12, weight: 650 });
    if (P.readout !== false) {
      const rows = [['Rayleigh limit $1.22\\lambda/D$', angleText(thR, true)]];
      if (!p.single) rows.push(['separation', angleText(sep, true)], ['separation ÷ limit', trim(ratio, 3)], ['dip between them', `${Math.round(100 * dip)}\\%`]);
      rows.push(['aperture', lengthText(D, true)], ['wavelength', lengthText(lam, true)]);
      F.readout(rows);
    }
  }

  // ── polarizers ──────────────────────────────────────────────────────────
  function drawPolar() {
    const W0 = A.w, H0 = A.h, p = F.params, n = +p.n;
    const angs = [p.a1, p.a2, p.a3].slice(0, n).map((a) => rad(a));
    const input = p.input === 'unpolarized' ? 'unpolarized' : rad(+p.input);
    const Is = W.polarizerChain(angs, input);
    aCtl?.forEach((c, i) => { if (c) c.node.hidden = i >= n; });
    frame(A, { l: 10, r: 10, t: 10, b: 10 });
    A.setView([0, 10], [-2.1, 2.1]);
    const K = [-0.42, -0.24];                                  // oblique projection of the horizontal transverse axis
    const P3 = (z, ex, ey) => [z + K[0] * ex, ey + K[1] * ex];
    const xs = [1.6, ...angs.map((_, i) => 3 + i * (6.2 / Math.max(1, n)) + 0.4)];
    const segs = [];                                           // field between elements: [z0, z1, angle | null, amplitude]
    segs.push([0.3, xs[1] - 0.4, input === 'unpolarized' ? null : input, 1]);
    for (let i = 0; i < n; i++) segs.push([xs[i + 1] + 0.4, i + 1 < n ? xs[i + 2] - 0.4 : 9.7, angs[i], Math.sqrt(Is[i] / (input === 'unpolarized' ? 0.5 : 1)) * (input === 'unpolarized' ? Math.SQRT1_2 : 1)]);
    // the beam axis
    A.line(0.2, 0, 9.8, 0, { color: 'ink4', width: 1, dash: [3, 4] });
    // the field in each segment
    const ph = S.t * 4;
    segs.forEach(([z0, z1, a, amp], si) => {
      if (amp < 0.01) return;
      if (a === null) {
        for (let q = 0; q < 4; q++) {
          const z = z0 + ((q + 0.5) * (z1 - z0)) / 4;
          for (let r = 0; r < 4; r++) {
            const t = (r * Math.PI) / 4 + q * 0.4;
            const [x1, y1] = P3(z, Math.sin(t) * 1.1, Math.cos(t) * 1.1), [x2, y2] = P3(z, -Math.sin(t) * 1.1, -Math.cos(t) * 1.1);
            A.line(x1, y1, x2, y2, { color: 'gold', width: 1.6, alpha: 0.75 });
          }
        }
        return;
      }
      const pts = [];
      for (let i = 0; i <= 80; i++) { const z = z0 + ((z1 - z0) * i) / 80, e = 1.25 * amp * Math.sin(5 * z - ph); pts.push(P3(z, Math.sin(a) * e, Math.cos(a) * e)); }
      A.path(pts, { color: 'gold', width: 2.2 });
      for (let i = 0; i <= 8; i++) {
        const z = z0 + ((z1 - z0) * i) / 8, e = 1.25 * amp * Math.sin(5 * z - ph), b = P3(z, 0, 0), q = P3(z, Math.sin(a) * e, Math.cos(a) * e);
        A.line(b[0], b[1], q[0], q[1], { color: 'gold', width: 1, alpha: 0.5 });
      }
      void si;
    });
    // the source
    A.circle(0.35, 0, 0.18, { fill: 'gold', alpha: 0.9, color: 'gold' });
    // the polarizers
    angs.forEach((a, i) => {
      const z = xs[i + 1], ring = [];
      for (let k = 0; k <= 60; k++) { const t = (2 * Math.PI * k) / 60; ring.push(P3(z, 1.55 * Math.sin(t), 1.55 * Math.cos(t))); }
      A.path(ring, { fill: 'accent', fillAlpha: 0.16, color: 'accent2', width: 1.6, close: true });
      for (let k = -4; k <= 4; k++) {                          // grid lines along the axis
        const o = (k / 4.6) * 1.55, l = Math.sqrt(Math.max(0, 1.55 * 1.55 - o * o));
        const c = Math.cos(a), s = Math.sin(a);
        const pA = P3(z, s * l + c * o, c * l - s * o), pB = P3(z, -s * l + c * o, -c * l - s * o);
        A.line(pA[0], pA[1], pB[0], pB[1], { color: 'accent2', width: k === 0 ? 2.4 : 0.8, alpha: k === 0 ? 1 : 0.5 });
      }
      if (P.labels) A.text(`${Math.round(deg(a))}°`, z, -1.9, { align: 'center', color: 'accent2', size: 11.5, weight: 600 });
    });
    // intensities
    if (P.labels) {
      A.text(input === 'unpolarized' ? 'unpolarized, I₀' : `polarized at ${Math.round(deg(input))}°, I₀`, 0.2, 1.85, { color: 'ink2', size: 11.5 });
      Is.forEach((I, i) => {
        const z = i + 1 < n ? (xs[i + 1] + xs[i + 2]) / 2 : (xs[i + 1] + 9.8) / 2;
        A.text(hide.has(`I${i + 1}`) ? '?' : `${trim(I, 3)} I₀`, z, 1.85, { align: 'center', color: 'gold', size: 12, weight: 650 });
      });
    }
    if (P.readout !== false) F.readout(Is.map((I, i) => [`after polarizer ${i + 1}`, hide.has(`I${i + 1}`) ? '?' : `${trim(I, 3)}\\,I_0`]));
  }

  // ── handles ─────────────────────────────────────────────────────────────
  if (mode === 'slits' && P.phasors !== false && P.controls !== false && !hide.has('probe')) {
    B.handle(() => [probeU ?? 0, Math.min(1.02, W.slitsIntensity(slitParams(), sinOf(probeU ?? 0)) + 0.06)], (x) => { const r = slitRange(); probeU = clamp(x, -r, r); F.notify('probe'); }, { hollow: true });
    B.onDrag = () => draw();
  }

  F.draw(draw);
  F.caption({
    slits: 'Far-field (Fraunhofer) patterns, computed by adding a phasor for every strip of every slit. The screen picture shows brightness as √intensity so the faint fringes are visible; the graph is true intensity, relative to the centre.',
    film: 'One non-absorbing layer, every internal bounce included (the Airy formula). Colours are computed from the reflected spectrum for even white light and brightened so that the brightest possible reflection shows as white. The rays are drawn slanted to separate them.',
    michelson: 'An ideal Michelson interferometer with a laser. The rings come from light crossing the instrument at slightly different angles; the mirror’s motion is drawn enormously exaggerated.',
    airy: 'Perfect optics with a filled, circular aperture and no atmosphere: each star becomes an Airy pattern, and the two add as intensities. Brightness in the picture is √intensity so the rings show. (The EHT is not a filled dish: it combines a few radio dishes, so this is only its best case.)',
    polar: 'Ideal polarizers. The yellow wave shows the direction and size of the electric field; unpolarized light is drawn as fields in many directions at once.',
  }[mode]);
  return { get: (k) => (k === 'probe' ? probeU : F.params[k]) };
}

/** Node-side check used by the content tests. */
export function validate(P0) {
  const problems = [];
  const mode = P0.mode ?? 'slits';
  if (!MODES.includes(mode)) return [`optics-waves: mode must be one of ${MODES.join(', ')}`];
  const P = { ...defaults, ...MODE_DEFAULTS[mode], ...P0 };
  const num = (k, lo, hi) => { if (!(typeof P[k] === 'number' && P[k] >= lo && P[k] <= hi)) problems.push(`optics-waves: ${k} must lie in [${lo}, ${hi}] (got ${P[k]})`); };
  if (!(P.controls === true || P.controls === false || Array.isArray(P.controls))) problems.push('optics-waves: controls must be true, false or a list of keys');
  if (!Array.isArray(P.hide)) problems.push('optics-waves: hide must be a list');
  if (mode === 'slits') {
    if (!(Number.isInteger(P.N) && P.N >= 1 && P.N <= 20)) problems.push('optics-waves: N must be a whole number from 1 to 20');
    num('a', 0, 200); num('d', 1, 1000); num('lambda', 380, 750); num('L', 0.2, 5);
    if (P.N === 1 && !(P.a > 0)) problems.push('optics-waves: a single slit needs a width a > 0');
    if (P.N >= 2 && P.a > P.d) problems.push('optics-waves: slits cannot be wider than their spacing');
    if (!['y', 'angle'].includes(P.axis)) problems.push('optics-waves: axis must be y or angle');
    if (!['laser', 'white'].includes(P.light)) problems.push('optics-waves: light must be laser or white');
    if (P.marks !== null && !['bright', 'dark', 'single'].includes(P.marks)) problems.push('optics-waves: marks must be null, bright, dark or single');
    if (P.range !== null && !(typeof P.range === 'number' && P.range > 0)) problems.push('optics-waves: range must be a positive number');
  } else if (mode === 'film') {
    num('t', 0, 1500); num('nFilm', 1, 2.5); num('nTop', 1, 2.5); num('nSub', 1, 2.5); num('angle', 0, 60);
    if (P.design !== null) num('design', 380, 750);
  } else if (mode === 'michelson') {
    num('maxL', 100, 20000); num('dL', 0, P.maxL); num('lambda', 400, 700); num('d0', 10, 5000);
  } else if (mode === 'airy') {
    if (!PRESETS[P.preset]) problems.push('optics-waves: preset must be eye, hubble, jwst, eht or custom');
    for (const [k, lo, hi] of [['D', 1e-3, 1.3e7], ['lambda', 1e-7, 1e-2], ['sep', 4.8e-12, 5e-3]]) if (P[k] !== null) num(k, lo, hi);
    if (![1, 4, 16].includes(P.zoom)) problems.push('optics-waves: zoom must be 1, 4 or 16');
  } else if (mode === 'polar') {
    if (![1, 2, 3].includes(P.n)) problems.push('optics-waves: n must be 1, 2 or 3');
    if (!(Array.isArray(P.angles) && P.angles.length >= P.n && P.angles.every((a) => typeof a === 'number' && a >= 0 && a <= 180))) problems.push('optics-waves: angles must list an angle in [0, 180] for each polarizer');
    if (!(P.input === 'unpolarized' || [0, 45].includes(P.input))) problems.push('optics-waves: input must be unpolarized, 0 or 45');
  }
  for (const k of ['readout', 'labels']) if (typeof P[k] !== 'boolean') problems.push(`optics-waves: ${k} must be true or false`);
  return problems;
}
