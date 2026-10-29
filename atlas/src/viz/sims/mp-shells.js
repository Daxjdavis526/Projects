// Building atoms electron by electron. On the left, the subshells in the
// order they fill (bottom up: 1s, 2s, 2p, 3s …), each drawn as its 2l + 1
// orbitals — boxes — holding at most one spin-up and one spin-down electron:
// the exclusion principle; Hund’s rule puts one electron in each box before
// any pair. On the right, either the periodic table, built up to the present
// element and coloured by block (s, p, d, f), or the list of every
// electron’s four quantum numbers (n, l, m_l, m_s) — no two rows alike.
// Below, the measured first ionization energies against Z, with the present
// element marked. Configurations, exceptions and NIST ionization energies in
// model/mp-shells.js (tested in test/mp-shells.test.mjs).
//
//   { type: 'mp-shells', params: {
//       Z: 8,                 // the element (1–86)
//       minZ: 1, maxZ: 36,    // the slider’s range, and the ionization chart’s
//       panels: null,         // any of 'boxes', 'table', 'numbers', 'ie' (default: boxes, table, ie; compact: boxes)
//       full: null,           // draw every subshell from 1s (default: when maxZ ≤ 36); otherwise the noble-gas core is one block
//       controls: null,       // true, false, or a list of: Z
//       readout: true,
//       hide: [],             // any of: name (the element’s name and symbol), config (the configuration as text),
//                             //   ie (the present element’s ionization energy, and its point on the chart), unpaired
//   } }

import { Plot } from '../plot.js';
import * as S from '../model/mp-shells.js';

export const defaults = { Z: 8, minZ: 1, maxZ: 36, panels: null, full: null, controls: null, readout: true, hide: [] };
const CONTROLS = ['Z'];
const PANELS = ['boxes', 'table', 'numbers', 'ie'];
const HIDE = ['name', 'config', 'ie', 'unpaired'];
const BLOCK = { s: 'accent', p: 'good', d: 'gold', f: 'violet' };
const PERIOD_SUBSHELLS = { 1: ['1s'], 2: ['2s', '2p'], 3: ['3s', '3p'], 4: ['4s', '3d', '4p'], 5: ['5s', '4d', '5p'], 6: ['6s', '4f', '5d', '6p'] };
const L_OF = { s: 0, p: 1, d: 2, f: 3 };
const half = (ms) => (ms > 0 ? '+½' : '−½');

