// The Liénard–Wiechert model behind the em4b-kink simulation.
//   node atlas/test/em4b-kink.test.mjs

import * as K from '../src/viz/model/em4b-kink.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const near = (a, b, rel = 1e-9, abs = 0) => Math.abs(a - b) <= rel * Math.max(Math.abs(a), Math.abs(b)) + abs;

// the retarded time solves its equation, for every mode
for (const mode of ['uniform', 'stop', 'start']) {
  const W = K.worldline(mode, 0.8, 0.7);
  let worst = 0;
  for (const [T, X, Y] of [[2, 1, 1], [0.3, -2, 0.5], [5, 3, -2], [-1, 0.2, 0.1], [0.5, 0.1, 0]]) {
    const tr = K.retardedTime(W, T, X, Y);
    worst = Math.max(worst, Math.abs(T - tr - Math.hypot(X - W.x(tr), Y)));
  }
  check(`${mode}: retarded time solves c(t − t_r) = 𝓻`, worst < 1e-10, `${worst}`);
}

// the worldlines are continuous with continuous velocity
for (const mode of ['stop', 'start']) {
  const W = K.worldline(mode, 0.6, 0.5), e = 1e-9;
  check(`${mode}: position and velocity continuous at 0 and τ`, [0, 0.5].every((t) => near(W.x(t - e), W.x(t + e), 0, 1e-8) && near(W.v(t - e), W.v(t + e), 0, 1e-8)));
}

// uniform motion: the LW field equals Heaviside's field pointing from the present position
for (const beta of [0.2, 0.6, 0.95]) {
  const W = K.worldline('uniform', beta, 1);
  let worst = 0;
  for (const [X, Y] of [[1, 1], [-2, 0.3], [0.4, -1.5], [3, 2]]) {
    const T = 0.7, E = K.field(W, T, X, Y), H = K.uniformField(beta, beta * T, X, Y);
    worst = Math.max(worst, Math.abs(E.Ex - H.Ex) / Math.hypot(H.Ex, H.Ey), Math.abs(E.Ey - H.Ey) / Math.hypot(H.Ex, H.Ey));
  }
  check(`uniform β = ${beta}: E points from the present position, with Heaviside's size`, worst < 1e-9, `${worst}`);
  const H = K.uniformField(beta, 0, 0, 1), Hl = K.uniformField(beta, 0, 1, 0);
  check(`uniform β = ${beta}: E side-on is γ/r², head-on (1 − β²)/r²`, near(H.Ey, 1 / Math.sqrt(1 - beta * beta), 1e-12) && near(Hl.Ex, 1 - beta * beta, 1e-12));
}

// a stopped charge: inside the inner shell, Coulomb from the stop point; outside the outer shell, the field of the charge had it not stopped
{
  const beta = 0.5, tau = 0.4, W = K.worldline('stop', beta, tau), T = 3;
  const xs = (beta * tau) / 2;
  const inner = K.field(W, T, xs + 1, 1.2), r2 = 1 + 1.44;
  check('stop: inside the inner shell E = 1/r² from the stop point', near(inner.Ex, 1 / r2 * (1 / Math.sqrt(r2)), 1e-9) && near(inner.Ey, 1.2 / r2 ** 1.5, 1e-9));
  const out = K.field(W, T, 3.5, 2), H = K.uniformField(beta, beta * T, 3.5, 2);
  check('stop: outside the outer shell E is the uniform field from where the charge would be', near(out.Ex, H.Ex, 1e-9) && near(out.Ey, H.Ey, 1e-9));
}

// Gauss's law holds through a sphere that cuts the radiation shell: flux = 4π
for (const [mode, T] of [['stop', 2], ['start', 1.7], ['stop', 0.2]]) {
  const W = K.worldline(mode, 0.7, 0.5), R = 2.2, n = 4000;
  let flux = 0;
  for (let i = 0; i < n; i++) {
    const th = ((i + 0.5) / n) * Math.PI, X = R * Math.cos(th), Y = R * Math.sin(th);
    const E = K.field(W, T, X, Y);
    flux += (E.Ex * Math.cos(th) + E.Ey * Math.sin(th)) * 2 * Math.PI * R * R * Math.sin(th) * (Math.PI / n);
  }
  check(`${mode} at T = ${T}: flux through a sphere is 4π (Gauss)`, near(flux, 4 * Math.PI, 2e-3), `${flux / (4 * Math.PI)}`);
}

// the radiation field: in the shell of a slow charge stopped abruptly, E⊥ ≈ a sin θ / 𝓻 (c = 1)
{
  const beta = 0.01, tau = 0.05, W = K.worldline('stop', beta, tau), a = beta / tau;
  const T = 10.025, th = Math.PI / 3, r = 10;   // a point in the middle of the shell, 60° from the motion
  const E = K.field(W, T, r * Math.cos(th), r * Math.sin(th));
  const perp = -E.Ex * Math.sin(th) + E.Ey * Math.cos(th);
  check('stop: radiation field in the shell ≈ a sinθ/r', near(Math.abs(perp), (a * Math.sin(th)) / r, 0.03), `${Math.abs(perp)} vs ${(a * Math.sin(th)) / r}`);
  check('stop: the radiation field exceeds the Coulomb field there', Math.abs(perp) > 1 / (r * r));
}

// field lines: a line traced through a stopped charge's shell ends up radial from the extrapolated position
{
  const beta = 0.6, tau = 0.3, W = K.worldline('stop', beta, tau), T = 2.5;
  const pts = K.fieldLine(W, T, Math.PI / 2, { bx: 8, by: 8, h: 0.02 });
  const [x, y] = pts[pts.length - 1], [x1, y1] = pts[pts.length - 20];
  const H = K.uniformField(beta, beta * T, x, y), m = Math.hypot(H.Ex, H.Ey);
  const dx = x - x1, dy = y - y1, dm = Math.hypot(dx, dy);
  check('stop: far out, the field line runs along the uniform field', Math.abs(dx / dm * H.Ex / m + dy / dm * H.Ey / m - 1) < 1e-3);
  check('stop: two news shells after the stop', K.shells('stop', W, T, tau).length === 2);
}

console.log(`${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
