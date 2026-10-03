/* Structural steel and fasteners for the test cell: rolled sections (wide-
   flange I-beams, channels, angles, rectangular hollow sections) extruded
   along a member between two points; plates with rounded corners, holes
   and chamfered edges; gussets; bolt heads with washers, instanced; anchor
   bolts. What makes a stand look like a stand rather than a stack of
   boxes is mostly this: real section shapes, and the bolts. Units are
   metres. */
import * as THREE from 'three';

const Z = new THREE.Vector3(0, 0, 1);

/* ---- section shapes (in the member's cross-section plane) ------------- */

/* Wide-flange I-beam: depth d, flange width b, web tw, flange tf, root r. */
export function iSection(d, b, tw = d * 0.06, tf = d * 0.09) {
  const s = new THREE.Shape(), hb = b / 2, hd = d / 2, ht = tw / 2, rr = Math.min(tw, tf) * 0.9;
  s.moveTo(-hb, -hd); s.lineTo(hb, -hd); s.lineTo(hb, -hd + tf); s.lineTo(ht + rr, -hd + tf);
  s.quadraticCurveTo(ht, -hd + tf, ht, -hd + tf + rr); s.lineTo(ht, hd - tf - rr);
  s.quadraticCurveTo(ht, hd - tf, ht + rr, hd - tf); s.lineTo(hb, hd - tf); s.lineTo(hb, hd); s.lineTo(-hb, hd);
  s.lineTo(-hb, hd - tf); s.lineTo(-ht - rr, hd - tf); s.quadraticCurveTo(-ht, hd - tf, -ht, hd - tf - rr);
  s.lineTo(-ht, -hd + tf + rr); s.quadraticCurveTo(-ht, -hd + tf, -ht - rr, -hd + tf); s.lineTo(-hb, -hd + tf); s.closePath();
  return s;
}

/* Channel (C): depth d, flange b, open toward +x. */
export function cSection(d, b, tw = d * 0.07, tf = d * 0.09) {
  const s = new THREE.Shape(), hd = d / 2;
  s.moveTo(0, -hd); s.lineTo(b, -hd); s.lineTo(b, -hd + tf); s.lineTo(tw, -hd + tf); s.lineTo(tw, hd - tf);
  s.lineTo(b, hd - tf); s.lineTo(b, hd); s.lineTo(0, hd); s.closePath();
  return s;
}

/* Equal angle (L): leg a, thickness t. */
export function lSection(a, t = a * 0.12) {
  const s = new THREE.Shape();
  s.moveTo(0, 0); s.lineTo(a, 0); s.lineTo(a, t); s.lineTo(t, t); s.lineTo(t, a); s.lineTo(0, a); s.closePath();
  return s;
}

/* Rectangular hollow section: w × h, wall t, corner radius 2t. */
export function rhsSection(w, h = w, t = w * 0.08) {
  const rr = (s, x, y, W, H, r) => {
    s.moveTo(x + r, y); s.lineTo(x + W - r, y); s.quadraticCurveTo(x + W, y, x + W, y + r); s.lineTo(x + W, y + H - r);
    s.quadraticCurveTo(x + W, y + H, x + W - r, y + H); s.lineTo(x + r, y + H); s.quadraticCurveTo(x, y + H, x, y + H - r);
    s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  };
  const s = new THREE.Shape(); rr(s, -w / 2, -h / 2, w, h, 2 * t);
  const hole = new THREE.Path(); rr(hole, -w / 2 + t, -h / 2 + t, w - 2 * t, h - 2 * t, t);
  s.holes.push(hole);
  return s;
}

/* A member of a given section between points a and b. roll turns the
   section about the member axis (radians). Ends are cut square. */
export function member(shape, a, b, mat, { roll = 0, cast = true } = {}) {
  const A = a.isVector3 ? a : new THREE.Vector3(...a), B = b.isVector3 ? b : new THREE.Vector3(...b);
  const L = A.distanceTo(B);
  const geo = new THREE.ExtrudeGeometry(shape, { depth: L, bevelEnabled: false, curveSegments: 4 });
  const m = new THREE.Mesh(geo, mat);
  const dir = B.clone().sub(A).normalize();
  // keep the section's "up" (its local y) as close to world up as the member allows
  const q = new THREE.Quaternion().setFromUnitVectors(Z, dir);
  const up = new THREE.Vector3(0, 1, 0).applyQuaternion(q);
  const want = Math.abs(dir.y) > 0.95 ? new THREE.Vector3(0, 0, 1) : new THREE.Vector3(0, 1, 0);
  const proj = want.clone().sub(dir.clone().multiplyScalar(want.dot(dir))).normalize();
  const ang = Math.atan2(up.clone().cross(proj).dot(dir), up.dot(proj));
  q.premultiply(new THREE.Quaternion().setFromAxisAngle(dir, ang + roll));
  m.quaternion.copy(q); m.position.copy(A);
  m.castShadow = cast; m.receiveShadow = true;
  return m;
}

/* ---- plates ---------------------------------------------------------- */

/* A plate w (local x) × h (local y) × t (thickness, local z, centred),
   corner radius rc, a small edge chamfer, optional round holes [x, y, r]. */
