// Objects that turn up in more than one scene. Units follow the figures: at
// scale 1 an adult is ~176 px tall, so a metre is ~98 px.

import { TAU, clamp, lerp, hash, css, mix } from './kit.js';
import { glow, box, circle, line, rrect, radial } from './paint.js';

// A sedan in profile. (x, y) is the ground under its middle; facing ±1.
// roll: distance travelled (turns the wheels). heads: number of people inside.
export function car(ctx, x, y, { s = 1, face = 1, color = '#5b6474', glass = '#1a2230', roll = 0, lights = 0, tail = 0, heads = 0, headColor = '#0d0f14', bounce = 0, sil = null, loaded = false } = {}) {
  ctx.save();
  ctx.translate(x, y - bounce * s);
  ctx.scale(face * s, s);
  const body = sil || color;
  // wheels
  for (const wx of [-148, 150]) {
    circle(ctx, wx, -32, 32, sil || '#111318');
    if (!sil) {
      circle(ctx, wx, -32, 18, '#6b7180');
      ctx.strokeStyle = css('#3a3f4a'); ctx.lineWidth = 3;
      for (let k = 0; k < 5; k++) {
        const a = -roll / 32 + (k * TAU) / 5;
        ctx.beginPath(); ctx.moveTo(wx, -32); ctx.lineTo(wx + Math.cos(a) * 16, -32 + Math.sin(a) * 16); ctx.stroke();
      }
      circle(ctx, wx, -32, 5, '#2a2e36');
    }
  }
  // body, with the wheel arches cut out
  ctx.fillStyle = css(body);
  ctx.beginPath();
  ctx.moveTo(-226, -30);
  ctx.lineTo(-229, -66);
  ctx.quadraticCurveTo(-226, -86, -206, -90);
  ctx.lineTo(-150, -94);
  ctx.quadraticCurveTo(-118, -136, -92, -141);
  ctx.lineTo(10, -143);
  ctx.quadraticCurveTo(40, -141, 96, -95);
  ctx.quadraticCurveTo(190, -88, 216, -76);
  ctx.quadraticCurveTo(232, -66, 230, -40);
  ctx.lineTo(228, -30);
  ctx.lineTo(192, -30);
  ctx.arc(150, -32, 40, 0, Math.PI, true);
  ctx.lineTo(-108, -30);
  ctx.arc(-148, -32, 40, 0, Math.PI, true);
  ctx.closePath();
  ctx.fill();
  if (!sil) {
    // glass
    ctx.fillStyle = css(glass);
    ctx.beginPath();
    ctx.moveTo(-136, -97); ctx.quadraticCurveTo(-112, -130, -90, -134); ctx.lineTo(8, -136);
    ctx.quadraticCurveTo(34, -133, 82, -97); ctx.closePath(); ctx.fill();
    box(ctx, -32, -136, 7, 40, body);
    // a crease and door lines
    line(ctx, -200, -72, 205, -70, mix(body, '#000', 0.25), 2);
    line(ctx, -30, -95, -32, -34, mix(body, '#000', 0.3), 1.5);
    line(ctx, 88, -93, 96, -40, mix(body, '#000', 0.3), 1.5);
    // lamps
    box(ctx, 214, -74, 14, 9, lights ? '#fff6d8' : '#c9ccd2', 1, 3);
    box(ctx, -229, -76, 9, 12, tail ? '#ff3a2a' : '#8a2320', 1, 2);
  }
  if (loaded && !sil) {
    // boxes and a bag piled against the rear glass
    box(ctx, -125, -118, 40, 22, '#8a7358', 1, 3);
    box(ctx, -80, -114, 34, 18, '#6d5a46', 1, 3);
  }
  for (let i = 0; i < heads; i++) {
    const hx = i === 0 ? 20 : -60;
    circle(ctx, hx, -112, 13, headColor);
    box(ctx, hx - 14, -102, 28, 8, headColor);
  }
  ctx.restore();
  if (lights) {
    glow(ctx, x + face * 226 * s, y - 70 * s, 90 * s, '#fff2c8', 0.5 * lights);
  }
  if (tail) glow(ctx, x - face * 226 * s, y - 70 * s, 50 * s, '#ff3020', 0.5 * tail);
}

