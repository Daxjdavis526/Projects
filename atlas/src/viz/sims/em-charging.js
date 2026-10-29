// Charging and the charge on neutral objects. Two scenes:
//
//   ball   a small charged ball held near a neutral sphere. A metal sphere’s free electrons
//          shift so its near side takes the opposite charge and its far side the same charge
//          — drawn from the exact image-charge solution — and the sphere is attracted,
//          whatever the ball’s sign. An insulating sphere cannot pass charge along; each
//          molecule only stretches into a tiny dipole, and it is attracted more weakly
//          (dipole approximation). Ground the metal sphere, then take the wire away, then the
//          ball: charging by induction — the order matters.
//   share  identical metal spheres touched together in pairs: each pair ends up sharing its
//          total charge equally, and the total of all the spheres never changes.
//
// Physics in model/em-charges.js (tested headlessly).
//
//   { type: 'em-charging', params: {
//       scene: 'ball',                      // ball | share
//       // ball:  material 'conductor' | 'insulator', Q (nC, ±) 30, d (cm, centre to centre) 14, a (cm) 5,
//       //        kappa 3 (insulator), ground: false, present: true, qNet (nC) 0 (a starting net charge)
//       // share: q: [6, 0, 0] (nC, two or three spheres), labels: ['A', 'B', 'C']
//       controls: true, readout: true, ask: false (hide numbers),
//   } }

import { Plot } from '../plot.js';
import * as C from '../model/em-charges.js';

export const defaults = { scene: 'ball', material: 'conductor', Q: 30, d: 14, a: 5, kappa: 3, ground: false, present: true, qNet: 0, q: [6, 0, 0], labels: ['A', 'B', 'C'], controls: true, readout: true, ask: false };
const NC = 1e-9, CM = 0.01;
const trim = (x, n = 3) => String(+(+x).toPrecision(n));
const fmtF = (F) => { const a = Math.abs(F); return a >= 1e-3 ? `${trim(F * 1e3)} mN` : a >= 1e-6 ? `${trim(F * 1e6)} µN` : `${trim(F * 1e9)} nN`; };
/** −q/e as TeX: the number of electrons gained (negative: lost). */
const electrons = (q) => { const n = -q / C.E_CHARGE; if (Math.abs(n) < 0.5) return '0'; const [m, e] = n.toExponential(2).split('e'); return `${m}\\times10^{${+e}}`; };
const texF = (F) => fmtF(F).replace(' mN', '\\,\\mathrm{mN}').replace(' µN', '\\,\\mu\\mathrm{N}').replace(' nN', '\\,\\mathrm{nN}');

