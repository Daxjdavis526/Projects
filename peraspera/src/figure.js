// The character rig. Faceless figures built from tapered capsules — drawn as
// pure silhouettes against light, or in flat colour where a scene is lit from
// the front. Profile ('side') and 'front' views share one pose vocabulary.
//
// Angles are radians, measured from straight down and positive toward the way
// the figure faces. In side view:
//   rot   whole body about the hip (−π/2: lying on the back, head behind)
//   lean  torso from vertical
//   neck  head relative to torso (+ looks down, − looks up)
//   s1,e1 near shoulder (relative to torso) and elbow flexion
//   s2,e2 far arm
//   h1,k1 near hip (relative to vertical) and knee flexion
//   h2,k2 far leg
// In front view the same names mean abduction away from the body's midline:
// arm/leg 1 is on the screen-right side, 2 on the left.

import { TAU, lerp, clamp, noise1, css, mix } from './kit.js';
import { capsulePath } from './paint.js';

const MAN = {
  headR: 10.5, neck: 7, neckR: 4.8, torso: 50,
  side: [[0, 9.5, 11.5], [0.2, 9, 10], [0.45, 9.5, 9], [0.7, 12.5, 10], [0.88, 11.5, 10.5], [1, 7, 8]],
  front: [[0, 12.5], [0.2, 12], [0.45, 11], [0.7, 14], [0.88, 17], [1, 15]],
  ua: 29, fa: 26, uaR: [5.3, 4.2], faR: [4.2, 3.2], handR: 3.9,
  th: 41, sh: 41, thR: [7.6, 5.4], shR: [5.2, 3.5], foot: 13.5, hair: 'short',
};
const BROTHER = {
  ...MAN, headR: 10.8, neckR: 7.2,
  side: [[0, 10, 12], [0.2, 9.5, 11], [0.45, 10.5, 10.5], [0.7, 16.5, 13], [0.88, 16, 13.5], [1, 9.5, 10]],
  front: [[0, 13], [0.2, 12.5], [0.45, 12.5], [0.7, 18], [0.88, 23.5], [1, 20]],
  uaR: [8.6, 6.4], faR: [6.4, 4.4], handR: 4.7, thR: [9.8, 6.8], shR: [6.8, 4.3], hair: 'buzz',
};
const WOMAN = {
  headR: 10, neck: 7.5, neckR: 3.9, torso: 46,
  side: [[0, 9.5, 12.5], [0.2, 8.5, 10.5], [0.45, 7.5, 7.5], [0.7, 11.5, 8], [0.88, 9, 8.5], [1, 6, 7]],
  front: [[0, 13.5], [0.2, 12], [0.45, 9.5], [0.7, 11.5], [0.88, 13], [1, 11.5]],
  ua: 27, fa: 24.5, uaR: [4.4, 3.5], faR: [3.5, 2.6], handR: 3.3,
  th: 39, sh: 39, thR: [7.6, 4.8], shR: [4.8, 3.0], foot: 12, hair: 'long',
};
const KID = {
  headR: 12, neck: 4.5, neckR: 3.6, torso: 31,
  side: [[0, 8, 8.5], [0.3, 8, 7.5], [0.6, 8.5, 7.5], [0.88, 8, 7.5], [1, 5.5, 5.5]],
  front: [[0, 9], [0.45, 8.5], [0.8, 10], [1, 9]],
  ua: 18, fa: 17, uaR: [3.8, 3.2], faR: [3.2, 2.6], handR: 3,
  th: 26, sh: 26, thR: [5.4, 4], shR: [4, 3], foot: 9.5, hair: 'kid',
};
const TODDLER = {
  ...KID, headR: 11, torso: 22, ua: 12, fa: 11, th: 15, sh: 15, foot: 7,
  side: [[0, 8, 8], [0.5, 9, 7], [0.9, 7, 6.5], [1, 5, 5]],
  front: [[0, 8.5], [0.5, 9], [1, 8]],
  uaR: [3.4, 3], faR: [3, 2.6], handR: 2.8, thR: [5, 4], shR: [4, 3.2],
};
export const BUILDS = {
  man: MAN, brother: BROTHER, woman: WOMAN, kid: KID, toddler: TODDLER,
  teen: { ...MAN, headR: 10.8, torso: 45, ua: 26, fa: 24, th: 40, sh: 40, uaR: [4.6, 3.8], faR: [3.8, 3], thR: [6.8, 5], shR: [4.8, 3.3],
    side: [[0, 8.5, 10], [0.2, 8, 9], [0.45, 8.5, 8.2], [0.7, 10.5, 9], [0.88, 10, 9.5], [1, 6.5, 7]],
    front: [[0, 11], [0.45, 10], [0.7, 12], [0.88, 14.5], [1, 13]] },
  girl: { ...KID, hair: 'girl' },
};

