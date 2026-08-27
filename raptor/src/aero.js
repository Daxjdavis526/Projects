// Six-degree-of-freedom flight model.
//
// Body axes follow the Three.js convention used by the renderer:
//   +X right, +Y up, -Z forward.
// Internally the aerodynamics use the conventional aerospace body frame
//   x forward, y right, z down
// and convert at the boundary. The mapping is a proper rotation, so angular
// velocities and moments transform the same way as forces.

import * as THREE from 'three';
import { AC, SIM } from './config.js';
import { isa } from './atmosphere.js';

const _v = new THREE.Vector3();
const _q = new THREE.Quaternion();

// aero (x fwd, y right, z down)  ->  three (x right, y up, z back)
function aeroToThree(ax, ay, az, out) { return out.set(ay, -az, -ax); }
// three -> aero
function threeToAero(v, out) { out.x = -v.z; out.y = v.x; out.z = -v.y; return out; }

const clamp = (x, a, b) => x < a ? a : x > b ? b : x;

/** Prandtl–Glauert-ish compressibility factor on lift-curve slope. */
function machLiftFactor(M) {
  if (M < 0.75) return 1 / Math.sqrt(1 - M * M);
  if (M < 1.15) {
    // transonic: cap the singularity and let it fall through Mach 1
    const t = (M - 0.75) / 0.40;
    return 1.512 * (1 - t) + 1.05 * t;
  }
  return Math.max(0.45, 4 / (Math.sqrt(M * M - 1) * 2 * Math.PI) * 2.6);
}

/** Wave-drag rise: nothing below M 0.85, peak just past Mach 1, decaying after. */
function waveDrag(M) {
  if (M < 0.85) return 0;
  const peak = 0.042 * Math.exp(-Math.pow((M - 1.06) / 0.17, 2));
  const plateau = 0.0115 / (1 + Math.exp(-(M - 1.0) * 14));
  return peak + plateau;
}

/** Lift coefficient with a soft stall and a flat-plate post-stall branch. */
function liftCoefficient(alpha, M) {
  const a = clamp(alpha, -AC.alphaMax, AC.alphaMax);
  const linear = (AC.CL0 + AC.CLalpha * a) * machLiftFactor(M);
  const s = AC.alphaStall;
  const over = (Math.abs(a) - s) / (12 * Math.PI / 180);
  if (over <= 0) return linear;
  const blend = clamp(over, 0, 1);
  const plate = Math.sign(a) * 1.05 * Math.sin(2 * Math.abs(a)) + AC.CL0;
  return linear * (1 - blend) + plate * blend;
}

export class FlightModel {
  constructor(wind, groundHeight) {
    this.wind = wind;
    this.groundHeight = groundHeight || (() => 0);

    this.position = new THREE.Vector3(0, 0, 0);      // world metres, y up
    this.velocity = new THREE.Vector3(0, 0, 0);      // world m/s
    this.quaternion = new THREE.Quaternion();
    this.omega = new THREE.Vector3(0, 0, 0);         // body rad/s (three axes)

    this.fuel = AC.fuelCapacity;
    this.gearDown = true;
    this.gearPos = 1;         // 0 up, 1 down
    this.brakes = 0;
    this.speedbrake = 0;
    this.nozzleVector = 0;    // rad, positive = nose-up command
    this.onGround = true;
    this.wow = 1;             // weight-on-wheels, smoothed 0..1

    // pilot inputs, -1..1 (or 0..1 for throttle)
    this.input = { pitch: 0, roll: 0, yaw: 0, throttle: 0, trim: 0 };
    this.fbw = true;
    this.autopilot = null;

    // derived state, refreshed every step
    this.alpha = 0; this.beta = 0; this.mach = 0; this.tas = 0; this.qbar = 0;
    this.gLoad = 1; this.aoaLimited = false; this.gLimited = false;
    this.surfaces = { elevator: 0, aileron: 0, rudder: 0, flap: 0 };
    this.accel = new THREE.Vector3();
    this.thrustTotal = 0;
    this.stalled = false;
    this.altAGL = 0;
    this.rates = { p: 0, q: 0, r: 0 };

    this._integ = { pitch: 0, roll: 0, yaw: 0 };
    this._gammaHold = null;
    this._vb = new THREE.Vector3();
    this._va = { x: 0, y: 0, z: 0 };
    this._force = new THREE.Vector3();
    this._moment = new THREE.Vector3();
    this._prevVel = new THREE.Vector3();
  }

