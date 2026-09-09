/* =============================================================================
   PLAYER — moving a suited human across the Moon
   -----------------------------------------------------------------------------
   Pure: no DOM, no three.js, so the whole gait runs in the tests.

   The point of this file is that lunar walking is not Earth walking slowed
   down. Three facts drive everything here.

   Gravity is a sixth, so the pendulum a walking leg swings through is six
   times slower. Walking stays stable only while the Froude number v^2/(gL)
   is under about 0.37, which on the Moon means about 0.7 m/s — a stroll.
   Above that a person has to leave the ground between steps, which is why
   every Apollo crew ended up loping: a two-footed bound with a long airborne
   phase, and it is genuinely the efficient gait there, not a stunt.

   Traction is a sixth too. Regolith's friction angle is around 35 to 50
   degrees, so the most horizontal force a boot can push with is roughly
   0.8 of your weight — and your weight is a sixth of Earth's. The ceiling on
   acceleration is therefore about 1.3 m/s^2, and only while a foot is actually
   down. Starting, stopping and turning all take metres rather than
   centimetres. The Apollo crews described exactly this: you plan your stop
   several paces ahead.

   Mass is not a sixth. Suit and backpack together mass more than the person,
   and inertia does not care which planet it is on. So the sluggishness is real
   and it is the interesting part of moving here.

   The one piece of fiction is the jetpack, which exists so terrain can never
   trap you. It is marked FICTIONAL wherever it surfaces.
   ========================================================================== */

import { PLAYER, R_MOON, GM_MOON } from '../config.js';
import { llhToXyz, xyzToLlh, enuBasis } from './frames.js';

/* Regolith's internal friction angle, Apollo soil mechanics: 35-50 degrees.
   The lower end is the honest choice for a boot on undisturbed surface. */
const FRICTION = Math.tan(37 * Math.PI / 180);

/* How close counts as standing on it, and how far a walker will follow the
   ground down before admitting they are airborne. */
const CONTACT_SLOP = 0.02;
const CONTACT_STICK = 0.22;

/* Slope is sampled over a stride rather than a boot print. A person walks over
   the centimetre-scale roughness; what tips them over is the metre-scale shape
   of the ground. */
const SLOPE_STEP = 1.5;

const DEG = Math.PI / 180;

/* Below this the walk is a walk; above it, a person on the Moon has to bound.
   Froude 0.37 with a 0.92 m leg. */
export const LOPE_SPEED = Math.sqrt(0.37 * 1.62 * 0.92);

export const GAIT = { STAND: 'stand', WALK: 'walk', LOPE: 'lope', FLIGHT: 'flight',
                      FALLEN: 'fallen', JET: 'jet' };

export class Player {
  /**
   * @param {object} opts { lat, lon, ground, yaw }
   *   ground: { heightAt(lat, lon), slopeAt?(lat, lon) } — the heightfield
   */
  constructor(opts) {
    this.ground = opts.ground;
    this.yaw = (opts.yaw ?? 90) * Math.PI / 180;
    this.pitch = 0;
    this.vel = { x: 0, y: 0, z: 0 };          // world frame, m/s
    this.pos = { x: 0, y: 0, z: 0 };
    this.gait = GAIT.STAND;
    this.grounded = true;
    this.stepPhase = 0;          // 0..1 through the current stride
    this.stepsTaken = 0;
    this.bob = 0;                // metres the body rises within a stride
    this.jetHeat = 0;
    this.jetOn = false;
    this.fallenFor = 0;
    this.stumbles = 0;
    this.lastImpact = 0;
    this.distance = 0;
    this.airborneFor = 0;
    this.exertion = 0;           // 0..1, drives breathing and consumables
    this.place(opts.lat ?? 0, opts.lon ?? 0);
  }

  /** Put the player on the surface at a latitude and longitude. */
  place(lat, lon, agl = 0) {
    const h = this.ground.heightAt(lat, lon);
    llhToXyz(lat, lon, h + agl, this.pos);
    this.vel.x = this.vel.y = this.vel.z = 0;
    this.grounded = agl <= 0.02;
    this.llh = { lat, lon, h: h + agl };
    this.surface = h;
  }

  get speed() {
    const u = this.up();
    const vr = this.vel.x * u.x + this.vel.y * u.y + this.vel.z * u.z;
    return Math.hypot(this.vel.x - vr * u.x, this.vel.y - vr * u.y, this.vel.z - vr * u.z);
  }

  up() {
    const r = Math.hypot(this.pos.x, this.pos.y, this.pos.z) || 1;
    return { x: this.pos.x / r, y: this.pos.y / r, z: this.pos.z / r };
  }