// Leg length from hip to sole, for standing a figure on the ground.
export function legLength(build) {
  const b = BUILDS[build] || build;
  return b.th + b.sh + b.shR[1];
}

const DEFAULT_POSE = { rot: 0, lean: 0, neck: 0, s1: 0.05, e1: 0.15, s2: -0.05, e2: 0.15, h1: 0.02, k1: 0.02, h2: -0.02, k2: 0.02, f1: 0, f2: 0 };

export function pose(p) { return { ...DEFAULT_POSE, ...p }; }
export function blend(a, b, k) {
  const out = {};
  for (const key in DEFAULT_POSE) out[key] = lerp(a[key] ?? DEFAULT_POSE[key], b[key] ?? DEFAULT_POSE[key], k);
  return out;
}
export function add(a, d) {
  const out = { ...a };
  for (const key in d) out[key] = (out[key] ?? 0) + d[key];
  return out;
}

// ─── pose vocabulary ──────────────────────────────────────────────────────

export const P = {
  stand: (t = 0, seed = 0) => pose({
    lean: 0.01 + noise1(t * 0.3, seed) * 0.012,
    neck: 0.04 + noise1(t * 0.25, seed + 3) * 0.05,
    s1: 0.06 + Math.sin(t * 1.6 + seed) * 0.012, e1: 0.14,
    s2: -0.05 - Math.sin(t * 1.6 + seed) * 0.012, e2: 0.16,
    h1: 0.05, k1: 0.03, h2: -0.04, k2: 0.02,
  }),
  // phase in cycles; one cycle is two steps
  walk: (phase, amt = 1) => {
    const f = phase * TAU;
    const leg = (x) => ({ h: 0.34 * Math.sin(x) * amt, k: (0.06 + 1.0 * Math.max(0, Math.cos(x + 0.55)) ** 2.2) * amt });
    const a = leg(f), b = leg(f + Math.PI);
    return pose({
      lean: 0.05 * amt, neck: 0.05,
      h1: a.h, k1: a.k, h2: b.h, k2: b.k,
      s1: -0.34 * Math.sin(f) * amt, e1: 0.25 + 0.3 * Math.max(0, -Math.sin(f)) * amt,
      s2: 0.34 * Math.sin(f) * amt, e2: 0.25 + 0.3 * Math.max(0, Math.sin(f)) * amt,
      f1: -0.3 * Math.max(0, Math.cos(f + 0.3)) * amt, f2: -0.3 * Math.max(0, Math.cos(f + Math.PI + 0.3)) * amt,
    });
  },
  sit: (t = 0, seed = 0) => pose({
    lean: 0.05 + noise1(t * 0.3, seed) * 0.02, neck: 0.1,
    h1: 1.5, k1: 1.5, h2: 1.42, k2: 1.4,
    s1: 0.5, e1: 0.9, s2: 0.45, e2: 0.95,
  }),
  // seated on the floor, knees drawn up, head down on them
  huddle: (t = 0, sob = 1) => {
    const shake = sob * (Math.sin(t * 9) * 0.5 + Math.sin(t * 13.7) * 0.5) * (0.5 + 0.5 * Math.sin(t * 0.9)) ** 2;
    return pose({
      lean: 0.42 + shake * 0.02, neck: 0.75 + shake * 0.05,
      h1: 2.15, k1: 2.6, h2: 2.05, k2: 2.5,
      s1: 0.25 + shake * 0.03, e1: 2.4, s2: 0.18, e2: 2.5,
    });
  },
  lieBack: (t = 0) => pose({
    rot: -Math.PI / 2, lean: 0, neck: -0.1 + noise1(t * 0.2, 4) * 0.05,
    h1: 0.25, k1: 0.5, h2: 0.05, k2: 0.1,
    s1: 2.75, e1: 2.4, s2: 2.62, e2: 2.5,        // hands behind the head
  }),
  kneel: () => pose({ lean: 0.15, neck: 0.3, h1: 1.45, k1: 1.45, h2: 0.12, k2: 1.65, s1: 0.9, e1: 0.5, s2: 0.7, e2: 0.7 }),
};

