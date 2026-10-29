// The DOM-free models behind the Road to Einstein's foundation simulations:
// the light clock (gr-light-clock), plane coordinates and lengths
// (gr-coordinates) and parallel transport on a sphere (gr-sphere-transport).
//   node atlas/test/gr-foundations.test.mjs

import * as K from '../src/viz/model/gr-clock.js';
import * as P from '../src/viz/model/gr-coords.js';
import * as S from '../src/viz/model/gr-sphere.js';
import { gamma } from '../src/viz/model/relativity.js';
import { simpson } from '../src/viz/model/numeric.js';
import { validate as validateClock } from '../src/viz/sims/gr-light-clock.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const near = (a, b, tol = 1e-9) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(b));

// ─── the light clock (c = 1) ───────────────────────────────────────────────
for (const beta of [0, 0.3, 0.6, 0.8, 0.99]) {
  const L = 1.7;
  check(`light clock at β = ${beta}: moving tick = γ × rest tick`, near(K.movingTick(L, beta) / K.restTick(L), gamma(beta)));
  // the pulse moves at exactly c in the frame where the clock moves, on both legs
  const T = K.movingTick(L, beta);
  for (const tt of [0.1 * T, 0.7 * T, 2.3 * T]) {
    const h = 1e-6 * T, a = K.pulse(L, beta, tt), b = K.pulse(L, beta, tt + h);
    const speed = Math.hypot(b.x - a.x, b.y - a.y) / h;
    check(`light clock at β = ${beta}: pulse speed is c at t = ${(tt / T).toFixed(1)}T`, near(speed, 1, 1e-6), String(speed));
  }
  const tri = K.halfTickTriangle(L, beta);
  check(`light clock at β = ${beta}: half-tick triangle obeys Pythagoras`, near(tri.slant ** 2, tri.up ** 2 + tri.across ** 2));
  check(`light clock at β = ${beta}: the pulse is back on the lower mirror after each tick`, near(K.pulse(L, beta, 3 * T).y, 0, 1e-9) && K.pulse(L, beta, 3.25 * T).ticks === 3);
}
check('light clock: pulse reaches the upper mirror at half a tick', near(K.pulse(2, 0.6, K.movingTick(2, 0.6) / 2).y, 2));
check('light clock sim rejects β ≥ 1', validateClock({ beta: 1 }).length > 0 && validateClock({ beta: 0.6 }).length === 0);

// ─── plane coordinates and metric lengths ─────────────────────────────────
{
  const alpha = Math.PI / 3;
  for (const [cx, cy, R, label] of [[3, 0.5, 1.5, 'not enclosing the origin'], [0.4, -0.3, 2, 'enclosing the origin'], [0, 0, 2.5, 'centred on the origin']]) {
    const L = P.lengths(P.circle(cx, cy, R, 1440), alpha);
    check(`circle ${label}: Cartesian length is 2πR`, near(L.cart, 2 * Math.PI * R, 1e-4), String(L.cart));
    check(`circle ${label}: the polar metric gives the same length`, near(L.polar, L.cart, 1e-4), `${L.polar} vs ${L.cart}`);
    check(`circle ${label}: the skewed metric gives the same length`, near(L.skew, L.cart, 1e-6), `${L.skew} vs ${L.cart}`);
    check(`circle ${label}: √(dr² + dθ²) is not the length`, Math.abs(L.naivePolar - L.cart) > 0.05 * L.cart, `${L.naivePolar}`);
    const encloses = Math.hypot(cx, cy) < R;
    check(`circle ${label}: winds ${encloses ? 'once' : 'zero times'} around the origin`, near(L.winding, encloses ? 2 * Math.PI : 0, 1e-6) || (!encloses && Math.abs(L.winding) < 1e-6), String(L.winding));
  }
  // a segment passing right through the origin, where θ is undefined
  const seg = P.lengths(P.segment([-2, -1], [4, 2], 600));
  check('segment through the origin: the polar metric still gives its length', near(seg.polar, Math.hypot(6, 3), 2e-3), `${seg.polar} vs ${Math.hypot(6, 3)}`);
  // coordinates round-trip, and a constant arrow rebuilt from its polar components
  for (const [x, y] of [[1, 1], [-2, 0.5], [0.3, -4]]) {
    const [r, th] = P.toPolar(x, y), [x2, y2] = P.fromPolar(r, th);
    const [u, v] = P.toSkew(x, y, alpha), [x3, y3] = P.fromSkew(u, v, alpha);
    check(`(${x}, ${y}): polar and skewed coordinates round-trip`, near(x2, x) && near(y2, y) && near(x3, x) && near(y3, y));
    const a = 0.7, [vr, vt] = P.polarComponents(a, th), B = P.polarBasis(th);
    const back = [vr * B.rhat[0] + vt * B.thetahat[0], vr * B.rhat[1] + vt * B.thetahat[1]];
    check(`(${x}, ${y}): a constant arrow is rebuilt from its changing polar components`, near(back[0], Math.cos(a)) && near(back[1], Math.sin(a)));
  }
  check('the east arrow at (1, 1) has polar components (0.7071, −0.7071)', near(P.polarComponents(0, Math.PI / 4)[0], Math.SQRT1_2) && near(P.polarComponents(0, Math.PI / 4)[1], -Math.SQRT1_2));
  check('skewed axes at 60°: the point (u, v) = (3, 5) is 7 from the origin', near(Math.hypot(...P.fromSkew(3, 5, Math.PI / 3)), 7, 1e-12));
}

