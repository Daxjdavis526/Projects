/* =============================================================================
   STAGE — renderer, the two-tier scene, and the floating origin
   -----------------------------------------------------------------------------
   Drawing a body 3474 km across while standing on it, in float32, needs two
   tricks.

   The floating origin: everything near the camera is drawn relative to a point
   that follows it on a 256 m lattice, so vertex coordinates stay in the
   thousands rather than the millions and stop shimmering.

   Two tiers: the sky (stars, the Sun, the Earth) is drawn first into a camera
   that has the same orientation but no position, then the depth buffer is
   cleared and the surface is drawn on top. That way the Earth can be 384 000 km
   away and a pebble 30 cm away without the depth buffer having to span both.
   ========================================================================== */

import * as THREE from 'three';
import { FRAME } from '../config.js';
import { FloatingOrigin } from '../physics/frames.js';

export class Stage {
  constructor(canvas, opts = {}) {
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: opts.antialias !== false,
      logarithmicDepthBuffer: true,
      powerPreference: 'high-performance',
      stencil: false,
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, opts.pixelRatio ?? 1.5));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.autoClear = false;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    /* Black. There is no atmosphere; there is nothing to scatter. */
    this.renderer.setClearColor(0x000000, 1);

    this.sky = new THREE.Scene();
    this.world = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      opts.fov ?? 55, window.innerWidth / window.innerHeight, FRAME.near, FRAME.far);
    this.skyCamera = new THREE.PerspectiveCamera(
      opts.fov ?? 55, window.innerWidth / window.innerHeight, 1, 1e9);

    this.origin = new FloatingOrigin();
    /* Position in world metres (doubles). The camera object itself always sits
       near the render origin. */
    this.eye = { x: 0, y: 0, z: 0 };

    /* Sunlight is the white point here, as it is for an eye or a camera with
       nothing between it and the Sun. The Moon's warm cast then comes from the
       regolith, which really is faintly brown, rather than from a tinted light
       that would double it. */
    this.sun = new THREE.DirectionalLight(0xffffff, 1);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(opts.shadowMap ?? 2048, opts.shadowMap ?? 2048);
    this.sun.shadow.camera.near = 1;
    this.sun.shadow.camera.far = 900;
    this.sun.shadow.camera.left = -260;
    this.sun.shadow.camera.right = 260;
    this.sun.shadow.camera.top = 260;
    this.sun.shadow.camera.bottom = -260;
    this.sun.shadow.bias = -0.0006;
    this.sun.shadow.normalBias = 0.05;
    this.world.add(this.sun);
    this.world.add(this.sun.target);

    /* Regolith bounce, for everything that is not the ground.

       The terrain computes its own, because it knows how much of the sky each
       point can see and can therefore make a crater floor darker than an open
       plain. Nothing else in the scene has a horizon map, and without this an
       astronaut standing with the Sun behind them was a black silhouette --
       which is the one thing Apollo photography conclusively shows is wrong.
       Aldrin on the ladder is in the LM's shadow and perfectly legible, lit by
       a landscape that throws back a tenth of what falls on it.

       The Moon is round, so the "up" this light hemispheres about is set every
       frame from where the camera is rather than being the world Y axis. */
    this.bounce = new THREE.HemisphereLight(0x000000, 0x000000, 1);
    this.world.add(this.bounce);

    this._onResize = () => this.resize();
    window.addEventListener('resize', this._onResize);
  }

  resize() {
    const w = window.innerWidth, h = window.innerHeight;
    this.renderer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.skyCamera.aspect = w / h;
    this.skyCamera.updateProjectionMatrix();
  }

  setPixelRatio(r) {
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, r));
  }

  /**
   * Move the eye. Returns true if the floating origin was re-based, which the
   * terrain system uses as its cue to re-place every tile.
   */
  setEye(x, y, z) {
    this.eye.x = x; this.eye.y = y; this.eye.z = z;
    const rebased = this.origin.update(x, y, z);
    const o = this.origin.origin;
    this.camera.position.set(x - o.x, y - o.y, z - o.z);
    return rebased;
  }

  /** Aim the Sun. `dir` points from the surface towards the Sun. */
  setSun(dir, irradiance, elevationDeg = 90) {
    /* three.js takes the light's position and target; only the direction
       matters, so keep it close to the origin to avoid precision loss. */
    this.sun.position.set(dir.x * 800, dir.y * 800, dir.z * 800);
    this.sun.target.position.set(0, 0, 0);
    this.sun.intensity = irradiance;
    this.sun.visible = irradiance > 0;
    /* The shadow map covers six hundred metres around the player. At a
       grazing Sun its camera looks along the surface rather than at it and
       the depth comparison has almost nothing to work with, so it is left to
       the per-vertex horizon map, which reaches to the real horizon and is
       what shapes a polar shadow anyway. */
    this.sun.castShadow = irradiance > 0 && elevationDeg > 1;
  }

  /**
   * Park the shadow camera around a point of interest (the player), in render
   * coordinates, sized for the near field. Far-field shadowing is handled by the
   * terrain's horizon map, not by shadow maps.
   */
  focusShadow(px, py, pz, radius = 260) {
    const s = this.sun.shadow.camera;
    s.left = -radius; s.right = radius; s.top = radius; s.bottom = -radius;
    s.far = radius * 4 + 200;
    s.updateProjectionMatrix();
    const d = this.sun.position;
    const len = Math.hypot(d.x, d.y, d.z) || 1;
    const back = radius * 2 + 100;
    this.sun.position.set(px + d.x / len * back, py + d.y / len * back, pz + d.z / len * back);
    this.sun.target.position.set(px, py, pz);
    this.sun.target.updateMatrixWorld();
  }

  /**
   * How much light the ground around you is throwing back up.
   *
   * @param {object} up  local vertical, a unit vector in world coordinates
   * @param {number} r   radiance of the lit ground, in the Sun's own units
   */
  setBounce(up, r) {
    this.bounce.position.set(up.x * 100, up.y * 100, up.z * 100);
    this.bounce.groundColor.setRGB(r, r * 0.97, r * 0.93);
  }

  setExposure(e) { this.renderer.toneMappingExposure = e; }

  /* Both tiers share a field of view, or the sky slides against the ground. */
  setFov(fov) {
    this.camera.fov = fov;
    this.skyCamera.fov = fov;
    this.camera.updateProjectionMatrix();
    this.skyCamera.updateProjectionMatrix();
  }

  render() {
    this.renderer.clear(true, true, true);
    this.skyCamera.quaternion.copy(this.camera.quaternion);
    this.skyCamera.updateMatrixWorld();
    this.renderer.render(this.sky, this.skyCamera);
    this.renderer.clearDepth();
    this.renderer.render(this.world, this.camera);
  }

  dispose() {
    window.removeEventListener('resize', this._onResize);
    this.renderer.dispose();
  }
}
