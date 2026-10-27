// A box of gas. Molecules (dots) fly about a three-dimensional box, seen from
// the front with its depth drawn in perspective-free oblique view; they bounce
// off the walls and off each other. Beside the box: the pressure their
// impacts on the walls produce, against nRT/V; and a live histogram of their
// speeds against the Maxwell–Boltzmann curve. Start every molecule at one
// speed and watch collisions spread them out; mix helium with xenon and watch
// the two kinds share energy until each has (3/2)k_BT on average. Physics in
// model/therm-gas.js (tested headlessly in test/therm-gas.test.mjs).
//
//   { type: 'therm-gas', params: {
//       gas: 'N2',              // H2 He N2 O2 Ar CO2 Xe, or a half-and-half mixture He+Xe He+Ar He+N2
//       T: 300,                 // temperature, K (20–2000)
//       N: 200,                 // dots (10–250); each stands for 2 × 10⁻⁴ mol
//       V: 1,                   // volume in litres (0.5–1), the box's width
//       start: 'mb',            // 'mb': already in equilibrium; 'equal': every molecule at one speed
//       controls: [],           // any of 'T' 'V' 'N' 'gas' 'start' 'play', or true for all
//       gases: null,            // the gases offered by the 'gas' control (default: just `gas`)
//       Tmin: 50, Tmax: 600,    // the temperature slider's range
//       hist: true,             // the speed histogram beside the box
//       curve: true,            // the Maxwell–Boltzmann curve over the histogram
//       marks: false,           // mark v_p, v̄ and v_rms on the histogram
//       gauge: true,            // the pressure bar beside the box
//       flashes: true,          // mark each impact on the right-hand wall
//       tag: null,              // the line over the box (default "N₂ · 300 K"); false hides it
//       readouts: null,         // live numbers, any of 'T' 'n' 'V' 'P' 'Pideal' 'vrms' 'KE' 'KEsp' 'KEth'
//                               // (default: T, P, nRT/V when there are controls; none otherwise)
//       vmax: null,             // the histogram's top speed, m/s (default: fitted to every gas and T on offer)
//       seed: 1,
//   } }

import { Plot, themeColors } from '../plot.js';
import * as G from '../model/therm-gas.js';

export const defaults = {
  gas: 'N2', T: 300, N: 200, V: 1, start: 'mb', controls: [], gases: null, Tmin: 50, Tmax: 600,
  hist: true, curve: true, marks: false, gauge: true, flashes: true, tag: null, readouts: null, vmax: null, seed: 1,
};
const ALL = ['T', 'V', 'N', 'gas', 'start', 'play'];
const READOUTS = ['T', 'n', 'V', 'P', 'Pideal', 'vrms', 'KE', 'KEsp', 'KEth'];
const SP_COL = ['accent', 'warn'];                     // mixtures: the light gas, the heavy gas
const K_OB = 0.3, ANG = Math.PI / 6;                   // the oblique view: depth drawn up and to the right
const OX = K_OB * Math.cos(ANG), OY = K_OB * Math.sin(ANG);
const trim = (x, n = 3) => String(+(+x).toPrecision(n));
const label = (k) => G.speciesOf(k).map((s) => s.formula).join(' + ');

/** A round number at or above x: 1, 2, 2.5, 5 × 10ⁿ. */
function niceUp(x) {
  const m = 10 ** Math.floor(Math.log10(x));
  return [1, 2, 2.5, 5, 10].map((k) => k * m).find((v) => v >= x * 0.999);
}

