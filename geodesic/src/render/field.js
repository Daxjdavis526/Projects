/* =============================================================================
   FIELD — the curvature visualizations
   -----------------------------------------------------------------------------
   Seven modes, each drawing a different quantity, each labelled in the UI with
   what it is and where it stops being literally true.

   The default and the one this project exists for is TENDEX: at every point on
   a 3D lattice, the tidal tensor E_ij is eigen-decomposed and its principal
   axes drawn, coloured by tendicity — red for stretching, blue for squeezing,
   following Nichols et al. (Phys. Rev. D 84, 124014).

   Why this and not a bent grid:

     - E_ij IS curvature. In the Newtonian limit it is the leading term of the
       Riemann tensor. It is not an analogy for curvature; it is the thing.
     - It cannot be transformed away. A freely falling observer feels no
       gravitational "force" — that is the equivalence principle — but still
       gets stretched. What survives every change of frame is what deserves to
       be drawn.
     - It is genuinely three-dimensional and needs no embedding dimension.
     - It superposes, so many bodies produce one coherent field.
     - It is directly interpretable: a body of height L along a tendex line of
       tendicity E feels a head-to-foot acceleration difference of -E*L.
   ========================================================================== */

import * as THREE from 'three';
import {
  tidalTensor, tendexFrame, timeDilation, potential,
  gravitationalField, frameDragOmega, flammZ,
} from '../physics/relativity.js';
import { C, G, SI, ARCSEC_PER_RAD } from '../physics/constants.js';
import { q } from '../ui/device.js';
import { traceOrbit, precessionPerOrbit, elements, radiation, radiationPattern }
  from '../physics/geodesic.js';

export const MODES = {
  none: {
    label: 'Bodies only',
    note: 'No field drawn. Just masses and their orbits.',
  },
  tendex: {
    label: 'Tidal curvature',
    note: '<b>Tendex lines.</b> Integral curves of E<sub>ij</sub>, the tidal field — ' +
          'red lines stretch, blue lines squeeze, brightness is field strength. ' +
          'This <b>is</b> spacetime curvature, not an analogy for it, and unlike ' +
          'gravitational force it cannot be transformed away.',
  },
  dilation: {
    label: 'Time dilation',
    note: '<b>Gravitational time dilation</b>, dτ/dt. Brighter means clocks run slower. ' +
          'This is the component that actually causes orbits — not curved space.',
  },
  potential: {
    label: 'Potential',
    note: '<b>Newtonian potential</b> Φ, on equipotential shells. ' +
          '<span class="warn">Not curvature</span> — a Newtonian quantity, shown for comparison.',
  },
  field: {
    label: 'Field vectors',
    note: '<b>Newtonian gravitational field</b> g = −∇Φ. ' +
          '<span class="warn">Coordinate-dependent</span>: a freely falling observer measures zero here.',
  },
  drag: {
    label: 'Frame drag',
    note: '<b>Lense–Thirring frame dragging</b> around spinning masses. ' +
          'Purely relativistic — unlike the tidal field, this has no Newtonian counterpart. ' +
          'Give a body spin in the inspector to see anything.',
  },
  grid: {
    label: '3D grid',
    note: '<b>A cube of freely falling markers</b> — real test particles, not a ' +
          'coordinate grid. Red edges stretch, blue ones squeeze. In vacuum the ' +
          'volume is <b>conserved exactly</b>; inside matter it shrinks at −4πGρ. ' +
          '<span class="warn">Not the rubber sheet</span> — nothing is bent into ' +
          'an extra dimension.',
  },

  geodesic: {
    label: 'Geodesics',
    note: '<b>Exact Schwarzschild orbit</b> of the selected body (amber) against ' +
          'the same initial conditions in <b>Newtonian gravity</b> (grey). Where ' +
          'the two separate is general relativity. For Mercury the gap is 0.1 ' +
          'arcseconds per orbit and you will not see it; near a black hole it is ' +
          'obvious. <span class="warn">This is a comparison, not the running ' +
          'simulation</span> — the bodies are still moving Newtonian.',
  },
  waves: {
    label: 'Gravitational waves',
    note: '<b>Quadrupole radiation pattern</b> of the dominant pair — the lobe ' +
          'radius is relative radiated power, eight times stronger along the ' +
          'orbital axis than in the plane. It is <span class="warn">not a wave ' +
          'and not a distance</span>. The amplitude is given as a number instead, ' +
          'because a visible ripple at this scale would be off by twenty orders ' +
          'of magnitude.',
  },
  embedding: {
    label: 'Embedding',
    note: '<b>Flamm\'s paraboloid</b> — the exact geometry of one equatorial spatial slice. ' +
          '<span class="warn">This is the famous rubber-sheet picture, and it does not explain orbits.</span> ' +
          'It is a 2D slice, and orbits come from time curvature, not space.',
  },
};

const LATTICE_N = q(9, 11);   // per axis; 11^3 = 1331 samples, 9^3 = 729

/* Tendex line tracing. Each seed is integrated both ways along the eigenvector
   field, so a line passes through its seed rather than starting there. */
const STRETCH_SEEDS = q(24, 40);
const SQUEEZE_SEEDS = q(10, 14);
const SQUEEZE_SHELLS = [0.5, 1.0, 2.0];
const STRETCH_STEPS = q(60, 90);
/* A squeeze curve closes on itself, so a long trace just draws the same arc
   again. A third of a turn is enough to read it as "around", not "along". */
const SQUEEZE_STEPS = q(22, 30);
const TENDEX_STEPS = Math.max(STRETCH_STEPS, SQUEEZE_STEPS);
const TENDEX_HZ = q(12, 20);         // field retraces at this rate, not every frame