export async function mount(F, P0) {
  const P = { ...defaults, ...P0 };
  const ctl = P.controls !== false;
  let reduced = false;
  try { reduced = (await import('../../ui/state.js')).reducedMotion(); } catch { reduced = true; }
  const { canvas } = F.canvas({ aspect: 'wide', label: P.alt || (P.scene === 'share' ? 'Metal spheres sharing charge when they touch' : 'A charged ball near a neutral sphere, and the charge it induces') });
  const plot = new Plot(canvas, { x: P.scene === 'share' ? [-10, 22] : [-12, 33], y: [-9, 9], equal: true, grid: false, axes: false });

  if (P.scene === 'share') return shareScene();

  // ─── a charged ball near a sphere ──────────────────────────────────────
  const S = { qNet: P.qNet * NC, present: P.present, ground: P.ground };
  if (ctl) {
    F.choice({ key: 'material', label: 'Sphere', options: [['conductor', 'Metal (conductor)'], ['insulator', 'Plastic (insulator)']], value: P.material, explain: 'In a metal some electrons are free to move through it; in an insulator every charge stays bound to its own molecule.' });
    F.choice({ key: 'sign', label: 'Ball’s charge', options: [[1, 'Positive'], [-1, 'Negative']], value: Math.sign(P.Q) || 1, explain: 'Either sign attracts a neutral sphere.' });
    F.slider({ key: 'd', label: 'Distance $d$', min: 7, max: 30, step: 0.5, value: P.d, unit: '\\mathrm{cm}', explain: 'Centre of the sphere to the ball.' });
    F.toggle({ key: 'ground', label: 'Connect the sphere to the ground', value: P.ground, explain: 'A wire to the earth, which can supply or swallow any amount of charge.' });
  } else Object.assign(F.params, { material: P.material, sign: Math.sign(P.Q) || 1, d: P.d, ground: P.ground });
  let ballBtn = null;
  if (ctl) ballBtn = F.button({ label: S.present ? 'Take the ball away' : 'Bring the ball back', onClick: () => { S.present = !S.present; ballBtn.textContent = S.present ? 'Take the ball away' : 'Bring the ball back'; settle(); draw(); } });
  if (ctl) F.button({ label: 'Reset', onClick: () => { S.qNet = P.qNet * NC; S.present = P.present; if (ballBtn) ballBtn.textContent = S.present ? 'Take the ball away' : 'Bring the ball back'; F.set('ground', false); settle(); draw(); } });
  const params = () => ({ Q: (F.params.sign || 1) * Math.abs(P.Q) * NC, d: F.params.d * CM, a: P.a * CM });
  // while grounded, the metal sphere takes whatever charge the earth gives it; otherwise its net charge stays put
  function settle() {
    if (F.params.material !== 'conductor') return;
    if (F.params.ground) S.qNet = S.present ? C.groundedCharge(params().Q, params().d, params().a) : 0;
  }
  F.onChange(() => { settle(); draw(); });
  settle();

  function draw() {
    plot.clear();
    const p = params(), a = P.a, d = F.params.d, metal = F.params.material === 'conductor';
    const Q = p.Q;
    // the sphere
    plot.circle(0, 0, a, { fill: metal ? 'ink4' : 'violet', alpha: 0.18, stroke: false });
    plot.circle(0, 0, a, { color: metal ? 'ink2' : 'violet', width: 2.4 });
    if (metal) {
      // surface charge from the image solution (with the ball absent, the net charge spreads evenly)
      const sig = (th) => (S.present ? C.sphereSigma(th, { Q, d: p.d, a: p.a, qNet: S.qNet }) : S.qNet / (4 * Math.PI * p.a * p.a));
      let smax = 0;
      for (let i = 0; i < 48; i++) smax = Math.max(smax, Math.abs(sig((i * Math.PI) / 24)));
      const ref = Math.max(smax, Math.abs(Q) / (4 * Math.PI * p.a * p.a) * 0.6) || 1;
      for (let i = 0; i < 28; i++) {
        const th = (i * 2 * Math.PI) / 28, s = sig(th), w = Math.min(1, Math.abs(s) / ref);
        if (w < 0.08) continue;
        // θ is measured from the +x axis, which points at the ball
        const x = (a - 0.8) * Math.cos(th), y = (a - 0.8) * Math.sin(th);
        plot.text(s > 0 ? '+' : '−', x, y, { color: s > 0 ? 'bad' : 'accent', size: 10 + 8 * w, weight: 800, align: 'center', halo: false });
      }
    } else {
      // molecules: tiny dipoles stretched along the ball's field, exaggerated enormously
      const pts = [];
      for (let i = -3; i <= 3; i++) for (let j = -3; j <= 3; j++) { const x = i * 1.25, y = j * 1.25; if (Math.hypot(x, y) < a - 0.7) pts.push([x, y]); }
      for (const [x, y] of pts) {
        let ex = 0, ey = 0;
        if (S.present) { const dx = x - d, dy = y, r = Math.hypot(dx, dy); ex = (Math.sign(Q) * dx) / r ** 3; ey = (Math.sign(Q) * dy) / r ** 3; }
        const m = Math.hypot(ex, ey), sh = S.present ? Math.min(0.42, 0.42 * (m / (1 / ((d - a) ** 2)))) : 0;
        const ux = m ? ex / m : 0, uy = m ? ey / m : 0;
        plot.circle(x, y, 0.5, { color: 'ink3', width: 1 });
        plot.text('+', x + ux * sh, y + uy * sh, { color: 'bad', size: 10, weight: 800, align: 'center', halo: false, dx: 3 * ux, dy: -3 * uy });
        plot.text('−', x - ux * sh, y - uy * sh, { color: 'accent', size: 11, weight: 800, align: 'center', halo: false, dx: -3 * ux, dy: 3 * uy });
      }
    }
    // the ground wire
    if (metal && F.params.ground) {
      plot.line(-a, 0, -a - 2.2, 0, { color: 'good', width: 2 }); plot.line(-a - 2.2, 0, -a - 2.2, -5.2, { color: 'good', width: 2 });
      for (let k = 0; k < 3; k++) plot.line(-a - 3.3 + k * 0.45, -5.2 - k * 0.55, -a - 1.1 - k * 0.45, -5.2 - k * 0.55, { color: 'good', width: 2 });
      plot.text('to ground', -a - 2.2, -5.2, { dx: -6, dy: 14, color: 'good', size: 11.5, align: 'right' });
    }
    // the ball on its insulating handle
    if (S.present) {
      plot.line(d, 1.2, d + 1.5, 7, { color: 'ink3', width: 3 });
      plot.circle(d, 0, 1.1, { color: Q > 0 ? 'bad' : 'accent', width: 2, fill: Q > 0 ? 'bad' : 'accent', alpha: 0.85 });
      plot.text(Q > 0 ? '+' : '−', d, 0, { color: 'bg', size: 15, weight: 800, align: 'center', halo: false });
      if (!P.ask) plot.text(`${Q > 0 ? '+' : '−'}${trim(Math.abs(P.Q))} nC`, d, 0, { dx: 14, dy: -14, color: Q > 0 ? 'bad' : 'accent', size: 12, weight: 650 });
    }
    // the force on the sphere (toward the ball is positive), drawn on a compressed scale
    let Fs = 0;
    if (S.present) Fs = metal ? C.forceOnSphere({ Q, d: p.d, a: p.a, qNet: S.qNet }) : C.forceOnDielectric({ Q, d: p.d, a: p.a, kappa: P.kappa });
    if (Math.abs(Fs) > 1e-12) {
      const len = Math.min(5.5, 1.2 + 1.1 * Math.log10(1 + Math.abs(Fs) / 1e-6));
      plot.arrow(0, -a - 1.4, Math.sign(Fs) * len, -a - 1.4, { color: 'gold', width: 3, head: 10 });
      plot.text(Fs > 0 ? 'pulled toward the ball' : 'pushed away from the ball', Math.sign(Fs) * len, -a - 1.4, { dx: Fs > 0 ? 8 : -8, align: Fs > 0 ? 'left' : 'right', color: 'gold', size: 12, weight: 650 });
    }
    const qn = S.qNet / NC;
    const head = P.ask ? (metal ? `metal sphere${F.params.ground ? ', grounded' : ''}` : 'plastic sphere')
      : metal ? `metal sphere: net charge ${Math.abs(qn) < 0.005 ? '0' : (qn > 0 ? '+' : '−') + trim(Math.abs(qn)) + ' nC'}` : 'plastic sphere: net charge 0 (it cannot gain charge from a wire)';
    plot.text(head, plot.L + 6, 14, { screen: true, color: 'ink2', size: 12, weight: 600 });
    if (P.readout !== false && !P.ask) F.readout([
      ['net charge on the sphere', `${trim(qn)}\\,\\mathrm{nC}`],
      ['force on the sphere', S.present ? `${texF(Math.abs(Fs))}\\ ${Fs >= 0 ? '\\text{(attraction)}' : '\\text{(repulsion)}'}` : '0'],
      ['ball’s charge', S.present ? `${Q > 0 ? '+' : '-'}${trim(Math.abs(P.Q))}\\,\\mathrm{nC}` : '\\text{(taken away)}'],
    ]);
  }
  F.draw(draw);
  F.caption('A metal sphere (radius 5 cm) or a plastic one near a small charged ball, seen in cross-section. On the metal sphere the + and − marks show the surface charge from the exact solution (marks bigger where it is denser); in the plastic one each molecule is drawn as a tiny dipole, its stretch enormously exaggerated. The force arrow uses a compressed (logarithmic) scale. The ball is treated as a point charge.');
  return { get: (k) => (k === 'qNet' ? S.qNet / NC : F.params[k]) };

  // ─── identical spheres sharing charge ──────────────────────────────────
  function shareScene() {
    const n = Math.min(3, Math.max(2, P.q.length));
    const st = { q: P.q.slice(0, n).map((x) => x * NC), anim: null };
    const home = n === 2 ? [0, 12] : [-4, 6, 16];
    const pos = home.slice();
    const R = 2.6;
    const touch = (i, j) => {
      const [a, b] = C.share(st.q[i], st.q[j]);
      const go = () => { st.q[i] = a; st.q[j] = b; draw(); };
      if (reduced) { go(); return; }
      st.anim = { i, j, t: 0, done: false, go };
      anim.start();
    };
    const anim = F.animate((dt) => {
      if (!st.anim) return;
      const A = st.anim;
      A.t += dt;
      const mid = (home[A.i] + home[A.j]) / 2, gap = Math.abs(home[A.j] - home[A.i]) / 2 - R;
      const u = A.t < 0.5 ? A.t / 0.5 : A.t < 0.8 ? 1 : Math.max(0, 1 - (A.t - 0.8) / 0.5);
      pos[A.i] = home[A.i] + Math.sign(mid - home[A.i]) * gap * u;
      pos[A.j] = home[A.j] + Math.sign(mid - home[A.j]) * gap * u;
      if (A.t >= 0.5 && !A.done) { A.done = true; A.go(); }
      if (A.t >= 1.3) { pos[A.i] = home[A.i]; pos[A.j] = home[A.j]; st.anim = null; }
      draw();
    }, { force: true });
    if (ctl) {
      const L = P.labels;
      F.button({ label: `Touch ${L[0]} and ${L[1]}`, primary: true, onClick: () => touch(0, 1) });
      if (n === 3) { F.button({ label: `Touch ${L[1]} and ${L[2]}`, onClick: () => touch(1, 2) }); F.button({ label: `Touch ${L[0]} and ${L[2]}`, onClick: () => touch(0, 2) }); }
      F.button({ label: 'Reset', onClick: () => { st.q = P.q.slice(0, n).map((x) => x * NC); draw(); } });
    }
    function draw() {
      plot.clear();
      plot.setView([-10, 22], [-8, 8]);
      const total = st.q.reduce((s, x) => s + x, 0);
      st.q.forEach((q, i) => {
        const x = pos[i], qn = q / NC;
        plot.line(x, -R, x, -7, { color: 'ink3', width: 3 });          // insulating stand
        plot.circle(x, 0, R, { fill: 'ink4', alpha: 0.2, stroke: false });
        plot.circle(x, 0, R, { color: 'ink2', width: 2.4 });
        // one mark per nC of net charge, spread over the surface (charge on a conductor sits on its surface)
        const marks = Math.min(16, Math.round(Math.abs(qn)));
        for (let k = 0; k < marks; k++) {
          const th = Math.PI / 2 + (k * 2 * Math.PI) / Math.max(1, marks);
          plot.text(qn > 0 ? '+' : '−', x + (R - 0.55) * Math.cos(th), (R - 0.55) * Math.sin(th), { color: qn > 0 ? 'bad' : 'accent', size: 13, weight: 800, align: 'center', halo: false });
        }
        plot.text(P.labels[i], x, R, { dy: -12, align: 'center', color: 'ink', size: 13, weight: 700 });
        if (!P.ask) plot.text(`${Math.abs(qn) < 0.005 ? '0' : (qn > 0 ? '+' : '−') + trim(Math.abs(qn))} nC`, x, -R, { dy: 14, dx: 26, color: qn > 0 ? 'bad' : qn < 0 ? 'accent' : 'ink3', size: 12, weight: 650 });
      });
      if (!P.ask) plot.text(`total: ${Math.abs(total / NC) < 0.005 ? '0' : trim(total / NC)} nC`, plot.R - 6, 14, { screen: true, align: 'right', color: 'gold', size: 12.5, weight: 700 });
      if (P.readout !== false && !P.ask) F.readout([
        ...st.q.map((q, i) => [`$q_${P.labels[i]}$`, `${trim(q / NC)}\\,\\mathrm{nC}`]),
        ['total', `${trim(total / NC)}\\,\\mathrm{nC}`],
        ...st.q.map((q, i) => [`electrons gained by ${P.labels[i]} (− : lost)`, electrons(q)]),
      ]);
    }
    F.draw(draw);
    F.caption('Identical metal spheres on insulating stands (one mark per nanocoulomb of net charge). When two touch, charge flows until they share it equally; the total never changes. Each nanocoulomb is about 6.2 billion elementary charges.');
    return { get: (k) => (k === 'q' ? st.q.map((x) => x / NC) : F.params[k]) };
  }
}