export function mount(F, P0) {
  const P = { ...defaults, ...P0 };
  const compact = F.compact;
  const controls = P.controls === true ? ALL : P.controls || [];
  const gases = P.gases || [P.gas];
  const Tlo = controls.includes('T') ? P.Tmin : P.T, Thi = controls.includes('T') ? P.Tmax : P.T;
  // one speed axis for every gas and temperature on offer, so changes show as moves, not rescalings
  const allSpecies = gases.flatMap((g) => G.speciesOf(g));
  const vmax = P.vmax ?? niceUp(G.histTop(allSpecies, Thi));
  const readouts = P.readouts ?? (controls.length ? ['T', 'P', 'Pideal'] : []);
  const reduced = () => document.documentElement.getAttribute('data-motion') === 'reduce' || !!globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const { canvas, box } = F.canvas({ aspect: P.aspect ?? (compact ? 'wide' : ''), label: P.alt || 'Gas molecules bouncing in a box, the pressure their impacts make, and a histogram of their speeds' });
  const ctx = canvas.getContext('2d');
  const hp = new Plot(canvas, { x: [0, vmax], y: [0, 1], xlabel: 'speed (m/s)', ylabel: 'share per 100 m/s', yticks: 4 });

  // controls
  if (controls.includes('gas') && gases.length > 1) F.choice({ key: 'gas', label: 'Gas', options: gases.map((g) => [g, label(g)]), value: P.gas, explain: gases.some((g) => G.MIXES[g]) ? 'A mixture is half one gas, half the other, by number of molecules.' : 'Molar masses: ' + gases.map((g) => G.speciesOf(g).map((s) => `${s.formula} ${trim(s.M, 3)} g/mol`).join(', ')).join('; ') + '.' });
  else F.params.gas = P.gas;
  if (controls.includes('T')) F.slider({ key: 'T', label: 'Temperature $T$', min: P.Tmin, max: P.Tmax, step: 5, value: P.T, unit: '\\mathrm{K}', explain: 'Sets the mean kinetic energy, $\\tfrac32 k_BT$ per molecule. Changing it rescales every speed by the same factor.' });
  else F.params.T = P.T;
  if (controls.includes('V')) F.slider({ key: 'V', label: 'Volume $V$', min: 0.5, max: 1, step: 0.05, value: P.V, unit: '\\mathrm{L}', explain: 'Moves the right-hand wall. The molecules keep their speeds, so the temperature stays put.' });
  else F.params.V = P.V;
  if (controls.includes('N')) F.slider({ key: 'N', label: 'Molecules (dots) $N$', min: 20, max: 250, step: 10, value: P.N, unit: '', explain: 'Each dot stands for $2\\times10^{-4}$ mol, about $1.2\\times10^{20}$ real molecules.' });
  else F.params.N = P.N;

  let S, bins, ymax, lastRead = -1, running = !reduced();
  function build(start, warm) {
    const gas = F.params.gas, T = F.params.T;
    const heavy = Math.max(...G.speciesOf(gas).map((s) => s.M));
    bins = Math.max(28, Math.min(84, Math.round((6 * vmax) / G.vmp(T, heavy))));
    S = G.createGas({ N: F.params.N, T, V: F.params.V, gas, start, seed: P.seed, bins, vmax });
    fitY();
    if (warm) for (let k = 0; k < Math.round(warm * 60); k++) G.advance(S, 1 / 60);
  }
  // the histogram's height: the tallest Maxwell–Boltzmann peak among the species, at half the starting temperature
  function fitY() {
    const Tref = Math.max(Tlo, 0.5 * F.params.T);
    ymax = 1.12 * Math.max(...S.species.map((s) => 100 * G.mbPdf(G.vmp(Tref, s.M), Tref, s.M)));
    if (!controls.includes('T')) ymax = 1.3 * Math.max(...S.species.map((s) => 100 * G.mbPdf(G.vmp(F.params.T, s.M), F.params.T, s.M)));
  }
  build(P.start, P.start === 'equal' ? 0 : 3);

  if (controls.includes('start')) {
    F.button({ label: 'All one speed', onClick: () => { G.setSpeeds(S, 'equal'); draw(); } });
    F.button({ label: 'Equilibrium speeds', onClick: () => { G.setSpeeds(S, 'mb'); draw(); } });
  }
  let loop = null;
  const step = (dt) => { if (running) G.advance(S, Math.min(dt, 1 / 30)); draw(); };
  loop = F.animate(step);
  if (controls.includes('play') || controls.includes('start')) {
    const btn = F.button({ label: running ? 'Pause' : 'Play', primary: !running, onClick: () => {
      running = !running;
      btn.textContent = running ? 'Pause' : 'Play';
      loop.stop();
      if (running) loop = F.animate(step, { force: true });
      else draw();
    } });
  }
  F.onChange((key) => {
    if (key === 'gas' || key === 'N') build('mb', 1.5);
    else if (key === 'T') { G.setTemperature(S, F.params.T); }
    else if (key === 'V') G.setVolume(S, F.params.V);
    draw();
  });

  function draw() {
    const c = themeColors();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = canvas.clientWidth || 600, H = canvas.clientHeight || 375;
    const narrow = W < 560 && P.hist;
    const want = narrow ? (compact ? '5 / 6' : '3 / 4') : '';
    if (box.style.aspectRatio !== want) { box.style.aspectRatio = want; requestAnimationFrame(draw); return; }
    if (canvas.width !== Math.round(W * dpr) || canvas.height !== Math.round(H * dpr)) { canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr); }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    hp.resize(); hp.refreshTheme();
    const font = (px, w = 500) => `${w} ${px}px Inter, system-ui, sans-serif`;

    // ── regions: the box (with its gauge) and the histogram, side by side or stacked
    const gaugeW = P.gauge ? 46 : 0, tagH = P.tag === false ? 6 : 24;
    const boxRegion = !P.hist ? { x: 0, y: 0, w: W, h: H } : narrow ? { x: 0, y: 0, w: W, h: Math.round(H * 0.56) } : { x: 0, y: 0, w: Math.round(W * 0.47), h: H };
    const r = S.d / 2, extW = 1 + 2 * r + OX * (1 + 2 * r), extH = 1 + 2 * r + OY * (1 + 2 * r);
    const s = Math.min((boxRegion.w - 20 - gaugeW) / extW, (boxRegion.h - tagH - 16) / extH);
    const left = boxRegion.x + Math.max(10, (boxRegion.w - gaugeW - s * extW) / 2);
    const bottom = boxRegion.y + tagH + 6 + s * extH;
    const pt = (x, y, z) => [left + s * (x + r + OX * (z + r)), bottom - s * (y + r + OY * (z + r))];
    const V = S.V;

    // the box: back edges, then the molecules far to near, then the front edges
    const edge = (a, b, color, wdt = 1, alpha = 1) => { ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = color; ctx.lineWidth = wdt; ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.stroke(); ctx.restore(); };
    const x0 = -r, x1 = V + r, y0 = -r, y1 = 1 + r, z0 = -r, z1 = 1 + r;
    const corners = (z) => [pt(x0, y0, z), pt(x1, y0, z), pt(x1, y1, z), pt(x0, y1, z)];
    const back = corners(z1), front = corners(z0);
    // the far wall, lightly filled so the box reads as a box in both themes
    ctx.save(); ctx.globalAlpha = 0.07; ctx.fillStyle = c.accent; ctx.beginPath(); back.forEach((p, i) => (i ? ctx.lineTo(...p) : ctx.moveTo(...p))); ctx.closePath(); ctx.fill(); ctx.restore();
    for (let i = 0; i < 4; i++) edge(back[i], back[(i + 1) % 4], c.ink4, 1);
    for (let i = 0; i < 4; i++) edge(back[i], front[i], c.ink4, 1);
    // the right-hand (movable) wall, shaded
    ctx.save(); ctx.globalAlpha = 0.1; ctx.fillStyle = c.ink2; ctx.beginPath();
    [pt(x1, y0, z0), pt(x1, y0, z1), pt(x1, y1, z1), pt(x1, y1, z0)].forEach((p, i) => (i ? ctx.lineTo(...p) : ctx.moveTo(...p)));
    ctx.closePath(); ctx.fill(); ctx.restore();

    const order = Array.from({ length: S.N }, (_, i) => i).sort((a, b) => S.z[b] - S.z[a]);
    const single = S.species.length === 1;
    const vp0 = G.vmp(S.T, S.species[0].M);
    const band = (v) => (v < 0.7 * vp0 ? 'teal' : v > 1.6 * vp0 ? 'warn' : 'accent');
    for (const i of order) {
      const [px, py] = pt(S.x[i], S.y[i], S.z[i]);
      const depth = S.z[i];
      ctx.globalAlpha = 0.95 - 0.45 * depth;
      ctx.fillStyle = c[single ? band(G.speedOf(S, i)) : SP_COL[S.sp[i]]];
      ctx.beginPath(); ctx.arc(px, py, Math.max(1.5, s * r * (1 - 0.15 * depth) * (single ? 1 : S.sp[i] ? 1.15 : 0.85)), 0, 2 * Math.PI); ctx.fill();
    }
    ctx.globalAlpha = 1;
    // impacts on the right-hand wall
    if (P.flashes) for (const hit of S.hitsRight) {
      const [px, py] = pt(x1, hit.y, hit.z), a = 1 - hit.age / 0.35;
      ctx.save(); ctx.globalAlpha = Math.max(0, a); ctx.strokeStyle = c.gold; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.arc(px, py, 3 + 9 * (1 - a), 0, 2 * Math.PI); ctx.stroke(); ctx.restore();
    }
    for (let i = 0; i < 4; i++) edge(front[i], front[(i + 1) % 4], c.ink3, 1.4);
    edge(pt(x1, y0, z0), pt(x1, y1, z0), controls.includes('V') ? c.ink : c.ink3, controls.includes('V') ? 3 : 1.4);

    // the line over the box
    if (P.tag !== false) {
      const tag = P.tag ?? `${label(S.gas)} · ${trim(S.T)} K${controls.includes('V') || S.V !== 1 ? ` · ${trim(S.V, 2)} L` : ''}`;
      ctx.fillStyle = c.ink2; ctx.font = font(12.5, 600); ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillText(tag, left, boxRegion.y + 6);
    }

    // the pressure bar: impacts (filled) against nRT/V (the tick)
    const Pm = G.measuredPressure(S), Pi = G.idealPressure(G.moles(S), S.T, G.volumeM3(S));
    if (P.gauge) {
      const [, gy0] = pt(x1, y0, z0), [, gy1] = pt(x1, y1, z0), gx = pt(x1, y0, z1)[0] + 16;
      const top = niceUp(1.25 * Pi / 1000) * 1000, hh = gy0 - gy1;
      ctx.save();
      ctx.strokeStyle = c.ink3; ctx.lineWidth = 1; ctx.strokeRect(gx, gy1, 12, hh);
      if (Pm !== null) { ctx.globalAlpha = 0.75; ctx.fillStyle = c.gold; const f = Math.min(1, Pm / top); ctx.fillRect(gx, gy0 - f * hh, 12, f * hh); }
      ctx.globalAlpha = 1; ctx.strokeStyle = c.ink; ctx.lineWidth = 2;
      const yi = gy0 - Math.min(1, Pi / top) * hh; ctx.beginPath(); ctx.moveTo(gx - 4, yi); ctx.lineTo(gx + 16, yi); ctx.stroke();
      ctx.fillStyle = c.ink2; ctx.font = font(11, 600); ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
      ctx.fillText('P', gx + 6, gy1 - 3);
      ctx.font = font(10); ctx.textBaseline = 'top'; ctx.fillText('0', gx + 6, gy0 + 3);
      ctx.textBaseline = 'bottom'; ctx.fillText(`${trim(top / 1000)} kPa`, gx + 6, gy1 - 15);
      ctx.restore();
    }

    // the speed histogram and the Maxwell–Boltzmann curve
    if (P.hist) {
      hp.o.pad = narrow ? { l: 52, r: 14, t: boxRegion.h + 18, b: 34 } : { l: boxRegion.w + 56, r: 14, t: 26, b: 34 };
      hp.setView([0, vmax], [0, ymax]);
      hp.grid(); hp.axes();
      const bw = S.vmax / S.bins;
      S.species.forEach((sp, k) => {
        const dens = G.histDensity(S, k);
        dens.forEach((p, b) => {
          const v0 = b * bw, hgt = 100 * p;
          if (hgt <= 0) return;
          const color = single ? band(v0 + bw / 2) : SP_COL[k];
          hp.rect(v0, 0, bw, Math.min(hgt, ymax), { color, alpha: single ? 0.42 : 0.32, width: 0.6 });
          if (hgt > ymax) hp.text('▲', v0 + bw / 2, ymax, { align: 'center', dy: 6, color, size: 10 });
        });
      });
      if (P.curve) S.species.forEach((sp, k) => hp.fn((v) => 100 * G.mbPdf(v, S.T, sp.M), { color: single ? 'ink' : SP_COL[k], width: 2.2, domain: [0, vmax] }));
      if (P.marks) {
        const M = S.species[0].M;
        [[G.vmp(S.T, M), 'vₚ', 'right', -3, 10], [G.vmean(S.T, M), 'v̄', 'center', 0, 26], [G.vrms(S.T, M), 'vᵣₘₛ', 'left', 3, 10]].forEach(([v, name, align, dx, dy]) => {
          hp.line(v, 0, v, ymax, { color: 'gold', width: 1.2, dash: [4, 4] });
          hp.text(name, v, ymax, { dx, dy, align, color: 'gold', size: 12, weight: 650 });
        });
      }
      ctx.fillStyle = c.ink2; ctx.font = font(11.5, 500); ctx.textAlign = 'right'; ctx.textBaseline = 'top';
      ctx.fillText(single ? 'bars: the box’s molecules · line: Maxwell–Boltzmann' : S.species.map((sp) => sp.formula).join(' and ') + ': bars measured · lines Maxwell–Boltzmann', W - 14, hp.T - 18);
    }

    // live numbers, a few times a second
    if (readouts.length && (S.time - lastRead > 0.2 || S.time < lastRead || !running)) {
      lastRead = S.time;
      const rows = [];
      const kE = (x) => `${(x * 1e21).toFixed(2)}\\times10^{-21}\\,\\mathrm{J}`;
      for (const k of readouts) {
        if (k === 'T') rows.push(['temperature $T$', `${trim(G.kineticTemperature(S))}\\,\\mathrm{K}`]);
        if (k === 'n') rows.push(['amount $n$', `${(+G.moles(S).toPrecision(3))}\\,\\mathrm{mol}`]);
        if (k === 'V') rows.push(['volume $V$', `${S.V.toFixed(2)}\\,\\mathrm{L}`]);
        if (k === 'P') rows.push(['$P$ from impacts', Pm === null ? '\\text{measuring…}' : `${trim(Pm / 1000)}\\,\\mathrm{kPa}`]);
        if (k === 'Pideal') rows.push(['$nRT/V$', `${trim(Pi / 1000)}\\,\\mathrm{kPa}`]);
        if (k === 'vrms') S.species.forEach((sp, j) => rows.push([`$v_\\text{rms}$${single ? '' : ' ' + sp.formula}`, `${Math.round(G.measuredVrms(S, j))}\\,\\mathrm{m/s}`]));
        if (k === 'KE') rows.push(['mean $\\tfrac12mv^2$', kE(G.meanKineticEnergy(S))]);
        if (k === 'KEsp') S.species.forEach((sp, j) => rows.push([`mean $\\tfrac12mv^2$ ${sp.formula}`, kE(G.meanKineticEnergy(S, j))]));
        if (k === 'KEth') rows.push(['$\\tfrac32k_BT$', kE(G.meanKE(S.T))]);
      }
      F.readout(rows);
    }
  }
  F.draw(draw);
  F.caption(`Each dot stands for about $1.2\\times10^{20}$ molecules, drawn enormously enlarged and slowed — but all in proportion: a dot twice as fast on screen is twice as fast in reality. Collisions are perfectly elastic. The dots’ own size pushes the measured pressure 1–4 % above $nRT/V$, inside the gauge’s jitter; real gases near room conditions miss it by less than 0.1 %. The model gas never condenses, though real xenon, oxygen and nitrogen would liquefy below 165 K, 90 K and 77 K at atmospheric pressure.`);
  return { get: (k) => F.params[k] };
}