// ─── the rig ──────────────────────────────────────────────────────────────

const dirDown = (a) => [Math.sin(a), Math.cos(a)];     // angle from down, + forward
const dirUp = (a) => [Math.sin(a), -Math.cos(a)];

function profile(tab, u) {
  for (let i = 1; i < tab.length; i++) {
    if (u <= tab[i][0]) {
      const k = (u - tab[i - 1][0]) / (tab[i][0] - tab[i - 1][0]);
      return tab[i - 1].slice(1).map((v, j) => lerp(v, tab[i][j + 1], k));
    }
  }
  return tab[tab.length - 1].slice(1);
}

// Computes joint positions in the figure's local frame (facing +x, hip at 0,0).
function joints(b, p, view) {
  const J = {};
  const up = dirUp(p.lean);
  const nrm = [Math.cos(p.lean), Math.sin(p.lean)];
  J.hip = [0, 0];
  J.top = [up[0] * b.torso, up[1] * b.torso];
  const hu = dirUp(p.lean + p.neck * 0.35);
  const hd = dirUp(p.lean + p.neck);
  J.neck = [J.top[0] + hu[0] * b.neck * 0.6, J.top[1] + hu[1] * b.neck * 0.6];
  J.head = [J.top[0] + hu[0] * b.neck + hd[0] * b.headR * 0.85, J.top[1] + hu[1] * b.neck + hd[1] * b.headR * 0.85];
  J.headA = p.lean + p.neck;
  const sh = [up[0] * b.torso * 0.9, up[1] * b.torso * 0.9];
  const arm = (s, e, side) => {
    let S, a1, a2;
    if (view === 'front') {
      const off = (profile(b.front, 0.9)[0] - 3.5) * side;
      S = [sh[0] + off, sh[1]];
      a1 = s * side; a2 = (s + e) * side;
      const d1 = dirDown(a1), d2 = dirDown(a2);
      const E = [S[0] + d1[0] * b.ua, S[1] + d1[1] * b.ua];
      const Wr = [E[0] + d2[0] * b.fa, E[1] + d2[1] * b.fa];
      return { S, E, W: Wr, a2 };
    }
    S = [sh[0] + nrm[0] * 1.5, sh[1] + nrm[1] * 1.5];
    a1 = p.lean + s; a2 = a1 + e;
    const d1 = dirDown(a1), d2 = dirDown(a2);
    const E = [S[0] + d1[0] * b.ua, S[1] + d1[1] * b.ua];
    const Wr = [E[0] + d2[0] * b.fa, E[1] + d2[1] * b.fa];
    return { S, E, W: Wr, a2 };
  };
  const leg = (h, k, f, side) => {
    let Hj, b1, b2;
    if (view === 'front') {
      Hj = [profile(b.front, 0)[0] * 0.5 * side, 2];
      b1 = h * side; b2 = (h - k * 0.3) * side;
    } else {
      Hj = [1, 1];
      b1 = h; b2 = h - k;
    }
    const d1 = dirDown(b1), d2 = dirDown(b2);
    const K = [Hj[0] + d1[0] * b.th, Hj[1] + d1[1] * b.th];
    const A = [K[0] + d2[0] * b.sh, K[1] + d2[1] * b.sh];
    const fa = view === 'front' ? b2 + Math.PI / 2 * side : b2 + Math.PI / 2 + f;
    const fd = dirDown(fa);
    const len = view === 'front' ? b.foot * 0.45 : b.foot;
    const T = [A[0] + fd[0] * len, A[1] + fd[1] * len];
    return { H: Hj, K, A, T };
  };
  J.arm1 = arm(p.s1, p.e1, 1);
  J.arm2 = arm(p.s2, p.e2, -1);
  J.leg1 = leg(p.h1, p.k1, p.f1, 1);
  J.leg2 = leg(p.h2, p.k2, p.f2, -1);
  return J;
}