  /** Height of the boots above the surface, in metres. */
  get agl() { return this.llh.h - this.surface; }

  /**
   * One fixed step.
   *
   * @param {number} dt seconds
   * @param {object} input {
   *   forward, strafe   -1..1
   *   run               boolean, ask for the fastest gait
   *   jump              boolean, edge-triggered by the caller
   *   jet               boolean, held
   *   gravityScale      1 normally; the tests use it to check the model
   * }
   */
  step(dt, input = {}) {
    const u = this.up();
    const r = Math.hypot(this.pos.x, this.pos.y, this.pos.z);
    const g = GM_MOON / (r * r);

    /* --- where the ground is ------------------------------------------- */
    const llh = xyzToLlh(this.pos.x, this.pos.y, this.pos.z);
    this.llh = llh;
    const wasSurface = this.surface;
    this.surface = this.ground.heightAt(llh.lat, llh.lon);

    /* The ground moves under you. A tile arriving at a finer level can drop or
       lift the surface by a metre or two while you stand perfectly still, and
       reading that as a fall is why the player was permanently getting up on
       rough terrain: refine, drop, land hard, refine again.

       This is sampled at the position you were already standing at, which is
       what separates a refinement from a cliff. Walking off an edge changes the
       ground because you moved; a tile arriving changes the ground under the
       spot you have not left. The first is a fall and should hurt. The second
       is bookkeeping, and the body is simply carried with it. */
    if (this.grounded && wasSurface !== null && wasSurface !== undefined &&
        Math.abs(this.surface - wasSurface) > CONTACT_SLOP) {
      llhToXyz(llh.lat, llh.lon, this.surface, this.pos);
      llh.h = this.surface;
      const nu = this.vel.x * u.x + this.vel.y * u.y + this.vel.z * u.z;
      this.vel.x -= nu * u.x; this.vel.y -= nu * u.y; this.vel.z -= nu * u.z;
    }
    const agl = llh.h - this.surface;
    const b = enuBasis(llh.lat, llh.lon);

    /* Split velocity into "along the surface" and "away from it". */
    let vUp = this.vel.x * u.x + this.vel.y * u.y + this.vel.z * u.z;
    let hx = this.vel.x - vUp * u.x, hy = this.vel.y - vUp * u.y, hz = this.vel.z - vUp * u.z;

    const wasGrounded = this.grounded;

    /* --- what the player is asking for ---------------------------------- */
    const fallen = this.fallenFor > 0;
    if (fallen) {
      this.fallenFor = Math.max(0, this.fallenFor - dt);
      input = { jet: input.jet };            // you can still fire the pack
    }
    const want = Math.min(1, Math.hypot(input.forward || 0, input.strafe || 0));
    const cy = Math.cos(this.yaw), sy = Math.sin(this.yaw);
    /* Yaw zero is north, positive towards east — the same convention the
       camera and the heading readout use. */
    const fwd = { x: b.n.x * cy + b.e.x * sy, y: b.n.y * cy + b.e.y * sy, z: b.n.z * cy + b.e.z * sy };
    const rgt = { x: b.e.x * cy - b.n.x * sy, y: b.e.y * cy - b.n.y * sy, z: b.e.z * cy - b.n.z * sy };
    const top = input.run ? PLAYER.sprint : PLAYER.lope;
    const wish = {
      x: (fwd.x * (input.forward || 0) + rgt.x * (input.strafe || 0)),
      y: (fwd.y * (input.forward || 0) + rgt.y * (input.strafe || 0)),
      z: (fwd.z * (input.forward || 0) + rgt.z * (input.strafe || 0)),
    };
    const wl = Math.hypot(wish.x, wish.y, wish.z) || 1;
    const target = want * top;

    /* --- traction ------------------------------------------------------- */
    /* A boot can push horizontally with at most the friction angle's worth of
       your weight, and only while it is on the ground. In flight there is no
       air to push against, so the small amount of control left is the little a
       person gets from swinging their limbs. */
    /* The heightfield reports slope in degrees and its normal in the local
       east/north/up frame, which is the contract the whole project uses. */
    const slope = (this.ground.slopeAt ? this.ground.slopeAt(llh.lat, llh.lon, SLOPE_STEP) : 0) * DEG;
    const traction = FRICTION * g;
    const maxAccel = this.grounded
      ? traction * (fallen ? 0 : 1) * Math.max(0.25, Math.cos(slope))
      : traction * PLAYER.airControl;

    const speed = Math.hypot(hx, hy, hz);
    let ax = wish.x / wl * target - hx, ay = wish.y / wl * target - hy, az = wish.z / wl * target - hz;
    /* Asking to stop is a thing a boot does. Letting go of the keys in flight
       used to apply the same deceleration through `airControl`, which took
       about eight per cent off the horizontal speed of a two-second bound: a
       retarding force in a vacuum, with nothing to push against and no source.
       In the air with no input, the only thing that changes your velocity is
       gravity — and the jetpack, below, which is thrust and is allowed to. */
    if (want < 0.01) {
      if (!this.grounded) { ax = 0; ay = 0; az = 0; }
      else { ax = -hx; ay = -hy; az = -hz; }
    }
    const need = Math.hypot(ax, ay, az);
    if (need > 1e-6) {
      const k = Math.min(1, maxAccel * dt / need);
      hx += ax * k; hy += ay * k; hz += az * k;
    }

    /* --- slopes ---------------------------------------------------------- */
    /* Gravity pulls you down the slope with g sin(theta) and a boot resists
       with at most FRICTION g cos(theta), so the surface becomes unstandable
       exactly where tan(theta) passes the friction angle — around 37 degrees on
       undisturbed regolith. Nothing special-cases a "slide": the two terms are
       applied and the steeper slopes win on their own. */
    if (this.grounded && slope > 0.02) {
      const n = this.ground.normalAt ? this.ground.normalAt(llh.lat, llh.lon, SLOPE_STEP) : null;
      /* The horizontal part of the surface normal points downhill. */
      const dl = n ? Math.hypot(n.e, n.n) : 0;
      if (dl > 1e-6) {
        const pull = g * Math.sin(slope) * dt / dl;
        const de = n.e * pull, dn = n.n * pull;
        hx += b.e.x * de + b.n.x * dn;
        hy += b.e.y * de + b.n.y * dn;
        hz += b.e.z * de + b.n.z * dn;
      }
    }

    /* --- gait ------------------------------------------------------------ */
    const moving = Math.hypot(hx, hy, hz);
    if (!this.grounded) {
      this.gait = this.jetOn ? GAIT.JET : GAIT.FLIGHT;
      this.airborneFor += dt;
    } else {
      this.airborneFor = 0;
      this.gait = fallen ? GAIT.FALLEN
        : moving < 0.12 ? GAIT.STAND
        : moving < LOPE_SPEED ? GAIT.WALK : GAIT.LOPE;
    }

    /* A lope is a bound: each stride leaves the ground. The stride lengthens
       with speed, and the push-off is whatever vertical speed keeps you in the
       air for exactly that long — which is what makes the motion read as low
       gravity rather than as a slow-motion walk. */
    if (this.grounded && !fallen) {
      const stride = moving > 0.05 ? 1.15 + 0.42 * moving : 1;
      this.stepPhase += moving * dt / stride;
      if (this.stepPhase >= 1) {
        this.stepPhase -= 1;
        this.stepsTaken++;
        if (this.gait === GAIT.LOPE) {
          const flight = Math.min(1.1, stride / Math.max(moving, 0.1));
          vUp = Math.max(vUp, Math.min(1.1, g * flight * 0.5));
        }
      }
      this.bob = this.gait === GAIT.WALK
        ? 0.035 * Math.sin(this.stepPhase * Math.PI * 2)
        : 0;
    }

    /* --- jump ------------------------------------------------------------ */
    if (input.jump && this.grounded && !fallen) {
      vUp = Math.sqrt(2 * g * PLAYER.jumpHeight);
      this.stepPhase = 0;
    }

    /* --- jetpack (FICTIONAL) --------------------------------------------- */
    /* Propellant is unlimited so terrain can never strand anyone, but the pack
       runs hot: about eight seconds of continuous thrust, then it has to cool.
       That keeps it a way out of a hole rather than a way to fly everywhere. */
    this.jetOn = false;
    if (input.jet && this.jetHeat < 1 && !fallen) {
      this.jetOn = true;
      this.jetHeat = Math.min(1, this.jetHeat + PLAYER.jetpackHeatUp * dt);
      const a = PLAYER.jetpackAccel * (1 - 0.35 * this.jetHeat) * dt;
      /* Mostly straight up, with some of it wherever you are pointing, so it
         can be flown as well as used to climb out of a crater. */
      vUp += a * 0.82;
      if (want > 0.01) {
        hx += wish.x / wl * a * 0.4; hy += wish.y / wl * a * 0.4; hz += wish.z / wl * a * 0.4;
      } else if (!wasGrounded) {
        /* Attitude control, which the brief asked for and which was the one
           thing the pack could not do: thrust against the way you are already
           going. This is the only honest way to stop in a vacuum, and it is
           what makes the pack a manoeuvring unit rather than a jump button —
           a bad bound is recoverable in the air rather than only survivable on
           landing. Never more than the speed itself, so it arrests and does
           not reverse. */
        const hs = Math.hypot(hx, hy, hz);
        if (hs > 1e-4) {
          const k = Math.min(1, a * 0.4 / hs);
          hx -= hx * k; hy -= hy * k; hz -= hz * k;
        }
      }
      this.grounded = false;
    } else {
      this.jetHeat = Math.max(0, this.jetHeat - PLAYER.jetpackHeatDown * dt);
    }

    /* --- integrate -------------------------------------------------------- */
    const gs = input.gravityScale ?? 1;
    if (!this.grounded || vUp > 0) vUp -= g * gs * dt;

    this.vel.x = hx + vUp * u.x;
    this.vel.y = hy + vUp * u.y;
    this.vel.z = hz + vUp * u.z;

    this.pos.x += this.vel.x * dt;
    this.pos.y += this.vel.y * dt;
    this.pos.z += this.vel.z * dt;
    this.distance += moving * dt;

    /* --- contact ---------------------------------------------------------- */
    /* Contact is decided here rather than from a height tolerance at the top of
       the step, because a tolerance leaves you hovering: the moment you are
       "close enough" gravity switches off and you stop a centimetre short. In
       contact the boots are put exactly on the surface instead.

       The stick distance keeps a walker attached over small undulations. A real
       stride would ride them; without it, every ripple in the ground launches
       you, and the gait dissolves into flicker. */
    const after = xyzToLlh(this.pos.x, this.pos.y, this.pos.z);
    const gh = this.ground.heightAt(after.lat, after.lon);
    /* Anything moving upwards has just pushed off and is not in contact,
       whatever the height says: a jump is only a few millimetres tall on its
       first frame. */
    const rising = vUp > 0.05;
    const stick = wasGrounded && !rising ? CONTACT_STICK : CONTACT_SLOP;
    if (!rising && after.h <= gh + stick) {
      const impact = -vUp;
      llhToXyz(after.lat, after.lon, gh, this.pos);
      const u2 = this.up();
      const nu = this.vel.x * u2.x + this.vel.y * u2.y + this.vel.z * u2.z;
      this.vel.x -= nu * u2.x; this.vel.y -= nu * u2.y; this.vel.z -= nu * u2.z;
      if (!wasGrounded) this.land(impact);
      this.grounded = true;
      after.h = gh;
    } else {
      this.grounded = false;
    }
    this.llh = after;
    this.surface = gh;

    /* Exertion, for breathing rate and consumables: standing still is idle,
       loping flat out is hard work, and the jetpack is neither. */
    const load = Math.min(1, moving / PLAYER.sprint);
    this.exertion += (load - this.exertion) * Math.min(1, dt / 6);
    return this;
  }

