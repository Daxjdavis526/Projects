// Flow Field: thousands of particles ride a planar vector field, leaving
// fading comet trails. Pick a preset or type your own F(x, y) = (P, Q); drag
// across the plane to release dye; drag the probe to read div and curl.

import * as THREE from 'three';
import type { DemoDef, DemoCtx, DemoInstance, Readout } from '../modules/types';
import type { V3 } from '../engine/viewport3d';
import { colormap } from '../engine/colors';
import { parse, compile, derivative, simplify, toTeX, freeSymbols, CONSTANTS, Node } from '../core/expr';
import { rk4Field, Field2 } from '../core/numeric/fidget';
import { fmt, tx, ping } from './common';

const B = 3;                 // the plane shown is [−B, B]²
const MAXP = 5000;
const TL = 14;               // trail length (points)
const MAXSTEP = 0.12;        // the longest step a particle may take in one frame

const PRESETS: Record<string, [string, string]> = {
  pendulum: ['(y, -sin(x) - k*y/5)', 'Damped pendulum (phase plane)'],
  vdp: ['(y, k*(1 - x^2)*y - x)', 'Van der Pol oscillator'],
  vortex: ['(-y, x)', 'Vortex (rotation)'],
  spiral: ['(-k*x/4 - y, x - k*y/4)', 'Spiral sink'],
  saddle: ['(x, -y)', 'Saddle'],
  source: ['(x, y)', 'Source'],
  cells: ['(sin(x)*cos(y), -cos(x)*sin(y))', 'Cellular flow'],
  duffing: ['(y, x - x^3 - k*y/4)', 'Double well (Duffing)'],
};

// speed → colour; on a light background the pale yellow end is left out
const LUT_DARK = Array.from({ length: 64 }, (_, i) => colormap('plasma', 0.18 + 0.8 * (i / 63)));
const LUT_LIGHT = Array.from({ length: 64 }, (_, i) => colormap('plasma', 0.02 + 0.76 * (i / 63)));

interface FieldParts { P: Node; Q: Node; f: Field2; div: Node | null; curl: Node | null }

function compileField(src: string, k: number): FieldParts {
  let n = parse(src.includes('=') ? src.slice(src.indexOf('=') + 1) : src);
  // allow (P, Q)*k: distribute a scalar factor over a tuple
  if (n.t === 'mul' && n.a.t === 'tuple') n = { t: 'tuple', items: n.a.items.map((it) => ({ t: 'mul', a: it, b: (n as { b: Node }).b }) as Node) };
  if (n.t !== 'tuple' || n.items.length !== 2) throw new Error('write the field as (P, Q), e.g. (y, -x)');
  const [P, Q] = n.items;
  for (const s of [...freeSymbols(P), ...freeSymbols(Q)]) if (!['x', 'y', 'k'].includes(s) && !(s in CONSTANTS)) throw new Error(`“${s}” has no value — use x, y and the slider k`);
  const fp = compile(P, ['x', 'y'], { k }), fq = compile(Q, ['x', 'y'], { k });
  const buf = [0, 0];
  const f: Field2 = (x, y, out) => { buf[0] = x; buf[1] = y; out[0] = fp(buf); out[1] = fq(buf); };
  let div: Node | null = null, curl: Node | null = null;
  try { div = simplify({ t: 'add', a: derivative(P, 'x'), b: derivative(Q, 'y') }); curl = simplify({ t: 'sub', a: derivative(Q, 'x'), b: derivative(P, 'y') }); } catch { /* not differentiable here */ }
  return { P, Q, f, div, curl };
}