  reset(pos, headingDeg, speed) {
    this.position.copy(pos);
    this.quaternion.setFromEuler(new THREE.Euler(0, -headingDeg * Math.PI / 180, 0, 'YXZ'));
    this.velocity.set(0, 0, -speed).applyQuaternion(this.quaternion);
    this.omega.set(0, 0, 0);
    this._integ.pitch = this._integ.roll = this._integ.yaw = 0;
    this._gammaHold = null;
  }

  get heading() {
    _v.set(0, 0, -1).applyQuaternion(this.quaternion);
    let h = Math.atan2(_v.x, -_v.z) * 180 / Math.PI;
    return (h + 360) % 360;
  }
  get pitchAngle() {
    _v.set(0, 0, -1).applyQuaternion(this.quaternion);
    return Math.asin(clamp(_v.y, -1, 1));
  }
  get bankAngle() {
    const up = _v.set(0, 1, 0).applyQuaternion(this.quaternion);
    const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(this.quaternion);
    const right = new THREE.Vector3().crossVectors(fwd, new THREE.Vector3(0, 1, 0)).normalize();
    if (!isFinite(right.x)) return 0;
    const horizUp = new THREE.Vector3().crossVectors(right, fwd).normalize();
    return Math.atan2(up.dot(right), up.dot(horizUp));
  }
  get verticalSpeed() { return this.velocity.y; }

  /**
   * Vertical component of the aircraft's own up axis: +1 upright, 0 knife
   * edge, -1 inverted. Any control term that reasons about the *world* has to
   * be scaled by this, or it inverts along with the aeroplane.
   */
  get upDot() {
    const q = this.quaternion;
    return 1 - 2 * (q.x * q.x + q.z * q.z);
  }