export function plate({ w, h, t, rc = Math.min(w, h) * 0.06, holes = [], mat, chamfer = Math.min(t * 0.25, 0.002) }) {
  const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
  s.moveTo(x + rc, y); s.lineTo(x + w - rc, y); s.quadraticCurveTo(x + w, y, x + w, y + rc); s.lineTo(x + w, y + h - rc);
  s.quadraticCurveTo(x + w, y + h, x + w - rc, y + h); s.lineTo(x + rc, y + h); s.quadraticCurveTo(x, y + h, x, y + h - rc);
  s.lineTo(x, y + rc); s.quadraticCurveTo(x, y, x + rc, y);
  for (const [hx, hy, hr] of holes) { const p = new THREE.Path(); p.absarc(hx, hy, hr, 0, Math.PI * 2, true); s.holes.push(p); }
  const geo = new THREE.ExtrudeGeometry(s, { depth: t - 2 * chamfer, bevelEnabled: chamfer > 0, bevelThickness: chamfer, bevelSize: chamfer, bevelSegments: 1, curveSegments: 10 });
  geo.translate(0, 0, -(t - 2 * chamfer) / 2);
  const m = new THREE.Mesh(geo, mat); m.castShadow = m.receiveShadow = true;
  return m;
}

/* A triangular gusset: legs a (local x) and b (local y), thickness t,
   the right angle at the origin, the hypotenuse cropped. */
export function gusset({ a, b, t, mat, crop = 0.15 }) {
  const s = new THREE.Shape();
  s.moveTo(0, 0); s.lineTo(a, 0); s.lineTo(a, b * crop); s.lineTo(a * crop, b); s.lineTo(0, b); s.closePath();
  const geo = new THREE.ExtrudeGeometry(s, { depth: t, bevelEnabled: false });
  geo.translate(0, 0, -t / 2);
  const m = new THREE.Mesh(geo, mat); m.castShadow = m.receiveShadow = true;
  return m;
}

/* ---- fasteners ------------------------------------------------------- */

const boltMat = new THREE.MeshStandardMaterial({ color: 0x9a9c98, metalness: 0.85, roughness: 0.4 });
const hexGeo = new THREE.CylinderGeometry(1, 1, 0.62, 6); hexGeo.translate(0, 0.31 + 0.12, 0);
const washerGeo = new THREE.CylinderGeometry(1.45, 1.45, 0.12, 14); washerGeo.translate(0, 0.06, 0);
const studGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.5, 8); studGeo.translate(0, 0.55 + 0.25 + 0.12, 0);

/* Bolt heads (hex + washer, and a stub of thread) at points p, all facing
   along normal n, of nominal across-flats size d. Instanced: hundreds cost
   three draw calls. */
export function bolts(points, n, d = 0.012, { stud = true, mat = boltMat } = {}) {
  const g = new THREE.Group();
  const N = n.isVector3 ? n.clone().normalize() : new THREE.Vector3(...n).normalize();
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), N);
  const parts = [[hexGeo, 1], [washerGeo, 1]].concat(stud ? [[studGeo, 1]] : []);
  for (const [geo] of parts) {
    const im = new THREE.InstancedMesh(geo, mat, points.length);
    const M = new THREE.Matrix4(), S = new THREE.Vector3(d * 0.58, d * 0.58, d * 0.58);
    points.forEach((p, i) => {
      const P = p.isVector3 ? p : new THREE.Vector3(...p);
      const rq = q.clone().multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), (i * 0.7) % 1.05));
      M.compose(P, rq, S); im.setMatrixAt(i, M);
    });
    im.castShadow = true; im.receiveShadow = true;
    g.add(im);
  }
  return g;
}

/* n bolts on a circle of radius R about centre c, in the plane normal to n. */
export function boltCircle(c, n, R, count, d, opts) {
  const N = n.isVector3 ? n.clone().normalize() : new THREE.Vector3(...n).normalize();
  const C = c.isVector3 ? c : new THREE.Vector3(...c);
  const u = Math.abs(N.y) < 0.9 ? new THREE.Vector3(0, 1, 0).cross(N).normalize() : new THREE.Vector3(1, 0, 0).cross(N).normalize();
  const v = N.clone().cross(u);
  const pts = [];
  for (let i = 0; i < count; i++) {
    const a = (i + 0.5) / count * Math.PI * 2;
    pts.push(C.clone().addScaledVector(u, Math.cos(a) * R).addScaledVector(v, Math.sin(a) * R));
  }
  return bolts(pts, N, d, opts);
}

/* A rectangular pattern of bolts on a face: centre c, normal n, the face's
   in-plane axes u (width w) and v (height h), nu × nv bolts. */
export function boltGrid(c, n, u, v, w, h, nu, nv, d, opts) {
  const C = c.isVector3 ? c : new THREE.Vector3(...c);
  const U = u.isVector3 ? u : new THREE.Vector3(...u), Vv = v.isVector3 ? v : new THREE.Vector3(...v);
  const pts = [];
  for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) {
    const a = nu > 1 ? (i / (nu - 1) - 0.5) * w : 0, b = nv > 1 ? (j / (nv - 1) - 0.5) * h : 0;
    pts.push(C.clone().addScaledVector(U, a).addScaledVector(Vv, b));
  }
  return bolts(pts, n, d, opts);
}
