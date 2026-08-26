/* Headless physics validation — runs in Node with no DOM and no three.js.
   This existing at all is the proof that the physics/render seam is clean. */
import { SimClock } from '../src/time/clock.js';
import { Engine } from '../src/physics/engine.js';
import { MODELS } from '../src/physics/models.js';
import { M_SUN, RHO_NUC } from '../src/config.js';

const YR = 3.15576e7, DAY = 86400;
let failures = 0;
const check = (label, cond, detail = '') => {
  console.log((cond ? '  ok   ' : '  FAIL ') + label + (detail ? '  — ' + detail : ''));
  if (!cond) failures++;
};

/* ---- core-collapse scenario ---- */
{
  const model = MODELS.ccsn15;
  const clock = new SimClock(model);
  const eng = new Engine(model, clock);

  const rows = [];
  let tPrev = -Infinity, monotonic = true;
  let rhoPeak = 0, shockStallMin = Infinity, shockStallMax = 0;
  for (let i = 0; i <= 2000; i++) {
    const u = i / 2000;
    const t = clock.tOfU(u);
    eng.stepTo(t);
    const s = eng.snapshot();
    if (s.t < tPrev - 1e-9) monotonic = false;
    tPrev = s.t;
    rhoPeak = Math.max(rhoPeak, s.rho_c);
    if (s.phase === 'stall' && s.t > 0.05 && s.t < 0.2) {
      shockStallMin = Math.min(shockStallMin, s.R_shock);
      shockStallMax = Math.max(shockStallMax, s.R_shock);
    }
    rows.push({ u, t: s.t, phase: s.phase, rho_c: s.rho_c, R_shock: s.R_shock,
                L_nu: s.L_nu, E_expl: s.E_expl, M_ni: s.M_ni, L_em: s.L_em,
                R_star: s.R_star, R_pns: s.R_pns, R_fwd: s.R_fwd });
  }

  check('time monotonic over full sweep', monotonic);
  check('rho_c peaks at 1-3x nuclear', rhoPeak > RHO_NUC && rhoPeak < 3 * RHO_NUC,
        (rhoPeak / RHO_NUC).toFixed(2) + 'x rho_nuc');

  const preBounce = rows.filter(r => r.t < -0.001);
  check('pre-bounce rho_c stays below nuclear',
        preBounce.every(r => r.rho_c < RHO_NUC * 1.2));

  check('shock stalls at 100-250 km', shockStallMin > 1.0e7 && shockStallMax < 2.5e7,
        (shockStallMin / 1e5).toFixed(0) + '-' + (shockStallMax / 1e5).toFixed(0) + ' km');

  const burst = rows.filter(r => r.t > 0 && r.t < 0.01);
  check('neutrino burst reaches ~1e53 erg/s', Math.max(...burst.map(r => r.L_nu)) > 1e53);

  const late = rows.at(-1);
  check('E_expl reaches ~1e51 erg', Math.abs(Math.log10(rows.find(r => r.t > 100)?.E_expl / 1e51)) < 0.2);
  check('final phase is sedov', late.phase === 'sedov');
  check('forward shock a few pc at 3000 yr', late.R_fwd > 3e18 && late.R_fwd < 3e19,
        (late.R_fwd / 3.086e18).toFixed(2) + ' pc');

  const d150 = rows.find(r => r.t > 150 * DAY), d400 = rows.find(r => r.t > 400 * DAY);
  const slope = 2.5 * Math.log10(d150.L_em / d400.L_em) / ((d400.t - d150.t) / DAY);
  check('radioactive tail slope ~0.0098 mag/day', Math.abs(slope - 0.0098) < 0.002,
        slope.toFixed(4));

  /* Backward scrub integrity. */
  const probes = [0.2, 0.31, 0.45, 0.7, 0.9];
  const eng2 = new Engine(model, clock);
  const snapAt = (e, u) => { e.stepTo(clock.tOfU(u)); const s = e.snapshot();
    return [s.rho_c, s.R_shock, s.E_expl, s.M_ni, s.R_star].map(v => v.toExponential(6)).join('|'); };
  const fresh = probes.map(u => snapAt(new Engine(model, clock), u));
  eng2.stepTo(clock.tOfU(0.95));                          // go deep
  const scrubbed = [...probes].reverse().map(u => snapAt(eng2, u)).reverse();
  let agree = true;
  for (let i = 0; i < probes.length; i++) if (fresh[i] !== scrubbed[i]) agree = false;
  check('backward scrub reproduces forward state', agree);
}

/* ---- black-hole variant ---- */
{
  const model = MODELS.ccsn40bh;
  const clock = new SimClock(model);
  const eng = new Engine(model, clock);
  let formed = false, LnuBefore = 0, LnuAfter = null, tForm = 0;
  for (let i = 0; i <= 1500; i++) {
    eng.stepTo(clock.tOfU(i / 1500));
    const s = eng.snapshot();
    if (s.bhFormed && !formed) { formed = true; tForm = s.t; }
    if (!formed && s.t > 0.1) LnuBefore = Math.max(LnuBefore, s.L_nu);
    if (formed && LnuAfter === null && s.t > tForm + 0.005) LnuAfter = s.L_nu;
  }
  check('BH forms', formed, 't = ' + tForm.toFixed(2) + ' s');
  check('neutrino signal truncates at horizon', LnuAfter !== null && LnuAfter < LnuBefore * 1e-3,
        LnuAfter === null ? 'no sample' : (LnuAfter / LnuBefore).toExponential(1));
  /* a failed supernova must actually fail */
  const sEnd = eng.snapshot();
  check('failed SN: no explosion energy', sEnd.E_expl < 1e49, sEnd.E_expl.toExponential(1));
  check('failed SN: no nickel', sEnd.M_ni < 1e30);
  check('failed SN: the star goes dark', sEnd.L_em < 1e38, sEnd.L_em.toExponential(1));
  check('failed SN: black hole grows past the remnant mass', sEnd.M_bh > 5 * M_SUN,
        (sEnd.M_bh / M_SUN).toFixed(1) + ' Msun');
}

/* ---- Type Ia ---- */
{
  const model = MODELS.ia;
  const clock = new SimClock(model);
  const eng = new Engine(model, clock);
  let Lpeak = 0, tPeak = 0, nuMax = 0;
  for (let i = 0; i <= 1500; i++) {
    eng.stepTo(clock.tOfU(i / 1500));
    const s = eng.snapshot();
    if (s.L_em > Lpeak) { Lpeak = s.L_em; tPeak = s.t; }
    nuMax = Math.max(nuMax, s.L_nu);
  }
  check('Ia peaks near 1e43 erg/s', Lpeak > 3e42 && Lpeak < 5e43, Lpeak.toExponential(1));
  check('Ia peak near day 19', Math.abs(tPeak / DAY - 19) < 12, (tPeak / DAY).toFixed(0) + ' d');
  check('Ia has no neutrino burst', nuMax < 1e50);
}

console.log(failures ? `\n${failures} FAILURES` : '\nall checks passed');
process.exit(failures ? 1 : 0);