/* Iso-surface tracing for the scalar modes. */
const ISO_LEVELS = q(4, 5);
const ISO_ROWS = q(16, 22);          // polar divisions
const ISO_COLS = q(30, 44);          // azimuthal divisions
const ISO_HZ = q(8, 12);

/* Vector modes. */
const VEC_N = q(5, 7);              // 7^3 = 343 arrows, which is as many as reads

export class FieldView {
  constructor(stage) {
    this.stage = stage;
    this.mode = 'none';
    this.extent = 6;          // half-width of the lattice, AU
    this.group = new THREE.Group();
    stage.scene.add(this.group);

    this._buildTendex();
    this._buildScalar();
    this._buildVectors();
    this._buildEmbedding();
    this._buildGeodesic();
    this._buildWaves();
    this.setMode('none');

    /* Mode-specific numbers for the UI to print under the note. */
    this.info = '';

    /* scratch, reused every frame */
    this._E = new Float64Array(9);
    this._p = [0, 0, 0];
    this._v = [0, 0, 0];
  }

  /* ---------------------------------------------------------------------------
     TENDEX LINES. Three orthogonal segments per lattice point — the principal
     axes of E_ij — with length scaled by |tendicity| and colour by its sign.
     Drawn with one LineSegments object so the whole field is a single draw
     call regardless of lattice size.
  ----------------------------------------------------------------------------*/
  _buildTendex() {
    const n = STRETCH_SEEDS * 2 * STRETCH_STEPS +
              SQUEEZE_SEEDS * SQUEEZE_SHELLS.length * 2 * SQUEEZE_STEPS;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 2 * 3), 3));
    geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(n * 2 * 3), 3));
    this.tendex = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({
      vertexColors: true, transparent: true, opacity: 0.55,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    this.tendex.frustumCulled = false;
    this.group.add(this.tendex);
  }

  /* Scalar fields (time dilation, potential) as a cloud of points whose size
     and colour carry the value. */
  /* ---------------------------------------------------------------------------
     Scalar modes are drawn as ISO-SURFACES, not as a cloud of coloured dots.
     A surface of constant potential is a real, nameable object — "the set of
     places where a clock ticks at this rate" — and nested surfaces show the
     gradient without any need for a key. A dot cloud shows neither.

     The surfaces are found by bisection along rays from the dominant mass,
     which assumes each surface is star-shaped about that mass. That is exact
     for one body and true for several as long as you are outside the saddle
     between them; where it fails, the vertex is dropped rather than faked,
     so the surface opens a hole instead of lying about its shape.
  ----------------------------------------------------------------------------*/
  _buildScalar() {
    const segs = ISO_LEVELS * ISO_ROWS * ISO_COLS * 2;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(segs * 2 * 3), 3));
    geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(segs * 2 * 3), 3));
    this.scalar = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({
      vertexColors: true, transparent: true, opacity: 0.6,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    this.scalar.frustumCulled = false;
    this.group.add(this.scalar);
  }

  _buildVectors() {
    const n = VEC_N ** 3 * 3;              // shaft + two barbs per arrow
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 2 * 3), 3));
    geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(n * 2 * 3), 3));
    this.vectors = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({
      vertexColors: true, transparent: true, opacity: 0.8,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    this.vectors.frustumCulled = false;
    this.group.add(this.vectors);
  }

  /* Flamm's paraboloid, as a wireframe surface in the orbital plane. */
  _buildEmbedding() {
    const RN = 64, TN = 48;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(RN * TN * 3), 3));
    const idx = [];
    for (let i = 0; i < RN - 1; i++) {
      for (let j = 0; j < TN; j++) {
        const a = i * TN + j, b = i * TN + ((j + 1) % TN), c = (i + 1) * TN + j;
        idx.push(a, b, a, c);
      }
    }
    geo.setIndex(idx);
    this.embedding = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({
      color: 0x5f7a8c, transparent: true, opacity: 0.45, depthWrite: false,
    }));
    this.embedding.frustumCulled = false;
    this._embedDims = { RN, TN };
    this.group.add(this.embedding);
  }

  setMode(mode) {
    this.mode = mode;
    this.tendex.visible = mode === 'tendex';
    this.scalar.visible = mode === 'dilation' || mode === 'potential';
    this.vectors.visible = mode === 'field' || mode === 'drag';
    this.embedding.visible = mode === 'embedding';
    this.geoGR.visible = this.geoNewt.visible = this.geoRings.visible = mode === 'geodesic';
    this.waves.visible = mode === 'waves';
    if (mode !== 'geodesic' && mode !== 'waves') this.info = '';
  }

  /* Lattice extent follows the camera so the field is always where you are
     looking, rather than a fixed box you fly out of. */
  _autoExtent() {
    const d = this.stage.camDistance;
    return Math.max(d * 0.55, 1e-6);
  }

  update(snapshot, selectedId = null) {
    if (this.mode === 'none' || !snapshot.bodies.length) return;
    const bodies = snapshot.bodies.map(b => ({
      pos: b.pos, mass: b.mass, radius: b.radius, spin: b.spin,
      isBlackHole: b.isBlackHole, schwarzschildRadius: b.rs, alive: true,
    }));
    this.extent = this._autoExtent();
    const centre = this.stage.controls.target;

    switch (this.mode) {
      case 'tendex':   this._updateTendex(bodies, centre); break;
      case 'dilation': this._updateScalar(bodies, centre, 'dilation'); break;
      case 'potential':this._updateScalar(bodies, centre, 'potential'); break;
      case 'field':    this._updateVectors(bodies, centre, 'field'); break;
      case 'drag':     this._updateVectors(bodies, centre, 'drag'); break;
      case 'embedding':this._updateEmbedding(snapshot); break;
      case 'geodesic': this._updateGeodesic(snapshot, selectedId); break;
      case 'waves':    this._updateWaves(snapshot); break;
    }
  }

  /* ---------------------------------------------------------------------------
     The tendex field.
  ----------------------------------------------------------------------------*/
  /* ---------------------------------------------------------------------------
     TENDEX LINES, properly: integral curves of the eigenvector fields of
     E_ij, not a lattice of little crosses.

     Around a single mass the stretching family comes out as radial rays and
     the squeezing family as curves lying on spheres — which is exactly the
     picture the tidal field deserves, because it says "gravity stretches you
     along the line to the mass and squeezes you across it" without drawing a
     single force arrow. With more than one mass the same curves bend, merge
     and reconnect, and that is the real superposed field, not an artist's
     impression of one.

     Two honest caveats, both surfaced in the explainer:

       - LENGTH along a line carries no magnitude information. A tendex line
         is a direction field's integral curve; it has no natural length.
         Magnitude is carried by BRIGHTNESS, log-scaled over four decades.
       - For an exactly spherical source the two squeezing eigenvalues are
         DEGENERATE: every direction perpendicular to the radius is an
         eigenvector, so "the" squeeze curve is not unique. Where that
         happens the tracer continues in the direction closest to the one it
         arrived in, which is a valid integral curve — one of infinitely
         many. The physics is that the squeeze is isotropic across the radial
         direction, and the drawing should not pretend to pick a winner.
  ----------------------------------------------------------------------------*/
  _updateTendex(bodies, centre) {
    /* Retracing is the most expensive thing this app does, so it runs at a
       fixed rate rather than per frame. */
    const now = performance.now();
    if (this._tendexAt && now - this._tendexAt < 1000 / TENDEX_HZ) return;
    this._tendexAt = now;

    const geo = this.tendex.geometry;
    const pos = geo.attributes.position.array;
    const col = geo.attributes.color.array;
    const maxSeg = pos.length / 6;
    let w = 0;

    const ext = this.extent;
    const c = [centre.x, centre.y, centre.z];

    /* Seed radius: far enough out to be outside the bodies, close enough in
       that the lines pass through the interesting region. */
    const r0 = Math.max(ext * 0.32, minSeedRadius(bodies) * 1.4);

    /* Normalisation is physical, not empirical: the top of the brightness
       scale is the radial tendicity at the surface of the strongest body,
       2GM/R³, which is the largest value the field actually reaches outside
       any body. Anchoring it there means brightness means the same thing from
       one frame to the next, so watching the field fade as you zoom out is
       reading the r⁻³ falloff rather than watching an auto-exposure chase. */
    let maxT = 1e-30;
    for (const b of bodies) {
      if (!b.alive) continue;
      const rr = Math.max(b.isBlackHole ? b.schwarzschildRadius : b.radius, 1e-12);
      maxT = Math.max(maxT, 2 * G * b.mass / (rr * rr * rr));
    }
    const logMax = Math.log10(maxT), span = 5;

    const emit = (a, b, t, m) => {
      if (w >= maxSeg) return false;
      const rel = Math.min(1, Math.max(0,
        (Math.log10(Math.max(m, 1e-30)) - logMax + span) / span));
      const o = w * 6;
      pos[o] = a[0]; pos[o + 1] = a[1]; pos[o + 2] = a[2];
      pos[o + 3] = b[0]; pos[o + 4] = b[1]; pos[o + 5] = b[2];
      const k = 0.14 + 0.86 * rel * rel;
      const cr = t < 0 ? 1.00 * k : 0.18 * k;
      const cg = t < 0 ? 0.30 * k : 0.58 * k;
      const cb = t < 0 ? 0.26 * k : 1.00 * k;
      for (let e = 0; e < 2; e++) {
        col[o + e * 3] = cr; col[o + e * 3 + 1] = cg; col[o + e * 3 + 2] = cb;
      }
      w++;
      return true;
    };

    for (const d of fibonacci(STRETCH_SEEDS)) {
      const seed = [c[0] + d[0] * r0, c[1] + d[1] * r0, c[2] + d[2] * r0];
      this._trace(bodies, seed, c, ext, 'stretch', +1, emit);
      this._trace(bodies, seed, c, ext, 'stretch', -1, emit);
    }
    /* Squeeze curves are seeded on several shells: one shell alone reads as a
       cage around the mass rather than as a field filling space. */
    for (const shell of SQUEEZE_SHELLS) {
      const r = r0 * shell;
      for (const d of fibonacci(SQUEEZE_SEEDS, 0.37 + shell)) {
        const seed = [c[0] + d[0] * r, c[1] + d[1] * r, c[2] + d[2] * r];
        if (insideAnyBody(bodies, seed)) continue;
        this._trace(bodies, seed, c, ext, 'squeeze', +1, emit);
        this._trace(bodies, seed, c, ext, 'squeeze', -1, emit);
      }
    }

    geo.attributes.position.needsUpdate = true;
    geo.attributes.color.needsUpdate = true;
    geo.setDrawRange(0, w * 2);
  }

  /* Trace one integral curve from `seed`, following the most-stretching or
     most-squeezing eigenvector, in the given sign direction. */
  _trace(bodies, seed, centre, ext, family, sign, emit) {
    const p = [seed[0], seed[1], seed[2]];
    let dir = null;
    const E = this._E;

    const steps = family === 'stretch' ? STRETCH_STEPS : SQUEEZE_STEPS;
    for (let s = 0; s < steps; s++) {
      tidalTensor(bodies, p, E);
      const frame = tendexFrame(E);          // sorted most-stretching first
      const strongest = Math.abs(frame[0].tendicity);
      if (!(strongest > 0)) return;

      let axis;
      if (family === 'stretch') {
        axis = frame[0];
      } else {
        /* Degenerate squeeze plane: continue in the arrival direction,
           projected onto the plane the two squeezing eigenvectors span. */
        const l1 = frame[1].tendicity, l2 = frame[2].tendicity;
        const degenerate = Math.abs(l1 - l2) < 0.02 * strongest;
        if (degenerate && dir) {
          const pr = projectOntoPlane(dir, frame[1].dir, frame[2].dir);
          if (!pr) return;
          axis = { dir: pr, tendicity: 0.5 * (l1 + l2) };
        } else {
          axis = frame[2];
        }
      }

      /* Eigenvectors have no sign; pick the branch continuous with the last
         step so the curve does not fold back on itself. */
      let d = axis.dir;
      if (dir && (d[0] * dir[0] + d[1] * dir[1] + d[2] * dir[2]) < 0) {
        d = [-d[0], -d[1], -d[2]];
      } else if (!dir) {
        d = sign > 0 ? d : [-d[0], -d[1], -d[2]];
      }
      dir = d;

      /* Adaptive step: fine near a mass, coarse far from one, so a line has
         the same visual resolution wherever it is. */
      const rn = nearestSurfaceDistance(bodies, p);
      const ds = Math.min(Math.max(rn * 0.10, ext * 1e-4), ext * 0.10);

      const q = [p[0] + d[0] * ds, p[1] + d[1] * ds, p[2] + d[2] * ds];

      if (insideAnyBody(bodies, q)) { emit(p, q, axis.tendicity, strongest); return; }
      if (Math.hypot(q[0] - centre[0], q[1] - centre[1], q[2] - centre[2]) > ext * 1.7) {
        emit(p, q, axis.tendicity, strongest);
        return;
      }
      if (!emit(p, q, axis.tendicity, strongest)) return;
      p[0] = q[0]; p[1] = q[1]; p[2] = q[2];
    }
  }

  /* ---------------------------------------------------------------------------
     Scalar fields.
  ----------------------------------------------------------------------------*/
  _updateScalar(bodies, centre, kind) {
    const now = performance.now();
    if (this._scalarAt && now - this._scalarAt < 1000 / ISO_HZ) return;
    this._scalarAt = now;

    const g = this.scalar.geometry;
    const pos = g.attributes.position.array;
    const col = g.attributes.color.array;
    const maxSeg = pos.length / 6;
    let w = 0;

    /* The quantity: both are positive and fall off monotonically with
       distance, which is what makes bisection along a ray valid. */
    const p = this._p;
    const f = (x, y, z) => {
      p[0] = x; p[1] = y; p[2] = z;
      return kind === 'dilation'
        ? 1 - timeDilation(bodies, p)        // 0 far away, 1 at a horizon
        : -potential(bodies, p);             // positive, larger = deeper
    };

    /* Star centre: the dominant mass. */
    let host = null;
    for (const b of bodies) if (b.alive && (!host || b.mass > host.mass)) host = b;
    if (!host) { g.setDrawRange(0, 0); return; }
    const c = host.pos;
    const rSurf = Math.max(host.isBlackHole ? host.schwarzschildRadius : host.radius, 1e-12);

    const ext = this.extent;
    const rMin = Math.max(rSurf * 1.02, ext * 0.02);
    const rMax = ext * 0.75;
    if (!(rMax > rMin * 1.2)) { g.setDrawRange(0, 0); return; }

    /* Levels are placed at geometrically spaced radii along +x, then held as
       VALUES — so each surface really is an iso-surface of the quantity, not
       a sphere of fixed radius wearing a disguise. */
    const levels = [];
    for (let n = 0; n < ISO_LEVELS; n++) {
      const t = n / (ISO_LEVELS - 1);
      const r = rMin * (rMax / rMin) ** t;
      levels.push({ value: f(c[0] + r, c[1], c[2]), t });
    }

    /* Radius at which the quantity equals `value` along direction d. */
    const solve = (d, value) => {
      let lo = rMin * 0.35, hi = rMax * 3;
      const flo = f(c[0] + d[0] * lo, c[1] + d[1] * lo, c[2] + d[2] * lo);
      const fhi = f(c[0] + d[0] * hi, c[1] + d[1] * hi, c[2] + d[2] * hi);
      if (!((flo - value) * (fhi - value) < 0)) return NaN;   // not bracketed
      for (let it = 0; it < 22; it++) {
        const mid = Math.sqrt(lo * hi);                       // geometric bisection
        const fm = f(c[0] + d[0] * mid, c[1] + d[1] * mid, c[2] + d[2] * mid);
        if ((fm - value) * (flo - value) > 0) lo = mid; else hi = mid;
      }
      return Math.sqrt(lo * hi);
    };

    const dir = (i, j) => {
      const th = (i / ISO_ROWS) * Math.PI;          // 0..pi
      const ph = (j / ISO_COLS) * Math.PI * 2;
      const st = Math.sin(th);
      return [st * Math.cos(ph), Math.cos(th), st * Math.sin(ph)];
    };

    const radii = new Float64Array((ISO_ROWS + 1) * ISO_COLS);

    for (const lev of levels) {
      for (let i = 0; i <= ISO_ROWS; i++) {
        for (let j = 0; j < ISO_COLS; j++) {
          radii[i * ISO_COLS + j] = solve(dir(i, j), lev.value);
        }
      }

      /* Colour: brighter for the deeper surfaces, in the mode's own hue. */
      const k = 0.18 + 0.82 * (1 - lev.t) ** 2.2;
      const cr = kind === 'dilation' ? 1.00 * k : 0.35 * k;
      const cg = kind === 'dilation' ? 0.82 * k : 0.90 * k;
      const cb = kind === 'dilation' ? 0.40 * k : 0.78 * k;

      const put = (i1, j1, i2, j2) => {
        const r1 = radii[i1 * ISO_COLS + j1], r2 = radii[i2 * ISO_COLS + j2];
        if (!isFinite(r1) || !isFinite(r2) || w >= maxSeg) return;
        const d1 = dir(i1, j1), d2 = dir(i2, j2), o = w * 6;
        pos[o]     = c[0] + d1[0] * r1; pos[o + 1] = c[1] + d1[1] * r1; pos[o + 2] = c[2] + d1[2] * r1;
        pos[o + 3] = c[0] + d2[0] * r2; pos[o + 4] = c[1] + d2[1] * r2; pos[o + 5] = c[2] + d2[2] * r2;
        for (let e = 0; e < 2; e++) {
          col[o + e * 3] = cr; col[o + e * 3 + 1] = cg; col[o + e * 3 + 2] = cb;
        }
        w++;
      };

      for (let i = 0; i <= ISO_ROWS; i++) {
        const pole = i === 0 || i === ISO_ROWS;
        for (let j = 0; j < ISO_COLS; j++) {
          /* At the poles every vertex of the ring is the same point, so the
             parallel there is a pile of zero-length segments. */
          if (!pole) put(i, j, i, (j + 1) % ISO_COLS);      // parallel
          if (i < ISO_ROWS) put(i, j, i + 1, j);            // meridian
        }
      }
    }

    g.attributes.position.needsUpdate = true;
    g.attributes.color.needsUpdate = true;
    g.setDrawRange(0, w * 2);
  }

  /* ---------------------------------------------------------------------------
     Vector modes: real arrows on a coarse lattice. Length is log-scaled over
     four decades — a linear scale would make every arrow but the innermost
     invisible — so length ranks magnitude, it does not measure it. That is
     said in the explainer, because an arrow twice as long here is not twice
     the field.
  ----------------------------------------------------------------------------*/
  _updateVectors(bodies, centre, kind) {
    const g = this.vectors.geometry;
    const N = VEC_N, ext = this.extent, step = (2 * ext) / (N - 1);
    const p = this._p, v = this._v;

    const samples = [];

    /* Frame dragging falls off as r⁻³ and exists only around spinning mass,
       so a box lattice spanning the whole system puts almost every sample
       where the field is unmeasurably small and draws nothing. Sample it on
       shells around each spinning body instead — that is where it lives. */
    if (kind === 'drag') {
      let any = false;
      for (const b of bodies) {
        if (!b.alive) continue;
        if (!(Math.hypot(b.spin[0], b.spin[1], b.spin[2]) > 0)) continue;
        any = true;
        /* Shells start just outside the body but never smaller than a few
           percent of what the camera can see, so the field is drawn where you
           are actually looking. Its weakness out there is carried by
           brightness, not by leaving the screen blank. */
        const rr = Math.max(b.isBlackHole ? b.schwarzschildRadius : b.radius, 1e-12);
        const r0 = Math.max(rr * 1.25, ext * 0.045);
        for (const shell of [1, 2, 4, 8]) {
          const r = r0 * shell;
          if (r > ext * 1.3) break;
          for (const d of fibonacci(18, shell)) {
            p[0] = b.pos[0] + d[0] * r; p[1] = b.pos[1] + d[1] * r; p[2] = b.pos[2] + d[2] * r;
            frameDragOmega(bodies, p, v);
            const m = Math.hypot(v[0], v[1], v[2]);
            if (!(m > 0)) continue;
            samples.push({
              p: [p[0], p[1], p[2]], v: [v[0] / m, v[1] / m, v[2] / m], m,
              scale: r * 0.42,
            });
          }
        }
      }
      if (!any) { g.setDrawRange(0, 0); return; }
      this._emitArrows(samples, kind, g, step);
      return;
    }

    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) for (let k = 0; k < N; k++) {
      p[0] = centre.x + (i / (N - 1) - 0.5) * 2 * ext;
      p[1] = centre.y + (j / (N - 1) - 0.5) * 2 * ext;
      p[2] = centre.z + (k / (N - 1) - 0.5) * 2 * ext;
      if (insideAnyBody(bodies, p)) continue;
      gravitationalField(bodies, p, v);
      const m = Math.hypot(v[0], v[1], v[2]);
      if (!(m > 0)) continue;
      samples.push({ p: [p[0], p[1], p[2]], v: [v[0] / m, v[1] / m, v[2] / m], m });
    }
    if (!samples.length) { g.setDrawRange(0, 0); return; }
    this._emitArrows(samples, kind, g, step);
  }

  /* Shared arrow emitter for both vector modes. `scale` on a sample overrides
     the lattice spacing, which is what the shell-sampled drag field needs. */
  _emitArrows(samples, kind, g, step) {
    const pos = g.attributes.position.array;
    const col = g.attributes.color.array;
    const maxSeg = pos.length / 6;
    let w = 0;

    const logMax = Math.log10(Math.max(...samples.map(s => s.m)));
    const span = 4;

    for (const s of samples) {
      const rel = (Math.log10(Math.max(s.m, 1e-32)) - logMax + span) / span;
      if (rel <= 0.05) continue;
      const len = (s.scale ?? step) * 0.46 * Math.min(rel, 1);
      const a = 0.18 + 0.82 * Math.min(rel, 1);

      /* teal for the Newtonian field, violet for frame dragging — the same
         hues the panel uses for those two ideas. */
      const cr = kind === 'drag' ? 0.72 * a : 0.30 * a;
      const cg = kind === 'drag' ? 0.49 * a : 0.90 * a;
      const cb = kind === 'drag' ? 1.00 * a : 0.80 * a;

      const tip = [s.p[0] + s.v[0] * len, s.p[1] + s.v[1] * len, s.p[2] + s.v[2] * len];

      /* Two barbs, in a plane containing the arrow, so it reads as an arrow
         from any viewpoint that is not exactly along it. */
      const up = Math.abs(s.v[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
      const side = normalise(cross(s.v, up));
      const back = 0.32 * len, wide = 0.16 * len;

      const put = (A, B) => {
        if (w >= maxSeg) return;
        const o = w * 6;
        pos[o] = A[0]; pos[o + 1] = A[1]; pos[o + 2] = A[2];
        pos[o + 3] = B[0]; pos[o + 4] = B[1]; pos[o + 5] = B[2];
        for (let e = 0; e < 2; e++) {
          col[o + e * 3] = cr; col[o + e * 3 + 1] = cg; col[o + e * 3 + 2] = cb;
        }
        w++;
      };
      put(s.p, tip);
      for (const sgn of [1, -1]) {
        put(tip, [
          tip[0] - s.v[0] * back + side[0] * wide * sgn,
          tip[1] - s.v[1] * back + side[1] * wide * sgn,
          tip[2] - s.v[2] * back + side[2] * wide * sgn,
        ]);
      }
    }

    g.attributes.position.needsUpdate = true;
    g.attributes.color.needsUpdate = true;
    g.setDrawRange(0, w * 2);
  }

  _updateEmbedding(snapshot) {
    let primary = null;
    for (const b of snapshot.bodies) if (!primary || b.mass > primary.mass) primary = b;
    if (!primary) { this.embedding.visible = false; return; }
    this.embedding.visible = true;

    const { RN, TN } = this._embedDims;
    const pos = this.embedding.geometry.attributes.position.array;
    const rs = primary.rs;
    const rMax = this.extent;
    const rMin = Math.max(rs * 1.0001, rMax * 1e-4);

    /* Exaggeration: Flamm's z-scale is sqrt(rs*r), which for the Sun at 1 AU is
       ~1e-4 AU — invisible. Scale it so the funnel is legible, and report the
       factor in the UI. */
    /* Drawn downward. The sign is pure convention — the embedded surface is
       symmetric about the slice — but every picture of this anyone has ever
       seen is a funnel, and the point of this mode is to show you the famous
       picture and then say what is wrong with it. */
    const zAt = (r) => -flammZ(rs, r);
    const zSpan = Math.max(zAt(rMax) - zAt(rMin), 1e-30);
    this.embedExaggeration = (rMax * 0.5) / zSpan;

    for (let i = 0; i < RN; i++) {
      /* log spacing: all the geometry is near the centre */
      const f = i / (RN - 1);
      const r = rMin * Math.pow(rMax / rMin, f);
      const z = -zAt(r) * this.embedExaggeration;
      for (let j = 0; j < TN; j++) {
        const a = (j / TN) * Math.PI * 2;
        const o = (i * TN + j) * 3;
        pos[o]     = primary.pos[0] + r * Math.cos(a);
        pos[o + 1] = primary.pos[1] + z + zAt(rMax) * this.embedExaggeration;
        pos[o + 2] = primary.pos[2] + r * Math.sin(a);
      }
    }
    this.embedding.geometry.attributes.position.needsUpdate = true;
    this.embedding.geometry.computeBoundingSphere();
  }
}


/* ===========================================================================
   Methods appended to FieldView: the two comparison modes.
   ======================================================================== */
const GEO_TURNS = 3;
const GEO_STEPS = q(360, 540);
const GEO_HZ = q(5, 8);

Object.assign(FieldView.prototype, {

  /* -------------------------------------------------------------------------
     GEODESICS. Two curves from one set of initial conditions: the exact
     Schwarzschild orbit and the Newtonian one. Drawing them together is the
     only way to make "relativity corrects Newton" a thing you can look at
     rather than a thing you are told.

     Both are TEST-PARTICLE orbits about the dominant mass, so they ignore
     every other body in the system. The running simulation does not: its
     orbits are the full N-body solution. Where the drawn curve and the trail
     disagree, that difference is other planets, not relativity.
  --------------------------------------------------------------------------*/
  _buildGeodesic() {
    const mk = (color, opacity, width) => {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position',
        new THREE.BufferAttribute(new Float32Array((GEO_TURNS * GEO_STEPS + 1) * 3), 3));
      g.setDrawRange(0, 0);
      const l = new THREE.Line(g, new THREE.LineBasicMaterial({
        color, transparent: true, opacity, depthWrite: false,
      }));
      l.frustumCulled = false;
      this.group.add(l);
      return l;
    };
    this.geoGR = mk(0xffd166, 0.95);
    this.geoNewt = mk(0x9aa3ad, 0.5);

    const rg = new THREE.BufferGeometry();
    rg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(3 * 129 * 3), 3));
    rg.setAttribute('color', new THREE.BufferAttribute(new Float32Array(3 * 129 * 3), 3));
    rg.setDrawRange(0, 0);
    this.geoRings = new THREE.LineSegments(rg, new THREE.LineBasicMaterial({
      vertexColors: true, transparent: true, opacity: 0.8, depthWrite: false,
    }));
    this.geoRings.frustumCulled = false;
    this.group.add(this.geoRings);
  },

  _updateGeodesic(snapshot, selectedId) {
    const now = performance.now();
    if (this._geoAt && now - this._geoAt < 1000 / GEO_HZ) return;
    this._geoAt = now;

    const bodies = snapshot.bodies;
    let prim = null;
    for (const b of bodies) if (!prim || b.mass > prim.mass) prim = b;

    /* Probe: whatever is selected, else the body with the deepest orbit — the
       one where the difference will be largest and therefore worth drawing. */
    let probe = selectedId != null ? bodies.find(b => b.id === selectedId) : null;
    if (probe === prim) probe = null;
    if (!probe) {
      let best = Infinity;
      for (const b of bodies) {
        if (b === prim) continue;
        const d = Math.hypot(b.pos[0] - prim.pos[0], b.pos[1] - prim.pos[1], b.pos[2] - prim.pos[2]);
        if (d < best) { best = d; probe = b; }
      }
    }
    if (!probe || !prim || probe === prim) {
      this.geoGR.geometry.setDrawRange(0, 0);
      this.geoNewt.geometry.setDrawRange(0, 0);
      this.geoRings.geometry.setDrawRange(0, 0);
      this.info = 'Select a body other than the dominant mass to compare its orbit.';
      return;
    }

    const rel = [probe.pos[0] - prim.pos[0], probe.pos[1] - prim.pos[1], probe.pos[2] - prim.pos[2]];
    const vel = [probe.vel[0] - prim.vel[0], probe.vel[1] - prim.vel[1], probe.vel[2] - prim.vel[2]];
    const opts = { turns: GEO_TURNS, stepsPerTurn: GEO_STEPS };

    const gr = traceOrbit(prim.mass, rel, vel, { ...opts, relativistic: true });
    const nw = traceOrbit(prim.mass, rel, vel, { ...opts, relativistic: false });

    const fill = (line, tr) => {
      const arr = line.geometry.attributes.position.array;
      for (let i = 0; i < tr.count; i++) {
        arr[i * 3]     = prim.pos[0] + tr.points[i * 3];
        arr[i * 3 + 1] = prim.pos[1] + tr.points[i * 3 + 1];
        arr[i * 3 + 2] = prim.pos[2] + tr.points[i * 3 + 2];
      }
      line.geometry.attributes.position.needsUpdate = true;
      line.geometry.setDrawRange(0, tr.count);
    };
    fill(this.geoGR, gr);
    fill(this.geoNewt, nw);

    /* Photon sphere (1.5 r_s) and ISCO (3 r_s), at true scale. They are the
       two radii where the Newtonian picture has nothing to say at all: one is
       where light orbits, the other is where orbiting stops being possible. */
    const rings = this.geoRings.geometry;
    const rp = rings.attributes.position.array;
    const rc = rings.attributes.color.array;
    let w = 0;
    const circle = (radius, col) => {
      for (let i = 0; i < 128; i++) {
        for (const k of [i, i + 1]) {
          const a = (k / 128) * Math.PI * 2;
          const o = w * 3;
          rp[o] = prim.pos[0] + Math.cos(a) * radius;
          rp[o + 1] = prim.pos[1];
          rp[o + 2] = prim.pos[2] + Math.sin(a) * radius;
          rc[o] = col[0]; rc[o + 1] = col[1]; rc[o + 2] = col[2];
          w++;
        }
      }
    };
    circle(prim.rs * 1.5, [1.0, 0.55, 0.30]);
    circle(prim.rs * 3.0, [0.50, 0.90, 0.78]);
    if (prim.isBlackHole) circle(prim.rs, [1.0, 0.35, 0.30]);
    rings.attributes.position.needsUpdate = true;
    rings.attributes.color.needsUpdate = true;
    rings.setDrawRange(0, w);

    const el = elements(prim.mass, rel, vel);
    const dphi = precessionPerOrbit(prim.mass, rel, vel);
    const arcsec = dphi * ARCSEC_PER_RAD;
    const T = el.a > 0 ? Math.sqrt(el.a ** 3 / prim.mass) : NaN;
    this.info =
      `${probe.name} about ${prim.name}: a = ${el.a.toExponential(3)} AU, e = ${el.e.toFixed(4)} · ` +
      `apsidal advance <b>${fmtArcsec(arcsec)} per orbit</b>` +
      (isFinite(T) && T > 0 ? ` (${fmtArcsec(arcsec * 100 / T)} per century)` : '') +
      (gr.captured ? ' · <span class="warn">this orbit ends inside the horizon</span>' : '') +
      (gr.escaped ? ' · <span class="warn">unbound on this trace</span>' : '');
  },

  /* -------------------------------------------------------------------------
     GRAVITATIONAL WAVES.

     What is honest to draw is the ANGULAR PATTERN of the radiated power,
     which is a real, static, direction-dependent quantity. What is not
     honest to draw is the wave itself: the strain of a binary star at any
     distance you could stand is of order 1e-20, so an animated ripple would
     need an exaggeration factor of 1e20 and would teach the viewer something
     false about how big the effect is. The amplitude is printed instead.
  --------------------------------------------------------------------------*/
  _buildWaves() {
    const RN = 26, TN = 52;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array((RN + 1) * TN * 3);
    const col = new Float32Array((RN + 1) * TN * 3);
    const idx = [];
    for (let i = 0; i < RN; i++) {
      for (let j = 0; j < TN; j++) {
        const a = i * TN + j, b = i * TN + ((j + 1) % TN);
        const c = (i + 1) * TN + j, d = (i + 1) * TN + ((j + 1) % TN);
        idx.push(a, b, c, b, d, c);
      }
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    geo.setIndex(idx);
    this.waves = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
      vertexColors: true, transparent: true, opacity: 0.16, side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    this.waves.frustumCulled = false;
    this.waves.userData.RN = RN;
    this.waves.userData.TN = TN;
    this.group.add(this.waves);
  },

  _updateWaves(snapshot) {
    const bodies = snapshot.bodies;
    if (bodies.length < 2) {
      this.waves.visible = false;
      this.info = 'Gravitational radiation needs at least two bodies.';
      return;
    }
    this.waves.visible = true;

    /* The dominant pair: the two heaviest bodies. */
    const sorted = [...bodies].sort((a, b) => b.mass - a.mass);
    const [A, B] = sorted;
    const rel = [B.pos[0] - A.pos[0], B.pos[1] - A.pos[1], B.pos[2] - A.pos[2]];
    const vel = [B.vel[0] - A.vel[0], B.vel[1] - A.vel[1], B.vel[2] - A.vel[2]];
    const R = radiation(A.mass, B.mass, rel, vel);
    if (!R) { this.waves.visible = false; this.info = 'That pair is not bound.'; return; }

    /* Orbital axis. */
    const n = normalise(cross(rel, vel));
    const e1 = normalise(cross(n, [0, 1, 0.0001]));
    const e2 = cross(n, e1);

    const sep = Math.hypot(...rel);
    const scale = sep * 0.45;
    const mt = A.mass + B.mass;
    const cx = (A.pos[0] * A.mass + B.pos[0] * B.mass) / mt;
    const cy = (A.pos[1] * A.mass + B.pos[1] * B.mass) / mt;
    const cz = (A.pos[2] * A.mass + B.pos[2] * B.mass) / mt;

    const { RN, TN } = this.waves.userData;
    const pos = this.waves.geometry.attributes.position.array;
    const col = this.waves.geometry.attributes.color.array;
    for (let i = 0; i <= RN; i++) {
      const th = (i / RN) * Math.PI;
      const ct = Math.cos(th), st = Math.sin(th);
      const p = radiationPattern(ct);
      for (let j = 0; j < TN; j++) {
        const ph = (j / TN) * Math.PI * 2;
        const r = p * scale;
        const dx = n[0] * ct + (e1[0] * Math.cos(ph) + e2[0] * Math.sin(ph)) * st;
        const dy = n[1] * ct + (e1[1] * Math.cos(ph) + e2[1] * Math.sin(ph)) * st;
        const dz = n[2] * ct + (e1[2] * Math.cos(ph) + e2[2] * Math.sin(ph)) * st;
        const o = (i * TN + j) * 3;
        pos[o] = cx + dx * r; pos[o + 1] = cy + dy * r; pos[o + 2] = cz + dz * r;
        col[o] = 0.55 + 0.45 * p; col[o + 1] = 0.35 + 0.30 * p; col[o + 2] = 0.95;
      }
    }
    this.waves.geometry.attributes.position.needsUpdate = true;
    this.waves.geometry.attributes.color.needsUpdate = true;
    this.waves.geometry.computeBoundingSphere();

    const watts = R.power * SI.M_SUN * SI.AU ** 2 / SI.YR ** 3;
    this.info =
      `${A.name} + ${B.name}: f<sub>GW</sub> = ${R.fGwHz.toExponential(2)} Hz · ` +
      `radiating ${watts.toExponential(2)} W · ` +
      `strain h = ${R.strain.toExponential(2)} at 100 kpc (optimally oriented) · ` +
      `coalescence in ${R.tMerge.toExponential(2)} yr — ` +
      `<span class="warn">which this simulation will never reach: there is no ` +
      `radiation reaction in the integrator, so the orbit you see does not shrink.</span>`;
  },
});

