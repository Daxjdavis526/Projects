/* =============================================================================
   RENDERER — WebGL context, HDR composer chain, tone mapping, quality
   -----------------------------------------------------------------------------
   Pass order is load-bearing:

     RenderPass        renders the scene to a half-float target in LINEAR light
     UnrealBloomPass   blooms in linear light, where bright means bright
     OutputPass        applies ACES filmic tone mapping + sRGB, LAST

   OutputPass reads renderer.toneMapping at render time, and three skips tone
   mapping when the output target is not the canvas, so ACES is applied exactly
   once despite the renderer flag being set. Exposure flashes (core bounce,
   shock breakout) animate renderer.toneMappingExposure — never emissive values,
   which stay in a documented linear range so bloom thresholds keep meaning.
   ========================================================================== */

import * as THREE from 'three';
import { EffectComposer }   from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass }       from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass }  from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass }       from 'three/addons/postprocessing/OutputPass.js';
import { QUALITY } from '../config.js';

export class Renderer {
  constructor(quality = 'high') {
    this.quality = quality;
    const q = QUALITY[quality];

    this.gl = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      logarithmicDepthBuffer: true,   // buys ~1e8 of the 1e13 depth range
      stencil: false,
    });
    this.gl.setPixelRatio(Math.min(window.devicePixelRatio, q.pixelRatioCap));
    this.gl.setSize(window.innerWidth, window.innerHeight);
    this.gl.toneMapping = THREE.ACESFilmicToneMapping;
    this.gl.toneMappingExposure = 1.0;
    this.gl.outputColorSpace = THREE.SRGBColorSpace;
    this.gl.autoClear = false;        // two render tiers clear depth manually
    document.body.appendChild(this.gl.domElement);

    this.composer = new EffectComposer(this.gl);  // half-float targets by default
    this.bloom = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      q.bloom.strength, q.bloom.radius, q.bloom.threshold,
    );
    this.output = new OutputPass();

    this._renderPass = null;   // installed by attach()
    window.addEventListener('resize', () => this.resize());
  }

  /* The near/far tier split needs a custom render step, so main.js supplies a
     function instead of a scene. It runs inside the composer's first pass. */
  attach(drawFn, scene, camera) {
    this._renderPass = new RenderPass(scene, camera);
    this._renderPass.render = (renderer, writeBuffer, readBuffer) => {
      renderer.setRenderTarget(this._renderPass.renderToScreen ? null : readBuffer);
      renderer.clear(true, true, true);
      drawFn(renderer);
    };
    this.composer.addPass(this._renderPass);
    this.composer.addPass(this.bloom);
    this.composer.addPass(this.output);
  }

  resize() {
    const w = window.innerWidth, h = window.innerHeight;
    this.gl.setSize(w, h);
    this.composer.setSize(w, h);
    this.bloom.setSize(w, h);
    if (this.onResize) this.onResize(w, h);
  }

  setQuality(name) {
    const q = QUALITY[name];
    if (!q) return;
    this.quality = name;
    this.gl.setPixelRatio(Math.min(window.devicePixelRatio, q.pixelRatioCap));
    this.bloom.strength  = q.bloom.strength;
    this.bloom.radius    = q.bloom.radius;
    this.bloom.threshold = q.bloom.threshold;
    this.resize();
  }

  set exposure(v) { this.gl.toneMappingExposure = v; }
  get exposure()  { return this.gl.toneMappingExposure; }

  render() { this.composer.render(); }

  get info() { return this.gl.info.render; }
}

/* Pick a starting tier from the GPU string. Deliberately conservative: it is
   far better to start at medium and let the user raise it than to open at ultra
   and stutter through the one scene that has to look effortless. */
export function autoQuality() {
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2') || c.getContext('webgl');
    if (!gl) return 'low';
    const dbg = gl.getExtension('WEBGL_debug_renderer_info');
    const s = (dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : '').toLowerCase();
    if (/swiftshader|llvmpipe|software/.test(s)) return 'low';
    if (/rtx|radeon rx|arc a|apple m[2-9]/.test(s)) return 'ultra';
    if (/gtx|quadro|radeon|apple m1/.test(s))       return 'high';
    if (/intel|uhd|iris|mali|adreno/.test(s))       return 'low';
    return 'medium';
  } catch { return 'medium'; }
}