// A house seen from the front. (x, y) = ground at its centre.
export function house(ctx, x, y, { w = 520, h = 260, roof = 150, wall = '#b9a58a', roofC = '#4a4040', trim = '#efe8dc', door = '#5a3a2a', lit = 0, litC = '#ffcf87', garage = true, win = '#2c3440', porch = 0, chimney = false, sil = null } = {}) {
  const x0 = x - w / 2;
  ctx.save();
  const W_ = sil || wall, R_ = sil || roofC;
  if (chimney) box(ctx, x + w * 0.22, y - h - roof * 0.9, 34, roof * 0.7, R_);
  box(ctx, x0, y - h, w, h, W_);
  ctx.fillStyle = css(R_);
  ctx.beginPath();
  ctx.moveTo(x0 - 26, y - h + 4); ctx.lineTo(x, y - h - roof); ctx.lineTo(x0 + w + 26, y - h + 4); ctx.closePath();
  ctx.fill();
  if (!sil) {
    // windows
    const wins = garage ? [[x0 + w * 0.12, y - h * 0.72, w * 0.18, h * 0.34]] : [[x0 + w * 0.1, y - h * 0.72, w * 0.2, h * 0.38], [x0 + w * 0.7, y - h * 0.72, w * 0.2, h * 0.38]];
    for (const [wx, wy, ww, wh] of wins) {
      box(ctx, wx - 5, wy - 5, ww + 10, wh + 10, trim);
      box(ctx, wx, wy, ww, wh, lit ? mix(win, litC, lit) : win);
      line(ctx, wx + ww / 2, wy, wx + ww / 2, wy + wh, trim, 3);
      line(ctx, wx, wy + wh / 2, wx + ww, wy + wh / 2, trim, 3);
      if (lit) glow(ctx, wx + ww / 2, wy + wh / 2, ww * 1.4, litC, 0.35 * lit);
    }
    // door
    const dx = garage ? x0 + w * 0.36 : x - w * 0.08;
    box(ctx, dx - 6, y - h * 0.62 - 6, w * 0.14 + 12, h * 0.62 + 6, trim);
    box(ctx, dx, y - h * 0.62, w * 0.14, h * 0.62, door);
    circle(ctx, dx + w * 0.12, y - h * 0.3, 3, '#d8c28a');
    if (garage) {
      const gx = x0 + w * 0.56;
      box(ctx, gx - 6, y - h * 0.62 - 6, w * 0.38 + 12, h * 0.62 + 6, trim);
      box(ctx, gx, y - h * 0.62, w * 0.38, h * 0.62, mix(wall, '#ffffff', 0.35));
      for (let i = 1; i < 5; i++) line(ctx, gx, y - h * 0.62 + (h * 0.62 * i) / 5, gx + w * 0.38, y - h * 0.62 + (h * 0.62 * i) / 5, mix(wall, '#000', 0.12), 2);
    }
    if (porch) {
      glow(ctx, dx + w * 0.07, y - h * 0.7, 80, '#ffd9a0', porch * 0.6);
      circle(ctx, dx + w * 0.07, y - h * 0.7, 5, '#fff2d0', porch);
    }
  }
  ctx.restore();
}

export function streetlamp(ctx, x, y, { h = 420, on = 1, color = '#ffc66e', post = '#15181f', a = 1 } = {}) {
  box(ctx, x - 4, y - h, 8, h, post);
  box(ctx, x - 10, y - 18, 20, 18, post);
  ctx.strokeStyle = css(post); ctx.lineWidth = 7;
  ctx.beginPath(); ctx.moveTo(x, y - h + 6); ctx.quadraticCurveTo(x + 10, y - h - 20, x + 46, y - h - 12); ctx.stroke();
  box(ctx, x + 34, y - h - 14, 30, 10, post, 1, 3);
  if (on > 0) {
    box(ctx, x + 38, y - h - 5, 22, 5, color, on);
    glow(ctx, x + 49, y - h, 220, color, 0.34 * on * a);
    glow(ctx, x + 49, y - h, 50, '#fff2d8', 0.6 * on * a);
  }
}