// ─── parallel transport on the unit sphere ─────────────────────────────────
{
  const N = [0, 0, 1];
  // triangles with a corner at the north pole: rotation = excess = enclosed area
  for (const [th0, dphi] of [[90, 90], [90, 40], [90, 150], [60, 90], [35, 70], [10, 120]]) {
    const t0 = (th0 * Math.PI) / 180, dp = (dphi * Math.PI) / 180;
    const A = S.sph(t0, 0), B = S.sph(t0, dp);
    const { path } = S.geodesicPolygon([N, A, B], { perRadian: 400 });
    const v0 = S.toward(N, A);
    const vs = S.transport(path, v0);
    const rot = S.tangentAngle(N, v0, vs[vs.length - 1]);
    const { excess } = S.triangle(N, A, B);
    // independent area: integrate (1 − cos θ_edge(φ)) dφ under the great-circle edge from A to B
    const n = S.cross(A, B);
    const area = simpson((phi) => { const z = -(n[0] * Math.cos(phi) + n[1] * Math.sin(phi)) / n[2]; return 1 - z / Math.hypot(1, z); }, 0, dp, 2000);
    const areaEq = th0 === 90 ? dp : area;
    check(`triangle (corners ${th0}° from the pole, ${dphi}° apart): excess equals the enclosed area`, near(excess, areaEq, 1e-6), `${excess} vs ${areaEq}`);
    check(`triangle (corners ${th0}° from the pole, ${dphi}° apart): the arrow turns anticlockwise by the area`, near(rot, excess, 1e-9), `${rot} vs ${excess}`);
  }
  check('octant triangle: three right angles, arrow turns 90°', near(S.triangle(N, S.sph(Math.PI / 2, 0), S.sph(Math.PI / 2, Math.PI / 2)).angles[1], Math.PI / 2, 1e-12));
  // along one great-circle leg the arrow keeps its angle to the path
  {
    const A = S.sph(Math.PI / 2, 0), B = S.sph(Math.PI / 2, 1.2);
    const { path } = S.geodesicPolygon([A, B], { closed: false });
    const vs = S.transport(path, S.northEast(A).north);
    const angle0 = S.tangentAngle(A, S.toward(A, B), vs[0]), k = Math.floor(path.length / 2);
    const tangentK = S.toward(path[k], path[k + 1]);
    check('along a great circle the transported arrow keeps its angle to the path', near(S.tangentAngle(path[k], tangentK, vs[k]), angle0, 1e-9));
  }
  // circles of latitude: rotation = cap area (mod 2π), converging as the steps shrink
  for (const latDeg of [60, 45, 30, 75, 10]) {
    const th0 = ((90 - latDeg) * Math.PI) / 180;
    const path = S.latitudeCircle(th0, { perRadian: 2000 });
    const v0 = S.northEast(path[0]).north;
    const vs = S.transport(path, v0);
    const rot = S.wrap2pi(S.tangentAngle(path[0], v0, vs[vs.length - 1]));
    const want = S.wrap2pi(S.capArea(th0));
    check(`circle of latitude ${latDeg}°: the arrow turns by the cap area 2π(1 − sin λ)`, Math.abs(rot - want) < 2e-5, `${rot} vs ${want}`);
  }
  check('60°N: 360°(1 − sin 60°) = 48.2°', near((S.capArea(Math.PI / 6) * 180) / Math.PI, 360 * (1 - Math.sin(Math.PI / 3)), 1e-12) && Math.abs((S.capArea(Math.PI / 6) * 180) / Math.PI - 48.2) < 0.05);
}

console.log(`${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