function create(ctx: DemoCtx): DemoInstance {
  const v = ctx.view3d!;
  v.setBounds({ x: [-B, B], y: [-B, B], z: [-0.5, 0.5] });
  v.setProjection('orthographic');
  v.view('top');
  v.camera.zoom = 1.4; v.camera.updateProjectionMatrix();
  v.controls.enableRotate = false;

  // particles: positions now, a ring of past positions for the trails, a life clock, a dye tint
  const px = new Float64Array(MAXP), py = new Float64Array(MAXP), life = new Float32Array(MAXP), dye = new Float32Array(MAXP);
  const ring = new Float32Array(MAXP * TL * 2);
  let head = 0;
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(MAXP * (TL - 1) * 2 * 3), col = new Float32Array(MAXP * (TL - 1) * 2 * 3);
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const lines = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ vertexColors: true }));
  lines.frustumCulled = false;
  v.addObject(lines);

  const seat = (i: number, x: number, y: number) => {
    px[i] = x; py[i] = y;
    for (let s = 0; s < TL; s++) { ring[(i * TL + s) * 2] = x; ring[(i * TL + s) * 2 + 1] = y; }
  };
  const spawn = (i: number) => { seat(i, (Math.random() * 2 - 1) * B, (Math.random() * 2 - 1) * B); life[i] = 1.5 + Math.random() * 4.5; dye[i] = 0; };
  for (let i = 0; i < MAXP; i++) spawn(i);

  let F: FieldParts | null = null, lastKey = '';
  const out = new Float64Array(2), kbuf = new Float64Array(8);
  let speedScale = 1;

  // the probe: drag it to read the field, divergence and curl at a point
  const probe = v.addPoint([1, 0.5, 0.02], { color: '#ffffff', size: 0.1, drag: { constrain: (p) => [Math.max(-B, Math.min(B, p[0])), Math.max(-B, Math.min(B, p[1])), 0.02], onDrag: () => report() } });
  const probeArrow = v.addArrow([1, 0.5, 0.02], [0.5, 0, 0], { color: '#ffffff', radius: 0.025 });
  let field: ReturnType<typeof v.addVectorField> | null = null;

  // release dye where you drag (left button on empty plane)
  const canvas = v.renderer.domElement, host = canvas.parentElement!;
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), hit = new THREE.Vector3();
  const toPlane = (e: PointerEvent): [number, number] | null => {
    const r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, v.camera);
    if (ray.intersectObject(probe.object, false).length) return null;          // that is the probe: let the viewport drag it
    if (!ray.ray.intersectPlane(plane, hit)) return null;
    return [hit.x, -hit.z];                                                        // world (x, y, z) → math (x, −z)
  };
  let next = 0, dyeing = false;
  const release = (p: [number, number], n: number) => {
    for (let j = 0; j < n; j++) {
      const i = next; next = (next + 1) % ctx.params.count;
      const a = Math.random() * 2 * Math.PI, r = 0.12 * Math.sqrt(Math.random());
      seat(i, p[0] + r * Math.cos(a), p[1] + r * Math.sin(a)); life[i] = 4 + Math.random() * 3; dye[i] = 1;
    }
  };
  const onDown = (e: PointerEvent) => {
    if (e.button !== 0) return;
    const p = toPlane(e);
    if (!p || Math.abs(p[0]) > B || Math.abs(p[1]) > B) return;
    e.stopPropagation(); e.preventDefault();
    dyeing = true; release(p, 60); ping(0.7, 0.025);
    window.addEventListener('pointermove', onMove); window.addEventListener('pointerup', onUp);
  };
  const onMove = (e: PointerEvent) => { if (!dyeing) return; const p = toPlane(e); if (p) release(p, 14); };
  const onUp = () => { dyeing = false; window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); };
  host.addEventListener('pointerdown', onDown, { capture: true });

  const report = () => {
    if (!F) return;
    const q = probe.get();
    F.f(q[0], q[1], out);
    const fx = out[0], fy = out[1], m = Math.hypot(fx, fy);
    const sc = m > 0 ? Math.min(1.2, 0.35 + 0.4 * m) / m : 0;
    probeArrow.set([q[0], q[1], 0.02], [fx * sc, fy * sc, 0]);
    const k = ctx.params.k;
    const at = (n: Node | null) => (n ? compile(n, ['x', 'y'], { k })([q[0], q[1]]) : NaN);
    const dv = at(F.div), cu = at(F.curl);
    const rows: Readout[] = [
      { label: 'F(x, y)', value: `\\left(${toTeX(F.P)},\\; ${toTeX(F.Q)}\\right)`, tex: true },
      { label: 'probe at', value: `(${fmt(q[0], 3)}, ${fmt(q[1], 3)})` },
      { label: 'F at the probe', value: `(${fmt(fx, 4)}, ${fmt(fy, 4)})` },
      { label: '|F| at the probe', value: fmt(m, 4) },
      { label: 'div F at the probe', value: fmt(dv, 5), tone: dv > 1e-9 ? 'warn' : dv < -1e-9 ? 'good' : 'muted' },
      { label: 'curl F at the probe', value: fmt(cu, 5) },
    ];
    if (F.div) rows.push({ label: '∇·F = ∂P/∂x + ∂Q/∂y', value: toTeX(F.div), tex: true });
    if (F.curl) rows.push({ label: '∂Q/∂x − ∂P/∂y', value: toTeX(F.curl), tex: true });
    ctx.setReadouts(rows);
    ctx.setNote(`Each particle obeys $\\dot x = P(x,y),\\ \\dot y = Q(x,y)$. At the probe the divergence is $${tx(dv)}$ (${dv > 1e-9 ? 'a source: particles spread apart' : dv < -1e-9 ? 'a sink: particles crowd together' : 'area-preserving there'}) and the curl is $${tx(cu)}$ (${cu > 1e-9 ? 'anticlockwise spin' : cu < -1e-9 ? 'clockwise spin' : 'no local spin'}). **Drag on the plane** to release dye; drag the white probe to read the field.`);
  };

  const update = () => {
    const pre = ctx.choices.field;
    const src = pre === 'custom' ? ctx.input : PRESETS[pre]?.[0] ?? ctx.input;
    const key = `${src}|${ctx.params.k}`;
    if (key !== lastKey) {
      lastKey = key;
      try {
        F = compileField(src, ctx.params.k); ctx.warn('');
        // a speed scale for colours, from a coarse sample of |F|
        let mx = 0;
        for (let i = 0; i <= 12; i++) for (let j = 0; j <= 12; j++) { F.f(-B + (2 * B * i) / 12, -B + (2 * B * j) / 12, out); const m = Math.hypot(out[0], out[1]); if (Number.isFinite(m)) mx = Math.max(mx, m); }
        speedScale = mx > 0 ? 1 / mx : 1;
        if (field) field.update(([x, y]) => { F!.f(x, y, out); return [out[0], out[1], 0] as V3; });
      } catch (e) { ctx.warn(`Could not read the field: ${(e as Error).message}`); }
    }
    if (ctx.toggles.arrows && !field && F) field = v.addVectorField(([x, y]) => { F!.f(x, y, out); return [out[0], out[1], 0]; }, { planar: true, n: 17, scale: 0.8, bounds: { x: [-B, B], y: [-B, B], z: [0, 0] } });
    field?.visible(!!ctx.toggles.arrows);
    const ink = ctx.dark ? '#ffffff' : '#1b1f2a';
    ((probe.object as THREE.Mesh).material as THREE.MeshStandardMaterial).color.set(ink);
    ((probe.object as THREE.Mesh).material as THREE.MeshStandardMaterial).emissive.set(ink);
    probeArrow.setColor(ink);
    report();
  };

  const bg = new THREE.Color();
  const stop = v.onFrame((dt) => {
    if (!F) return;
    const n = Math.round(ctx.params.count);
    const h = dt * ctx.params.speed;
    head = (head + 1) % TL;
    bg.set(ctx.dark ? 0x0d1017 : 0xf4f5f8);
    const LUT = ctx.dark ? LUT_DARK : LUT_LIGHT;
    const fade = ctx.params.trail;
    for (let i = 0; i < n; i++) {
      life[i] -= dt;
      let x = px[i], y = py[i];
      // RK4 step; where |F| is huge the step is shortened (a slower clock along the same path)
      F.f(x, y, out);
      const sp = Math.hypot(out[0], out[1]);
      const hh = sp * Math.abs(h) > MAXSTEP ? (MAXSTEP / sp) * Math.sign(h) : h;
      rk4Field(F.f, x, y, hh, out, kbuf);
      x = out[0]; y = out[1];
      if (life[i] <= 0 || !(Math.abs(x) <= B * 1.08 && Math.abs(y) <= B * 1.08)) { spawn(i); x = px[i]; y = py[i]; }
      else { px[i] = x; py[i] = y; }
      const o = (i * TL + head) * 2;
      ring[o] = x; ring[o + 1] = y;
      if (dye[i] > 0) dye[i] = Math.max(0, dye[i] - dt * 0.25);
      // write the trail: newest segment brightest, fading to the background
      const c = LUT[Math.min(63, Math.floor(sp * speedScale * 63))];
      const lf = Math.min(1, life[i] * 1.5);
      const d = dye[i];
      const dr = ctx.dark ? 0.7 : 0.05, dg = ctx.dark ? 0.97 : 0.55, db = ctx.dark ? 1 : 0.6;   // dye: icy white (teal on light)
      const cr = c.r + (dr - c.r) * d, cg = c.g + (dg - c.g) * d, cb = c.b + (db - c.b) * d;
      let w = i * (TL - 1) * 6;
      for (let s = 0; s < TL - 1; s++) {
        const a = (head - s + TL) % TL, b = (head - s - 1 + TL) % TL;
        const ia = (i * TL + a) * 2, ib = (i * TL + b) * 2;
        const t0 = lf * Math.pow(1 - s / (TL - 1), fade), t1 = lf * Math.pow(1 - (s + 1) / (TL - 1), fade);
        pos[w] = ring[ia]; pos[w + 1] = ring[ia + 1]; pos[w + 2] = 0.01;
        col[w] = bg.r + (cr - bg.r) * t0; col[w + 1] = bg.g + (cg - bg.g) * t0; col[w + 2] = bg.b + (cb - bg.b) * t0;
        pos[w + 3] = ring[ib]; pos[w + 4] = ring[ib + 1]; pos[w + 5] = 0.01;
        col[w + 3] = bg.r + (cr - bg.r) * t1; col[w + 4] = bg.g + (cg - bg.g) * t1; col[w + 5] = bg.b + (cb - bg.b) * t1;
        w += 6;
      }
    }
    geo.setDrawRange(0, n * (TL - 1) * 2);
    geo.attributes.position.needsUpdate = true;
    geo.attributes.color.needsUpdate = true;
  });

  return {
    update,
    csv() {
      const rows = ['x,y'];
      for (let i = 0; i < Math.round(ctx.params.count); i++) rows.push(`${px[i].toFixed(5)},${py[i].toFixed(5)}`);
      return rows.join('\n');
    },
    dispose() { stop(); onUp(); host.removeEventListener('pointerdown', onDown, { capture: true }); v.controls.enableRotate = true; v.clear(); },
  };
}

