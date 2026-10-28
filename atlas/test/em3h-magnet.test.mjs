// The magnetized-body model behind the em3h-magnet simulation: Bulirsch's cel
// against known elliptic integrals, the closed-form solenoid against a direct
// Biot–Savart quadrature over its loops, the axis formula, ∇·B = 0 and
// ∇×B = 0 away from the surface current, the jumps across the side (B_z by
// μ₀K, H_z continuous) and across an end face (B_z continuous, H_z by M),
// B = (1 − N)μ₀M at the centre, the sphere's ⅔ and its dipole outside,
// flux conservation through the midplane, the electret equivalence, field
// lines that close (B) or end on the south face (H); and both simulations'
// parameter validators are exercised by em3h-loop.test.mjs and here.
//   node atlas/test/em3h-magnet.test.mjs

import * as M from '../src/viz/model/em3h-magnet.js';
import { validate, defaults } from '../src/viz/sims/em3h-magnet.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const close = (a, b, tol) => Math.abs(a - b) <= tol * Math.max(Math.abs(b), 1e-300);

// ── cel: K(m) = cel(k_c, 1, 1, 1), E(m) = cel(k_c, 1, 1, k_c²) ──
check('cel gives K(m = 0.25)', close(M.cel(Math.sqrt(0.75), 1, 1, 1), 1.685750354812596, 1e-12));
check('cel gives E(m = 0.25)', close(M.cel(Math.sqrt(0.75), 1, 1, 0.75), 1.467462209339427, 1e-12));
check('cel gives K(0) = π/2', close(M.cel(1, 1, 1, 1), Math.PI / 2, 1e-14));

// ── the solenoid against Biot–Savart over its loops (Gauss–Legendre in z and φ) ──
const GX = [-0.9739065285171717, -0.8650633666889845, -0.6794095682990244, -0.4333953941292472, -0.1488743389816312, 0.1488743389816312, 0.4333953941292472, 0.6794095682990244, 0.8650633666889845, 0.9739065285171717];
const GW = [0.0666713443086881, 0.1494513491505806, 0.2190863625159820, 0.2692667193099963, 0.2955242247147529, 0.2955242247147529, 0.2692667193099963, 0.2190863625159820, 0.1494513491505806, 0.0666713443086881];
function gl(f, a, b, panels) {
  let s = 0; const h = (b - a) / panels;
  for (let p = 0; p < panels; p++) for (let i = 0; i < 10; i++) s += GW[i] * f(a + h * (p + 0.5) + (h / 2) * GX[i]) * (h / 2);
  return s;
}
// B/μ₀K of a loop of unit radius at height z0, at (ρ, z): μ₀/4π ∮ dl × R / R³ with K dz as the current
function loopBz(rho, z, z0, comp) {
  return gl((p) => {
    const dl = [-Math.sin(p), Math.cos(p), 0], R = [rho - Math.cos(p), -Math.sin(p), z - z0], d3 = Math.hypot(...R) ** 3;
    const c = [dl[1] * R[2] - dl[2] * R[1], dl[2] * R[0] - dl[0] * R[2], dl[0] * R[1] - dl[1] * R[0]];
    return (comp === 'r' ? c[0] : c[2]) / d3;
  }, 0, 2 * Math.PI, 16) / (4 * Math.PI);
}
let worst = 0;
for (const h of [0.2, 1, 2.5]) for (const [rho, z] of [[0, 0.1], [0.4, 0.3], [1.6, 0.2], [2, 3], [0.3, h + 0.6], [3, -1.2], [0.7, -h - 0.4]]) {
  const ex = M.solenoidB(1, h, rho, z);
  const nr = gl((z0) => loopBz(rho, z, z0, 'r'), -h, h, 24), nz = gl((z0) => loopBz(rho, z, z0, 'z'), -h, h, 24);
  worst = Math.max(worst, Math.abs(ex[0] - nr), Math.abs(ex[1] - nz));
}
check('closed-form solenoid matches Biot–Savart quadrature', worst < 1e-7, `${worst}`);

// ── the axis and the centre ──
for (const ratio of [0.1, 0.5, 1, 3]) {
  const S = M.body({ shape: 'cylinder', ratio });
  let w = 0;
  for (const z of [0, 0.3 * ratio, ratio + 0.2, 4]) w = Math.max(w, Math.abs(M.B(S, 0, z)[1] - M.axisB(S, z)));
  check(`axis field, L/D = ${ratio}`, w < 1e-10, `${w}`);
  check(`B at the centre is (1 − N)μ₀M, L/D = ${ratio}`, close(M.B(S, 0, 0)[1], 1 - M.centreN(S), 1e-10));
  check(`H at the centre is −NM, L/D = ${ratio}`, close(M.H(S, 0, 0)[1], -M.centreN(S), 1e-9));
}