// Draw a figure. Options:
//   x, y       hip position (or give `ground` to stand the lowest foot on it)
//   s          scale (1 ≈ a 176 px tall adult)
//   face       1 right, −1 left
//   view       'side' | 'front'
//   sil        a colour: draw as a single-colour silhouette
//   colors     { skin, hair, top, bottom, shoes } for flat colour
//   hair, helmet, weldmask, dress, tie, tag, belly, hood, sleeves ('short')
// Returns world-space joints for attaching props.
export function figure(ctx, build, p, o = {}) {
  const b = typeof build === 'string' ? BUILDS[build] : build;
  const view = o.view || 'side';
  const s = o.s ?? 1;
  const face = o.face ?? 1;
  const J = joints(b, p, view);

  let y = o.y ?? 0;
  if (o.ground !== undefined) {
    // plant the lowest point of either foot on the ground line
    const pts = [J.leg1.A, J.leg1.T, J.leg2.A, J.leg2.T];
    const c = Math.cos(p.rot), sn = Math.sin(p.rot);
    let low = -Infinity;
    for (const q of pts) low = Math.max(low, q[0] * sn + q[1] * c);
    y = o.ground - (low + b.shR[1] * 0.9) * s;
  }
  const x = o.x ?? 0;

  const sil = o.sil;
  const C = o.colors || {};
  const col = (part) => css(sil || C[part] || '#222', 1);
  const far = (part) => sil ? css(o.silFar || sil, 1) : css(mix(C[part] || '#222', '#000', 0.22));

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(face, 1);
  ctx.rotate(p.rot);
  ctx.scale(s, s);
  if (o.alpha !== undefined) ctx.globalAlpha = o.alpha;

  const capsule = (P1, r1, P2, r2, fillStyle) => {
    ctx.fillStyle = fillStyle;
    ctx.beginPath();
    capsulePath(ctx, P1[0], P1[1], r1, P2[0], P2[1], r2);
    ctx.fill();
  };
  const limbArm = (A, farSide) => {
    const topC = farSide ? far('top') : col('top');
    const armC = o.sleeves === 'short' ? (farSide ? far('skin') : col('skin')) : topC;
    capsule(A.S, b.uaR[0], A.E, b.uaR[1], topC);
    capsule(A.E, b.faR[0], A.W, b.faR[1], armC);
    const hd = dirDown(A.a2 * (view === 'front' ? 1 : 1));
    const hc = [A.W[0] + hd[0] * b.handR * 0.8, A.W[1] + hd[1] * b.handR * 0.8];
    ctx.fillStyle = o.gloves ? (farSide ? far('gloves') : col('gloves')) : (farSide ? far('skin') : col('skin'));
    ctx.beginPath(); ctx.arc(hc[0], hc[1], b.handR, 0, TAU); ctx.fill();
    A.hand = hc;
  };
  const limbLeg = (L, farSide) => {
    const c = farSide ? far('bottom') : col('bottom');
    capsule(L.H, b.thR[0], L.K, b.thR[1], c);
    capsule(L.K, b.shR[0], L.A, b.shR[1], c);
    capsule(L.A, b.shR[1] * 0.95, L.T, b.shR[1] * 0.7, farSide ? far('shoes') : col('shoes'));
  };
  const torso = () => {
    const up = dirUp(p.lean);
    const nrm = [Math.cos(p.lean), Math.sin(p.lean)];
    const us = [0, 0.1, 0.2, 0.3, 0.45, 0.6, 0.7, 0.8, 0.88, 0.95, 1];
    const front = [], back = [];
    for (const u of us) {
      const P0 = [up[0] * b.torso * u, up[1] * b.torso * u];
      if (view === 'front') {
        const [hw] = profile(b.front, u);
        const bell = (o.belly || 0) * 3 * Math.max(0, 1 - Math.abs(u - 0.35) / 0.3);
        front.push([P0[0] + hw + bell, P0[1]]);
        back.push([P0[0] - hw - bell, P0[1]]);
      } else {
        let [fw, bw] = profile(b.side, u);
        fw += (o.belly || 0) * 15 * Math.max(0, 1 - Math.abs(u - 0.33) / 0.33) ** 0.8;
        front.push([P0[0] + nrm[0] * fw, P0[1] + nrm[1] * fw]);
        back.push([P0[0] - nrm[0] * bw, P0[1] - nrm[1] * bw]);
      }
    }
    const pts = [...front, ...back.reverse()];
    ctx.fillStyle = col('top');
    ctx.beginPath();
    const n = pts.length;
    const mid = (i) => { const a = pts[(i + n) % n], c = pts[(i + 1) % n]; return [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2]; };
    let m = mid(-1);
    ctx.moveTo(m[0], m[1]);
    for (let i = 0; i < n; i++) {
      const q = pts[i]; m = mid(i);
      ctx.quadraticCurveTo(q[0], q[1], m[0], m[1]);
    }
    ctx.closePath();
    ctx.fill();
    // hips / seat in the trouser colour
    if (!sil && C.bottom && !o.dress) {
      ctx.save();
      ctx.clip();
      const cut = b.torso * 0.14;
      ctx.fillStyle = col('bottom');
      ctx.translate(0, 0);
      ctx.rotate(p.lean);
      ctx.fillRect(-40, -cut, 80, 60);
      ctx.restore();
    }
    if (o.tie && view === 'front' && !o.back) {
      const top = [up[0] * b.torso * 0.95, up[1] * b.torso * 0.95];
      ctx.fillStyle = css(o.tie);
      ctx.beginPath();
      ctx.moveTo(top[0] - 2, top[1]); ctx.lineTo(top[0] + 2, top[1]);
      ctx.lineTo(top[0] + 3.2, top[1] + b.torso * 0.55); ctx.lineTo(top[0], top[1] + b.torso * 0.62);
      ctx.lineTo(top[0] - 3.2, top[1] + b.torso * 0.55); ctx.closePath(); ctx.fill();
    } else if (o.tie) {
      const P0 = [up[0] * b.torso * 0.92 + nrm[0] * 9, up[1] * b.torso * 0.92 + nrm[1] * 9];
      const P1 = [up[0] * b.torso * 0.4 + nrm[0] * 10.5, up[1] * b.torso * 0.4 + nrm[1] * 10.5];
      ctx.strokeStyle = css(o.tie); ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(P0[0], P0[1]); ctx.lineTo(P1[0], P1[1]); ctx.stroke();
    }
    if (o.tag && !o.back) {
      const P0 = view === 'front'
        ? [up[0] * b.torso * 0.78 + 7, up[1] * b.torso * 0.78]
        : [up[0] * b.torso * 0.78 + nrm[0] * 9, up[1] * b.torso * 0.78 + nrm[1] * 9];
      ctx.save(); ctx.translate(P0[0], P0[1]); ctx.rotate(p.lean);
      ctx.fillStyle = css(o.tag); ctx.fillRect(-3.5, -1.8, view === 'front' ? 9 : 4, 4);
      ctx.restore();
    }
  };
  const skirt = () => {
    if (!o.dress) return;
    const up = dirUp(p.lean);
    const w = [up[0] * b.torso * 0.42, up[1] * b.torso * 0.42];
    const len = o.dressLen ?? (b.th + b.sh * 0.9);
    const flare = o.flare ?? 26;
    const sway = o.sway || 0;
    ctx.fillStyle = css(sil || o.dress);
    ctx.beginPath();
    if (view === 'front') {
      ctx.moveTo(w[0] - 9, w[1]);
      ctx.lineTo(w[0] + 9, w[1]);
      ctx.quadraticCurveTo(flare * 0.8 + sway, len * 0.6, flare + sway, len);
      ctx.lineTo(-flare + sway, len);
      ctx.quadraticCurveTo(-flare * 0.8 + sway, len * 0.6, w[0] - 9, w[1]);
    } else {
      ctx.moveTo(w[0] - 8, w[1]);
      ctx.lineTo(w[0] + 9 + (o.belly || 0) * 8, w[1]);
      ctx.quadraticCurveTo(flare * 0.6 + sway + (o.belly || 0) * 14, len * 0.45, flare * 0.8 + sway, len);
      ctx.lineTo(-flare * 0.9 + sway, len);
      ctx.quadraticCurveTo(-flare * 0.5 + sway, len * 0.5, w[0] - 8, w[1]);
    }
    ctx.closePath();
    ctx.fill();
  };
  const head = () => {
    // neck
    capsule(J.top, b.neckR * 1.05, J.neck, b.neckR, col('skin'));
    ctx.save();
    ctx.translate(J.head[0], J.head[1]);
    ctx.rotate(J.headA);
    const r = b.headR;
    const hairC = col('hair');
    const hairStyle = o.hair || b.hair;
    // long hair falls behind the head, so it goes first
    if (hairStyle === 'long' && !o.helmet && !o.hood) {
      ctx.fillStyle = hairC;
      ctx.beginPath();
      const sw = o.hairSway || 0;
      if (view === 'front') {
        ctx.moveTo(-r * 1.05, -r * 0.2);
        ctx.quadraticCurveTo(-r * 1.35, r * 1.6, -r * 1.1 + sw, r * 2.9);
        ctx.lineTo(r * 1.1 + sw, r * 2.9);
        ctx.quadraticCurveTo(r * 1.35, r * 1.6, r * 1.05, -r * 0.2);
        ctx.closePath();
      } else {
        ctx.moveTo(r * 0.2, -r * 1.02);
        ctx.quadraticCurveTo(-r * 1.5, -r * 0.8, -r * 1.25 + sw, r * 1.2);
        ctx.quadraticCurveTo(-r * 1.2 + sw, r * 2.6, -r * 0.2 + sw * 1.3, r * 3.0);
        ctx.quadraticCurveTo(-r * 0.2, r * 1.2, r * 0.1, r * 0.4);
        ctx.closePath();
      }
      ctx.fill();
    }
    if (o.helmet) {
      ctx.fillStyle = css(sil || o.helmet);
      ctx.beginPath();
      ctx.ellipse(-r * 0.05, -r * 0.05, r * 1.42, r * 1.38, 0, 0, TAU);
      ctx.fill();
      if (!sil && view === 'side') {
        ctx.fillStyle = css(o.visor || '#111');
        ctx.beginPath();
        ctx.ellipse(r * 0.75, -r * 0.1, r * 0.62, r * 0.42, -0.2, -1.5, 1.5);
        ctx.fill();
      }
      ctx.restore();
      return;
    }
    // skull and jaw
    ctx.fillStyle = col('skin');
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, TAU);
    ctx.fill();
    if (view === 'side') {
      ctx.beginPath();
      ctx.ellipse(r * 0.28, r * 0.42, r * 0.7, r * 0.62, 0.3, 0, TAU);
      ctx.fill();
      // nose — just enough to read which way a silhouette faces
      ctx.beginPath();
      ctx.moveTo(r * 0.92, -r * 0.15);
      ctx.lineTo(r * 1.2, r * 0.2);
      ctx.lineTo(r * 0.9, r * 0.32);
      ctx.fill();
    }
    if (o.hood) {
      ctx.fillStyle = css(sil || o.hood);
      ctx.beginPath();
      ctx.arc(-r * 0.08, -r * 0.08, r * 1.2, 0, TAU);
      ctx.fill();
      ctx.fillStyle = css(o.mask || '#e8eef4');
      if (view === 'side') {
        ctx.beginPath(); ctx.ellipse(r * 0.75, -r * 0.05, r * 0.38, r * 0.3, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = css(o.goggle || '#3a4a5a');
        ctx.beginPath(); ctx.ellipse(r * 0.85, -r * 0.1, r * 0.28, r * 0.18, 0, 0, TAU); ctx.fill();
      }
      ctx.restore();
      return;
    }
    ctx.fillStyle = hairC;
    if (o.back && view === 'front') {
      // seen from behind: all hair
      ctx.beginPath();
      if (hairStyle === 'buzz') ctx.arc(0, -r * 0.02, r * 1.02, 0, TAU);
      else ctx.arc(0, -r * 0.05, r * 1.07, 0, TAU);
      ctx.fill();
      if (hairStyle === 'short' || hairStyle === 'buzz' || hairStyle === 'kid') {
        ctx.fillStyle = col('skin');
        ctx.fillRect(-r * 0.55, r * 0.55, r * 1.1, r * 0.5);
      }
    } else if (hairStyle === 'short' || hairStyle === 'kid' || hairStyle === 'girl') {
      ctx.beginPath();
      if (view === 'front') {
        ctx.arc(0, -r * 0.08, r * 1.06, Math.PI * 1.02, Math.PI * 1.98);
        ctx.quadraticCurveTo(r * 0.3, -r * 0.55, -r * 1.02, -r * 0.1);
      } else {
        ctx.arc(-r * 0.05, -r * 0.06, r * (hairStyle === 'kid' ? 1.1 : 1.07), Math.PI * 0.62, Math.PI * 1.9);
        ctx.quadraticCurveTo(r * 0.5, -r * 0.55, -r * 0.1, -r * 0.2);
        ctx.quadraticCurveTo(-r * 0.6, r * 0.4, -r * 0.4, r * 0.95);
      }
      ctx.closePath();
      ctx.fill();
      if (hairStyle === 'girl') {
        ctx.beginPath();
        ctx.ellipse(view === 'front' ? -r * 1.1 : -r * 1.15, r * 0.4, r * 0.35, r * 0.7, 0.3, 0, TAU);
        if (view === 'front') ctx.ellipse(r * 1.1, r * 0.4, r * 0.35, r * 0.7, -0.3, 0, TAU);
        ctx.fill();
      }
    } else if (hairStyle === 'buzz') {
      ctx.beginPath();
      if (view === 'front') ctx.arc(0, -r * 0.03, r * 1.03, Math.PI * 1.05, Math.PI * 1.95);
      else ctx.arc(-r * 0.03, -r * 0.03, r * 1.03, Math.PI * 0.75, Math.PI * 1.85);
      ctx.closePath();
      ctx.fill();
    } else if (hairStyle === 'long') {
      ctx.beginPath();
      ctx.arc(-r * 0.05, -r * 0.05, r * 1.1, Math.PI * 0.55, Math.PI * 1.95);
      ctx.quadraticCurveTo(r * 0.4, -r * 0.5, -r * 0.25, -r * 0.2);
      ctx.closePath();
      ctx.fill();
    }
    if (o.weldmask) {
      ctx.fillStyle = css(sil || o.weldmask);
      ctx.beginPath();
      if (view === 'side') {
        ctx.moveTo(r * 0.3, -r * 1.3);
        ctx.quadraticCurveTo(r * 1.9, -r * 0.8, r * 1.6, r * 0.9);
        ctx.lineTo(r * 0.5, r * 1.5);
        ctx.lineTo(r * 0.2, r * 0.4);
        ctx.closePath();
      } else {
        rrectPath(ctx, -r * 1.05, -r * 1.1, r * 2.1, r * 2.5, r * 0.4);
      }
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, -r * 0.3, r * 1.15, Math.PI, TAU);
      ctx.lineWidth = 3; ctx.strokeStyle = css(sil || o.weldmask);
      ctx.stroke();
    }
    if (o.hat) o.hat(ctx, r);
    ctx.restore();
  };

  if (view === 'side') {
    limbArm(J.arm2, true);
    limbLeg(J.leg2, true);
    torso();
    if (o.dress) skirt();
    else limbLeg(J.leg1, false);
    if (o.dress) {
      // feet under a dress
      ctx.fillStyle = col('shoes');
      for (const L of [J.leg1, J.leg2]) { ctx.beginPath(); capsulePath(ctx, L.A[0], L.A[1], b.shR[1], L.T[0], L.T[1], b.shR[1] * 0.7); ctx.fill(); }
    }
    head();
    if (o.prop2) o.prop2(ctx, J);
    limbArm(J.arm1, false);
  } else {
    limbLeg(J.leg1, false);
    limbLeg(J.leg2, false);
    torso();
    if (o.dress) skirt();
    head();
    limbArm(J.arm1, false);
    limbArm(J.arm2, false);
  }
  if (o.prop) o.prop(ctx, J);
  ctx.restore();

  // world-space joints
  const cr = Math.cos(p.rot), sr = Math.sin(p.rot);
  const w = (q) => {
    const lx = q[0] * s, ly = q[1] * s;
    const rx = lx * cr - ly * sr, ry = lx * sr + ly * cr;
    return [x + rx * face, y + ry];
  };
  return {
    hip: w(J.hip), head: w(J.head), top: w(J.top),
    hand1: w(J.arm1.hand || J.arm1.W), hand2: w(J.arm2.hand || J.arm2.W),
    elbow1: w(J.arm1.E), elbow2: w(J.arm2.E),
    foot1: w(J.leg1.A), foot2: w(J.leg2.A), knee1: w(J.leg1.K), knee2: w(J.leg2.K),
    headR: b.headR * s, y,
  };
}

function rrectPath(ctx, x, y, w, h, r) {
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// Walk phase for a figure that has covered `dist` px at scale s.
export function stride(dist, s = 1, build = 'man') {
  const b = BUILDS[build];
  return dist / ((b.th + b.sh) * 1.6 * s);
}
