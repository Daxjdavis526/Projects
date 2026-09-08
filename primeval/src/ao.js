// Screen-space ambient occlusion.
//
// The stock three.js AO passes are no use here, because this renderer runs with
// a logarithmic depth buffer — it has to, with a near plane at 9 cm and a far
// plane 90 km out — and they all assume the ordinary perspective encoding.
// Rather than give that up, this inverts three's encoding directly:
//
//   gl_FragDepth = log2(1 + w) * logDepthBufFC * 0.5      (three writes this)
//   w            = exp2(2 * depth / logDepthBufFC) - 1    (we read it back)
//
// and w is the view-space distance, which is better than what an ordinary depth
// buffer gives you: no division, no precision cliff at range. Everything else
// is a straightforward hemisphere occlusion — reconstruct view position from
// the depth, take the normal from the closest of the four neighbouring
// reconstructions, sample a spiral around it, count the samples the geometry
// occludes. A depth-aware blur cleans up the noise afterwards.
//
// This darkens the whole lit result, not just the ambient term, which is not
// physically right; it is the usual cheap compromise and the reason the default
// intensity is well under 1.

import * as THREE from 'three';
import { Pass, FullScreenQuad } from 'three/addons/postprocessing/Pass.js';

const QUAD_VERT = /* glsl */`
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;

const DEPTH_FNS = /* glsl */`
uniform sampler2D tDepth;
uniform vec2 uProjScale;   // (1 / P00, 1 / P11)
uniform float uLogFC;      // 2 / log2(far + 1), matching three's logDepthBufFC
uniform vec2 uTexel;

// View-space z (negative in front of the camera). Sky comes back as -uFar-ish.
float pvViewZ(vec2 uv){
  float d = texture2D(tDepth, uv).x;
  return -(exp2(d * 2.0 / uLogFC) - 1.0);
}
vec3 pvViewPos(vec2 uv){
  float z = pvViewZ(uv);
  return vec3((uv * 2.0 - 1.0) * uProjScale * -z, z);
}
`;

const AO_FRAG = /* glsl */`
precision highp float;
varying vec2 vUv;
${DEPTH_FNS}
uniform float uRadius;
uniform float uBias;
uniform float uFar;
uniform float uPower;
uniform float uProbe;   // 0 off, 1 linear depth, 2 normals, 3 raw occlusion

float pvHash(vec2 p){ p = fract(p * vec2(233.34, 851.73)); p += dot(p, p + 23.45); return fract(p.x * p.y); }

const int TAPS = 14;

void main(){
  float z = pvViewZ(vUv);
  // Sky: nothing in front of the far plane, so nothing to occlude.
  if (-z > uFar * 0.92) { gl_FragColor = vec4(1.0); return; }

  vec3 P = pvViewPos(vUv);

  // Normal from the closer of the forward and backward differences on each
  // axis. Plain dFdx across a silhouette straddles two surfaces and produces a
  // normal belonging to neither, which haloes every tree against the sky.
  vec3 Pl = pvViewPos(vUv - vec2(uTexel.x, 0.0));
  vec3 Pr = pvViewPos(vUv + vec2(uTexel.x, 0.0));
  vec3 Pd = pvViewPos(vUv - vec2(0.0, uTexel.y));
  vec3 Pu = pvViewPos(vUv + vec2(0.0, uTexel.y));
  vec3 dx = abs(Pr.z - P.z) < abs(P.z - Pl.z) ? (Pr - P) : (P - Pl);
  vec3 dy = abs(Pu.z - P.z) < abs(P.z - Pd.z) ? (Pu - P) : (P - Pd);
  vec3 N = cross(dx, dy);
  if (dot(N, N) < 1e-12) { gl_FragColor = vec4(1.0); return; }
  N = normalize(N);
  if (N.z < 0.0) N = -N;

  float rot = pvHash(gl_FragCoord.xy) * 6.2831853;
  float occ = 0.0;

  for (int i = 0; i < TAPS; i++){
    float fi = (float(i) + 0.5) / float(TAPS);
    float ang = fi * 6.2831853 * 3.0 + rot;
    float rad = uRadius * sqrt(fi);
    // Lift off the surface along the normal, so a flat plane occludes nothing.
    vec3 S = P + vec3(cos(ang), sin(ang), 0.0) * rad + N * rad * 0.28;
    if (S.z > -0.05) continue;
    vec2 suv = 0.5 + 0.5 * vec2(S.x / (uProjScale.x * -S.z), S.y / (uProjScale.y * -S.z));
    if (suv.x < 0.0 || suv.x > 1.0 || suv.y < 0.0 || suv.y > 1.0) continue;

    float sz = pvViewZ(suv);
    // Geometry nearer the camera than the sample point occludes it, but only
    // while it is close enough to plausibly be the same surface.
    float range = smoothstep(0.0, 1.0, uRadius / max(abs(P.z - sz), 1e-4));
    occ += step(uBias, sz - S.z) * range;
  }

  if (uProbe > 0.5) {
    if (uProbe < 1.5) { gl_FragColor = vec4(fract(-z / 20.0)); return; }
    if (uProbe < 2.5) { gl_FragColor = vec4(N * 0.5 + 0.5, 1.0); return; }
    gl_FragColor = vec4(occ / float(TAPS) * 4.0); return;
  }
  // A linear count of occluded samples barely moves off 1.0 in the open; the
  // curve is what turns it into shading you can actually see in a crease.
  gl_FragColor = vec4(pow(clamp(1.0 - occ / float(TAPS), 0.0, 1.0), uPower));
}
`;

const BLUR_FRAG = /* glsl */`
precision highp float;
varying vec2 vUv;
${DEPTH_FNS}
uniform sampler2D tAO;
uniform vec2 uDir;
uniform float uDepthTol;

