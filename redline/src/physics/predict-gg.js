/* The steady operating point of a gas-generator engine, from its drawing.

   A gas-generator cycle is a loop: the pumps feed the main chamber AND the
   gas generator; the gas generator drives the turbine; the turbine drives
   the pumps. Where it settles is the speed at which the turbine's torque
   equals the pumps' (plus the bearings' and the windage):

     pump        ΔP = ρ g H0 (a0 n² + a1 n q) − Rq ṁ²,  q = ṁ_total / (ρ Q0)
     main feed   ṁ = √(2ρ (Pd − Pc) / ΣR)   (line, valve, injector in series)
     GG tap      ṁ = √(2ρ (Pd − Pgg) / ΣR)  (valve, throttle, orifice)
     chambers    Pc = ṁ η c*(MR) / (Cd At)
     turbine     τ = ṁ_gg r (φ c0 cos α − u)(1 + ψ) η_x,  c0 from the GG gas

   The same equations the transient model integrates, solved for d/dt = 0:
   for a trial speed, iterate the chamber pressures to consistency; then
   bisect on the speed until the shaft balances. No DOM. */

const G0 = 9.80665, TAU = 2 * Math.PI;
const R = a => (a > 0 ? 1 / (a * a) : Infinity);          // ×1/(2ρ) later
const Gam = g => Math.sqrt(g) * Math.pow(2 / (g + 1), (g + 1) / (2 * (g - 1)));

/* opts: { tankOx, tankFu (Pa abs), thrGG (0–1, both GG legs), thrGGox,
   thrGGfu, eta, etaGG, fluids, At (main throat area override), n (force a
   speed: the balance is then reported, not solved), cda: { ox, fu, ggox,
   ggfu } (flow areas instead of the as-built ones — the drawing's, for a
   prediction), cold: { P, T } — a
   pump-fed cold flow: the gas generator shut, the turbine on start-gas
   nitrogen at P (abs) and T, the liquid leaving through the open throat } */