// An open laptop in profile. (x, y) is the hinge on the table; the user sits
// on the -face side and the screen faces them.
export function laptop(ctx, x, y, { s = 1, face = 1, tilt = 0.26, glowC = '#bcd4ff', glowA = 0.6, color = '#3a3e48' } = {}) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(face * s, s);
  box(ctx, -72, -5, 74, 6, color, 1, 2);
  ctx.strokeStyle = css(color);
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  const tx = Math.sin(tilt) * 66, ty = -Math.cos(tilt) * 66;
  ctx.beginPath(); ctx.moveTo(0, -3); ctx.lineTo(tx, ty); ctx.stroke();
  // the lit face of the screen
  ctx.strokeStyle = css(glowC, 0.9 * clamp(glowA * 1.5));
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-3, -6); ctx.lineTo(tx - 3, ty + 2); ctx.stroke();
  ctx.restore();
  if (glowA > 0) glow(ctx, x - face * 50 * s, y - 34 * s, 150 * s, glowC, glowA * 0.45);
}

// A suitcase standing on its wheels, handle up. (x, y) = ground.
export function suitcase(ctx, x, y, { s = 1, color = '#2a2e38', handle = 1 } = {}) {
  box(ctx, x - 18 * s, y - 64 * s, 36 * s, 58 * s, color, 1, 5 * s);
  if (handle) {
    line(ctx, x - 8 * s, y - 64 * s, x - 8 * s, y - 64 * s - 34 * s * handle, '#15171d', 2.5 * s);
    line(ctx, x + 8 * s, y - 64 * s, x + 8 * s, y - 64 * s - 34 * s * handle, '#15171d', 2.5 * s);
    line(ctx, x - 10 * s, y - 64 * s - 34 * s * handle, x + 10 * s, y - 64 * s - 34 * s * handle, '#15171d', 3 * s);
  }
  circle(ctx, x - 12 * s, y - 4 * s, 4 * s, '#111');
  circle(ctx, x + 12 * s, y - 4 * s, 4 * s, '#111');
}

// A motorcycle in profile, facing ±1, (x, y) = ground under its middle.
export function bikeSide(ctx, x, y, { s = 1, face = 1, color = '#e8ecf2', accent = '#2a5bd7', sil = null, stand = false } = {}) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(face * s, s);
  const C = (c) => css(sil || c);
  for (const wx of [-72, 78]) {
    ctx.fillStyle = C('#121317');
    ctx.beginPath(); ctx.arc(wx, -32, 32, 0, TAU); ctx.fill();
    if (!sil) { circle(ctx, wx, -32, 20, '#3a3d45'); circle(ctx, wx, -32, 7, '#8a8e98'); }
  }
  ctx.strokeStyle = C('#2a2c33'); ctx.lineWidth = 7;
  ctx.beginPath(); ctx.moveTo(-72, -32); ctx.lineTo(-10, -52); ctx.stroke();        // swingarm
  ctx.beginPath(); ctx.moveTo(78, -32); ctx.lineTo(56, -104); ctx.stroke();         // forks
  // fairing, tank, tail
  ctx.fillStyle = C(color);
  ctx.beginPath();
  ctx.moveTo(-96, -92); ctx.lineTo(-40, -86); ctx.lineTo(-10, -100); ctx.lineTo(30, -106);
  ctx.lineTo(62, -120); ctx.quadraticCurveTo(98, -104, 96, -70); ctx.lineTo(70, -46);
  ctx.lineTo(0, -40); ctx.lineTo(-20, -58); ctx.lineTo(-60, -76); ctx.closePath(); ctx.fill();
  if (!sil) {
    ctx.fillStyle = css(accent);
    ctx.beginPath(); ctx.moveTo(20, -60); ctx.lineTo(80, -64); ctx.lineTo(70, -48); ctx.lineTo(10, -46); ctx.closePath(); ctx.fill();
    ctx.fillStyle = css('#1a1e28', 0.85);
    ctx.beginPath(); ctx.moveTo(62, -120); ctx.lineTo(70, -134); ctx.lineTo(84, -112); ctx.closePath(); ctx.fill();
    box(ctx, -60, -72, 36, 12, '#555a64', 1, 5);   // exhaust
  }
  if (stand) {
    ctx.strokeStyle = C('#b0302a'); ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(-72, -32); ctx.lineTo(-100, 0); ctx.stroke();
  }
  ctx.restore();
}

