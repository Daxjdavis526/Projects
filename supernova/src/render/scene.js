/* =============================================================================
   SCENE — two render tiers, floating origin, starfield
   -----------------------------------------------------------------------------
   The simulation spans 12 km (a neutron star) to ~1e14 km (a 3000-year-old
   remnant). That is 13 decades, which no single depth buffer survives. Three
   things together make it work:

     1. logarithmicDepthBuffer            (in renderer.js)
     2. two render tiers, depth cleared between them
     3. a floating origin — the camera sits at (0,0,0) in f32 shader space and
        the world is offset around it each frame using f64 JS numbers

   The far tier is drawn first with a camera that inherits only ORIENTATION, so
   its contents never parallax. That is exactly right for a starfield, which is
   effectively at infinity, and it costs nothing.
   ========================================================================== */

import * as THREE from 'three';
import { CAMERA } from '../config.js';

export class Stage {
  constructor(quality) {
    /* --- near tier: everything with a real position ---------------------- */
    this.near = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      CAMERA.fov, window.innerWidth / window.innerHeight, CAMERA.near, CAMERA.far);

    /* --- far tier: the sky ------------------------------------------------ */
    this.far = new THREE.Scene();
    this.farCamera = new THREE.PerspectiveCamera(
      CAMERA.fov, window.innerWidth / window.innerHeight, 0.1, 100);

    /* World offset in f64. Objects subtract this before touching the GPU. */
    this.origin = { x: 0, y: 0, z: 0 };

    this.far.add(makeStarfield(quality.starfield));
  }

  resize(w, h) {
    this.camera.aspect = w / h;    this.camera.updateProjectionMatrix();
    this.farCamera.aspect = w / h; this.farCamera.updateProjectionMatrix();
  }

  /* Called once per frame, before drawing. */
  sync() {
    this.farCamera.quaternion.copy(this.camera.quaternion);
    this.farCamera.fov = this.camera.fov;
    this.farCamera.updateProjectionMatrix();
  }

  /* Handed to Renderer.attach() — runs inside the composer's first pass.
     Stats are latched here: reading renderer.info after composer.render()
     only ever reports the final fullscreen composite quad. */
  draw(gl) {
    gl.render(this.far, this.farCamera);
    gl.clearDepth();
    gl.render(this.near, this.camera);
    this.stats = { calls: gl.info.render.calls, tris: gl.info.render.triangles };
  }
}

/* -----------------------------------------------------------------------------
   Starfield. Points, not sprites: at this distance a star IS a point, and
   sizeAttenuation:false keeps them crisp at every camera speed. Brightness and
   colour come from a rough sampling of the real stellar luminosity function —
   mostly dim red dwarfs, a scattering of hot blue stars — so the sky reads as
   a sky rather than as white confetti.
-------------------------------------------------------------------------------*/
function makeStarfield(count) {
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  const siz = new Float32Array(count);
  let seed = 20250826;
  const rnd = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;

  for (let i = 0; i < count; i++) {
    /* uniform on the sphere */
    const u = rnd() * 2 - 1, th = rnd() * Math.PI * 2, s = Math.sqrt(1 - u * u);
    pos[i * 3]     = s * Math.cos(th) * 50;
    pos[i * 3 + 1] = u * 50;
    pos[i * 3 + 2] = s * Math.sin(th) * 50;

    /* Skewed toward faint: p^3 gives many dim stars and a few bright ones. */
    const p = rnd(), mag = p * p * p;
    /* Colour temperature, weighted toward cool. */
    const t = Math.pow(rnd(), 2.2);
    const r = 1.0, g = 0.72 + 0.28 * t, b = 0.48 + 0.52 * t * t;
    const lum = 0.20 + 1.55 * mag;
    col[i * 3] = r * lum; col[i * 3 + 1] = g * lum; col[i * 3 + 2] = b * lum;
    siz[i] = 0.9 + 2.3 * mag;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color',    new THREE.BufferAttribute(col, 3));
  geo.setAttribute('aSize',    new THREE.BufferAttribute(siz, 1));

  const mat = new THREE.ShaderMaterial({
    uniforms: { uPixelRatio: { value: window.devicePixelRatio } },
    vertexShader: /* glsl */`
      attribute float aSize;
      varying vec3 vCol;
      uniform float uPixelRatio;
      void main() {
        vCol = color;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = aSize * uPixelRatio;
      }`,
    fragmentShader: /* glsl */`
      varying vec3 vCol;
      void main() {
        /* soft round point — square stars are the cheapest tell of all */
        vec2 d = gl_PointCoord - 0.5;
        float r2 = dot(d, d);
        if (r2 > 0.25) discard;
        float a = smoothstep(0.25, 0.02, r2);
        gl_FragColor = vec4(vCol * a, 1.0);
      }`,
    vertexColors: true,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    depthTest: false,
  });

  const pts = new THREE.Points(geo, mat);
  pts.frustumCulled = false;
  pts.renderOrder = -1000;
  return pts;
}
