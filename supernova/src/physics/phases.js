/* =============================================================================
   PHASES — the physics of each stage of the collapse
   -----------------------------------------------------------------------------
   Every step() is stable under arbitrarily large dt: closed-form solutions
   where they exist (free-fall, homologous expansion, radioactive decay,
   Sedov-Taylor), semi-implicit relaxations elsewhere. Nothing here integrates
   with a small explicit step, because the scrub bar can ask for 500 years in
   one frame and must get them.

   The physical forms and constants are discussed in the README and the
   in-app assumptions modal; the shorthand here:

     t_ff   free-fall time sqrt(3 pi / 32 G rho)
     M_ch   effective Chandrasekhar mass ~ 5.83 Ye^2 Msun (+ entropy corr.)
     rho_nuc nuclear saturation, 2.7e14 g/cm3 — the bounce wall
     L_crit critical neutrino luminosity for shock revival ~ Mdot^0.4
   ========================================================================== */

import {
  G, C, M_SUN, RHO_NUC, RHO_TRAP, MEV,
  TAU_NI, TAU_CO, EPS_NI, EPS_CO, N_SHELL, NEL, SIGMA_SB,
} from '../config.js';

/* deterministic PRNG for SASI phases — reproducible runs, seed in the UI */
function mulberry(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
/* exponential relaxation of x toward target with rate k over dt — the
   semi-implicit workhorse that is stable for any dt */
const relax = (x, target, k, dt) => target + (x - target) * Math.exp(-k * dt);

/* ---------------------------------------------------------------------------
   PROGENITOR — the star just sits there, convecting. The only physics is a
   slow contraction of the core as it loses pressure support, purely as a
   visual overture: rho_c creeps up over the final minutes.
--------------------------------------------------------------------------- */
const progenitor = {
  enter(st, model) {
    st.L_nu = 1e46;            // pre-collapse neutrino cooling, already huge
    st.R_nu = 0;
  },
  step(st, model, t0, t1) {
    /* Core densification toward instability: factor ~1.5 over the last 600 s */
    const f = clamp((t1 - (-600)) / 600, 0, 1);
    st.rho_c = model.rho_c0 * (1 + 0.5 * f * f);
    st.T_c = model.T_c0 * (1 + 0.15 * f * f);
    st.L_em = model.L_star * 3.828e33;
  },
};

/* ---------------------------------------------------------------------------
   COLLAPSE — pressureless free-fall cycloid per shell, for the core only.

   Each iron-core shell falls as r = r0 cos^2(theta) with
   tau(theta) = sqrt(r0^3 / 2 G m) (theta + sin theta cos theta).
   The collapse is normalised so the CENTRAL region reaches nuclear density at
   exactly t = 0: free-fall from rho_c0 takes t_ff ~ 25 ms, but electron
   capture accelerates the pressure loss, so the visible collapse is arranged
   to occupy the segment's 450 ms with the last e-fold happening in the final
   milliseconds — which is the real shape of the event.

   Ye follows the density ramp and freezes at trapping. The inner core
   (m < M_ic) stays homologous, v ~ r; the outer core falls supersonically.
--------------------------------------------------------------------------- */
function yeOfRho(rho, ye0) {
  /* empirical deleptonization: ye0 at 1e9, ~0.36 at 1e11, frozen ~0.29 above
     trapping. Smooth in log rho. */
  const x = Math.log10(clamp(rho, 1e9, 1e15));
  const y = ye0
    - (ye0 - 0.36) * clamp((x - 9) / 2, 0, 1)
    - (0.36 - 0.29) * clamp((x - 11) / (Math.log10(RHO_TRAP) - 11), 0, 1);
  return Math.max(y, 0.28);
}

const collapse = {
  enter(st, model) {
    st.v_shock = 0;
    st._collT = 0.45;              // duration of the visible collapse segment
  },
  step(st, model, t0, t1) {
    const Mfe = model.M_fe;
    const D = st._collT;
    /* Progress variable: 0 at segment start, 1 at bounce. The cycloid is
       parameterised so the central density hits rho_nuc exactly at p = 1. */
    const p = clamp((t1 + D) / D, 0, 1);

    /* Central density: run the cycloid backwards from the bounce condition.
       rho ~ rho0 / (1 - p^2)^2 has the right character — slow at first,
       divergent at the end — capped at overshoot. */
    const q = clamp(1 - p, 1e-4, 1);
    st.rho_c = Math.min(model.rho_c0 * 1.5 / Math.pow(q, 3.2), RHO_NUC * 1.15);
    st.T_c = model.T_c0 * Math.pow(st.rho_c / model.rho_c0, 0.35);
    st.Ye_c = yeOfRho(st.rho_c, model.Ye_core);

    /* Shells: inner core homologous, r = r0 * s(p); outer core lags with a
       free-fall delay growing outward; envelope has not heard the news. */
    const sInner = Math.max(Math.pow(model.rho_c0 / st.rho_c, 1 / 3), 0.012);
    for (let i = 0; i < N_SHELL; i++) {
      const m = st.m[i];
      if (m <= model.M_ic) {
        st.r[i] = st.r0[i] * sInner;
        st.v[i] = -st.r[i] * 2.0 * p / D;              // v ~ r, inward
      } else if (m <= Mfe * 1.6) {
        /* outer core + silicon: supersonic infall v ~ -sqrt(2Gm/r), delayed */
        const lag = clamp((m / Mfe - 0.4) * 0.9, 0, 0.92);
        const pl = clamp((p - lag) / (1 - lag), 0, 1);
        const s = 1 - (1 - sInner * 1.8) * pl * pl;
        st.r[i] = st.r0[i] * Math.max(s, 0.02);
        st.v[i] = pl > 0 ? -Math.sqrt(2 * G * m / st.r[i]) * pl : 0;
      }
      /* envelope untouched */
      st.ye[i] = yeOfRho(st.rho[i] * Math.pow(st.r0[i] / Math.max(st.r[i], 1e-9), 3), st.ye[i]);
      if (st.m[i] <= Mfe) {
        st.rho[i] = st.rho[i] * Math.pow(st.r0[i] / Math.max(st.r[i], 1e-9), 3);
        st.r0[i] = st.r[i];   // rebase so density compounds correctly
      }
    }

    st.R_core = interpR(st, Mfe);
    /* Neutrino luminosity climbs as capture rates explode with density. */
    st.L_nu = 1e46 * Math.pow(st.rho_c / model.rho_c0, 1.4);
    st.E_nu += st.L_nu * (t1 - t0);
    st.M_pns = model.M_ic * p;
  },
};

/* ---------------------------------------------------------------------------
   BOUNCE — the EOS stiffens at nuclear density: the inner core overshoots,
   rings down over ~1 ms, and the proto-neutron star settles. The breakout
   neutrino burst — the single most luminous moment any star ever has —
   happens here, peaking near 1e53 erg/s.
--------------------------------------------------------------------------- */
const bounce = {
  enter(st, model) {
    st.R_pns = 30e5;
    st.M_pns = model.M_ic;
    st._nuPeak = model.id === 'ia' ? 0 : 3.5e53;
  },
  step(st, model, t0, t1) {
    const t = t1;                        // t = 0 at bounce
    /* damped ring-down of the central density around ~rho_nuc */
    const ring = Math.exp(-t / 0.0012) * Math.cos(2 * Math.PI * t / 0.001);
    st.rho_c = RHO_NUC * (1.0 + 0.8 * Math.max(ring, -0.5));
    st.T_c = 1.2e11 * Math.pow(st.rho_c / RHO_NUC, 0.4);
    st.Ye_c = 0.29;

    /* PNS: 30 km at bounce, Kelvin-Helmholtz contraction handled in stall */
    st.R_pns = 30e5;
    st.R_nu = 60e5;

    /* Breakout burst: sharp rise, ~ms decay to the accretion plateau. */
    const rise = 1 - Math.exp(-t / 4e-4);
    const decay = Math.exp(-t / 6e-3);
    st.L_nu = 1e52 + st._nuPeak * rise * decay;
    st.E_nu += st.L_nu * (t1 - t0);

    /* Shock born at the sonic point ~15 km. The prompt shock is launched hard
       but photodisintegration (8.8 MeV per nucleon of iron it crosses) bleeds
       it immediately: it decelerates and hands over to the stall phase near
       100 km already dying. */
    const Lsh = 8.5e6, tau = 0.004;
    st.R_shock = 15e5 + Lsh * (1 - Math.exp(-t / tau));
    st.v_shock = (Lsh / tau) * Math.exp(-t / tau);
    st.M_dot_acc = 0.4 * M_SUN;          // g/s — the infalling outer core
    st.L_em = model.L_star * 3.828e33;   // photosphere hasn't heard anything
  },
};

/* ---------------------------------------------------------------------------
   STALL — the shock burns its energy dissociating iron (8.8 MeV per nucleon)
   and stalls at 150-200 km while matter rains through it onto the PNS. The
   SASI sloshes the shock; neutrino heating builds in the gain region; when
   L_nu exceeds the critical luminosity for the current accretion rate — which
   happens when the Si/O interface falls through and Mdot drops — the shock
   revives. In the 40 Msun variant it never does: the PNS crosses its maximum
   mass and the story ends behind a horizon.
--------------------------------------------------------------------------- */
const stall = {
  enter(st, model) {
    st._rng = mulberry(st.seed);
    st._phases = Array.from({ length: 24 }, () => st._rng() * 2 * Math.PI);
    st._revived = false;
    st.aFrozen = false;
  },
  step(st, model, t0, t1) {
    const dt = t1 - t0, t = t1;

    /* PNS contracts as it deleptonizes: 30 km -> 12 km, tau ~ 1 s. */
    st.R_pns = model.R_pns_inf + (30e5 - model.R_pns_inf) * Math.exp(-t / model.tau_pns);
    st.R_nu = st.R_pns * 1.8;

    /* Accretion rate: high early, drops sharply when the Si/O interface
       (a real density cliff in the progenitor) reaches the shock at ~0.25 s. */
    const tSiO = model.id === 'ccsn40bh' ? 2.6 : 0.25;
    const cliff = 1 / (1 + Math.exp((t - tSiO) / 0.06));
    st.M_dot_acc = (0.15 + 0.45 * cliff) * M_SUN;
    st.M_pns = Math.min(st.M_pns + st.M_dot_acc * dt, model.M_remnant * 1.05);

    /* Neutrino luminosity: accretion-powered plateau + Kelvin-Helmholtz
       cooling tail. The tail carries the bulk of the 3e53 erg budget, so its
       time-integral must be EXACT under the huge steps a timeline scrub can
       take — both terms integrate in closed form. */
    const A_kh = 8e52, tau_kh = 3.5, A_acc = 8e52;
    const cliffAt = x => 1 / (1 + Math.exp((x - tSiO) / 0.06));
    st.L_nu = A_kh * Math.exp(-t / tau_kh) + A_acc * ((0.15 + 0.45 * cliffAt(t)) / 0.6);
    /* closed-form integrals over [t0, t1] */
    const Ikh = A_kh * tau_kh * (Math.exp(-t0 / tau_kh) - Math.exp(-t1 / tau_kh));
    const S = x => x - 0.06 * Math.log(1 + Math.exp((x - tSiO) / 0.06));   // ∫cliff
    const Iacc = A_acc * (0.15 * (t1 - t0) + 0.45 * (S(t1) - S(t0))) / 0.6;
    st.E_nu += Ikh + Iacc;

    /* Shock radius: relax toward a quasi-equilibrium that scales with the
       heating/ram balance. Stalls near 170 km, sags as Mdot persists. */
    const Req = 1.7e7 * Math.pow(st.L_nu / 6e52, 0.55) * Math.pow(st.M_dot_acc / (0.4 * M_SUN), -0.35);
    st.R_shock = relax(st.R_shock, clamp(Req, 8e6, 2.4e7), 8, dt);
    st.v_shock = (clamp(Req, 8e6, 2.4e7) - st.R_shock) * 8;

    /* Neutrino heating integral behind the shock. */
    const eff = 0.08;
    st.E_heat += eff * st.L_nu * dt * clamp(st.R_shock / 2e7, 0.3, 1.5);

    /* SASI: l=1 fastest growing, saturating tanh, sloshing at ~40 ms period */
    growSASI(st, model, t, dt);

    /* Black-hole track: the PNS crosses the maximum mass. */
    if (model.outcome === 'black-hole' && st.M_pns > 2.2 * M_SUN && !st.bhFormed) {
      st.bhFormed = true;
      st.M_bh = st.M_pns;
      st._nuCut = t;
    }
    if (st.bhFormed) {
      /* The neutrino signal TRUNCATES — not fades — at horizon formation. */
      st.L_nu = st.L_nu * Math.exp(-(t - st._nuCut) / 5e-4);
      st.R_pns = 2 * G * st.M_bh / (C * C);      // Schwarzschild radius
      st.R_shock = Math.max(st.R_shock * Math.exp(-(t - st._nuCut) / 0.05), 1e6);
    }

    /* Revival criterion: L_nu > L_crit(Mdot). Crossed soon after the cliff. */
    const Lcrit = 9e52 * Math.pow(st.M_dot_acc / (0.4 * M_SUN), 0.4);
    if (!st._revived && !st.bhFormed && st.L_nu > Lcrit && t > 0.1) {
      st._revived = true;
      st.aFrozen = true;               // the lobes are imprinted forever

      /* Momentum conservation: the ejecta go preferentially one way, the
         neutron star goes the other. The kick is antiparallel to the frozen
         l=1 dipole, 200-600 km/s depending on its amplitude — which is why
         real pulsars are found displaced from their remnant centres. */
      const d = [st.a[2], st.a[0], st.a[1]];              // (x, y, z) dipole
      const mag = Math.hypot(...d) + 1e-9;
      const v = (2.0e7 + 4.0e7 * Math.min(mag / 0.3, 1)); // cm/s
      st.kick = [-d[0] / mag * v, -d[1] / mag * v, -d[2] / mag * v];
    }
    st.L_em = model.L_star * 3.828e33;
  },
};

function growSASI(st, model, t, dt) {
  if (st.aFrozen) return;
  const sig = model.sasi.sigma, om1 = model.sasi.omega_1;
  let k = 0;
  for (let l = 1; l <= 4; l++) {
    const sat = 0.62 / Math.pow(2 * l + 1, 0.35);
    for (let mm = -l; mm <= l; mm++, k++) {
      const gain = Math.tanh(0.002 * Math.exp(sig[l] * Math.min(t, 0.6)));
      const osc = Math.cos(om1 * t / Math.sqrt(l) + st._phases[k]);
      st.a[k] = sat * gain * osc;
    }
  }
}

/* ---------------------------------------------------------------------------
   EXPLOSION — the revived shock accelerates outward through the mantle and
   envelope. E_expl ramps to ~1e51 erg over ~1 s of neutrino heating; the
   shock speed follows sqrt(2 E / M_swept); breakout happens when it reaches
   the photosphere, about a day later. Shells become ballistic as the shock
   passes them: homologous v = r / t is seeded here.
--------------------------------------------------------------------------- */
const explosion = {
  enter(st, model) {
    st._tRev = st.t;
    st.aFrozen = true;
    st._broke = false;
  },
  step(st, model, t0, t1) {
    const dt = t1 - t0, t = t1, te = t - st._tRev;

    /* Failed supernova: the black hole formed during the stall, the shock
       never revived, and there is nothing to explode. The envelope falls
       back over hours; the star simply goes dark — the "disappearing star"
       transients (N6946-BH1) are exactly this. */
    if (st.bhFormed) {
      st.E_expl = 0;
      st.M_ni = 0;
      st.R_shock = Math.max(st.R_shock * Math.exp(-dt / 20), 1e6);
      st.v_shock = 0;
      st.L_nu = 0;
      /* envelope accretes; the horizon grows */
      const Mdot_fb = 0.5 * M_SUN / 3.15e7;             // ~0.5 Msun/yr fallback
      st.M_bh = Math.min(st.M_bh + Mdot_fb * dt, model.M_star);
      st.R_pns = 2 * G * st.M_bh / (C * C);
      st.M_pns = st.M_bh;
      /* the photosphere cools and dims as support vanishes */
      st.L_em = model.L_star * 3.828e33 * Math.exp(-t / (30 * 86400));
      st.T_eff = Math.max(model.T_eff * Math.exp(-t / (60 * 86400)), 3000);
      return;
    }

    /* Energy ramp, saturating at the model's explosion energy. */
    st.E_expl = model.E_expl * (1 - Math.exp(-te / 0.7));

    /* Mass already swept by the shock. */
    const Msw = massInside(st, st.R_shock) - model.M_remnant;
    const vSh = Math.sqrt(2 * st.E_expl / Math.max(Msw + 0.1 * M_SUN, 0.1 * M_SUN));
    st.v_shock = vSh;
    st.R_shock = Math.min(st.R_shock + vSh * dt, model.R_star * 1.001);

    /* Shells inside the shock: kicked to homologous ballistic flight.
       v(m) declines outward through the mantle — the inner ejecta are
       slower in absolute terms but the envelope gets the final kick. */
    for (let i = 0; i < N_SHELL; i++) {
      if (st.m[i] <= model.M_remnant) { st.r[i] = Math.min(st.r[i], st.R_pns); st.v[i] = 0; continue; }
      if (st.r[i] < st.R_shock) {
        if (st.v[i] <= 0) {
          /* the shock arrives: instant kick to local shock speed */
          st.v[i] = vSh * (0.85 + 0.3 * (st.m[i] / model.M_star));
        }
        st.r[i] += st.v[i] * dt;
        st.rho[i] *= Math.pow(st.r[i] / (st.r[i] - st.v[i] * dt + 1e-20), -3);
      }
    }

    st.rho_c = RHO_NUC; st.T_c = 8e10;
    st.R_pns = model.R_pns_inf + (30e5 - model.R_pns_inf) * Math.exp(-t / model.tau_pns);
    st.M_pns = model.M_remnant;
    st.L_nu = 8e52 * Math.exp(-t / 3.5);
    st.E_nu += 8e52 * 3.5 * (Math.exp(-t0 / 3.5) - Math.exp(-t1 / 3.5));
    st.M_dot_acc = 0;

    /* Nucleosynthesis: Ni-56 minted while the shock is in the silicon/oxygen
       layers (first ~seconds). */
    st.M_ni = model.M_ni * clamp(te / 3, 0, 1);

    /* Breakout: the shock reaches the photosphere. */
    if (!st._broke && st.R_shock >= model.R_star) {
      st._broke = true; st._tBreak = t;
    }
    if (st._broke) {
      const tb = t - st._tBreak;
      st.L_em = 1e45 * Math.exp(-tb / 3600) + 3e42;
      st.R_star = Math.max(st.R_star, st.R_shock);
      st.T_eff = 5e4 * Math.exp(-tb / 7200) + 8000;
    } else {
      st.L_em = model.L_star * 3.828e33;
    }
    st.rtAmp = clamp((st.R_shock / model.R_star) * 0.6, 0, 0.6);
  },
};

/* ---------------------------------------------------------------------------
   LIGHT — free homologous expansion through the plateau and radioactive tail.
   Everything is closed-form in t: r = v t per shell, the light curve is
   recombination plateau + Ni/Co decay.
--------------------------------------------------------------------------- */
const light = {
  enter(st, model) {
    st._t0 = st.t;
    if (st.bhFormed) return;
    /* freeze per-shell homologous velocities: v = r / t at entry */
    for (let i = 0; i < N_SHELL; i++) {
      if (st.m[i] > model.M_remnant) st.v[i] = Math.max(st.v[i], st.r[i] / Math.max(st.t, 1));
    }
    st.M_ni = model.M_ni;
  },
  step(st, model, t0, t1) {
    const t = t1;
    if (st.bhFormed) {
      /* the fallback transient: dim red decline into nothing */
      st.L_em = model.L_star * 3.828e33 * Math.exp(-t / (30 * 86400));
      st.T_eff = Math.max(3000 * Math.exp(-t / (2 * 3.15e7)), 1200);
      const Mdot_fb = 0.5 * M_SUN / 3.15e7;
      st.M_bh = Math.min(st.M_bh + Mdot_fb * (t1 - t0), model.M_star);
      st.M_pns = st.M_bh;
      st.R_pns = 2 * G * st.M_bh / (C * C);
      st.R_star = Math.max(st.R_star * Math.pow(0.5, (t1 - t0) / (5 * 3.15e7)), 1e11);
      return;
    }
    homologous(st, model, t0, t1);

    /* Radioactive chain, exact solution. */
    const Mni0 = model.M_ni;
    const ni = Mni0 * Math.exp(-t / TAU_NI);
    const co = Mni0 * (TAU_CO / (TAU_CO - TAU_NI)) * (Math.exp(-t / TAU_CO) - Math.exp(-t / TAU_NI));
    st.M_ni = ni; st.M_co = co;
    const Lrad = EPS_NI * ni + EPS_CO * co;

    /* Plateau: recombination holds L up for ~100 days (IIP), then the curve
       falls onto the radioactive tail. */
    const plat = model.t_plateau ?? 100 * 86400;
    const Lplat = (model.L_plateau ?? 1e42) * Math.exp(-Math.pow(t / plat, 6));
    st.L_em = Lplat + Lrad;

    /* Photosphere: recedes in mass, roughly fixed in radius during plateau. */
    st.R_star = st.r[N_SHELL - 1];
    st.T_eff = Math.max(4500 * Math.pow(1 + t / plat, -0.35), 2500);

    st.L_nu = 1e42 * Math.exp(-t / 20);   // PNS cooling, negligible now
    st.rtAmp = 0.6;
  },
};

/* ---------------------------------------------------------------------------
   FREE — free expansion of the remnant, decades to centuries. The ejecta
   coast; the forward shock sweeps CSM; the reverse shock is born when the
   swept mass becomes comparable to the ejecta mass.
--------------------------------------------------------------------------- */
const freeExp = {
  enter(st, model) {
    st._vej = Math.sqrt(2 * model.E_expl / (model.M_star - model.M_remnant)) * 1.2;
  },
  step(st, model, t0, t1) {
    const t = t1;
    if (st.bhFormed) {
      /* the fallback transient: dim red decline into nothing */
      st.L_em = model.L_star * 3.828e33 * Math.exp(-t / (30 * 86400));
      st.T_eff = Math.max(3000 * Math.exp(-t / (2 * 3.15e7)), 1200);
      const Mdot_fb = 0.5 * M_SUN / 3.15e7;
      st.M_bh = Math.min(st.M_bh + Mdot_fb * (t1 - t0), model.M_star);
      st.M_pns = st.M_bh;
      st.R_pns = 2 * G * st.M_bh / (C * C);
      st.R_star = Math.max(st.R_star * Math.pow(0.5, (t1 - t0) / (5 * 3.15e7)), 1e11);
      return;
    }
    homologous(st, model, t0, t1);
    st.R_fwd = st._vej * t;
    st.R_cd = st.R_fwd * 0.85;
    /* swept CSM mass for an r^-2 wind: M = (Mdot/vw) R */
    st.M_swept = (model.Mdot / model.v_wind) * st.R_fwd;
    st.R_rev = st.R_fwd * (0.75 + 0.10 * clamp(st.M_swept / (model.M_star - model.M_remnant), 0, 1) * 5);
    st.R_star = st.r[N_SHELL - 1];
    st.R_shock = st.R_fwd;
    st.v_shock = st._vej;

    const Mni0 = model.M_ni;
    const co = Mni0 * (TAU_CO / (TAU_CO - TAU_NI)) * (Math.exp(-t / TAU_CO) - Math.exp(-t / TAU_NI));
    st.L_em = EPS_CO * co + 1e38 * Math.pow(t / 3.15e8, -1);   // decay + early CSM shock
    st.T_eff = 8000;
    st.T_ej = 1e4 * Math.pow(1 + t / 3.15e9, -1);
    st.rtAmp = 0.6;
  },
};

/* ---------------------------------------------------------------------------
   SEDOV — the swept mass exceeds the ejecta mass and the remnant forgets its
   initial conditions. For an r^-2 wind CSM the similarity solution gives
   R ~ t^(2/3). The reverse shock has fully formed; the forward shock heats
   CSM to X-ray temperatures; everything slowly cools and fades.
--------------------------------------------------------------------------- */
const sedov = {
  enter(st, model) {
    st._tS = st.t;
    st._RS = st.R_fwd || 1e18;
  },
  step(st, model, t0, t1) {
    const t = t1;
    if (st.bhFormed) { blackHoleQuiet(st, model, t0, t1); return; }
    /* R ∝ t^(2/3) matched continuously to the free-expansion radius */
    st.R_fwd = st._RS * Math.pow(t / st._tS, 2 / 3);
    st.v_shock = (2 / 3) * st.R_fwd / t;
    st.R_shock = st.R_fwd;
    st.R_cd = st.R_fwd * 0.80;
    st.R_rev = st.R_fwd * (0.65 - 0.25 * clamp(Math.log10(t / st._tS) / 1.2, 0, 1));
    st.M_swept = (model.Mdot / model.v_wind) * st.R_fwd;

    /* Ejecta shells keep coasting but decelerate as they couple to the CSM. */
    const brake = Math.pow(t / st._tS, -1 / 3);
    for (let i = 0; i < N_SHELL; i++) {
      if (st.m[i] <= model.M_remnant) continue;
      st.r[i] = Math.min(st.r[i] + st.v[i] * (t1 - t0) * brake, st.R_fwd * 0.98);
    }
    st.R_star = st.r[N_SHELL - 1];

    /* Shock temperature: T = 3 mu m_H v^2 / 16 k ~ 1e7 K at 1000 km/s. */
    st.T_ej = 1.4e-9 * st.v_shock * st.v_shock;
    st.L_em = 3e36 * Math.pow(t / st._tS, -0.6);   // fading synchrotron/thermal
    st.T_eff = 6000;
    st.rtAmp = 0.65;

    /* The neutron star drifts on its kick. */
    /* (position integrated by the renderer from st.kick and t) */
  },
};

/* After a failed supernova there is no remnant to evolve: a black hole sits
   where the star was, finishing its meal. */
function blackHoleQuiet(st, model, t0, t1) {
  st.L_em = 0; st.L_nu = 0;
  st.R_shock = 0; st.R_fwd = 0; st.R_rev = 0;
  st.M_bh = Math.min(st.M_bh + 0.1 * M_SUN / 3.15e7 * (t1 - t0), model.M_star);
  st.M_pns = st.M_bh;
  st.R_pns = 2 * G * st.M_bh / (C * C);
  st.R_star = Math.max(st.R_star * 0.99, 1e10);
  st.T_eff = 1200;
}

/* --------------------------------------------------------------------------- */
function homologous(st, model, t0, t1) {
  const dt = t1 - t0;
  for (let i = 0; i < N_SHELL; i++) {
    if (st.m[i] <= model.M_remnant) continue;
    st.r[i] += st.v[i] * dt;
  }
  /* density drops as r^-3 in homologous flow; track the mean */
  const f = Math.pow(st.r[N_SHELL - 1] / Math.max(st.r[N_SHELL - 1] - st.v[N_SHELL - 1] * dt, 1), -3);
  for (let i = 0; i < N_SHELL; i++) if (st.m[i] > model.M_remnant) st.rho[i] *= f;
}

function massInside(st, R) {
  let m = 0;
  for (let i = 0; i < N_SHELL; i++) { if (st.r[i] <= R) m = st.m[i]; else break; }
  return m;
}

function interpR(st, mTarget) {
  for (let i = 1; i < N_SHELL; i++) {
    if (st.m[i] >= mTarget) {
      const f = (mTarget - st.m[i - 1]) / (st.m[i] - st.m[i - 1] + 1e-30);
      return st.r[i - 1] + f * (st.r[i] - st.r[i - 1]);
    }
  }
  return st.r[N_SHELL - 1];
}

/* ---------------------------------------------------------------------------
   TYPE IA phases — genuinely different physics: no collapse, no neutrinos,
   total disruption. Implemented against the same interface.
--------------------------------------------------------------------------- */
const deflagration = {
  enter(st, model) { st._rng = mulberry(st.seed); },
  step(st, model, t0, t1) {
    const p = clamp((t1 + 2) / 2, 0, 1);
    st.T_c = model.T_c0 * (1 + 20 * p * p);       // runaway
    st.rho_c = model.rho_c0;
    st.L_em = 1e40 * (1 + 9 * p);   // surface barely brightens pre-breakout
    st.R_star = model.R_star;
    st.T_eff = model.T_eff;
  },
};
const detonation = {
  enter(st, model) {
    st.aFrozen = true;
    /* mild asymmetry from off-centre ignition */
    const rng = mulberry(st.seed);
    for (let k = 0; k < 24; k++) st.a[k] = (rng() - 0.5) * 0.25 / (1 + k * 0.2);
    st.E_expl = 0;
  },
  step(st, model, t0, t1) {
    const t = t1, dt = t1 - t0;
    st.E_expl = model.E_expl * clamp(t / 2, 0, 1);
    const vej = Math.sqrt(2 * Math.max(st.E_expl, 1e49) / model.M_star);
    st.R_shock = Math.min(model.R_star + vej * t * 1.5, model.R_star * 400);
    st.v_shock = vej * 1.5;
    for (let i = 0; i < N_SHELL; i++) {
      st.v[i] = vej * (0.4 + 1.4 * st.m[i] / model.M_star);
      st.r[i] += st.v[i] * dt;
    }
    st.M_ni = model.M_ni * clamp(t / 1.5, 0, 1);
    st.R_star = st.r[N_SHELL - 1];
    st.T_eff = 15000;
    st.L_em = 1e42 * clamp(t / 2, 0, 1);
    st.rtAmp = clamp(t / 2, 0, 0.5);
  },
};
const fireball = {
  enter(st, model) { light.enter(st, model); },
  step(st, model, t0, t1) {
    homologous(st, model, t0, t1);
    const t = t1;
    const Mni0 = model.M_ni;
    const ni = Mni0 * Math.exp(-t / TAU_NI);
    const co = Mni0 * (TAU_CO / (TAU_CO - TAU_NI)) * (Math.exp(-t / TAU_CO) - Math.exp(-t / TAU_NI));
    st.M_ni = ni; st.M_co = co;
    /* Arnett-like: the light curve RISES as the photon diffusion time drops,
       peaks near 19 days, then follows the decay. */
    const tPeak = 19 * 86400;
    const diff = 1 - Math.exp(-Math.pow(t / tPeak, 2));
    st.L_em = (EPS_NI * ni + EPS_CO * co) * diff;
    st.R_star = st.r[N_SHELL - 1];
    st.T_eff = Math.max(15000 * Math.pow(1 + t / tPeak, -0.6), 5000);
    st.L_nu = 0;
  },
};

export const PHASES = {
  progenitor, collapse, bounce, stall, explosion, light,
  free: freeExp, sedov,
  deflagration, detonation, fireball, tail: light,
};