export function mount(F, P0) {
  const P = { ...defaults, ...P0 };
  const hide = new Set(P.hide || []);
  const wanted = P.controls === true || (P.controls === null && !F.compact) ? CONTROLS : Array.isArray(P.controls) ? P.controls : [];
  const panels = Array.isArray(P.panels) ? P.panels : F.compact ? ['boxes'] : ['boxes', 'table', 'ie'];
  const full = P.full ?? P.maxZ <= 36;
  const clampZ = (z) => Math.max(P.minZ, Math.min(P.maxZ, Math.round(z)));

  if (wanted.includes('Z')) {
    F.slider({ key: 'Z', label: 'Atomic number $Z$', min: P.minZ, max: P.maxZ, step: 1, value: P.Z, unit: '', explain: 'The number of protons in the nucleus — and of electrons in the neutral atom. Each step adds one of each.' });
    F.button({ label: '− one electron', onClick: () => F.set('Z', clampZ(F.params.Z - 1)) });
    F.button({ label: '+ one electron', onClick: () => F.set('Z', clampZ(F.params.Z + 1)) });
  } else F.params.Z = P.Z;

  const right = panels.includes('numbers') ? 'numbers' : panels.includes('table') ? 'table' : null;
  const both = panels.includes('boxes') && right;
  const top = panels.includes('boxes') || right ? F.canvas({ aspect: both ? '' : 'wide', label: P.alt || 'The subshells of an atom filled with electrons, two to an orbital with opposite spins' }) : null;
  const plot = top ? new Plot(top.canvas, { x: [0, 100], y: [0, 50], grid: false, axes: false, pad: { l: 0, r: 0, t: 0, b: 0 } }) : null;
  const iec = panels.includes('ie') && !hide.has('ie') ? F.canvas({ aspect: 'wide', label: 'First ionization energy against atomic number' }) : null;
  const iep = iec ? new Plot(iec.canvas, { x: [0.5, P.maxZ + 0.5], y: [0, 26], xlabel: 'atomic number Z', ylabel: 'first ionization energy (eV)', yticks: 6 }) : null;

  const Znow = () => clampZ(F.params.Z ?? P.Z);

  // ---- the subshells as boxes
  function rowsFor(Z) {
    if (full) {
      // every subshell up to the last one the slider can reach
      const need = S.configuration(P.maxZ).at(-1);
      const idx = S.ORDER.findIndex(([n, l]) => n === need.n && l === need.l);
      return S.ORDER.slice(0, idx + 1).map(([n, l]) => S.subshellName(n, l));
    }
    return PERIOD_SUBSHELLS[S.periodOf(Z)];
  }
  function drawBoxes(x0, x1, y0, y1, Z, fs) {
    const counts = new Map(S.configuration(Z).map((s) => [S.subshellName(s.n, s.l), s.count]));
    const rows = rowsFor(Z), core = full ? 0 : S.coreOf(Z);
    const slots = rows.length + (core ? 1 : 0);
    const rh = Math.min(12, (y1 - y0 - 4) / slots);
    const maxBoxes = Math.max(...rows.map((r) => 2 * L_OF[r[r.length - 1]] + 1));
    const b = Math.min(rh * 0.72, (x1 - x0 - 16) / (maxBoxes + 0.6));
    const lx = x0 + 1, bx = x0 + 7.5;
    const qn = S.quantumNumbers(Z), last = S.isException(Z) ? null : qn.at(-1);
    y0 += Math.max(0, (y1 - y0 - 4 - slots * rh) / 2);       // centre the stack
    let y = y0 + (core ? rh : 0);
    if (core) {
      plot.rect(bx, y0 + rh * 0.15, Math.min(x1 - bx - 1, (maxBoxes + 0.4) * b), rh * 0.7, { color: 'ink3', alpha: 0.12, width: 1, stroke: 'ink3' });
      plot.text(`[${S.symbol(core)}] core: ${core} electrons, every subshell full`, bx + 1.2, y0 + rh * 0.5, { color: 'ink2', size: fs - 0.5 });
    }
    for (const name of rows) {
      const l = L_OF[name[name.length - 1]], n = +name.slice(0, -1), c = counts.get(name) || 0;
      const yc = y + rh / 2;
      plot.text(name, lx, yc, { color: c ? 'ink' : 'ink4', weight: 650, size: fs + 1 });
      const bxs = S.boxes(l, c);
      bxs.forEach((bx_, i) => {
        const xb = bx + i * b * 1.04;
        plot.rect(xb, yc - b / 2, b, b, { color: c ? 'ink2' : 'ink4', alpha: 0, stroke: c ? 'ink2' : 'ink4', width: 1.2 });
        const isLast = (ms) => last && last.n === n && last.l === l && last.ml === bx_.ml && last.ms === ms;
        if (bx_.up) plot.arrow(xb + b * 0.33, yc - b * 0.36, xb + b * 0.33, yc + b * 0.38, { color: isLast(0.5) ? 'gold' : 'accent', width: isLast(0.5) ? 2.6 : 2, head: Math.max(5, b * 2) });
        if (bx_.down) plot.arrow(xb + b * 0.67, yc + b * 0.36, xb + b * 0.67, yc - b * 0.38, { color: isLast(-0.5) ? 'gold' : 'warn', width: isLast(-0.5) ? 2.6 : 2, head: Math.max(5, b * 2) });
      });
      if (c) plot.text(`${c}/${S.capacity(l)}`, bx + bxs.length * b * 1.04 + 0.8, yc, { color: c === S.capacity(l) ? 'ink3' : 'ink2', size: fs - 1 });
      y += rh;
    }
    plot.arrow(x0 + 4.6, y0 + 1, x0 + 4.6, y - 0.5, { color: 'ink4', width: 1, head: 6 });
    plot.text('filling order', x0 + 4.6, y + 0.6, { color: 'ink3', size: fs - 1.5, align: 'center' });
    if (S.isException(Z)) plot.text('a real exception to the filling order', bx, y + 2.6, { color: 'bad', size: fs - 1 });
  }

  // ---- the periodic table, built up to Z
  function drawTable(x0, x1, y0, y1, Z, fs) {
    const c = Math.min((x1 - x0) / 18, (y1 - y0) / 13.4);       // the table is 8.6 cells tall; the legend and title take 4.8 more
    const W = 18 * c, left = x0 + (x1 - x0 - W) / 2, topY = y0 + 8.6 * c;
    const px = (col) => left + (col - 1) * c, py = (row) => topY - (row === 8 ? 7.5 : row) * c;
    const cellPx = plot.X(c) - plot.X(0);
    for (let z = 1; z <= S.ZMAX; z++) {
      const { row, col } = S.position(z), blk = S.blockOf(z);
      const built = z <= Z, inRange = z <= P.maxZ;
      plot.rect(px(col) + 0.06 * c, py(row) + 0.06 * c, 0.88 * c, 0.88 * c, { color: BLOCK[blk], alpha: z === Z ? 0.85 : built ? 0.32 : 0.0, stroke: inRange ? (z === Z ? 'ink' : BLOCK[blk]) : 'ink4', width: z === Z ? 2 : 0.8 });
      if (cellPx >= 15 && (built || inRange)) plot.text(z === Z && hide.has('name') ? '?' : S.symbol(z), px(col) + c / 2, py(row) + c / 2, { color: z === Z ? 'void' : built ? 'ink' : 'ink3', align: 'center', size: Math.min(10.5, cellPx * 0.48), weight: z === Z ? 700 : 500, halo: false });
    }
    // the f-block strip belongs between groups 2 and 3 of period 6
    plot.text('f-block (lanthanum to ytterbium) sits in period 6, between groups 2 and 3', left + W / 2, py(8) - 0.55 * c, { color: 'ink3', align: 'center', size: fs - 2 });
    const legendY = topY + 0.9 * c;
    [['s', 's-block'], ['p', 'p-block'], ['d', 'd-block'], ['f', 'f-block']].forEach(([k, txt], i) => {
      const lx = left + i * (W / 4);
      plot.rect(lx, legendY - 0.35 * c, 0.7 * c, 0.7 * c, { color: BLOCK[k], alpha: 0.5, stroke: BLOCK[k], width: 1 });
      plot.text(txt, lx + 0.95 * c, legendY, { color: 'ink2', size: fs - 1.5 });
    });
    // the present element, large
    const el = S.element(Z);
    const ty = legendY + 3.6 * c;
    const title = hide.has('name') ? `Z = ${Z}: which element?` : `${Z} ${el.sym}: ${el.name}`;
    plot.text(title, left, ty, { color: 'ink', size: fs + 3, weight: 700 });
    if (!hide.has('config')) plot.text(S.configText(Z), left, ty - 1.9 * c, { color: 'ink2', size: fs + 1 });
  }

  // ---- every electron’s quantum numbers
  function drawNumbers(x0, x1, y0, y1, Z, fs) {
    const qn = S.quantumNumbers(Z);
    const perCol = Math.max(10, Math.ceil(qn.length / 2));
    const cols = qn.length > perCol ? 2 : 1;
    const rh = Math.min(4.2, (y1 - y0 - 4) / (perCol + 1));
    fs += 1;
    const cw = (x1 - x0) / 2;
    for (let k = 0; k < cols; k++) {
      const cx = x0 + k * cw, hy = y1 - 2;
      ['#', 'n', 'l', 'mₗ', 'mₛ'].forEach((h, j) => plot.text(h, cx + 2 + j * (cw - 4) / 5, hy, { color: 'ink3', size: fs - 0.5, weight: 650 }));
      for (let i = 0; i < perCol; i++) {
        const e = qn[k * perCol + i];
        if (!e) break;
        const y = hy - (i + 1) * rh, now = k * perCol + i === qn.length - 1;
        [String(k * perCol + i + 1), String(e.n), String(e.l), e.ml > 0 ? `+${e.ml}` : e.ml < 0 ? `−${-e.ml}` : '0', half(e.ms)].forEach((v, j) =>
          plot.text(v, cx + 2 + j * (cw - 4) / 5, y, { color: now ? 'gold' : j === 4 ? (e.ms > 0 ? 'accent' : 'warn') : 'ink', size: fs - 0.5, weight: now ? 700 : 500 }));
      }
    }
  }

  function drawTop() {
    if (!plot) return;
    const Z = Znow();
    const w = top.canvas.clientWidth || 600, h = top.canvas.clientHeight || 375;
    const H = (100 * h) / w;
    plot.setView([0, 100], [0, H]);
    plot.clear();
    const fs = w < 520 ? 9.5 : 11.5;
    const split = !right ? 100 : !panels.includes('boxes') ? 0 : right === 'numbers' ? 52 : 46;
    if (panels.includes('boxes')) drawBoxes(1, split - 1, 1.5, H - 1.5, Z, fs);
    if (right === 'table') drawTable(split + 1, 99, 1.5, H - 1.5, Z, fs);
    if (right === 'numbers') drawNumbers(split + 1, 99, 1.5, H - 1.5, Z, fs);
  }

  function drawIE() {
    if (!iep) return;
    const Z = Znow();
    iep.clear();
    const zs = Array.from({ length: P.maxZ }, (_, i) => i + 1);
    iep.path(zs.map((z) => [z, S.ionization(z)]), { color: 'ink4', width: 1.2 });
    for (const z of zs) iep.point(z, S.ionization(z), { color: BLOCK[S.blockOf(z)], r: z <= Z ? 3.4 : 2 });
    const narrow = (iec.canvas.clientWidth || 600) < 520;
    for (const z of [...S.NOBLE, 3, 11, 19, 37, 55]) if (z <= P.maxZ && (!narrow || S.NOBLE.includes(z))) iep.text(S.symbol(z), z, S.ionization(z), { color: 'ink2', dx: z === Z ? 12 : 0, dy: S.NOBLE.includes(z) ? -12 : 13, align: z === Z ? 'left' : 'center', size: narrow ? 9.5 : 11 });
    iep.line(Z, 0, Z, 26, { color: 'gold', width: 1.2, dash: [4, 4] });
    iep.point(Z, S.ionization(Z), { color: 'gold', r: 6, ring: 'ink' });
  }

  let last = '';
  function readout() {
    if (P.readout === false) return;
    const Z = Znow();
    if (String(Z) === last) return;
    last = String(Z);
    const el = S.element(Z);
    F.readout([
      ['element', hide.has('name') ? `Z = ${Z}` : `${Z}\\ \\text{${el.name}}\\ (\\mathrm{${el.sym}})`],
      ['ground state', hide.has('config') ? '?' : S.configTeX(Z)],
      ['unpaired electrons', hide.has('unpaired') ? '?' : String(S.unpaired(Z))],
      ['first ionization energy', hide.has('ie') ? '?' : `${el.ie.toFixed(2)}\\,\\mathrm{eV}`],
    ]);
  }

  function drawAll() { readout(); drawTop(); drawIE(); }
  F.onChange(() => drawAll());
  F.draw(drawAll);
  F.caption(P.caption || `Boxes are orbitals (one per value of mₗ), arrows are electrons (up: mₛ = +½, down: −½); the newest electron is gold. Subshells are stacked in the order they fill (n + l, then n), which is a bookkeeping rule, not an energy scale: once 3d holds electrons it lies below 4s. Ground states and first ionization energies from the NIST Atomic Spectra Database, exceptions included.`);
  return { get: (k) => F.params[k] };
}

export function validate(P) {
  const p = [];
  const okZ = (z) => Number.isInteger(z) && z >= 1 && z <= S.ZMAX;
  if (!okZ(P.Z)) p.push(`mp-shells: Z must be an integer 1–${S.ZMAX}`);
  if (!okZ(P.minZ) || !okZ(P.maxZ) || P.minZ > P.maxZ) p.push('mp-shells: minZ and maxZ must be integers with 1 ≤ minZ ≤ maxZ ≤ 86');
  else if (P.Z < P.minZ || P.Z > P.maxZ) p.push('mp-shells: Z must lie between minZ and maxZ');
  if (P.full && P.maxZ > 36) p.push('mp-shells: full (every subshell from 1s) is for maxZ ≤ 36');
  for (const x of P.panels || []) if (!PANELS.includes(x)) p.push(`mp-shells: unknown panel “${x}”`);
  for (const h of P.hide || []) if (!HIDE.includes(h)) p.push(`mp-shells: unknown hide “${h}”`);
  if (Array.isArray(P.controls)) for (const c of P.controls) if (!CONTROLS.includes(c)) p.push(`mp-shells: unknown control “${c}”`);
  return p;
}