/** Node-side check used by the content tests. */
export function validate(P0) {
  const P = { ...defaults, ...P0 }, problems = [];
  const ok = (g) => !!(G.GASES[g] || G.MIXES[g]);
  if (!ok(P.gas)) problems.push(`unknown gas “${P.gas}” (use ${[...Object.keys(G.GASES), ...Object.keys(G.MIXES)].join(', ')})`);
  if (P.gases && (!Array.isArray(P.gases) || !P.gases.every(ok) || !P.gases.includes(P.gas))) problems.push('gases must be a list of known gases that includes gas');
  if (!(P.T >= 20 && P.T <= 2000)) problems.push('T must be in [20, 2000] K');
  if (!(Number.isInteger(P.N) && P.N >= 10 && P.N <= 250)) problems.push('N must be a whole number in [10, 250]');
  if (!(P.V >= 0.5 && P.V <= 1)) problems.push('V must be in [0.5, 1] L');
  if (!['mb', 'equal'].includes(P.start)) problems.push('start must be mb or equal');
  const controls = P.controls === true ? ALL : P.controls || [];
  if (!Array.isArray(controls) || !controls.every((k) => ALL.includes(k))) problems.push(`controls must be true or a list of ${ALL.join(', ')}`);
  if (controls.includes('T') && !(P.Tmin < P.Tmax && P.T >= P.Tmin && P.T <= P.Tmax)) problems.push('T must lie in [Tmin, Tmax]');
  if (P.readouts !== null && !(Array.isArray(P.readouts) && P.readouts.every((k) => READOUTS.includes(k)))) problems.push(`readouts must be a list of ${READOUTS.join(', ')}`);
  if (P.vmax !== null && !(P.vmax > 0)) problems.push('vmax must be positive');
  return problems;
}