// A racing motorcycle and rider seen from behind. (x, y) = rear tyre contact,
// lean in radians (positive leans right). knee: how far the inside knee is out.
export function bikeRear(ctx, x, y, { s = 1, lean = 0, color = '#eef1f6', accent = '#2255cc', helmet = '#f4f6f9', star = true, leathers = '#20242e', sil = null } = {}) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(lean);
  ctx.scale(s, s);
  const C = (c) => css(sil || c);
  const side = Math.sign(lean) || 1;
  const kneeOut = clamp(Math.abs(lean) / 0.8);
  // tyre
  ctx.fillStyle = C('#101114');
  ctx.beginPath(); rrect(ctx, -17, -72, 34, 72, 16); ctx.fill();
  // exhaust, one side
  ctx.fillStyle = C('#6b707a');
  ctx.beginPath(); rrect(ctx, 20, -120, 22, 46, 8); ctx.fill();
  // fairing flanks, wider than the tail
  ctx.fillStyle = C(color);
  ctx.beginPath();
  ctx.moveTo(-50, -112); ctx.quadraticCurveTo(-58, -150, -40, -176); ctx.lineTo(40, -176);
  ctx.quadraticCurveTo(58, -150, 50, -112); ctx.lineTo(24, -96); ctx.lineTo(-24, -96); ctx.closePath(); ctx.fill();
  // tail unit
  ctx.beginPath();
  ctx.moveTo(-26, -100); ctx.lineTo(-22, -150); ctx.lineTo(22, -150); ctx.lineTo(26, -100); ctx.closePath(); ctx.fill();
  if (!sil) {
    box(ctx, -12, -108, 24, 7, '#e0302a', 1, 3);                  // tail light
    ctx.fillStyle = css(accent);
    ctx.beginPath(); ctx.moveTo(-22, -140); ctx.lineTo(22, -140); ctx.lineTo(20, -128); ctx.lineTo(-20, -128); ctx.closePath(); ctx.fill();
  }
  // legs: boots on the pegs, the inside knee out toward the kerb
  ctx.fillStyle = C(leathers);
  for (const sd of [-1, 1]) {
    const out = sd === side ? 1 + kneeOut * 1.6 : 1;
    ctx.beginPath();
    ctx.moveTo(sd * 30, -150);
    ctx.quadraticCurveTo(sd * 62 * out, -150, sd * 58 * out, -122);
    ctx.lineTo(sd * 40, -104);
    ctx.lineTo(sd * 30, -112);
    ctx.closePath(); ctx.fill();
    if (sd === side && kneeOut > 0.5 && !sil) box(ctx, sd * 58 * out - 7, -134, 14, 12, '#d9d9d9', 1, 4);  // knee slider
  }
  // seat, back and shoulders, tucked
  ctx.beginPath();
  ctx.moveTo(-34, -150); ctx.quadraticCurveTo(-46, -196, -34, -222); ctx.quadraticCurveTo(0, -236, 34, -222);
  ctx.quadraticCurveTo(46, -196, 34, -150); ctx.closePath(); ctx.fill();
  if (!sil) {
    ctx.fillStyle = css(color);
    ctx.beginPath(); ctx.moveTo(-6, -154); ctx.lineTo(6, -154); ctx.lineTo(10, -214); ctx.lineTo(-10, -214); ctx.closePath(); ctx.fill(); // spine stripe
    ctx.fillStyle = css(accent);
    ctx.beginPath(); ctx.ellipse(0, -196, 22, 8, 0, 0, TAU); ctx.fill();                                          // aero hump
  }
  // arms reaching forward to the bars
  ctx.fillStyle = C(leathers);
  for (const sd of [-1, 1]) {
    ctx.beginPath(); ctx.ellipse(sd * 40, -214, 12, 16, sd * 0.4, 0, TAU); ctx.fill();
  }
  // helmet
  ctx.fillStyle = C(helmet);
  ctx.beginPath(); ctx.ellipse(0, -238, 26, 25, 0, 0, TAU); ctx.fill();
  if (!sil && star) {
    ctx.fillStyle = css(accent);
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? 5 : 12;
      ctx.lineTo(Math.cos(a) * r, -240 + Math.sin(a) * r);
    }
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}

