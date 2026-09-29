/* Campaign analysis: many runs at once.

   A single firing answers "what did it do?". A campaign answers "how does it
   behave?" — thrust against chamber pressure across a pressure sweep, impulse
   bit against pulse width, the scatter of ten nominally identical pulses.
   This module is the arithmetic: a catalogue of per-run quantities that can
   be plotted against each other, a least-squares straight line with honest
   uncertainties, and repeatability statistics. No DOM.

   A "run" here is anything with {id, plan, meta.config, metrics} — a run
   recorded this session, or its summary loaded from test history. */

/* Per-run quantities. `get` returns SI or NaN. `kind` limits a quantity to
   single burns or pulse trains. */
export const QUANTITIES_CATALOG = [
  { key: 'regSet', label: 'Regulator setpoint', q: 'pressure', get: r => r.meta?.config?.regSet },
  { key: 'supply', label: 'Supply pressure at record start', q: 'pressure', get: r => r.meta?.config?.supply },
  { key: 'Pc', label: 'Chamber pressure, steady (gauge)', q: 'pressure', kind: 'single', get: r => s(r).Pc },
  { key: 'PcAbs', label: 'Chamber pressure, steady (absolute)', q: 'pressure', kind: 'single', get: r => s(r).PcAbs },
  { key: 'Preg', label: 'Regulator outlet, steady', q: 'pressure', kind: 'single', get: r => s(r).Preg },
  { key: 'droop', label: 'Regulator droop', q: 'pressure', kind: 'single', get: r => s(r).droop },
  { key: 'F', label: 'Thrust, steady', q: 'force', kind: 'single', get: r => s(r).F },
  { key: 'mdot', label: 'Mass flow, MDOT-C (calculated)', q: 'massflow', kind: 'single', get: r => s(r).mdot },
  { key: 'mdotFM', label: 'Mass flow, FT-201 (measured)', q: 'massflow', kind: 'single', get: r => s(r).mdotFM },
  { key: 'Isp', label: 'Isp (MDOT-C)', q: 'isp', kind: 'single', get: r => s(r).Isp },
  { key: 'IspFM', label: 'Isp (FT-201)', q: 'isp', kind: 'single', get: r => s(r).IspFM },
  { key: 'Cf', label: 'Thrust coefficient (nominal At)', q: 'ratio', kind: 'single', get: r => s(r).Cf },
  { key: 'dThroat', label: 'Effective throat Ø (FT-201)', q: 'length', kind: 'single', get: r => s(r).dThroat },
  { key: 'I', label: 'Total impulse', q: 'impulse', get: r => s(r).I },
  { key: 'delay', label: 'Opening delay (single burn)', q: 'time', kind: 'single', get: r => s(r).delay },
  { key: 'sdelay', label: 'Shutdown delay (single burn)', q: 'time', kind: 'single', get: r => s(r).sdelay },
  { key: 'rise', label: 'Pc rise time 10→90 %', q: 'time', kind: 'single', get: r => s(r).rise },
  { key: 'width', label: 'Pulse width (commanded)', q: 'time', kind: 'pulse', get: r => (r.plan?.mode === 'pulse' ? r.plan.on : NaN) },
  { key: 'Ibit', label: 'Impulse bit (mean)', q: 'impulse', kind: 'pulse', get: r => s(r).Ibit },
  { key: 'IbitCv', label: 'Impulse-bit scatter (1σ / mean)', q: 'ratio', kind: 'pulse', get: r => s(r).IbitCv },
  { key: 'PcPk', label: 'Pulse peak chamber pressure', q: 'pressure', kind: 'pulse', get: r => s(r).PcPk },
  { key: 'pdelay', label: 'Opening delay (pulses)', q: 'time', kind: 'pulse', get: r => s(r).pdelay },
  { key: 'fracSteady', label: 'Fraction of pulses reaching steady Pc', q: 'ratio', kind: 'pulse', get: r => (s(r).n ? s(r).steady / s(r).n : NaN) },
];

const s = r => r.metrics?.summary || {};
const num = x => (typeof x === 'number' && Number.isFinite(x) ? x : NaN);

export function quantity(key) { return QUANTITIES_CATALOG.find(q => q.key === key); }

export function value(run, key) {
  const q = quantity(key);
  if (!q) return NaN;
  try { return num(q.get(run)); } catch { return NaN; }
}

export function runKind(run) {
  return run.plan?.mode === 'pulse' ? 'pulse' : run.metrics?.kind === 'pulse' ? 'pulse' : 'single';
}

/* Ordinary least squares y = a·x + b with standard errors and R².
   With fewer than three points the uncertainties are not defined. */