  /** Arriving back on the ground at `speed` m/s. */
  land(speed) {
    this.lastImpact = Math.max(0, speed);
    /* A stumble, not an injury: on the Moon you have a long time to see it
       coming and the getting up is the slow part. */
    if (speed > PLAYER.fallHurt) { this.fallenFor = 2.6; this.stumbles++; }
  }

  /** Heading in degrees, 0 north, 90 east. */
  get heading() { return ((this.yaw * 180 / Math.PI) % 360 + 360) % 360; }

  /** Everything the renderer, HUD and audio need. Read-only by convention. */
  snapshot() {
    return {
      lat: this.llh.lat, lon: this.llh.lon, alt: this.llh.h,
      surface: this.surface, agl: this.agl,
      speed: this.speed, heading: this.heading, pitch: this.pitch,
      gait: this.gait, grounded: this.grounded, stepPhase: this.stepPhase,
      steps: this.stepsTaken, bob: this.bob, distance: this.distance,
      jetOn: this.jetOn, jetHeat: this.jetHeat,
      fallen: this.fallenFor > 0, lastImpact: this.lastImpact, stumbles: this.stumbles,
      exertion: this.exertion, airborneFor: this.airborneFor,
    };
  }
}

/** The speed above which a person has to leave the ground, for a given g. */
export function lopeThreshold(g = 1.62, legLength = 0.92) {
  return Math.sqrt(0.37 * g * legLength);
}

/** How far it takes to stop from `v`, given regolith traction. */
export function stoppingDistance(v, g = 1.62) {
  return v * v / (2 * FRICTION * g);
}

export { FRICTION, R_MOON };