  // -------------------------------------------------------------------------
  // Fly-by-wire. The pilot commands a load factor and a roll rate; the control
  // laws work out the surface deflections and blend in thrust vectoring when
  // aerodynamic authority runs out. Limits are soft, like a real FBW jet's.
  // -------------------------------------------------------------------------
  _flyByWire(dt, V) {
    const inp = this.input;
    const s = this.surfaces;
    const { p, q, r } = this.rates;

    if (!this.fbw) {
      s.elevator = inp.pitch; s.aileron = inp.roll; s.rudder = inp.yaw;
      return;
    }

    // On the wheels the control laws hand the stabilators straight to the
    // pilot: a load-factor command loop cannot converge when the gear is
    // carrying the aeroplane, and trying makes it over-rotate on every takeoff.
    this.wow += ((this.onGround ? 1 : 0) - this.wow) * Math.min(1, dt * 4);
    if (this.wow > 0.02) {
      const direct = clamp(inp.pitch * 0.9 - q * 0.8 + inp.trim, -1, 1);
      const directRoll = clamp(inp.roll * 0.8 - p * 0.5, -1, 1);
      if (this.wow > 0.98) {
        s.elevator = direct; s.aileron = directRoll;
        s.rudder = clamp(inp.yaw - r * 0.3, -1, 1);
        this._integ.pitch = 0;
        this.aoaLimited = false; this.gLimited = false;
        this.nozzleVector *= Math.max(0, 1 - dt * 4);
        return;
      }
      this._directPitch = direct; this._directRoll = directRoll;
    }

    // --- pitch: an angle-of-attack command at low speed blending into a
    //     load-factor command as dynamic pressure builds. Both loops run all
    //     the time; only their authority shifts. Neutral stick means one g in
    //     both of them, so hands-off is level flight, not zero lift. ---
    const aLim = AC.alphaStall + 0.30 * (AC.alphaMax - AC.alphaStall);
    const gBlend = clamp((V - 120) / 130, 0, 1);

    // the angle of attack that would hold exactly one g right now
    const mass = AC.emptyMass + this.fuel;
    const CLreq = clamp(mass * SIM.g0 / Math.max(this.qbar * AC.wingArea, 1), -1.6, 1.9);
    const alphaTrim = clamp((CLreq - AC.CL0) / (AC.CLalpha * machLiftFactor(this.mach)),
      -8 * Math.PI / 180, 24 * Math.PI / 180);
    // Full aft stick asks for about 30 degrees — past the aerodynamic stall,
    // which is the regime thrust vectoring exists for.
    const aMaxCmd = 30 * Math.PI / 180;
    const alphaCmd = inp.pitch >= 0
      ? alphaTrim + inp.pitch * Math.max(0, aMaxCmd - alphaTrim)
      : alphaTrim + inp.pitch * (alphaTrim + 12 * Math.PI / 180);
    const errA = (alphaCmd - this.alpha) * 2.4;

    const gCmd = inp.pitch > 0
      ? 1 + inp.pitch * (AC.gLimit - 1)
      : 1 + inp.pitch * (1 - AC.gLimitNeg);
    const errG = (gCmd - this.gLoad) * 0.30;

    let err = errA * (1 - gBlend) + errG * gBlend;

    // Flight-path hold. A pure load-factor command is happy to sit in a steady
    // descent forever, because a steady descent is also one g. Real control
    // laws add a path term; so does this one, captured the moment the stick
    // comes back to centre.
    //
    // It is the one term in here that reasons about the world rather than the
    // aeroplane, so it is scaled by the aircraft's own up axis: inverted, pull
    // pushes the flight path down, and a hold term that did not know that
    // would drive the stabilators the wrong way and tumble you out of the roll.
    // Near knife edge it has no authority at all and switches itself off.
    const gamma = V > 20 ? Math.asin(clamp(this.velocity.y / V, -1, 1)) : 0;
    const upY = this.upDot;
    if (Math.abs(inp.pitch) < 0.04 && !this.onGround && Math.abs(upY) > 0.30) {
      if (this._gammaHold === null || this._gammaHold === undefined) this._gammaHold = gamma;
      err += clamp((this._gammaHold - gamma) * 1.1 * upY, -0.30, 0.30);
    } else {
      this._gammaHold = null;
    }

    // the angle-of-attack limiter has the last word in every regime
    this.aoaLimited = this.alpha > aLim * 0.97 && inp.pitch > 0;
    if (this.alpha > aLim) err = Math.min(err, (aLim - this.alpha) * 3.0);
    this.gLimited = Math.abs(this.gLoad) > AC.gLimit * 0.97;
    if (this.gLoad > AC.gLimit) err = Math.min(err, (AC.gLimit - this.gLoad) * 1.5);
    if (this.gLoad < AC.gLimitNeg) err = Math.max(err, (AC.gLimitNeg - this.gLoad) * 1.5);

    let elev = clamp(err * 2.2 + this._integ.pitch - q * 2.0 + inp.trim, -1, 1);
    // small, slow trim integrator with anti-windup — a big one saturates the
    // stabilators and flies the aeroplane into the ground
    if (Math.abs(elev) < 0.97) {
      this._integ.pitch = clamp(this._integ.pitch + err * dt * 0.55, -0.35, 0.35);
    }

    // --- roll: rate command, scaled down at high AoA to stay departure-free ---
    const maxRoll = (2.6 - 1.9 * clamp((this.alpha - 0.25) / 0.5, 0, 1)) * clamp(V / 160, 0.25, 1);
    // with the stick centred the law holds the bank angle, the way a modern
    // fly-by-wire jet does — a pure rate command would drift into a spiral
    // Bank hold only wings-level-ish and only right way up: rolled past 80
    // degrees or inverted, neutral stick holds the attitude you left it in,
    // which is what lets you fly upside down at all.
    const bankHold = Math.abs(inp.roll) < 0.04 && Math.abs(this.bankAngle) < 80 * Math.PI / 180
      && this.upDot > 0.2
      ? clamp(-this.bankAngle * 2.4, -1.2, 1.2) : 0;
    const rollErr = inp.roll * maxRoll + bankHold - p;
    let ail = clamp(rollErr * 1.1, -1, 1);

    // --- yaw: automatic turn coordination plus pedal authority ---
    // Positive rudder yaws the nose right, so a nose-right sideslip (beta < 0)
    // needs left rudder: the coordination term goes *with* beta, not against.
    const coord = clamp(this.beta * 7.0 - r * 0.5, -0.85, 0.85);
    let rud = clamp(coord + inp.yaw, -1, 1);

    if (this.wow > 0.02) {
      elev = elev * (1 - this.wow) + (this._directPitch || 0) * this.wow;
      ail = ail * (1 - this.wow) + (this._directRoll || 0) * this.wow;
    }
    s.elevator = elev; s.aileron = ail; s.rudder = rud;

    // --- thrust vectoring: takes over as dynamic pressure falls away ---
    const authority = clamp(1 - this.qbar / 9000, 0, 1);
    const want = elev * authority * (this.onGround ? 0 : 1);
    const target = clamp(want, -1, 1) * AC.nozzleVectorMax;
    const rate = AC.nozzleVectorRate * dt;
    this.nozzleVector += clamp(target - this.nozzleVector, -rate, rate);
  }

