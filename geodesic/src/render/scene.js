/* =============================================================================
   SCENE — renderer, camera rig, and the scale problem
   -----------------------------------------------------------------------------
   The scale problem is the interesting part. A black hole horizon is 2e-8 AU
   and a Neptune orbit is 30 AU: fifteen orders of magnitude in one scene. Two
   rules keep it honest:

     1. Bodies are drawn at TRUE radius whenever true radius is resolvable.
     2. When a body would be smaller than a few pixels it is drawn as a MARKER
        at a fixed screen size, and the UI says so. A marker is never mistaken
        for a measurement.

   That distinction matters here more than in most simulators, because one of
   the experiments this tool exists for is "keep the mass, shrink the radius,
   see what changes" — and the answer (orbits don't change, surface effects do)
   is only legible if radius is drawn truthfully.
   ========================================================================== */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class Stage {
  constructor() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true, powerPreference: 'high-performance',
      logarithmicDepthBuffer: true,
    });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.renderer.setSize(innerWidth, innerHeight);
    this.renderer.setClearColor(0x05060a, 1);
    document.body.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 1e-7, 1e9);
    this.camera.position.set(0, 2.2, 4.2);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.minDistance = 1e-7;
    this.controls.maxDistance = 1e7;
    this.controls.zoomSpeed = 1.1;

    /* Follow target: when set, the camera's orbit centre tracks a body, which
       is how "body-centred frame" is implemented. */
    this.follow = null;

    this.scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const key = new THREE.DirectionalLight(0xffffff, 1.4);
    key.position.set(3, 5, 2);
    this.scene.add(key);

    this.scene.add(makeStarfield(3500));
    this.grid = makeReferenceGrid();
    this.scene.add(this.grid);

    addEventListener('resize', () => this.resize());
  }

  resize() {
    this.camera.aspect = innerWidth / innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(innerWidth, innerHeight);
  }

  /* World units per pixel at a given depth — the basis for both the scale bar
     and the decision about whether a body is resolvable. */
  unitsPerPixel(distance) {
    const h = 2 * distance * Math.tan(THREE.MathUtils.degToRad(this.camera.fov) / 2);
    return h / innerHeight;
  }

  get camDistance() {
    return this.camera.position.distanceTo(this.controls.target);
  }

  update(dt) {
    if (this.follow) {
      this.controls.target.set(...this.follow);
    }
    this.controls.update();
    this._fitGrid();
  }

  /* The ruler has to work from a horizon radius to a wide binary, so its cell
     size is snapped to a decade chosen from the camera distance, and its
     origin is snapped to a whole number of cells around wherever you are
     looking. The lines therefore always sit at round coordinates — it stays a
     ruler, it just changes which ruler it is. */
  _fitGrid() {
    const cell = 10 ** Math.round(Math.log10(Math.max(this.camDistance, 1e-9) / 8));
    const t = this.controls.target;
    this.grid.scale.setScalar(cell);
    this.grid.position.set(
      Math.round(t.x / (cell * 10)) * cell * 10,
      0,
      Math.round(t.z / (cell * 10)) * cell * 10,
    );
    this.gridCell = cell;
  }

  render() { this.renderer.render(this.scene, this.camera); }
}

/* -----------------------------------------------------------------------------
   Starfield: pure decoration, and deliberately dim. It exists so rotation has
   a visual reference — without it, an empty sandbox gives no sense of turning.
-------------------------------------------------------------------------------*/
function makeStarfield(count) {
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  let seed = 1337;
  const rnd = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
  for (let i = 0; i < count; i++) {
    const u = rnd() * 2 - 1, th = rnd() * Math.PI * 2, s = Math.sqrt(1 - u * u);
    pos[i * 3] = s * Math.cos(th) * 5e6;
    pos[i * 3 + 1] = u * 5e6;
    pos[i * 3 + 2] = s * Math.sin(th) * 5e6;
    const b = 0.22 + 0.5 * rnd() ** 3;
    col[i * 3] = b; col[i * 3 + 1] = b * 0.97; col[i * 3 + 2] = b * 0.92;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const pts = new THREE.Points(g, new THREE.PointsMaterial({
    size: 1.4, sizeAttenuation: false, vertexColors: true,
    transparent: true, opacity: 0.75, depthWrite: false,
  }));
  pts.frustumCulled = false;
  pts.renderOrder = -100;
  return pts;
}

/* -----------------------------------------------------------------------------
   Reference grid on the orbital plane.

   THIS IS NOT SPACETIME. It is a ruler: a flat coordinate grid, drawn to give
   distance and orientation a reference. It never bends, dips, or reacts to
   mass, because bending it would be the rubber-sheet lie. The curvature modes
   draw curvature; this draws a floor.
-------------------------------------------------------------------------------*/
function makeReferenceGrid() {
  const g = new THREE.Group();
  const mk = (size, div, color, opacity) => {
    const h = new THREE.GridHelper(size, div, color, color);
    h.material.transparent = true;
    h.material.opacity = opacity;
    h.material.depthWrite = false;
    return h;
  };
  g.add(mk(40, 40, 0x2a3038, 0.5));    // cell = 1 unit before scaling
  g.add(mk(40, 4, 0x39424d, 0.7));     // cell = 10 units
  g.userData.isRuler = true;
  return g;
}