/** Node-side check used by the content tests. */
export function validate(P0) {
  const P = { ...defaults, ...P0 }, problems = [];
  if (!['ball', 'share'].includes(P.scene)) return ['scene must be ball or share'];
  if (P.scene === 'ball') {
    if (!['conductor', 'insulator'].includes(P.material)) problems.push('material must be conductor or insulator');
    if (!(Math.abs(P.Q) > 0 && Math.abs(P.Q) <= 200)) problems.push('Q must be nonzero, up to 200 nC');
    if (!(P.d >= 7 && P.d <= 30)) problems.push('d must lie in [7, 30] cm');
    if (!(P.a > 0 && P.a < P.d - 1.5)) problems.push('the ball must sit outside the sphere');
    if (!(P.kappa >= 1)) problems.push('kappa must be at least 1');
    for (const k of ['ground', 'present']) if (typeof P[k] !== 'boolean') problems.push(`${k} must be true or false`);
  } else {
    if (!Array.isArray(P.q) || P.q.length < 2 || P.q.length > 3 || !P.q.every((x) => Number.isFinite(x) && Math.abs(x) <= 16)) problems.push('q: two or three charges, each within ±16 nC');
  }
  for (const k of ['controls', 'readout', 'ask']) if (typeof P[k] !== 'boolean') problems.push(`${k} must be true or false`);
  return problems;
}
