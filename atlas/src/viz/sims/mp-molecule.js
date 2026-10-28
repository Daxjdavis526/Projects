// A diatomic molecule’s spectrum and the levels that make it. Above: the
// rotational ladders — J = 0, 1, 2 … — of the ground vibrational level and,
// for the infrared band, of the first excited one, with every allowed
// absorption (ΔJ = ±1) as an arrow: the P branch (J → J − 1) and the R
// branch (J → J + 1). Below: the spectrum those arrows make — sticks at their
// wavenumbers (or frequencies), heights set by the Boltzmann populations at
// temperature T — for the main isotopologue and, fainter, its heavier
// partner (H³⁷Cl beside H³⁵Cl, D³⁷Cl beside D³⁵Cl, ¹³CO beside ¹²CO).
// Constants from Huber & Herzberg; physics in model/mp-molecule.js (tested in
// test/mp-molecule.test.mjs).
//
//   { type: 'mp-molecule', params: {
//       molecule: 'HCl',      // 'HCl', 'DCl' or 'CO'
//       mode: 'ir',           // 'ir' (the fundamental vibration–rotation band) or 'microwave' (pure rotation)
//       T: 300,               // temperature, K (5–1000; the slider runs 20–1000)
//       isotopes: true,       // also draw the heavier isotopologue’s lines
//       line: null,           // a line to highlight: in 'ir' the signed m (R(J): m = J + 1; P(J): m = −J); in 'microwave' the lower J
//       Jmax: 7,              // the highest J drawn in the ladders (3–10)
//       panels: null,         // any of 'levels', 'spectrum' (default both)
//       controls: null,       // true, false, or a list of: molecule mode T isotopes
//       readout: true,
//       hide: [],             // any of: numbers (the spectrum’s axis numbers and the highlighted line’s position), labels (P/R names on the sticks)
//   } }

import { Plot } from '../plot.js';
import * as M from '../model/mp-molecule.js';

export const defaults = { molecule: 'HCl', mode: 'ir', T: 300, isotopes: true, line: null, Jmax: 7, panels: null, controls: null, readout: true, hide: [] };
const CONTROLS = ['molecule', 'mode', 'T', 'isotopes'];
const PANELS = ['levels', 'spectrum'];
const HIDE = ['numbers', 'labels'];
const PAIRS = { HCl: ['HCl35', 'HCl37'], DCl: ['DCl35', 'DCl37'], CO: ['CO', 'CO13'] };