export const flowField: DemoDef = {
  id: 'fidget.flow', module: 'fidget', title: 'Flow Field', topic: 'Vector fields, trajectories, phase portraits, divergence and curl',
  summary: 'Thousands of glowing particles ride a vector field, leaving comet trails. Choose a preset or type your own field, and drag across the plane to pour in dye.',
  tex: '\\dot{\\mathbf x} = \\mathbf F(\\mathbf x),\\qquad \\mathbf F(x, y) = \\big(P(x, y),\\, Q(x, y)\\big)',
  view: '3d',
  input: { label: 'Custom F(x, y) =', value: 'F(x,y) = (sin(y), sin(x))', placeholder: '(P, Q) in x, y and k — e.g. (y, -x - y/3)' },
  params: [
    { key: 'k', label: 'field parameter k', value: 1, min: -3, max: 3, step: 0.01 },
    { key: 'speed', label: 'flow speed', value: 1, min: -2, max: 3, step: 0.01 },
    { key: 'count', label: 'particles', value: 3000, min: 300, max: MAXP, step: 100 },
    { key: 'trail', label: 'trail fade (higher = shorter)', value: 1.4, min: 0.4, max: 4, step: 0.05 },
  ],
  choices: [{ key: 'field', label: 'Field', value: 'pendulum', options: [...Object.entries(PRESETS).map(([k, [, label]]) => [k, label] as [string, string]), ['custom', 'Custom (type it below)']] }],
  toggles: [{ key: 'arrows', label: 'Field arrows', value: false }],
  experiments: [
    'Damped pendulum: particles spiral into the rest states at x = 0, ±2π, and slip past the saddles at x = ±π. Set k = 0 — no friction — and they circulate forever.',
    'Van der Pol: every particle, from inside or out, joins one closed loop — a **limit cycle**. Make k negative and it repels instead.',
    'Drag the probe into the vortex: div F = 0 and curl F = 2 everywhere. Then try the source: div F = 2, curl F = 0.',
    'Choose Custom and type `(y, -x - y/3)`, or `(x - y - x*(x^2+y^2), x + y - y*(x^2+y^2))` — a perfect circular limit cycle.',
    'Set the flow speed negative: time runs backward, and the sinks become sources.',
  ],
  connections: ['fidget.eigen', 'fidget.derivative'],
  accuracy: 'Particles follow the exact trajectories of ẋ = F(x) integrated by classical RK4 with step dt·speed. Where |F| is so large that a step would exceed 0.12, the step is shortened — the particle moves along the same path on a slower clock, so speeds are not to scale there. Divergence and curl are exact symbolic derivatives evaluated in floating point.',
  create,
};