// A wooden or wire fence along the ground from x0 to x1.
export function fence(ctx, x0, x1, y, { h = 70, gap = 90, color = '#2a2420', rails = 2, w = 7 } = {}) {
  for (let x = x0; x <= x1; x += gap) box(ctx, x - w / 2, y - h, w, h, color);
  for (let r = 0; r < rails; r++) {
    const yy = y - h + 10 + (r * (h - 25)) / Math.max(1, rails - 1);
    box(ctx, x0, yy, x1 - x0, 5, color);
  }
}

// A five-pointed star path.
export function starPath(ctx, x, y, r, inner = 0.45, rot = -Math.PI / 2) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = rot + (i * Math.PI) / 5, rr = i % 2 ? r * inner : r;
    ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  ctx.closePath();
}

// A satellite bus: gold-foil box, folded or deployed arrays, a dish.
export function satellite(ctx, x, y, { s = 1, deploy = 0, t = 0 } = {}) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  // arrays
  const pw = lerp(30, 220, deploy);
  for (const sd of [-1, 1]) {
    box(ctx, sd > 0 ? 70 : -70 - pw, -40, pw, 80, '#1d2f5a');
    for (let i = 0; i < 6; i++) line(ctx, sd > 0 ? 70 + (pw * i) / 6 : -70 - (pw * i) / 6, -40, sd > 0 ? 70 + (pw * i) / 6 : -70 - (pw * i) / 6, 40, '#3a5a98', 1.5);
    line(ctx, sd * 60, 0, sd * 70, 0, '#aab0b8', 4);
  }
  // body in foil
  const g = ctx.createLinearGradient(-60, -70, 60, 70);
  g.addColorStop(0, '#f6d77a'); g.addColorStop(0.35, '#c79a36'); g.addColorStop(0.6, '#f0cf6a'); g.addColorStop(1, '#9c7426');
  ctx.fillStyle = g;
  ctx.fillRect(-60, -70, 120, 140);
  for (let i = 0; i < 8; i++) line(ctx, -60 + hash(i, 5) * 120, -70, -60 + hash(i, 6) * 120, 70, '#fff3c0', 1, 0.35);
  // dish
  ctx.fillStyle = css('#e8e9ec');
  ctx.beginPath(); ctx.ellipse(0, -96, 44, 14, 0, 0, TAU); ctx.fill();
  line(ctx, 0, -96, 0, -70, '#b8bcc4', 4);
  line(ctx, 0, -96, 0, -118, '#b8bcc4', 2);
  ctx.restore();
}

// The nozzle and chamber contour of a small liquid engine, as a closed path
// around the axis (x along the flow). Returns the path points of the upper wall.
export function nozzleWall(len = 1, rc = 0.34, rt = 0.14, re = 0.36, lc = 0.36) {
  const pts = [];
  const n = 60;
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const x = u * len;
    let r;
    if (u < lc - 0.12) r = rc;
    else if (u < lc) { const k = (u - (lc - 0.12)) / 0.12; r = lerp(rc, rt, 0.5 - 0.5 * Math.cos(k * Math.PI)); }
    else { const k = (u - lc) / (1 - lc); r = rt + (re - rt) * Math.sin((k * Math.PI) / 2) ** 0.8; }
    pts.push([x, r]);
  }
  return pts;
}
