// =============================================================================
// Pen and paper.
//
// The sketch view redraws the tower the way it was first drawn: hard ruled
// edges that overshoot their corners, a grid of squares on the glass, and
// hatching that gets denser on the faces turned from the light. Hatching is
// laid in screen space, as a hand would, not stuck to the surfaces.
//
// Lines are screen-space ribbons (WebGL's own lines are one pixel wide).
// Each segment carries its place in the drawing order, so the drawing can be
// put down stroke by stroke.
// =============================================================================

import * as THREE from 'three';

export const PAPER = new THREE.Color('#f3efe6');
export const INK = new THREE.Color('#1c1a18');

const common = /* glsl */`
  float h21(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
`;

export function inkFaceMaterial({ mirror = false } = {}) {
  return new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    polygonOffset: true, polygonOffsetFactor: 2, polygonOffsetUnits: 2,
    transparent: mirror,
    depthWrite: !mirror,
    uniforms: {
      uLight: { value: new THREE.Vector3(-0.55, 0.45, 0.7).normalize() },
      uFade: { value: 0 },
      uReveal: { value: 1e6 },
      uPaper: { value: PAPER },
      uInk: { value: INK },
      uDpr: { value: 1 },
      uMirror: { value: mirror ? 1 : 0 },
    },
    vertexShader: /* glsl */`
      attribute vec2 facade;
      attribute float kind;
      varying vec2 vFacade;
      varying vec3 vN;
      varying vec3 vW;
      varying float vKind;
      void main(){
        vFacade = facade; vKind = kind;
        vN = normalize(mat3(modelMatrix) * normal);
        vec4 w = modelMatrix * vec4(position, 1.0);
        vW = w.xyz;
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: /* glsl */`
      uniform vec3 uLight, uPaper, uInk;
      uniform float uFade, uDpr, uMirror, uReveal;
      varying vec2 vFacade;
      varying vec3 vN;
      varying vec3 vW;
      varying float vKind;
      ${common}
      // a family of slightly wavering parallel strokes in screen space
      float hatch(vec2 p, float ang, float spacing, float width){
        vec2 d = vec2(cos(ang), sin(ang));
        float a = dot(p, d);
        float b = dot(p, vec2(-d.y, d.x));
        float row = floor(a / spacing);
        a += sin(b * 0.045 + row * 1.7) * 0.8;
        float f = abs(fract(a / spacing) - 0.5) * spacing;
        // strokes break up here and there, as a pen skips
        float skip = step(0.18, h21(vec2(row, floor(b / 60.0))));
        return (1.0 - smoothstep(width * 0.5, width * 0.5 + 0.9, f)) * skip;
      }
      float gridLine(float x, float spacing){
        float g = x / spacing;
        float d = abs(fract(g + 0.5) - 0.5) / fwidth(g);
        return 1.0 - smoothstep(0.4, 1.4, d);
      }
      void main(){
        vec3 n = normalize(vN);
        if (!gl_FrontFacing) n = -n;
        float lam = dot(n, uLight);
        float tone = clamp(0.62 - lam * 0.75, 0.0, 1.0);
        // undersides of the wings are where the sketch is darkest
        tone = max(tone, smoothstep(-0.3, -0.85, n.y) * 0.95);
        if (vKind > 2.5) tone = max(tone, 0.7);         // the legs, in shadow
        vec2 p = gl_FragCoord.xy / uDpr;
        float ink = 0.0;
        ink = max(ink, hatch(p, 0.95, 6.0, 1.0) * smoothstep(0.30, 0.42, tone));
        ink = max(ink, hatch(p, -0.62, 5.0, 1.0) * smoothstep(0.55, 0.66, tone));
        ink = max(ink, hatch(p, 0.2, 3.6, 1.1) * smoothstep(0.78, 0.88, tone));
        // the glazing grid, ruled lightly on the walls
        float wall = 1.0 - smoothstep(0.6, 0.8, abs(n.y));
        float g = max(gridLine(vFacade.x, 7.0), gridLine(vFacade.y, 8.4)) * wall * 0.55;
        // filled in behind the outlines, from the ground up
        float here = 1.0 - smoothstep(uReveal - 25.0, uReveal, abs(vW.y));
        ink = max(ink * uFade, g) * here;
        vec3 col = mix(uPaper, uInk, ink);
        float a = 1.0;
        if (uMirror > 0.5) {
          // the reflection: only the ink, fading with depth below the water
          float fade = (1.0 - smoothstep(0.0, 160.0, -vW.y)) * 0.32;
          a = ink * fade;
          col = uInk;
        }
        gl_FragColor = vec4(col, a);
      }`,
  });
}

// Ribbons for a list of [a, b] segments. order: where each sits in the
// drawing sequence, 0..1.
export function inkLines(segments, { width = 1.6, overshoot = 9, mirror = false } = {}) {
  const n = segments.length;
  const pa = new Float32Array(n * 4 * 3), pb = new Float32Array(n * 4 * 3);
  const side = new Float32Array(n * 4), end = new Float32Array(n * 4);
  const order = new Float32Array(n * 4), seed = new Float32Array(n * 4);
  const idx = [];
  segments.forEach(([a, b], i) => {
    const o = segments.order ? segments.order[i] : i / n;
    const s = Math.abs(Math.sin(i * 91.7 + 3.1) * 43758.55) % 1;
    for (let k = 0; k < 4; k++) {
      const v = i * 4 + k;
      pa.set(a, v * 3); pb.set(b, v * 3);
      side[v] = k % 2 ? 1 : -1;
      end[v] = k < 2 ? 0 : 1;
      order[v] = o; seed[v] = s;
    }
    const v = i * 4;
    idx.push(v, v + 1, v + 2, v + 2, v + 1, v + 3);
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pa, 3)); // for bounds only
  g.setAttribute('pb', new THREE.BufferAttribute(pb, 3));
  g.setAttribute('side', new THREE.BufferAttribute(side, 1));
  g.setAttribute('endT', new THREE.BufferAttribute(end, 1));
  g.setAttribute('order', new THREE.BufferAttribute(order, 1));
  g.setAttribute('seed', new THREE.BufferAttribute(seed, 1));
  g.setIndex(idx);
  g.computeBoundingSphere();
  g.boundingSphere.radius *= 2;

  const m = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,   // ribbons are built in screen space; winding follows the line
    uniforms: {
      uRes: { value: new THREE.Vector2(1, 1) },
      uWidth: { value: width },
      uOver: { value: overshoot },
      uDraw: { value: 1 },
      uInk: { value: INK },
      uMirror: { value: mirror ? 1 : 0 },
      uAlpha: { value: 1 },
    },
    vertexShader: /* glsl */`
      attribute vec3 pb;
      attribute float side, endT, order, seed;
      uniform vec2 uRes;
      uniform float uWidth, uOver, uDraw;
      varying float vT, vSide, vShow, vSeed, vY;
      void main(){
        // pulled a metre and a half toward the eye, so a line wins against
        // the faces it bounds but not against faces in front of it
        vec4 ma = modelViewMatrix * vec4(position, 1.0);
        vec4 mb = modelViewMatrix * vec4(pb, 1.0);
        ma.xyz *= 1.0 - 1.5 / max(length(ma.xyz), 2.0);
        mb.xyz *= 1.0 - 1.5 / max(length(mb.xyz), 2.0);
        vec4 ca = projectionMatrix * ma;
        vec4 cb = projectionMatrix * mb;
        // keep both ends in front of the camera
        if (ca.w < 0.1) ca = mix(ca, cb, (0.1 - ca.w) / (cb.w - ca.w));
        if (cb.w < 0.1) cb = mix(cb, ca, (0.1 - cb.w) / (ca.w - cb.w));
        vec2 sa = ca.xy / ca.w * uRes * 0.5;
        vec2 sb = cb.xy / cb.w * uRes * 0.5;
        vec2 dir = sb - sa;
        float len = length(dir);
        dir = len > 1e-4 ? dir / len : vec2(1.0, 0.0);
        vec2 nrm = vec2(-dir.y, dir.x);
        // a ruled line runs past its corners; how far varies line to line
        float ov = uOver * (0.35 + seed);
        // the hand is slightly off: ends shift a pixel or two across the line
        float jit = (fract(seed * 13.7) - 0.5) * 2.2;
        vec4 c = endT < 0.5 ? ca : cb;
        vec2 s = endT < 0.5 ? sa - dir * ov + nrm * jit : sb + dir * ov * 0.6 - nrm * jit;
        // pressure: a little heavier on long lines
        float w = uWidth * (0.8 + 0.4 * fract(seed * 7.3)) * (0.85 + 0.3 * smoothstep(20.0, 300.0, len));
        s += nrm * side * (w * 0.5 + 1.0);
        c.xy = s / (uRes * 0.5) * c.w;
        gl_Position = c;
        vT = endT; vSide = side * (w * 0.5 + 1.0) / max(w * 0.5, 0.5);
        // stroke-by-stroke: this line is drawn over a short stretch of uDraw
        vShow = clamp((uDraw - order * 0.88) / 0.12, 0.0, 1.0);
        vSeed = seed;
        vY = (modelMatrix * vec4(endT < 0.5 ? position : pb, 1.0)).y;
      }`,
    fragmentShader: /* glsl */`
      uniform vec3 uInk;
      uniform float uMirror, uAlpha;
      varying float vT, vSide, vShow, vSeed, vY;
      void main(){
        if (vT > vShow) discard;
        float a = 1.0 - smoothstep(0.7, 1.0, abs(vSide));
        a *= 0.82 + 0.18 * fract(vSeed * 31.1);
        if (uMirror > 0.5) {
          a *= (1.0 - smoothstep(0.0, 140.0, -vY)) * 0.28;
          // reflections break into dashes, like strokes across water
          a *= step(0.35, fract(vT * (6.0 + 10.0 * vSeed) + vSeed));
        }
        gl_FragColor = vec4(uInk, a * uAlpha);
      }`,
  });
  return new THREE.Mesh(g, m);
}

// Paint the paper's surroundings: horizon strokes and wavelets across the water.
export function groundStrokes(rnd) {
  const segs = [];
  // the ground line, gone over a few times
  for (let k = 0; k < 4; k++) {
    const z = 100 + (rnd() - 0.5) * 5;   // just in front of the plinth
    segs.push([[-420 - rnd() * 60, 0, z], [420 + rnd() * 60, 0, z]]);
  }
  // short horizontal strokes across the water in front, sparser further out
  for (let k = 0; k < 140; k++) {
    const z = 115 + Math.pow(rnd(), 0.7) * 700;
    const x = (rnd() - 0.5) * (300 + z * 0.9);
    const L = 8 + rnd() * 50;
    segs.push([[x - L, 0, z], [x + L, 0, z]]);
  }
  return segs;
}