  // -------------------------------------------------------------------------
  step(dt, engines) {
    const pos = this.position;
    const alt = pos.y;
    const air = isa(alt);
    const ground = this.groundHeight(pos.x, pos.z);
    this.altAGL = alt - ground;

    // ---- airspeed in the body frame ----
    const w = this.wind.sample(pos.x, alt, pos.z);
    _v.set(this.velocity.x - w.x, this.velocity.y - w.y, this.velocity.z - w.z);
    const vWorldAir = _v.clone();
    const V = vWorldAir.length();
    this.tas = V;
    _q.copy(this.quaternion).invert();
    this._vb.copy(vWorldAir).applyQuaternion(_q);
    const va = threeToAero(this._vb, this._va);
    const u = va.x, vy = va.y, wz = va.z;

    this.alpha = V > 1 ? Math.atan2(wz, Math.max(u, 0.5)) : 0;
    this.beta = V > 1 ? Math.asin(clamp(vy / V, -1, 1)) : 0;
    this.mach = V / air.a;
    this.qbar = 0.5 * air.rho * V * V;

    // body rates in aerospace convention
    const ob = threeToAero(this.omega, { x: 0, y: 0, z: 0 });
    this.rates.p = ob.x; this.rates.q = ob.y; this.rates.r = ob.z;

    this._flyByWire(dt, V);
    const s = this.surfaces;

    // ---- coefficients ----
    const M = this.mach;
    const CL = liftCoefficient(this.alpha, M);
    this.stalled = Math.abs(this.alpha) > AC.alphaStall && V > 40;
    const CDi = CL * CL / (Math.PI * AC.aspectRatio * AC.oswald);
    const CD = AC.CD0 + waveDrag(M) + CDi
      + this.gearPos * AC.CDgear + this.speedbrake * AC.CDbrake
      + 0.9 * Math.abs(Math.sin(this.beta)) * Math.abs(Math.sin(this.beta))
      + 0.35 * Math.abs(s.elevator) * 0.02;
    const CY = -0.9 * this.beta;

    this.CL = CL; this.CD = CD;
    const S = AC.wingArea;
    const L = this.qbar * S * CL;
    const D = this.qbar * S * CD;
    const Y = this.qbar * S * CY;

    // wind-axis -> aerospace body axes
    const ca = Math.cos(this.alpha), sa = Math.sin(this.alpha);
    const cb = Math.cos(this.beta), sb = Math.sin(this.beta);
    const Fx = -D * ca * cb - Y * ca * sb + L * sa;
    const Fy = -D * sb + Y * cb;
    const Fz = -D * sa * cb - Y * sa * sb - L * ca;

    // ---- propulsion ----
    const thrust = engines.totalThrust(air, M, alt);
    this.thrustTotal = thrust;
    this.dragTotal = D;
    const tv = this.nozzleVector;
    const Tx = thrust * Math.cos(tv);
    const Tz = -thrust * Math.sin(tv);   // +nose-up vectoring pushes tail down

    // ---- moments (aerospace body axes) ----
    const b = AC.wingSpan, mac = AC.mac;
    const invV = 1 / Math.max(V, 25);
    const Cl = AC.Clda * s.aileron + AC.Clbeta * this.beta + AC.Clp * this.rates.p * b * 0.5 * invV;
    const Cm = -0.02 - 0.09 * this.alpha + AC.Cmde * s.elevator
      + AC.Cmq * this.rates.q * mac * 0.5 * invV;
    const Cn = AC.Cndr * s.rudder + AC.Cnbeta * this.beta + AC.Cnr * this.rates.r * b * 0.5 * invV;

    let Mx = this.qbar * S * b * Cl;
    let My = this.qbar * S * mac * Cm;
    let Mz = this.qbar * S * b * Cn;
    // thrust vectoring moment: nozzles sit ~5.2 m aft of the CG
    My += Tz * -5.2 * -1;

    // post-stall: aerodynamic moments wash out, vectoring keeps working
    if (Math.abs(this.alpha) > AC.alphaStall) {
      const f = clamp(1 - (Math.abs(this.alpha) - AC.alphaStall) / 0.5, 0.25, 1);
      Mx *= f; Mz *= f; My = My * f + Tz * -5.2 * -1 * (1 - f);
    }

    // ---- total force in world axes ----
    const fAeroBody = aeroToThree(Fx + Tx, Fy, Fz + Tz, this._force);
    const mass = AC.emptyMass + this.fuel;
    const fWorld = fAeroBody.clone().applyQuaternion(this.quaternion);
    fWorld.y -= mass * SIM.g0;

    const mBody = aeroToThree(Mx, My, Mz, this._moment);

    // ---- ground contact ----
    if (this.gearPos > 0.5 || this.altAGL < 3) {
      this._groundContact(fWorld, mBody, ground, mass, dt);
    } else {
      this.onGround = false;
    }

    // ---- integrate ----
    const acc = fWorld.divideScalar(mass);
    this.accel.copy(acc);
    this.velocity.addScaledVector(acc, dt);
    this.position.addScaledVector(this.velocity, dt);

    // angular: I is diagonal in the aerospace frame; work there, convert back
    const mA = threeToAero(mBody, { x: 0, y: 0, z: 0 });
    const { p: pr, q: qr, r: rr } = this.rates;
    const dp = (mA.x - (AC.Izz - AC.Iyy) * qr * rr) / AC.Ixx;
    const dq = (mA.y - (AC.Ixx - AC.Izz) * pr * rr) / AC.Iyy;
    const dr = (mA.z - (AC.Iyy - AC.Ixx) * pr * qr) / AC.Izz;
    const np = pr + dp * dt, nq = qr + dq * dt, nr = rr + dr * dt;
    aeroToThree(np, nq, nr, this.omega);

    // quaternion integration (body-rate)
    const om = this.omega;
    const dqt = new THREE.Quaternion(om.x * dt * 0.5, om.y * dt * 0.5, om.z * dt * 0.5, 1);
    this.quaternion.multiply(dqt).normalize();

    // ---- load factor felt by the pilot (specific force along body +Y) ----
    const specific = aeroToThree(Fx + Tx, Fy, Fz + Tz, _v).divideScalar(mass * SIM.g0);
    this.gLoad = specific.y;
    if (this.onGround) this.gLoad = Math.max(1, this.gLoad);

    // ---- divergence guard: one bad frame must not poison the whole flight ----
    if (!isFinite(this.position.x) || !isFinite(this.position.y) || !isFinite(this.position.z) ||
        !isFinite(this.velocity.x) || !isFinite(this.omega.x) || !isFinite(this.quaternion.w)) {
      this.recover(ground);
    }

    // ---- gear transit & fuel ----
    const gt = dt / AC.gearTransitTime;
    this.gearPos = clamp(this.gearPos + (this.gearDown ? gt : -gt), 0, 1);
    this.fuel = Math.max(0, this.fuel - engines.fuelFlow * dt);
  }

