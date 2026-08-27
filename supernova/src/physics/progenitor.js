/* =============================================================================
   PROGENITOR — build the initial stellar structure from a model's parameters
   -----------------------------------------------------------------------------
   The shells are laid out in mass coordinate with deliberate non-uniformity:
   half of all shells cover the inner 2 solar masses, because that is where the
   entire collapse story happens. A uniform-in-mass grid would spend 90% of its
   resolution on the hydrogen envelope, which mostly just sits there until the
   shock arrives.

   The radial profile is a piecewise power law chosen to hit each burning
   shell's tabulated density, with an n=3/2 polytropic envelope. It is not a
   solution of the stellar-structure equations — the assumptions modal says so —
   but every ordering and every order of magnitude is right, and that is what
   the visualisation actually communicates.
   ========================================================================== */

import { N_SHELL, NEL, ELEMENTS, M_SUN, G } from '../config.js';

export function buildProgenitor(state, model) {
  const N = N_SHELL;
  const M = model.M_star;
  const Mcore = Math.min(2.0 * M_SUN, M * 0.35);

  /* --- mass grid: half the shells inside Mcore ------------------------- */
  for (let i = 0; i < N; i++) {
    const u = (i + 1) / N;
    let m;
    if (u <= 0.5) m = Mcore * Math.pow(u * 2, 1.35);        // dense core sampling
    else          m = Mcore + (M - Mcore) * Math.pow((u - 0.5) * 2, 1.25);
    state.m[i] = m;
  }

  /* --- composition: smoothstepped shells in mass coordinate ------------- */
  const sm = (e0, e1, x) => {
    const t = Math.min(Math.max((x - e0) / Math.max(e1 - e0, 1e-30), 0), 1);
    return t * t * (3 - 2 * t);
  };
  const elIndex = Object.fromEntries(ELEMENTS.map((e, j) => [e, j]));

  for (let i = 0; i < N; i++) {
    const mi = state.m[i];
    /* Weight of each shell's material at this mass coordinate: the innermost
       listed shell whose boundary lies above mi wins, softened by dm. */
    const w = new Float64Array(model.shells.length);
    let acc = 0;
    for (let jS = 0; jS < model.shells.length; jS++) {
      const sh = model.shells[jS];
      const lo = jS === 0 ? 0 : model.shells[jS - 1].m * M_SUN;
      const dmLo = jS === 0 ? 1 : model.shells[jS - 1].dm * M_SUN;
      const hi = sh.m * M_SUN, dmHi = sh.dm * M_SUN;
      const inside = sm(lo - dmLo, lo + dmLo, mi) * (1 - sm(hi - dmHi, hi + dmHi, mi));
      w[jS] = inside; acc += inside;
    }
    for (let j = 0; j < NEL; j++) state.X[i * NEL + j] = 0;
    if (acc > 0) {
      for (let jS = 0; jS < model.shells.length; jS++) {
        const j = elIndex[model.shells[jS].el];
        state.X[i * NEL + j] += w[jS] / acc;
      }
    } else {
      state.X[i * NEL + elIndex.H] = 1;   // outside everything: envelope
    }
  }

  /* --- radial structure -------------------------------------------------
     Anchor (m, rho, T) at each shell boundary from the model table, then
     interpolate log-linearly in mass between anchors and integrate radius
     from dm = 4 pi r^2 rho dr. This guarantees the density hits every
     tabulated value AND encloses the right mass at the right radius. */
  const anchors = [{ m: 0, rho: model.rho_c0, T: model.T_c0 }];
  for (const sh of model.shells) anchors.push({ m: sh.m * M_SUN, rho: sh.rho, T: sh.T });

  const rhoAt = (mi) => {
    let k = 0;
    while (k < anchors.length - 2 && anchors[k + 1].m < mi) k++;
    const a = anchors[k], b = anchors[k + 1];
    const f = Math.min(Math.max((mi - a.m) / Math.max(b.m - a.m, 1e-30), 0), 1);
    return {
      rho: Math.exp(Math.log(a.rho) * (1 - f) + Math.log(b.rho) * f),
      T:   Math.exp(Math.log(Math.max(a.T, 1e4)) * (1 - f) + Math.log(Math.max(b.T, 1e4)) * f),
    };
  };

  let r = 0, mPrev = 0;
  for (let i = 0; i < N; i++) {
    const mi = state.m[i];
    const { rho, T } = rhoAt(0.5 * (mi + mPrev));
    const dm = mi - mPrev;
    /* dr from the shell's own volume at its local density */
    const vol = dm / rho;
    r = Math.cbrt(r * r * r + vol * 3 / (4 * Math.PI));
    state.r[i] = r; state.r0[i] = r;
    state.rho[i] = rho; state.T[i] = T;
    state.v[i] = 0;
    state.ye[i] = mi < model.M_fe ? model.Ye_core : 0.5;
    mPrev = mi;
  }

  /* The integrated radius lands within a factor ~2 of the model's R_star;
     rescale the outer envelope smoothly so the photosphere is exactly right
     while the core radii (which the collapse depends on) stay untouched. */
  const rEdge = state.r[N - 1];
  const scale = model.R_star / rEdge;
  const mCoreEnd = anchors[1].m;                 // iron-core edge
  for (let i = 0; i < N; i++) {
    const f = sm(mCoreEnd, M * 0.9, state.m[i]); // 0 in the core, 1 far out
    const k = Math.pow(scale, f);
    state.r[i] *= k; state.r0[i] = state.r[i];
  }

  /* --- scalars --------------------------------------------------------- */
  state.t = -600;                        // 10 minutes before collapse onset
  state.phase = 'progenitor';
  state.phaseT = 0;
  state.rho_c = model.rho_c0;
  state.T_c = model.T_c0;
  state.Ye_c = model.Ye_core ?? 0.5;
  state.R_star = model.R_star;
  state.T_eff = model.T_eff;

  /* Iron core radius: last shell inside M_fe. */
  let Rc = state.r[0];
  for (let i = 0; i < N; i++) if (state.m[i] <= (model.M_fe ?? 0)) Rc = state.r[i];
  state.R_core = Rc;

  state.M_pns = 0; state.R_pns = 0;
  state.R_shock = 0; state.L_nu = 0; state.E_nu = 0;
  state.E_expl = 0; state.M_ni = 0; state.L_em = model.L_star * 3.828e33;

  return state;
}