export function linfit(xs, ys) {
  const pts = xs.map((x, i) => [x, ys[i]]).filter(([x, y]) => Number.isFinite(x) && Number.isFinite(y));
  const n = pts.length;
  if (n < 2) return null;
  let sx = 0, sy = 0;
  for (const [x, y] of pts) { sx += x; sy += y; }
  const mx = sx / n, my = sy / n;
  let sxx = 0, sxy = 0, syy = 0;
  for (const [x, y] of pts) { sxx += (x - mx) ** 2; sxy += (x - mx) * (y - my); syy += (y - my) ** 2; }
  if (sxx === 0) return null;
  const a = sxy / sxx, b = my - a * mx;
  let sse = 0;
  const resid = pts.map(([x, y]) => { const r = y - (a * x + b); sse += r * r; return r; });
  const dof = n - 2;
  const se = dof > 0 ? Math.sqrt(sse / dof) : NaN;
  return {
    a, b, n, r2: syy > 0 ? 1 - sse / syy : 1,
    sa: dof > 0 ? se / Math.sqrt(sxx) : NaN,
    sb: dof > 0 ? se * Math.sqrt(1 / n + mx * mx / sxx) : NaN,
    se, resid, xMean: mx,
    at: x => a * x + b,
  };
}

/* Mean, sample standard deviation, coefficient of variation, range. */
export function stats(xs) {
  const v = xs.filter(Number.isFinite);
  const n = v.length;
  if (!n) return null;
  const mean = v.reduce((p, x) => p + x, 0) / n;
  const sd = n > 1 ? Math.sqrt(v.reduce((p, x) => p + (x - mean) ** 2, 0) / (n - 1)) : NaN;
  return { n, mean, sd, cv: mean !== 0 ? sd / Math.abs(mean) : NaN, min: Math.min(...v), max: Math.max(...v),
           // 95 % confidence half-width on the mean (Student t, small n)
           ci95: n > 1 ? tCrit(n - 1) * sd / Math.sqrt(n) : NaN };
}

function tCrit(dof) {
  const T = [12.71, 4.303, 3.182, 2.776, 2.571, 2.447, 2.365, 2.306, 2.262, 2.228, 2.201, 2.179, 2.160, 2.145, 2.131];
  return dof <= T.length ? T[dof - 1] : 1.96 + 2.4 / dof;
}

/* What a fit means, where the simulator knows how to read it. Returns lines
   of interpretation for the analysis view — the arithmetic an engineer would
   do next with the slope and intercept. */
export function interpret(xKey, yKey, fit, def) {
  if (!fit) return [];
  const out = [];
  const At = Math.PI / 4 * def.nominal.throatDia ** 2;
  const nz = def.physics.elements.find(e => e.type === 'nozzle')?.nozzle;
  const Ae = nz ? Math.PI / 4 * nz.exitDia ** 2 : NaN;
  const Pa = def.physics.ambient.P;
  if (yKey === 'F' && xKey === 'PcAbs') {
    out.push({ label: 'Slope / At  (≈ vacuum-like Cf, nominal At)', value: fit.a / At, q: 'ratio' });
    out.push({ label: 'Intercept (thrust at zero absolute Pc)', value: fit.b, q: 'force' });
    out.push({ label: '−Pa·Ae from the drawing (exit Ø)', value: -Pa * Ae, q: 'force',
               note: 'For attached flow F = k·Pc − Pa·Ae: the intercept is ambient pressure pushing on the exit area.' });
    out.push({ label: 'Exit Ø implied by the intercept', value: Math.sqrt(4 * Math.max(0, -fit.b) / (Math.PI * Pa)), q: 'length' });
  }
  if (yKey === 'F' && xKey === 'Pc') {
    out.push({ label: 'Slope / At (nominal At)', value: fit.a / At, q: 'ratio' });
    out.push({ label: 'Intercept at zero GAUGE Pc', value: fit.b, q: 'force',
               note: 'Not −Pa·Ae: at zero gauge pressure the chamber is still at one atmosphere. Plot against absolute Pc to read the exit area.' });
  }
  if ((yKey === 'mdotFM' || yKey === 'mdot') && xKey === 'PcAbs') {
    out.push({ label: 'Slope ṁ/Pc  (= Cd·At / c*)', value: fit.a, q: 'ratio', raw: true, unit: 'kg/(s·Pa)' });
    out.push({ label: 'Intercept (should be ≈ 0 for a choked throat)', value: fit.b, q: 'massflow' });
    if (yKey === 'mdot') out.push({ label: '', value: NaN, note: 'MDOT-C is computed from PT-401 with the nominal throat — this line is the DAQ\'s own formula, not a measurement.' });
  }
  if (yKey === 'droop' || (yKey === 'Preg' && xKey === 'regSet')) {
    out.push({ label: 'Slope', value: fit.a, q: 'ratio', note: 'Regulator characterisation: how outlet and droop change with setpoint.' });
  }
  if (yKey === 'Ibit' && xKey === 'width') {
    out.push({ label: 'Slope (≈ steady thrust once the valve is fully open)', value: fit.a, q: 'force' });
    out.push({ label: 'Width at zero impulse (x-intercept)', value: -fit.b / fit.a, q: 'time',
               note: 'An estimate of the dead time before thrust starts. Pulses shorter than it produce little or nothing: the minimum impulse bit.' });
  }
  return out;
}