export function mount(F, P0) {
  const P = { ...defaults, ...P0 };
  const hide = new Set(P.hide || []);
  const wanted = P.controls === true || (P.controls === null && !F.compact) ? CONTROLS : Array.isArray(P.controls) ? P.controls : [];
  const panels = Array.isArray(P.panels) ? P.panels : PANELS;
  const Jmax = P.Jmax;

  if (wanted.includes('molecule')) F.choice({ key: 'molecule', label: 'Molecule', options: [['HCl', 'HCl'], ['DCl', 'DCl'], ['CO', 'CO']], value: P.molecule, explain: 'Hydrogen chloride, its deuterium twin, or carbon monoxide.' });
  else F.params.molecule = P.molecule;
  if (wanted.includes('mode')) F.choice({ key: 'mode', label: 'Spectrum', options: [['ir', 'infrared band (vibration + rotation)'], ['microwave', 'microwave (rotation only)']], value: P.mode, explain: 'The fundamental band v = 1 ← 0, or pure rotational lines within v = 0.' });
  else F.params.mode = P.mode;
  if (wanted.includes('T')) F.slider({ key: 'T', label: 'Temperature $T$', min: 20, max: 1000, value: P.T, logScale: true, unit: '\\mathrm{K}', fmt: (v) => String(Math.round(v)), explain: 'Sets the Boltzmann populations of the rotational levels, and so the heights of the lines. Logarithmic.' });
  else F.params.T = P.T;
  if (wanted.includes('isotopes')) F.toggle({ key: 'isotopes', label: 'Show the heavier isotopologue', value: P.isotopes, explain: 'Same bond, heavier atom: a smaller reduced mass ratio shifts every line.' });
  else F.params.isotopes = P.isotopes;

  const top = panels.includes('levels') ? F.canvas({ aspect: 'wide', label: P.alt || 'Rotational energy ladders of a diatomic molecule with its allowed transitions' }) : null;
  const plot = top ? new Plot(top.canvas, { x: [0, 100], y: [0, 50], grid: false, axes: false, pad: { l: 0, r: 0, t: 0, b: 0 } }) : null;
  const bot = panels.includes('spectrum') ? F.canvas({ aspect: 'wide', label: 'The absorption spectrum' }) : null;
  const splot = bot ? new Plot(bot.canvas, { x: [0, 1], y: [0, 1.25], xlabel: '', ylabel: 'relative absorption', yticks: 0, axesAt: 'edge', grid: false }) : null;

  const now = () => {
    const pair = PAIRS[F.params.molecule] || PAIRS.HCl, T = Math.min(1000, Math.max(5, F.params.T));
    const mode = F.params.mode === 'microwave' ? 'microwave' : 'ir';
    const main = M.constants(pair[0]), iso = M.constants(pair[1]);
    return { pair, T, mode, main, iso, iso_on: !!F.params.isotopes };
  };
  const linesOf = (c, S) => (S.mode === 'ir' ? M.band(c, S.T, 30) : M.rotation(c, S.T, 30).map((l) => ({ ...l, branch: 'J', m: l.J })));
  const name = (l) => (l.branch === 'J' ? `${l.J + 1}←${l.J}` : `${l.branch}(${l.J})`);
  const selected = (l) => P.line !== null && l.m === P.line;

  function drawLevels() {
    if (!plot) return;
    const S = now(), c = S.main;
    const w = top.canvas.clientWidth || 600, h = top.canvas.clientHeight || 300, H = (100 * h) / w;
    plot.setView([0, 100], [0, H]);
    plot.clear();
    const fs = w < 520 ? 9 : 11;
    const x0 = 13, x1 = 97;
    const ladders = S.mode === 'ir' ? [[0, 3.6, H * 0.44], [1, H * 0.54, H - 3]] : [[0, 4, H - 4]];
    const yOf = {};
    for (const [v, ya, yb] of ladders) {
      const top_ = M.F(c, v, Jmax);
      yOf[v] = (J) => ya + ((yb - ya) * M.F(c, v, J)) / top_;
      for (let J = 0; J <= Jmax; J++) {
        const y = yOf[v](J);
        plot.line(x0, y, x1, y, { color: 'ink3', width: 1.2 });
        if (J === 0 || (w >= 520 && (yOf[v](J) - yOf[v](J - 1)) > 2.2) || (w < 520 && J === Jmax)) plot.text(`J = ${J}`, x0 - 1, y, { color: 'ink3', align: 'right', size: fs - 1.5 });
      }
      plot.text(S.mode === 'ir' ? `v = ${v}` : 'v = 0', 1, (ya + yb) / 2, { color: 'ink2', size: fs, weight: 650 });
    }
    if (S.mode === 'ir') plot.text(`gap of ${Math.round(M.origin(c))} cm⁻¹, not to scale`, 1, H * 0.49, { color: 'ink3', size: fs - 2 });
    // the transitions, ordered left to right like the spectrum
    const L = linesOf(c, S).filter((l) => (S.mode === 'ir' ? (l.branch === 'R' ? l.J + 1 <= Jmax : l.J <= Jmax) : l.J + 1 <= Jmax));
    L.forEach((l, k) => {
      const x = x0 + 3 + (k + 0.5) * ((x1 - x0 - 6) / L.length);
      const [vl, Jl, vu, Ju] = S.mode === 'ir' ? [0, l.J, 1, l.branch === 'R' ? l.J + 1 : l.J - 1] : [0, l.J, 0, l.J + 1];
      const col = selected(l) ? 'gold' : l.branch === 'P' ? 'warn' : 'accent';
      plot.arrow(x, yOf[vl](Jl), x, yOf[vu](Ju), { color: col, width: selected(l) ? 3 : 1.6, head: 6 });
      if (!hide.has('labels') && (L.length <= 16 || k % 2 === 0)) plot.text(name(l), x, yOf[vu](Ju), { color: col, align: 'center', dy: -8, size: fs - 2 });
    });
    if (S.mode === 'ir') {
      plot.text('P branch: J → J − 1', x0 + 2, 1.2, { color: 'warn', size: fs - 1 });
      plot.text('R branch: J → J + 1', x1 - 2, 1.2, { color: 'accent', size: fs - 1, align: 'right' });
    }
  }

  function drawSpectrum() {
    if (!splot) return;
    const S = now();
    const main = linesOf(S.main, S), iso = S.iso_on ? linesOf(S.iso, S) : [];
    const top = Math.max(...main.map((l) => l.I));
    const visible = main.filter((l) => l.I > 0.004 * top);
    const xs = S.mode === 'ir' ? visible.map((l) => l.nu) : visible.map((l) => l.ghz);
    const span = Math.max(...xs) - Math.min(...xs) || 1;
    const lo = S.mode === 'ir' ? Math.min(...xs) - 0.06 * span : 0, hi = Math.max(...xs) + 0.06 * span;
    splot.o.xlabel = S.mode === 'ir' ? 'wavenumber (cm⁻¹)' : 'frequency (GHz)';
    splot.o.xticks = hide.has('numbers') ? 0 : undefined;
    splot.setView([lo, hi], [0, 1.25]);
    splot.clear();
    const X = (l) => (S.mode === 'ir' ? l.nu : l.ghz);
    if (S.mode === 'ir') {
      const o = M.origin(S.main);
      splot.line(o, 0, o, 1.15, { color: 'ink4', width: 1, dash: [4, 4] });
      splot.text('band origin: no line', o, 1.15, { color: 'ink3', align: 'center', dy: -2, size: 10.5 });
    }
    for (const l of iso) if (X(l) >= lo && X(l) <= hi) splot.line(X(l), 0, X(l), l.I / top, { color: 'violet', width: 1.6, alpha: 0.8 });
    for (const l of main) {
      if (X(l) < lo || X(l) > hi) continue;
      const col = selected(l) ? 'gold' : l.branch === 'P' ? 'warn' : 'accent';
      splot.line(X(l), 0, X(l), l.I / top, { color: col, width: selected(l) ? 3.2 : 2.2 });
      const nar = (bot.canvas.clientWidth || 600) < 520;
      if (!hide.has('labels') && l.I > (nar ? 0.45 : 0.12) * top && (!nar || l.J % 2 === 1 || l.branch === 'J')) splot.text(name(l), X(l), l.I / top, { color: col, align: 'center', dy: -9, size: nar ? 9 : 10 });
    }
    const narrowS = (bot.canvas.clientWidth || 600) < 520;
    if (S.iso_on) splot.text(`violet: ${S.iso.label}`, narrowS ? lo : hi, 1.18, { color: 'violet', align: narrowS ? 'left' : 'right', dx: narrowS ? 4 : 0, size: 10.5 });
  }

  let last = '';
  function readout() {
    if (P.readout === false) return;
    const S = now(), key = [S.pair[0], S.mode, Math.round(S.T)].join();
    if (key === last) return;
    last = key;
    const L = linesOf(S.main, S), best = L.reduce((a, b) => (b.I > a.I ? b : a));
    const sel = P.line === null ? null : L.find((l) => l.m === P.line);
    const at = (l) => (S.mode === 'ir' ? `${l.nu.toFixed(2)}\\,\\mathrm{cm^{-1}}` : `${l.ghz.toFixed(3)}\\,\\mathrm{GHz}`);
    F.readout([
      ['molecule', `\\text{${S.main.label}}`],
      S.mode === 'ir' ? ['band origin', hide.has('numbers') ? '?' : `${M.origin(S.main).toFixed(2)}\\,\\mathrm{cm^{-1}}`] : ['$B_0$', hide.has('numbers') ? '?' : `${(M.Bv(S.main, 0) * M.GHZ_PER_CM).toFixed(3)}\\,\\mathrm{GHz}`],
      ['strongest line', `\\text{${name(best)}}`],
      sel ? [`\\text{${name(sel)}}`, hide.has('numbers') ? '?' : at(sel)] : null,
    ]);
  }

  function drawAll() { readout(); drawLevels(); drawSpectrum(); }
  F.onChange(() => drawAll());
  F.draw(drawAll);
  F.caption(P.caption || 'Constants from Huber & Herzberg; the heavier isotopologue’s are scaled by its reduced mass. Line heights are relative: Boltzmann populations of the lower levels at the chosen temperature times the standard line-strength factors and the natural abundances (³⁵Cl 76%, ³⁷Cl 24%; ¹³C 1.1%, drawn at that strength). Real lines also have widths, set by pressure and the Doppler effect.');
  return { get: (k) => F.params[k] };
}