void main(){
  float z0 = pvViewZ(vUv);
  float sum = texture2D(tAO, vUv).r;
  float wsum = 1.0;
  for (int i = 1; i <= 3; i++){
    float o = float(i);
    for (int s = 0; s < 2; s++){
      vec2 uv = vUv + uDir * uTexel * o * (s == 0 ? 1.0 : -1.0);
      // Do not blur across a depth step, or the occlusion bleeds off the
      // silhouette of everything in the scene.
      float w = step(abs(pvViewZ(uv) - z0), uDepthTol * max(1.0, -z0 * 0.05));
      sum += texture2D(tAO, uv).r * w;
      wsum += w;
    }
  }
  gl_FragColor = vec4(sum / wsum);
}
`;

const APPLY_FRAG = /* glsl */`
precision highp float;
varying vec2 vUv;
uniform sampler2D tDiffuse;
uniform sampler2D tAO;
uniform float uIntensity;
uniform float uDebug;
void main(){
  float ao = clamp(texture2D(tAO, vUv).r, 0.0, 1.0);
  ao = mix(1.0, ao, uIntensity);
  vec4 c = texture2D(tDiffuse, vUv);
  gl_FragColor = mix(vec4(c.rgb * ao, c.a), vec4(vec3(ao), 1.0), uDebug);
}
`;

/**
 * @param {THREE.PerspectiveCamera} camera
 * @param {THREE.DepthTexture} depthTexture  the main render target's depth
 */
export class AOPass extends Pass {
  constructor(camera, depthTexture, { intensity = 0.85, radius = 1.1, bias = 0.03, power = 2.6 } = {}) {
    super();
    this.camera = camera;
    this.needsSwap = true;

    const shared = () => ({
      tDepth: { value: depthTexture },
      uProjScale: { value: new THREE.Vector2(1, 1) },
      uLogFC: { value: 1 },
      uTexel: { value: new THREE.Vector2(1, 1) },
    });

    this.aoMaterial = new THREE.ShaderMaterial({
      uniforms: {
        ...shared(),
        uRadius: { value: radius },
        uBias: { value: bias },
        uFar: { value: camera.far },
        uPower: { value: power },
        uProbe: { value: 0 },
      },
      vertexShader: QUAD_VERT, fragmentShader: AO_FRAG,
      depthTest: false, depthWrite: false,
    });

    this.blurMaterial = new THREE.ShaderMaterial({
      uniforms: {
        ...shared(),
        tAO: { value: null },
        uDir: { value: new THREE.Vector2(1, 0) },
        uDepthTol: { value: 0.35 },
      },
      vertexShader: QUAD_VERT, fragmentShader: BLUR_FRAG,
      depthTest: false, depthWrite: false,
    });

    this.applyMaterial = new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse: { value: null },
        tAO: { value: null },
        uIntensity: { value: intensity },
        uDebug: { value: 0 },
      },
      vertexShader: QUAD_VERT, fragmentShader: APPLY_FRAG,
      depthTest: false, depthWrite: false,
    });

    this.quad = new FullScreenQuad(null);
    const opts = {
      type: THREE.UnsignedByteType, format: THREE.RedFormat,
      minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter,
      depthBuffer: false, stencilBuffer: false,
    };
    this.aoTarget = new THREE.WebGLRenderTarget(1, 1, opts);
    this.tmpTarget = new THREE.WebGLRenderTarget(1, 1, opts);
  }

  /** The depth texture is recreated whenever the composer target resizes. */
  setDepthTexture(depthTexture) {
    this.aoMaterial.uniforms.tDepth.value = depthTexture;
    this.blurMaterial.uniforms.tDepth.value = depthTexture;
  }

  setSize(width, height) {
    // Half resolution. AO is low frequency; the depth-aware blur is what
    // matters, and this is four times cheaper.
    const w = Math.max(2, Math.floor(width * 0.5));
    const h = Math.max(2, Math.floor(height * 0.5));
    this.aoTarget.setSize(w, h);
    this.tmpTarget.setSize(w, h);
    for (const m of [this.aoMaterial, this.blurMaterial]) {
      m.uniforms.uTexel.value.set(1 / w, 1 / h);
    }
  }

  /** Called every frame: the projection can change with the field of view. */
  syncCamera() {
    const p = this.camera.projectionMatrix.elements;
    const scale = new THREE.Vector2(1 / p[0], 1 / p[5]);
    this.aoMaterial.uniforms.uProjScale.value.copy(scale);
    this.blurMaterial.uniforms.uProjScale.value.copy(scale);
    const fc = 2.0 / (Math.log(this.camera.far + 1.0) / Math.LN2);
    this.aoMaterial.uniforms.uLogFC.value = fc;
    this.blurMaterial.uniforms.uLogFC.value = fc;
    this.aoMaterial.uniforms.uFar.value = this.camera.far;
  }

  render(renderer, writeBuffer, readBuffer) {
    // Take the depth from whichever buffer the render pass just drew into.
    // EffectComposer clones the target it is given for its second buffer, and
    // the clone gets its own depth texture — so the one handed in at
    // construction time is the buffer that never gets rendered to, and reads
    // back empty. Binding it here is also correct if the composer ping-pongs.
    const depth = readBuffer && readBuffer.depthTexture;
    if (!depth) { this.enabled = false; return; }
    if (this.aoMaterial.uniforms.tDepth.value !== depth) this.setDepthTexture(depth);
    this.syncCamera();
    const prevTarget = renderer.getRenderTarget();
    const prevAutoClear = renderer.autoClear;
    renderer.autoClear = false;

    this.quad.material = this.aoMaterial;
    renderer.setRenderTarget(this.aoTarget);
    renderer.clear(true, false, false);
    this.quad.render(renderer);

    this.quad.material = this.blurMaterial;
    this.blurMaterial.uniforms.tAO.value = this.aoTarget.texture;
    this.blurMaterial.uniforms.uDir.value.set(1, 0);
    renderer.setRenderTarget(this.tmpTarget);
    renderer.clear(true, false, false);
    this.quad.render(renderer);

    this.blurMaterial.uniforms.tAO.value = this.tmpTarget.texture;
    this.blurMaterial.uniforms.uDir.value.set(0, 1);
    renderer.setRenderTarget(this.aoTarget);
    renderer.clear(true, false, false);
    this.quad.render(renderer);

    this.quad.material = this.applyMaterial;
    this.applyMaterial.uniforms.tDiffuse.value = readBuffer.texture;
    this.applyMaterial.uniforms.tAO.value = this.aoTarget.texture;
    renderer.setRenderTarget(this.renderToScreen ? null : writeBuffer);
    if (this.clear) renderer.clear();
    this.quad.render(renderer);

    renderer.autoClear = prevAutoClear;
    renderer.setRenderTarget(prevTarget);
  }

  dispose() {
    this.aoTarget.dispose();
    this.tmpTarget.dispose();
    this.aoMaterial.dispose();
    this.blurMaterial.dispose();
    this.applyMaterial.dispose();
    this.quad.dispose();
  }
}
