/* Units. Everything inside the simulator is SI: pascals (absolute unless a
   name says gauge), kelvin, newtons, kg/s, seconds. Conversion happens only
   at the edge — stand definitions (which are easier to read in the units a
   test engineer would write them in) and the display.

   No DOM here: the headless tests import this. */

export const PSI = 6894.757293168;        // Pa per psi
export const BAR = 1e5;
export const G0 = 9.80665;                // m/s^2, standard gravity (for Isp)
export const P_STD = 101325;              // Pa
export const LBF = 4.4482216152605;       // N per lbf
export const LBM = 0.45359237;            // kg per lbm
export const IN = 0.0254;                 // m per inch

/* Stand-definition helpers: write "psi(150)" and mean 150 psi as a pressure
   difference in pascals. Gauge-to-absolute is the stand's job, since it
   knows its ambient pressure. */
export const psi = x => x * PSI;
export const bar = x => x * BAR;
export const degC = x => x + 273.15;
export const mm = x => x * 1e-3;
export const cc = x => x * 1e-6;          // cm^3 -> m^3
export const litre = x => x * 1e-3;

/* ---- display ----------------------------------------------------------- */

/* Each measured quantity has an SI base and a set of display units. `to`
   converts from SI; `dp` is the decimal places a readout shows, chosen so the
   last digit is roughly at the noise floor of a typical sensor — a readout
   with more digits than the sensor can resolve teaches a false precision. */
export const QUANTITIES = {
  pressure: {
    base: 'Pa',
    units: {
      psi: { to: v => v / PSI, from: v => v * PSI, dp: 1, label: 'psi' },
      bar: { to: v => v / BAR, from: v => v * BAR, dp: 3, label: 'bar' },
      kPa: { to: v => v / 1e3, from: v => v * 1e3, dp: 1, label: 'kPa' },
    },
  },
  force: {
    base: 'N',
    units: {
      N:   { to: v => v, from: v => v, dp: 2, label: 'N' },
      lbf: { to: v => v / LBF, from: v => v * LBF, dp: 3, label: 'lbf' },
    },
  },
  temperature: {
    base: 'K',
    units: {
      C: { to: v => v - 273.15, from: v => v + 273.15, dp: 1, label: '°C' },
      K: { to: v => v, from: v => v, dp: 1, label: 'K' },
      F: { to: v => (v - 273.15) * 1.8 + 32, from: v => (v - 32) / 1.8 + 273.15, dp: 1, label: '°F' },
    },
  },
  massflow: {
    base: 'kg/s',
    units: {
      'g/s':   { to: v => v * 1e3, from: v => v / 1e3, dp: 2, label: 'g/s' },
      'lbm/s': { to: v => v / LBM, from: v => v * LBM, dp: 4, label: 'lbm/s' },
    },
  },
  mass: {
    base: 'kg',
    units: {
      kg:  { to: v => v, from: v => v, dp: 3, label: 'kg' },
      g:   { to: v => v * 1e3, from: v => v / 1e3, dp: 1, label: 'g' },
      lbm: { to: v => v / LBM, from: v => v * LBM, dp: 4, label: 'lbm' },
    },
  },
  velocity: { base: 'm/s', units: { 'm/s': { to: v => v, from: v => v, dp: 1, label: 'm/s' } } },
  current:  { base: 'A', units: { A: { to: v => v, from: v => v, dp: 3, label: 'A' } } },
  voltage:  { base: 'V', units: { V: { to: v => v, from: v => v, dp: 2, label: 'V' } } },
  discrete: { base: '', units: { '': { to: v => v, from: v => v, dp: 0, label: '' } } },
  time:     { base: 's', units: { s: { to: v => v, from: v => v, dp: 3, label: 's' } } },
  length:   { base: 'm', units: { mm: { to: v => v * 1e3, from: v => v / 1e3, dp: 3, label: 'mm' } } },
  impulse:  { base: 'N·s', units: { 'N·s': { to: v => v, from: v => v, dp: 3, label: 'N·s' },
                                    'lbf·s': { to: v => v / LBF, from: v => v * LBF, dp: 4, label: 'lbf·s' } } },
  isp:      { base: 's', units: { s: { to: v => v, from: v => v, dp: 1, label: 's' } } },
  ratio:    { base: '', units: { '': { to: v => v, from: v => v, dp: 3, label: '' } } },
  accel:    { base: 'g', units: { g: { to: v => v, from: v => v, dp: 2, label: 'g' } } },
  area:     { base: 'm²', units: { 'mm²': { to: v => v * 1e6, from: v => v / 1e6, dp: 3, label: 'mm²' } } },
  rate:     { base: 'Pa/s', units: { 'psi/min': { to: v => v / PSI * 60, from: v => v * PSI / 60, dp: 2, label: 'psi/min' } } },
};

/* The operator's display preferences. Mutable; the UI owns it. */
export const DISPLAY = {
  pressure: 'psi',
  force: 'N',
  temperature: 'C',
  massflow: 'g/s',
  mass: 'kg',
  velocity: 'm/s',
  current: 'A',
  voltage: 'V',
  discrete: '',
  time: 's',
  length: 'mm',
  impulse: 'N·s',
  isp: 's',
  ratio: '',
  area: 'mm²',
  accel: 'g',
  rate: 'psi/min',
};

export function unitOf(quantity) {
  const q = QUANTITIES[quantity];
  if (!q) return { to: v => v, from: v => v, dp: 2, label: '' };
  return q.units[DISPLAY[quantity]] || Object.values(q.units)[0];
}

/* Convert an SI value to the display unit. */
export const toDisplay = (v, quantity) => unitOf(quantity).to(v);
export const fromDisplay = (v, quantity) => unitOf(quantity).from(v);

/* Unit label, with a g/a suffix on pressure when the caller knows which. */
export function unitLabel(quantity, gauge) {
  const u = unitOf(quantity);
  if (quantity === 'pressure' && gauge !== undefined && u.label !== 'kPa') return u.label + (gauge ? 'g' : 'a');
  return u.label;
}

export function fmt(v, quantity, dpOverride) {
  if (v === null || v === undefined || Number.isNaN(v)) return '----';
  const u = unitOf(quantity);
  const x = u.to(v);
  const dp = dpOverride ?? u.dp;
  if (!Number.isFinite(x)) return x > 0 ? 'OVR' : 'UNR';
  return x.toFixed(dp);
}

/* Sim-time formatting: T-00:05.000 style for test time, HH:MM:SS for wall. */
export function fmtT(t, dp = 2) {
  if (t === null || t === undefined || Number.isNaN(t)) return 'T  --:--.--';
  const sign = t < 0 ? '−' : '+';
  const a = Math.abs(t);
  const m = Math.floor(a / 60);
  const s = a - m * 60;
  return `T${sign}${String(m).padStart(2, '0')}:${s.toFixed(dp).padStart(3 + dp, '0')}`;
}

export function fmtClock(seconds) {
  const s = Math.floor(seconds);
  const h = Math.floor(s / 3600) % 24, m = Math.floor(s / 60) % 60, ss = s % 60;
  return [h, m, ss].map(x => String(x).padStart(2, '0')).join(':');
}