  /** Put the aeroplane back into a sane state after a numerical blow-up. */
  recover(groundY) {
    const p = this.position;
    if (!isFinite(p.x) || !isFinite(p.z)) p.set(0, 0, 0);
    p.y = (isFinite(groundY) ? groundY : 0) + 2000;
    this.velocity.set(0, 0, -220).applyQuaternion(
      isFinite(this.quaternion.w) ? this.quaternion : this.quaternion.identity());
    this.omega.set(0, 0, 0);
    this.quaternion.normalize();
    this._integ.pitch = this._integ.roll = this._integ.yaw = 0;
    this.diverged = (this.diverged || 0) + 1;
  }

  /** Three-point gear model: spring-damper struts, friction, brakes, steering. */
  _groundContact(fWorld, mBody, groundY, mass, dt) {
    const contacts = [
      { x: 0, z: -AC.wheelbase * 0.80, steer: true },
      { x: -AC.track * 0.5, z: AC.wheelbase * 0.20, brake: true },
      { x: AC.track * 0.5, z: AC.wheelbase * 0.20, brake: true },
    ];
    const strut = this.gearPos * AC.gearHeight;
    let anyContact = false;
    const up = new THREE.Vector3(0, 1, 0);

    for (const c of contacts) {
      const local = new THREE.Vector3(c.x, -strut, c.z).applyQuaternion(this.quaternion);
      const wp = local.clone().add(this.position);
      const pen = groundY - wp.y;
      if (pen <= 0) continue;
      anyContact = true;

      // velocity of this contact point
      const vp = new THREE.Vector3().crossVectors(this.omega, local).add(this.velocity);

      // Sized for a ~0.2 m static deflection per strut at about 0.8 of
      // critical damping: stiff enough to hold the jet up, soft enough to be
      // stable at 240 Hz.
      const k = 5.0e5, cDamp = 1.1e5;
      let N = k * Math.min(pen, 1.2) - cDamp * Math.min(vp.y, 0);
      N = clamp(N, 0, mass * 12);

      // friction: rolling + braking along the track, hard cornering resistance across
      const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(this.quaternion).setY(0).normalize();
      const side = new THREE.Vector3().crossVectors(up, fwd).normalize();
      const vf = vp.dot(fwd), vs = vp.dot(side);

      const mu = AC.rollingResistance + this.brakes * (c.brake ? 0.55 : 0.1);
      let ff = -Math.sign(vf) * Math.min(mu * N, Math.abs(vf) * mass * 1.5);
      let fs = -clamp(vs * mass * 0.9, -0.9 * N, 0.9 * N);

      const F = new THREE.Vector3()
        .addScaledVector(up, N)
        .addScaledVector(fwd, ff)
        .addScaledVector(side, fs);
      fWorld.add(F);

      // moment about the CG, expressed in the body frame
      const Fb = F.clone().applyQuaternion(_q.copy(this.quaternion).invert());
      mBody.add(new THREE.Vector3().crossVectors(local.clone().applyQuaternion(_q), Fb));
    }

    this.onGround = anyContact;
    if (anyContact) {
      // nosewheel steering, only meaningful at taxi speeds
      const gs = Math.hypot(this.velocity.x, this.velocity.z);
      if (gs < 45) {
        const steer = this.input.yaw * AC.noseWheelMaxSteer * clamp(1 - gs / 45, 0, 1);
        const yawMoment = -steer * gs * mass * 0.9;
        mBody.y += yawMoment;
      }
      // damp residual body rates so the jet sits still on the ramp
      this.omega.multiplyScalar(Math.max(0, 1 - dt * 3.5));
    }
  }
}