// ── Maxwell away from the surfaces: ∇·B = 0, (∇×B)_φ = 0 ──
const S1 = M.body({ shape: 'cylinder', ratio: 0.8 });
const e = 1e-4;
const divB = (S, r, z) => { const Br = (rr) => M.B(S, rr, z)[0]; return (((r + e) * Br(r + e) - (r - e) * Br(r - e)) / (2 * e)) / r + (M.B(S, r, z + e)[1] - M.B(S, r, z - e)[1]) / (2 * e); };
const curlB = (S, r, z) => (M.B(S, r, z + e)[0] - M.B(S, r, z - e)[0]) / (2 * e) - (M.B(S, r + e, z)[1] - M.B(S, r - e, z)[1]) / (2 * e);
worst = 0;
for (const [r, z] of [[0.3, 0.2], [0.6, -0.5], [1.4, 0.3], [0.5, 1.5], [2.5, -2]]) worst = Math.max(worst, Math.abs(divB(S1, r, z)), Math.abs(curlB(S1, r, z)));
check('∇·B = 0 and ∇×B = 0 inside and outside (no free current)', worst < 1e-6, `${worst}`);

// ── jumps: the side (bound current K = M) and an end face (pole density M) ──
const d = 1e-7;
const Bin = M.B(S1, 1 - d, 0.2), Bout = M.B(S1, 1 + d, 0.2), Hin = M.H(S1, 1 - d, 0.2), Hout = M.H(S1, 1 + d, 0.2);
check('side: B_z jumps by μ₀K = μ₀M', close(Bin[1] - Bout[1], 1, 1e-5), `${Bin[1] - Bout[1]}`);
check('side: B_ρ continuous', Math.abs(Bin[0] - Bout[0]) < 1e-5);
check('side: H_z continuous (no free current)', Math.abs(Hin[1] - Hout[1]) < 1e-5);
const zf = S1.half, Fin = M.B(S1, 0.4, zf - d), Fout = M.B(S1, 0.4, zf + d), FHin = M.H(S1, 0.4, zf - d), FHout = M.H(S1, 0.4, zf + d);
check('end face: B_z continuous', Math.abs(Fin[1] - Fout[1]) < 1e-5);
check('end face: H_z jumps by M', close(FHout[1] - FHin[1], 1, 1e-5));

// ── flux conservation through the midplane: up inside = down outside ──
const up = M.fluxUp(S1, 1);
// beyond r = 60 the field is a dipole's, B_z = −L/4r³ (units μ₀M, moment πa²L·M): its tail adds −πL/(2·60)
const down = gl((r) => M.B(S1, r, 0)[1] * 2 * Math.PI * r, 1, 60, 200) - (Math.PI * S1.L) / (2 * 60);
check('the flux up through the magnet returns outside it', close(-down, up, 2e-3), `${up} vs ${-down}`);

// ── the sphere ──
const SS = M.body({ shape: 'sphere' });
check('sphere: B = ⅔μ₀M inside', close(M.B(SS, 0.3, -0.2)[1], 2 / 3, 1e-14) && M.B(SS, 0.3, -0.2)[0] === 0);
check('sphere: H = −M/3 inside', close(M.H(SS, 0.1, 0.5)[1], -1 / 3, 1e-14));
const th = 0.7, rin = [Math.sin(th) * (1 - d), Math.cos(th) * (1 - d)], rout = [Math.sin(th) * (1 + d), Math.cos(th) * (1 + d)];
const nr = (b) => b[0] * Math.sin(th) + b[1] * Math.cos(th);
check('sphere: B_r continuous at the surface', Math.abs(nr(M.B(SS, ...rin)) - nr(M.B(SS, ...rout))) < 1e-5);
check('sphere: on the axis outside, B = 2m/4πr³ with m = (4/3)πa³M', close(M.B(SS, 0, 2.5)[1], (2 * (4 / 3) * Math.PI) / (4 * Math.PI * 2.5 ** 3), 1e-12));
check('sphere: centreN = 1/3', M.centreN(SS) === 1 / 3);

// ── the electret: ε₀E ≡ H, D ≡ B/μ₀ ──
check('electret fields are the magnet’s H and B', M.field(S1, 'E', 0.5, 0.3).every((v, i) => v === M.H(S1, 0.5, 0.3)[i]) && M.field(S1, 'D', 0.5, 0.3).every((v, i) => v === M.B(S1, 0.5, 0.3)[i]));

// ── field lines ──
const sb = M.seeds(S1, 'B', 5);
check('B seeds: the first on the axis, all inside', sb[0][0] === 0 && sb.every(([x]) => x >= 0 && x < 1));
const tB = M.trace(S1, 'B', sb[3][0], 0, 1, [-6, 6, -6, 6], { ds: 0.01 });
check('a B line closes on itself', tB.end === 'closed', tB.end);
const sh = M.seeds(S1, 'H', 5);
const tH = M.trace(S1, 'H', sh[2][0], S1.half - 1e-3, 1, [-6, 6, -6, 6], { ds: 0.01 });
check('an H line from the north face ends on the south face', tH.end === 'pole' && Math.abs(tH.pts[tH.pts.length - 1][1] + S1.half) < 0.02, `${tH.end}`);
const tHo = M.trace(S1, 'H', sh[3][0], S1.half + 1e-3, 1, [-6, 6, -6, 6], { ds: 0.01 });
check('an H line leaving the north face outside comes back to the south face', tHo.end === 'pole', tHo.end);

// ── validate ──
check('defaults validate', validate(defaults).length === 0, validate(defaults).join('; '));
check('a bad shape is caught', validate({ ...defaults, shape: 'cube' }).length === 1);
check('a bad ratio is caught', validate({ ...defaults, ratio: 0 }).length === 1);
check('a bad control is caught', validate({ ...defaults, controls: ['spin'] }).length === 1);

console.log(`em3h-magnet: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