export function validate(P) {
  const p = [];
  if (!PAIRS[P.molecule]) p.push(`mp-molecule: unknown molecule “${P.molecule}”`);
  if (!['ir', 'microwave'].includes(P.mode)) p.push('mp-molecule: mode must be ir or microwave');
  if (!(P.T >= 5 && P.T <= 1000)) p.push('mp-molecule: T must lie in 5–1000 K');
  if (!(Number.isInteger(P.Jmax) && P.Jmax >= 3 && P.Jmax <= 10)) p.push('mp-molecule: Jmax must be an integer 3–10');
  if (P.line !== null && P.mode === 'ir' && !(Number.isInteger(P.line) && P.line !== 0 && Math.abs(P.line) <= P.Jmax)) p.push('mp-molecule: in ir mode, line is a nonzero integer m within ±Jmax (or null)');
  if (P.line !== null && P.mode === 'microwave' && !(Number.isInteger(P.line) && P.line >= 0 && P.line < P.Jmax)) p.push('mp-molecule: in microwave mode, line is the lower J, 0 to Jmax − 1');
  for (const x of P.panels || []) if (!PANELS.includes(x)) p.push(`mp-molecule: unknown panel “${x}”`);
  for (const h of P.hide || []) if (!HIDE.includes(h)) p.push(`mp-molecule: unknown hide “${h}”`);
  if (Array.isArray(P.controls)) for (const c of P.controls) if (!CONTROLS.includes(c)) p.push(`mp-molecule: unknown control “${c}”`);
  return p;
}