export function steadyGG(def, opts = {}) {
  const p = def.physics, A = p.ambient.P;
  const L = Object.fromEntries(p.lines.map(l => [l.id, l]));
  const TP = p.turbopump, T = TP.turbine, B = TP.bearings;
  const wD = TP.Nd * TAU / 60;
  const fl = opts.fluids || { ox: L.ox.fluid, fu: L.fu.fluid };
  const tank = { ox: opts.tankOx ?? A + 50 * 6894.757, fu: opts.tankFu ?? A + 50 * 6894.757 };
  const thrGG = { ox: opts.thrGGox ?? opts.thrGG ?? 1, fu: opts.thrGGfu ?? opts.thrGG ?? 1 };
  const C = p.chamber, GG = p.gg;
  const At = opts.At ?? Math.PI / 4 * C.throatDia ** 2, AtG = Math.PI / 4 * GG.throatDia ** 2;
  const eta = opts.eta ?? C.etaCstar, etaG = opts.etaGG ?? GG.etaCstar;
  const gG = GG.gammaP ?? 1.22, RG = GG.Rp ?? 340;
  const pumps = {};
  for (const side of ['ox', 'fu']) {
    const s = TP.pumps[side], rho = fl[side].rho;
    const [a0, a1, a2] = s.a || [1.15, -0.03, 0.12];
    const Q0 = s.Q0, H0 = s.H0;
    pumps[side] = {
      rho, Q0, H0, a0, a1, a2, shut: s.shut ?? 0.4,
      P0: s.rhoD * G0 * H0 * Q0 / s.eta, rhoD: s.rhoD,
      Rs: s.CdAsuc ? 1 / (2 * rho * s.CdAsuc ** 2) : 0,
      Rq: G0 * H0 * a2 / (rho * Q0 * Q0),
      // main path: line + valve + injector; tap: valve + orifice (throttled)
      Rmain: (R(L[side].CdAline) + R(L[side].valve.CdA) + R(opts.cda?.[side] ?? L[side].CdAinj)) / (2 * rho),
      Rtap: L[side].tap && !opts.cold ? (R(L[side].tap.valve.CdA) + R((opts.cda?.['gg' + side] ?? L[side].tap.CdA) * thrGG[side])) / (2 * rho) : Infinity,
    };
  }
  /* Hydraulics at speed n: chamber pressures by fixed-point iteration. */
  function hydraulics(n) {
    let Pc = 0.5 * C.Pnom, Pg = 0.5 * GG.Pnom;
    const out = {};
    for (let it = 0; it < 200; it++) {
      for (const side of ['ox', 'fu']) {
        const u = pumps[side];
        // solve for the pump's total flow: Pd(ṁ) = Pin + ΔP; flows to both outlets
        let lo = 0, hi = 20;
        let m = 0, mm = 0, mt = 0, Pd = 0;
        for (let k = 0; k < 60; k++) {
          m = 0.5 * (lo + hi);
          const q = m / (u.rho * u.Q0);
          const Pin = tank[side] - u.Rs * m * m;
          Pd = Pin + u.rho * G0 * u.H0 * (u.a0 * n * Math.abs(n) + u.a1 * n * q) - u.Rq * m * m;
          mm = Pd > Pc ? Math.sqrt((Pd - Pc) / u.Rmain) : 0;
          mt = Pd > Pg && Number.isFinite(u.Rtap) ? Math.sqrt((Pd - Pg) / u.Rtap) : 0;
          if (mm + mt > m) lo = m; else hi = m;
        }
        out[side] = { m, mm, mt, Pd, Pin: tank[side] - u.Rs * m * m, q: m / (u.rho * u.Q0) };
      }
      const mo = out.ox.mm, mf = out.fu.mm, go = out.ox.mt, gf = out.fu.mt;
      const MR = mo / Math.max(mf, 1e-9), MRg = go / Math.max(gf, 1e-9);
      const PcN = (mo + mf) * eta * C.cstar(MR) / ((C.Cd ?? 0.98) * At);
      const PgN = (go + gf) * etaG * GG.cstar(MRg) / ((GG.Cd ?? 0.98) * AtG);
      if (opts.cold) { Pc = A; Pg = opts.cold.P; if (it > 0) break; continue; }
      const done = Math.abs(PcN - Pc) < 50 && Math.abs(PgN - Pg) < 50;
      Pc += 0.5 * (Math.max(A, PcN) - Pc); Pg += 0.5 * (Math.max(A, PgN) - Pg);
      if (done) break;
    }
    return { ...out, Pc, Pg };
  }
  /* Turbine and pump torques at speed n with hydraulics h. */
  function shaft(n, h) {
    const w = n * wD;
    let mg, Tg, cp, gx;
    if (opts.cold) {
      // start-gas nitrogen through the turbine nozzles (choked)
      const Rn = 296.8; gx = 1.4; Tg = opts.cold.T; cp = gx * Rn / (gx - 1);
      mg = (GG.Cd ?? 0.98) * AtG * opts.cold.P * Gam(gx) / Math.sqrt(Rn * Tg);
    } else {
      mg = h.ox.mt + h.fu.mt;
      const MRg = h.ox.mt / Math.max(h.fu.mt, 1e-9);
      const cs = etaG * GG.cstar(MRg), RTg = (cs * Gam(gG)) ** 2;
      Tg = RTg / RG; cp = gG * RG / (gG - 1); gx = gG;
    }
    const Pex = A * (1 + 0.05 * Math.min(1, mg / (T.mdotD || 0.1)));
    const pr = Pex / Math.max(h.Pg, 1);
    const x = pr < 1 ? 1 - Math.pow(pr, (gx - 1) / gx) : 0;
    const c0 = Math.sqrt(2 * cp * Tg * x);
    const u = w * T.rm;
    const tauT = mg * T.rm * ((T.phi ?? 0.95) * c0 * Math.cos((T.alpha ?? 20) * Math.PI / 180) - u) * (1 + (T.psi ?? 0.85)) * (T.etaX ?? 0.8);
    let tauP = 0;
    for (const side of ['ox', 'fu']) {
      const s = pumps[side], q = h[side].q;
      tauP += s.P0 / wD * (s.rho / s.rhoD) * (s.shut * n * n + (1 - s.shut) * n * q);
    }
    const tauW = (T.kw ?? 0) * w * w, tauB = B.c0 + B.c1 * w;
    const Pt = tauT * w;
    return { tauT, tauP, tauW, tauB, net: tauT - tauP - tauW - tauB, Tg, c0, uc0: c0 > 0 ? u / c0 : 0, Pt, Texh: mg > 1e-5 ? Tg - Pt / (mg * cp) : Tg, cp, mg };
  }
  let n = opts.n, h, sh;
  if (n == null) {
    let lo = 0.15, hi = 1.6;
    for (let k = 0; k < 50; k++) {
      n = 0.5 * (lo + hi);
      h = hydraulics(n); sh = shaft(n, h);
      if (sh.net > 0) lo = n; else hi = n;
    }
  }
  h = hydraulics(n); sh = shaft(n, h);
  const mo = h.ox.mm, mf = h.fu.mm, MR = mo / Math.max(mf, 1e-9);
  const mdotMain = mo + mf, mdotGG = h.ox.mt + h.fu.mt;
  // thrust from an ideal nozzle at the throat conditions (as the chamber model)
  const g = 1.22, Ae = Math.PI / 4 * C.exitDia ** 2, eps = Ae / At;
  const area = M => (1 / M) * Math.pow((2 / (g + 1)) * (1 + (g - 1) / 2 * M * M), (g + 1) / (2 * (g - 1)));
  let lo = 1.0001, hi = 10;
  for (let i = 0; i < 80; i++) { const m = 0.5 * (lo + hi); if (area(m) > eps) hi = m; else lo = m; }
  const Me = 0.5 * (lo + hi), pe = h.Pc * Math.pow(1 + (g - 1) / 2 * Me * Me, -g / (g - 1));
  const cs = eta * C.cstar(MR), RT = (cs * Gam(g)) ** 2;
  const Ve = Math.sqrt(2 * g / (g - 1) * RT * (1 - Math.pow(pe / h.Pc, (g - 1) / g)));
  const F = Math.max(0, mdotMain * Ve + (pe - A) * Ae);
  if (opts.cold) return {
    kind: 'ggcold', n, rpm: n * TP.Nd, mdotOx: mo, mdotFu: mf, MR, PdOx: h.ox.Pd, PdFu: h.fu.Pd, PinOx: h.ox.Pin, PinFu: h.fu.Pin,
    dPinjOx: h.ox.Pd - A, dPinjFu: h.fu.Pd - A, mdotDrive: sh.mg, Pturb: sh.Pt, Texh: sh.Texh, uc0: sh.uc0, balance: sh.net,
  };
  return {
    kind: 'gg', n, rpm: n * TP.Nd,
    Pc: h.Pc, Pgg: h.Pg, MR, MRgg: h.ox.mt / Math.max(h.fu.mt, 1e-9),
    mdotOx: mo, mdotFu: mf, mdotGGox: h.ox.mt, mdotGGfu: h.fu.mt, mdotMain, mdotGG,
    ggFrac: mdotGG / (mdotMain + mdotGG),
    PdOx: h.ox.Pd, PdFu: h.fu.Pd, PinOx: h.ox.Pin, PinFu: h.fu.Pin,
    dPinjOx: h.ox.Pd - h.Pc, dPinjFu: h.fu.Pd - h.Pc,
    TIT: sh.Tg, Texh: sh.Texh, c0: sh.c0, uc0: sh.uc0, Pturb: sh.Pt,
    F, Isp: F / ((mdotMain + mdotGG) * G0), IspChamber: F / (mdotMain * G0),
    balance: sh.net,
  };
}