function fmtArcsec(a) {
  const x = Math.abs(a);
  if (x >= 3600) return `${(a / 3600).toFixed(3)}°`;
  if (x >= 60) return `${(a / 60).toFixed(3)}′`;
  if (x >= 0.01) return `${a.toFixed(3)}″`;
  return `${a.toExponential(2)}″`;
}

/* =============================================================================
   TRACING HELPERS
   ========================================================================== */

/* Evenly spread directions on a sphere. `jitter` offsets the spiral so the
   squeeze seeds do not land on the stretch seeds. */
function fibonacci(n, jitter = 0) {
  const out = [];
  const ga = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - ((i + 0.5 + jitter) / n) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const th = ga * (i + jitter);
    out.push([Math.cos(th) * r, y, Math.sin(th) * r]);
  }
  return out;
}

function insideAnyBody(bodies, p) {
  for (const b of bodies) {
    if (!b.alive) continue;
    const rr = b.isBlackHole ? b.schwarzschildRadius : b.radius;
    const d = Math.hypot(p[0] - b.pos[0], p[1] - b.pos[1], p[2] - b.pos[2]);
    if (d < rr) return true;
  }
  return false;
}

/* Distance to the nearest surface, floored so a trace inside the softening
   radius of a point-like body still takes finite steps. */
