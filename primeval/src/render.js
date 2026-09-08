// Renderer, camera rig and the post chain.

import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

/**
 * Final grade: vignette, chromatic fringing at the edges, film grain, a heat
 * shimmer used on reentry and near lava, and a red damage pulse.
 */
const GradeShader = {
  uniforms: {
    tDiffuse: { value: null },
    uTime: { value: 0 },
    uVignette: { value: 0.72 },
    uGrain: { value: 0.022 },
    uSaturation: { value: 1.12 },
    uHeat: { value: 0 },
    uDamage: { value: 0 },
    uDesat: { value: 0 },
    uFade: { value: 0 },
    uAberration: { value: 0.0016 },
    uResolution: { value: new THREE.Vector2(1, 1) },
  },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
  fragmentShader: /* glsl */`
    varying vec2 vUv;
    uniform sampler2D tDiffuse;
    uniform float uTime, uVignette, uGrain, uHeat, uDamage, uDesat, uFade, uAberration, uSaturation;
    uniform vec2 uResolution;
    float h12(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
    void main(){
      vec2 uv = vUv;
      // Heat shimmer: vertical ripples that climb, strongest low in frame.
      if (uHeat > 0.001) {
        float w = sin(uv.y * 90.0 + uTime * 6.0) * 0.5 + sin(uv.y * 41.0 - uTime * 3.7) * 0.5;
        uv.x += w * 0.0022 * uHeat;
        uv.y += sin(uv.x * 60.0 + uTime * 4.0) * 0.0012 * uHeat;
      }
      vec2 d = uv - 0.5;
      float r2 = dot(d, d);
      float ab = uAberration * (0.35 + r2 * 3.0);
      vec3 col;
      col.r = texture2D(tDiffuse, uv + d * ab).r;
      col.g = texture2D(tDiffuse, uv).g;
      col.b = texture2D(tDiffuse, uv - d * ab).b;

      // This pass runs before the output pass, so the values here are still
      // linear HDR: lift saturation multiplicatively rather than around 0.5.
      float lum = dot(max(col, 0.0), vec3(0.2126, 0.7152, 0.0722));
      col = mix(vec3(lum), col, uSaturation);
      col = mix(col, vec3(lum), uDesat);

      float vig = 1.0 - uVignette * pow(r2 * 1.72, 1.45);
      col *= clamp(vig, 0.0, 1.0);

      if (uDamage > 0.001) {
        float edge = smoothstep(0.16, 0.58, r2);
        col = mix(col, vec3(0.42, 0.02, 0.02), edge * uDamage * 0.85);
      }

      float g = h12(gl_FragCoord.xy + fract(uTime) * 913.0) - 0.5;
      col += g * uGrain;
      col *= (1.0 - uFade);
      gl_FragColor = vec4(col, 1.0);
    }
  `,
};

export class Renderer {
  constructor(canvas, quality) {
    this.quality = quality;
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: quality.renderScale >= 1,
      powerPreference: 'high-performance',
      stencil: false,
      logarithmicDepthBuffer: true,
    });
    this.renderer.setClearColor(0x000000, 1);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;
    this.renderer.shadowMap.enabled = quality.shadows;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.autoClear = true;
    this.renderer.info.autoReset = false;

    this.camera = new THREE.PerspectiveCamera(72, 1, 0.09, 90000);
    this.camera.rotation.order = 'YXZ';

    this.composer = null;
    this.grade = null;
    this.bloom = null;
    this.scene = null;
    this.resize();
    addEventListener('resize', () => this.resize());
  }

  attach(scene) {
    this.scene = scene;
    // A multisampled half-float target. MSAA matters more here than anywhere
    // else in the renderer: a jungle is hundreds of thousands of alpha-tested
    // leaf edges, and without it every one of them crawls.
    const size = this.renderer.getDrawingBufferSize(new THREE.Vector2());
    const target = new THREE.WebGLRenderTarget(Math.max(2, size.x), Math.max(2, size.y), {
      type: THREE.HalfFloatType,
      samples: this.quality.msaa ?? 0,
      depthBuffer: true,
      stencilBuffer: false,
    });
    this.composer = new EffectComposer(this.renderer, target);
    this.composer.addPass(new RenderPass(scene, this.camera));
    if (this.quality.bloom) {
      this.bloom = new UnrealBloomPass(
        new THREE.Vector2(this.width, this.height), 0.36, 0.72, 0.94
      );
      this.composer.addPass(this.bloom);
    }
    this.grade = new ShaderPass(GradeShader);
    this.composer.addPass(this.grade);
    this.composer.addPass(new OutputPass());
    this.resize();
  }

  resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const w = Math.max(2, innerWidth), h = Math.max(2, innerHeight);
    this.width = w; this.height = h;
    this.renderer.setPixelRatio(dpr * this.quality.renderScale);
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    if (this.composer) {
      this.composer.setPixelRatio(dpr * this.quality.renderScale);
      this.composer.setSize(w, h);
      this.grade.uniforms.uResolution.value.set(w, h);
    }
  }

  setFov(fov) {
    if (Math.abs(this.camera.fov - fov) < 0.01) return;
    this.camera.fov = fov;
    this.camera.updateProjectionMatrix();
  }

  render(t) {
    if (!this.composer) return;
    this.renderer.info.reset();
    this.grade.uniforms.uTime.value = t;
    this.composer.render();
  }

  get info() { return this.renderer.info; }
}