function nearestSurfaceDistance(bodies, p) {
  let best = Infinity;
  for (const b of bodies) {
    if (!b.alive) continue;
    const rr = b.isBlackHole ? b.schwarzschildRadius : b.radius;
    const d = Math.hypot(p[0] - b.pos[0], p[1] - b.pos[1], p[2] - b.pos[2]);
    best = Math.min(best, Math.max(d - rr, rr * 0.05));
  }
  return isFinite(best) ? best : 1;
}

/* Component of v in the plane spanned by orthonormal e1, e2, normalised. */
function projectOntoPlane(v, e1, e2) {
  const a = v[0] * e1[0] + v[1] * e1[1] + v[2] * e1[2];
  const b = v[0] * e2[0] + v[1] * e2[1] + v[2] * e2[2];
  const x = a * e1[0] + b * e2[0], y = a * e1[1] + b * e2[1], z = a * e1[2] + b * e2[2];
  const n = Math.hypot(x, y, z);
  return n > 1e-12 ? [x / n, y / n, z / n] : null;
}

/* The largest body radius present, so seeds never start inside a surface. */
function minSeedRadius(bodies) {
  let r = 0;
  for (const b of bodies) {
    if (!b.alive) continue;
    r = Math.max(r, b.isBlackHole ? b.schwarzschildRadius : b.radius);
  }
  return r;
}

function cross(a, b) {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}
function normalise(a) {
  const n = Math.hypot(a[0], a[1], a[2]);
  return n > 0 ? [a[0] / n, a[1] / n, a[2] / n] : [1, 0, 0];
}
