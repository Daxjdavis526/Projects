//! How the body moves: a procedural animator for the player's figure.
//!
//! No canned clips. The figure is driven by what the simulation is actually
//! doing, so the feet, the footstep sounds and the vibration a worm hears all
//! agree:
//!
//! - **Footfalls come from the gait.** One continuous cycle phase drives
//!   both legs at the [`crate::gait::Stride`]'s cadence, and each real
//!   footstrike nudges it (never jumps it) into step, so what you see lands
//!   when you hear it. A planted foot stays world-fixed for its stance,
//!   rolling up onto its ball as the body passes; the other swings on an arc
//!   to where it will land (predicted from the body's velocity), and the legs
//!   reach them with two-bone IK. Feet do not skate and they sit on the real
//!   ground height, slopes included.
//! - **The rest follows the legs.** The pelvis bobs and sways over the stance
//!   foot and drops if a leg cannot reach; the torso leans with speed and
//!   counter-rotates against the hips; arms swing against the legs.
//! - **Gaits look different**: walking upright; running leaned in with bent
//!   arms, a longer swing and a flight phase; sandwalking low, cautious and
//!   irregular with the arms held out; crouching; in the air, legs tucked and
//!   a compression on landing; riding, braced wide with both hands on the
//!   ropes.
//!
//! Proportions follow Drillis & Contini (1966): every segment is a fixed
//! fraction of stature.

use crate::player::Gait;
use glam::DVec3;

/// Segment lengths and joint heights, metres.
#[derive(Clone, Copy, Debug)]
pub struct Proportions {
    pub height: f64,
    pub hip_height: f64,
    pub thigh: f64,
    pub shank: f64,
    pub ankle_height: f64,
    pub foot: f64,
    /// Lateral offset of each hip joint from the centre.
    pub hip_half: f64,
    pub waist_height: f64,
    pub chest_height: f64,
    pub shoulder_height: f64,
    /// Lateral offset of each shoulder joint.
    pub shoulder_half: f64,
    pub neck_height: f64,
    pub head_centre: f64,
    pub upper_arm: f64,
    pub forearm: f64,
    pub hand: f64,
}

impl Proportions {
    /// An adult of stature `h`, by Drillis & Contini's ratios.
    pub fn of_height(h: f64) -> Self {
        Self {
            height: h,
            hip_height: 0.530 * h,
            thigh: 0.245 * h,
            shank: 0.246 * h,
            ankle_height: 0.039 * h,
            foot: 0.152 * h,
            // Hip joints sit well inside the hip breadth (0.191 H).
            hip_half: 0.052 * h,
            waist_height: 0.630 * h,
            chest_height: 0.720 * h,
            shoulder_height: 0.818 * h,
            // Shoulder joints, inside the biacromial breadth (0.259 H).
            shoulder_half: 0.105 * h,
            neck_height: 0.870 * h,
            head_centre: 0.935 * h,
            upper_arm: 0.186 * h,
            forearm: 0.146 * h,
            hand: 0.108 * h,
        }
    }

    pub fn leg(&self) -> f64 {
        self.thigh + self.shank
    }
}

/// Joint indices of a [`Pose`].
pub mod j {
    pub const PELVIS: usize = 0;
    pub const WAIST: usize = 1;
    pub const CHEST: usize = 2;
    pub const NECK: usize = 3;
    pub const HEAD: usize = 4;
    pub const HIP: [usize; 2] = [5, 9];
    pub const KNEE: [usize; 2] = [6, 10];
    pub const ANKLE: [usize; 2] = [7, 11];
    pub const TOE: [usize; 2] = [8, 12];
    pub const SHOULDER: [usize; 2] = [13, 17];
    pub const ELBOW: [usize; 2] = [14, 18];
    pub const WRIST: [usize; 2] = [15, 19];
    pub const FINGERS: [usize; 2] = [16, 20];
    pub const COUNT: usize = 21;
}

/// Index 0 is the left side, 1 the right, throughout.
pub const LEFT: usize = 0;
pub const RIGHT: usize = 1;

/// Joint positions in world space, and the frames that orient the segments.
#[derive(Clone, Debug)]
pub struct Pose {
    pub j: [DVec3; j::COUNT],
    /// Horizontal facing of the hips.
    pub fwd: DVec3,
    /// Torso's up (spine direction) and the shoulders' facing.
    pub up: DVec3,
    pub chest_fwd: DVec3,
    /// Where the head is looking.
    pub look: DVec3,
    /// Each foot on the ground (for footprints and sound).
    pub planted: [bool; 2],
}

/// What the figure is doing besides moving about.
#[derive(Clone, Copy, Debug, PartialEq)]
pub enum Activity {
    Move,
    /// On a worm: braced, both hands on the ropes at these points.
    Ride { hands: [DVec3; 2] },
    /// Kneeling to drive a caller into the sand, `t` seconds in.
    Plant { t: f64 },
    /// Throwing a hook with one arm, `t` seconds in.
    Throw { right: bool, t: f64 },
}

#[derive(Clone, Copy, Debug)]
pub struct AnimInput {
    /// Feet position of the body (the simulation's player position).
    pub pos: DVec3,
    pub vel: DVec3,
    /// Velocity of whatever is underfoot (a worm's back), zero on sand.
    pub ground_vel: DVec3,
    /// Camera heading and pitch, radians; yaw 0 looks down -z.
    pub look_yaw: f64,
    pub look_pitch: f64,
    pub gait: Gait,
    pub grounded: bool,
    pub crouch: f64,
    /// Current step from the stride: seconds it lasts, which foot struck last,
    /// and a strike that happened this frame (true = left).
    pub step_interval: f64,
    pub last_left: bool,
    pub strike: Option<bool>,
    pub landed: Option<f64>,
    pub activity: Activity,
}

#[derive(Clone, Copy, Debug)]
struct Foot {
    /// Ground contact point (under the ankle) while planted, or where the
    /// swing is now.
    at: DVec3,
    planted: bool,
    /// Which way the foot points (horizontal). Fixed while planted.
    dir: DVec3,
    /// Where the swing started, which way the foot pointed then, and the
    /// cycle phase it started at.
    lift: DVec3,
    lift_dir: DVec3,
    lift_q: f64,
    /// Where the swing is headed, smoothed: the prediction moves as the body
    /// speeds up and slows, and the foot should not jerk when it does.
    aim: DVec3,
    /// Where the body was when the swing began.
    lift_body: DVec3,
    /// 0..1 through the swing.
    swing: f64,
    /// Heel lift while planted (radians), and what it was at lift-off.
    roll: f64,
    lift_roll: f64,
    /// Seconds a corrective (settling) step lasts, if taking one.
    settle: Option<(f64, f64, DVec3)>,
}

/// Keeps the state that makes the motion continuous from frame to frame.
#[derive(Clone, Debug)]
pub struct Animator {
    pub p: Proportions,
    feet: [Foot; 2],
    yaw: f64,
    /// Smoothed blend weights for the gaits.
    run: f64,
    sneak: f64,
    crouch: f64,
    air: f64,
    ride: f64,
    /// Landing compression: a damped spring on the pelvis.
    drop: f64,
    drop_v: f64,
    lean: f64,
    twist: f64,
    /// Gait cycle, 0..1: the left foot strikes at 0, the right at 0.5.
    phase: f64,
    /// Correction still to be worked into the phase.
    phase_err: f64,
    /// Smoothed ground speed.
    speed: f64,
    was_moving: bool,
    /// How far the hips have dropped to let a leg reach.
    sink: f64,
    interval: f64,
    started: bool,
}

fn yaw_fwd(yaw: f64) -> DVec3 {
    DVec3::new(-yaw.sin(), 0.0, -yaw.cos())
}

fn wrap(a: f64) -> f64 {
    let t = std::f64::consts::TAU;
    (a + std::f64::consts::PI).rem_euclid(t) - std::f64::consts::PI
}

fn ease(k: f64, dt: f64) -> f64 {
    1.0 - (-dt * k).exp()
}

/// Rotate `v` about unit `axis` by `ang`.
pub fn rotate(v: DVec3, axis: DVec3, ang: f64) -> DVec3 {
    let (s, c) = ang.sin_cos();
    v * c + axis.cross(v) * s + axis * axis.dot(v) * (1.0 - c)
}

/// Ankle to the ball of the foot, horizontally.
fn ball(p: &Proportions) -> f64 {
    p.foot * 0.62
}

/// A foot's ankle with the heel lifted `th` radians about the ball.
fn rolled_ankle(foot: &Foot, p: &Proportions, th: f64) -> DVec3 {
    let b = ball(p);
    let d = foot.dir;
    let ball_at = foot.at + d * b;
    let (sn, cs) = th.sin_cos();
    ball_at - d * (b * cs) + DVec3::Y * (b * sn) + (DVec3::Y * cs + d * sn) * p.ankle_height
}

/// Where a planted foot's ankle goes, rolling up onto the ball of the foot
/// if the hip is too far ahead to reach it flat (a trailing leg pushing off);
/// the toe joint, which does not move while the foot is down; and the roll.
fn heel_roll(foot: &Foot, hip: DVec3, p: &Proportions, reach: f64) -> (DVec3, DVec3, f64) {
    let toe = foot.at + foot.dir * ball(p) + DVec3::Y * (p.ankle_height * 0.3);
    let at = |th: f64| rolled_ankle(foot, p, th);
    let limit = p.leg() * reach;
    let flat = at(0.0);
    if (flat - hip).length() <= limit || (flat - hip).dot(foot.dir) >= 0.0 || !foot.planted {
        return (flat, toe, 0.0);
    }
    // Smallest heel lift that reaches, up to about 60 degrees.
    let (mut lo, mut hi) = (0.0, 1.05);
    if (at(hi) - hip).length() > limit {
        return (at(hi), toe, hi);
    }
    for _ in 0..14 {
        let mid = 0.5 * (lo + hi);
        if (at(mid) - hip).length() > limit { lo = mid } else { hi = mid }
    }
    (at(hi), toe, hi)
}

/// Two-bone IK: from `root` with bones `a` then `b`, reaching for `target`,
/// bending toward `pole`. Returns the middle joint and the (possibly
/// shortened) end point.
pub fn two_bone(root: DVec3, target: DVec3, a: f64, b: f64, pole: DVec3) -> (DVec3, DVec3) {
    let to = target - root;
    let d = to.length().clamp((a - b).abs() * 1.01 + 1e-4, (a + b) * 0.9995);
    let dir = if to.length_squared() > 1e-12 { to.normalize() } else { DVec3::NEG_Y };
    let end = root + dir * d;
    // Law of cosines for the angle at the root.
    let cos_a = ((a * a + d * d - b * b) / (2.0 * a * d)).clamp(-1.0, 1.0);
    let sin_a = (1.0 - cos_a * cos_a).sqrt();
    let mut side = pole - dir * pole.dot(dir);
    if side.length_squared() < 1e-9 {
        side = dir.any_orthonormal_vector();
    }
    let side = side.normalize();
    (root + dir * (a * cos_a) + side * (a * sin_a), end)
}

impl Animator {
    pub fn new(p: Proportions) -> Self {
        let f = Foot {
            at: DVec3::ZERO,
            planted: true,
            dir: DVec3::NEG_Z,
            lift: DVec3::ZERO,
            lift_dir: DVec3::NEG_Z,
            lift_q: 0.6,
            aim: DVec3::ZERO,
            lift_body: DVec3::ZERO,
            swing: 0.5,
            roll: 0.0,
            lift_roll: 0.0,
            settle: None,
        };
        Self {
            p,
            feet: [f, f],
            yaw: 0.0,
            run: 0.0,
            sneak: 0.0,
            crouch: 0.0,
            air: 0.0,
            ride: 0.0,
            drop: 0.0,
            drop_v: 0.0,
            lean: 0.0,
            twist: 0.0,
            phase: 0.0,
            phase_err: 0.0,
            speed: 0.0,
            was_moving: false,
            sink: 0.0,
            interval: 0.55,
            started: false,
        }
    }

    pub fn yaw(&self) -> f64 {
        self.yaw
    }

    /// Advance by `dt` and pose the figure. `ground(x, z)` is the surface
    /// height the feet stand on.
    pub fn update(&mut self, i: &AnimInput, dt: f64, ground: impl Fn(f64, f64) -> f64) -> Pose {
        let p = self.p;
        // As long a frame as the simulation will take (see world::tick).
        let dt = dt.clamp(1e-4, 0.25);
        let rel = i.vel - i.ground_vel;
        let hspeed = rel.x.hypot(rel.z);

        // Facing: where you are going, or where you look when still.
        let want_yaw = match i.activity {
            Activity::Ride { .. } => i.look_yaw,
            _ if hspeed > 0.35 && i.grounded => (-rel.x).atan2(-rel.z),
            _ => i.look_yaw,
        };
        if !self.started {
            self.yaw = want_yaw;
        }
        let turn = if hspeed > 0.35 { 7.0 } else { 3.0 };
        self.yaw = wrap(self.yaw + wrap(want_yaw - self.yaw) * ease(turn, dt));
        let fwd = yaw_fwd(self.yaw);
        let right = DVec3::new(-fwd.z, 0.0, fwd.x);

        // Blend weights.
        let target = |on: bool| if on { 1.0 } else { 0.0 };
        self.run += (target(i.gait == Gait::Run) - self.run) * ease(6.0, dt);
        self.sneak += (target(i.gait == Gait::Sandwalk) - self.sneak) * ease(5.0, dt);
        self.crouch += (i.crouch - self.crouch) * ease(10.0, dt);
        self.air += (target(!i.grounded) - self.air) * ease(12.0, dt);
        let riding = matches!(i.activity, Activity::Ride { .. });
        self.ride += (target(riding) - self.ride) * ease(5.0, dt);

        let side_of = |f: usize| if f == LEFT { -1.0 } else { 1.0 };
        let neutral = |f: usize, at: DVec3| {
            let stance = p.hip_half * (1.1 + 0.9 * self.ride);
            let stagger = if f == LEFT { 0.06 } else { -0.05 } * (1.0 + self.ride * 2.0);
            let q = at + right * side_of(f) * stance + fwd * stagger;
            DVec3::new(q.x, ground(q.x, q.z) as f64, q.z)
        };

        if !self.started {
            self.started = true;
            for f in 0..2 {
                self.feet[f].at = neutral(f, i.pos);
                self.feet[f].planted = true;
                self.feet[f].dir = fwd;
            }
        }

        // Planted feet ride along on moving ground.
        for f in 0..2 {
            if self.feet[f].planted {
                self.feet[f].at += i.ground_vel * dt;
                let g = ground(self.feet[f].at.x, self.feet[f].at.z);
                self.feet[f].at.y = g;
            }
        }

        // The stride's interval can change abruptly (every sandwalk step
        // draws a new one); the legs change pace smoothly.
        if !self.started {
            self.interval = i.step_interval;
        }
        self.interval += (i.step_interval.clamp(0.2, 2.5) - self.interval) * ease(4.0, dt);
        let interval = self.interval.clamp(0.2, 2.5);
        // Fraction of the two-step cycle each foot spends on the ground:
        // about 0.6 walking, under a third running (so both feet leave the
        // ground between steps), longer when creeping.
        let beta = (0.6 - 0.32 * self.run + 0.06 * self.sneak + 0.06 * self.crouch).clamp(0.25, 0.75);
        self.speed += (hspeed - self.speed) * ease(8.0, dt);
        // Ground the body covers while a foot is down.
        let sweep = (self.speed * beta * 2.0 * interval).min(1.6);
        // Land ahead of the hip by part of that, less when running (feet
        // land nearly under the body), so the leg can reach both ends.
        let lead = (sweep * (0.45 - 0.1 * self.run)).min(p.leg() * 0.55);

        if i.grounded && !riding {
            let moving = hspeed > 0.25;
            if moving {
                // One phase drives both feet: left strikes at 0, right at
                // 0.5. It runs at the stride's cadence and is nudged, never
                // jumped, toward each real footstrike so feet and sound agree.
                if i.strike.is_some() {
                    let near = if (self.phase - 0.5).abs() < 0.25 { 0.5 } else { 0.0 };
                    let mut e = near - self.phase;
                    if e < -0.5 {
                        e += 1.0;
                    }
                    self.phase_err = e;
                }
                if !self.was_moving {
                    // Setting off: the left foot steps first, from here.
                    self.phase = beta;
                    self.phase_err = 0.0;
                }
                // A stance foot left too far behind (setting off, speeding
                // up) hurries the other foot down rather than letting the
                // hips sink to reach it.
                let mut hurry: f64 = 0.0;
                for f in 0..2 {
                    if self.feet[f].planted && !self.feet[1 - f].planted {
                        let trail = (i.pos - self.feet[f].at).dot(fwd);
                        let limit = (sweep - lead).max(p.leg() * 0.5) + 0.12;
                        hurry = hurry.max((trail - limit) / p.leg());
                    }
                }
                let base = dt / (2.0 * interval) * (1.0 + 4.0 * hurry.clamp(0.0, 0.4));
                let extra = (self.phase_err * ease(5.0, dt)).clamp(-0.6 * base, 2.0 * base);
                self.phase_err -= extra;
                self.phase = (self.phase + base + extra).rem_euclid(1.0);
            } else {
                self.phase_err = 0.0;
            }
            self.was_moving = moving;
            let turn = self.feet_turn(i.pos, &neutral);
            for f in 0..2 {
                let offset = if f == LEFT { 0.0 } else { 0.5 };
                let q = (self.phase - offset).rem_euclid(1.0);
                let foot = &mut self.feet[f];
                if moving {
                    if foot.settle.take().is_some() || (foot.planted && q >= beta) {
                        foot.planted = false;
                        // Leave from wherever the rolled-up heel had got to.
                        foot.lift = rolled_ankle(foot, &p, foot.roll) - DVec3::Y * p.ankle_height;
                        foot.at = foot.lift;
                        foot.lift_roll = foot.roll;
                        foot.roll = 0.0;
                        foot.lift_dir = foot.dir;
                        foot.lift_q = q.max(beta).min(0.999);
                        foot.aim = foot.at;
                        foot.lift_body = DVec3::new(i.pos.x, foot.lift.y, i.pos.z);
                    }
                    if !foot.planted && q < beta {
                        // Touchdown.
                        foot.at.y = ground(foot.at.x, foot.at.z);
                        foot.planted = true;
                        foot.dir = fwd;
                        foot.roll = 0.0;
                    }
                    if !foot.planted {
                        let u = ((q - foot.lift_q) / (1.0 - foot.lift_q)).clamp(0.0, 1.0);
                        let remain = (1.0 - q) * 2.0 * interval;
                        let body_then = i.pos + rel * remain;
                        let aim = body_then + fwd * lead + right * side_of(f) * p.hip_half * 1.05;
                        let aim = DVec3::new(aim.x, ground(aim.x, aim.z), aim.z);
                        foot.aim += (aim - foot.aim) * if u < 0.05 { 1.0 } else { ease(8.0, dt) };
                        let s = u * u * (3.0 - 2.0 * u);
                        // Walking, the foot skims from where it left to
                        // where it will land, just clear of the sand.
                        let world = foot.lift.lerp(foot.aim, s);
                        // Running, the swing is a loop about the hips: the
                        // heel kicks up behind toward the seat, and the knee
                        // drives the foot through to land under the body.
                        let from = foot.lift - foot.lift_body;
                        let to = fwd * lead + right * side_of(f) * p.hip_half * 1.05;
                        let sr = { let v = u.powf(1.25); v * v * (3.0 - 2.0 * v) };
                        let body = i.pos + from.lerp(to, sr);
                        let mut at = world.lerp(body, self.run);
                        at.y = ground(at.x, at.z);
                        let clear = 0.07 + 0.38 * self.run + 0.06 * self.sneak;
                        let peak = 1.0 - 0.3 * self.run;
                        at.y += (u.powf(peak) * std::f64::consts::PI).sin() * clear;
                        foot.at = at;
                        foot.dir = foot.lift_dir.lerp(fwd, s).normalize_or(fwd);
                        foot.swing = u;
                    }
                } else {
                    // Standing: bring a stray foot back under the hip with a
                    // small step, one foot at a time.
                    let home = neutral(f, i.pos);
                    match foot.settle {
                        Some((t, dur, from)) => {
                            let u = ((t + dt) / dur).min(1.0);
                            let s = u * u * (3.0 - 2.0 * u);
                            let mut at = from.lerp(home, s);
                            at.y += (u * std::f64::consts::PI).sin() * 0.05;
                            foot.at = at;
                            foot.dir = foot.dir.lerp(fwd, s).normalize_or(fwd);
                            foot.planted = u >= 1.0;
                            foot.settle = if u >= 1.0 { None } else { Some((t + dt, dur, from)) };
                        }
                        None => {
                            if !foot.planted {
                                foot.settle = Some((0.0, 0.25, foot.at));
                            } else if ((foot.at - home).length() > 0.2 || foot.dir.dot(fwd) < 0.8) && f == turn {
                                foot.planted = false;
                                foot.settle = Some((0.0, 0.32, foot.at));
                            }
                        }
                    }
                    foot.swing = 0.5;
                }
            }
        } else if riding {
            // Braced on the ropes: a wide stance that rides with the worm.
            self.was_moving = false;
            for f in 0..2 {
                let home = neutral(f, i.pos);
                let foot = &mut self.feet[f];
                if (foot.at - home).length() > 0.35 || !foot.planted {
                    foot.at = foot.at.lerp(home, ease(10.0, dt));
                    foot.planted = (foot.at - home).length() < 0.05;
                }
                foot.dir = foot.dir.lerp(fwd, ease(10.0, dt)).normalize_or(fwd);
                foot.swing = 0.5;
            }
        } else {
            // In the air: legs gather up under the body.
            self.was_moving = false;
            for f in 0..2 {
                let foot = &mut self.feet[f];
                foot.planted = false;
                foot.settle = None;
                let tuck = i.pos + right * side_of(f) * p.hip_half + fwd * if f == LEFT { 0.12 } else { -0.18 }
                    + DVec3::Y * (0.18 + 0.12 * (1.0 - self.run));
                foot.at = foot.at.lerp(tuck, ease(10.0, dt));
                foot.dir = foot.dir.lerp(fwd, ease(10.0, dt)).normalize_or(fwd);
                foot.swing = 0.6;
            }
        }
        if let Some(v) = i.landed {
            // Soak up the landing in the knees.
            self.drop_v += v.min(9.0) * 0.18;
            for f in 0..2 {
                let foot = &mut self.feet[f];
                foot.at.y = ground(foot.at.x, foot.at.z);
                foot.planted = true;
            }
        }
        // The spring settles the compression.
        self.drop_v += (-self.drop * 90.0 - self.drop_v * 14.0) * dt;
        self.drop = (self.drop + self.drop_v * dt).clamp(-0.05, 0.35);

        // --- pelvis -----------------------------------------------------------
        let g_here = ground(i.pos.x, i.pos.z);
        // Per-step phase, 0 at each footstrike. Walking vaults over a stiff
        // leg, highest at mid-stance; running compresses into it, lowest
        // there and highest in flight.
        let step_phase = (self.phase * 2.0).fract();
        let moving_w = ((self.speed - 0.2) / 0.5).clamp(0.0, 1.0) * (1.0 - self.air);
        let bob = moving_w * (0.02 + 0.025 * self.run) * (1.0 - 2.0 * self.run) * (std::f64::consts::TAU * (step_phase - beta)).cos();
        let body_y = if i.grounded { g_here } else { i.pos.y };
        let mut pelvis_y = body_y + p.hip_height - 0.36 * self.crouch - 0.11 * self.sneak - 0.05 * self.run - 0.14 * self.ride + bob - self.drop;
        // Sway over the planted foot.
        let sway = -0.025 * moving_w * (std::f64::consts::TAU * (self.phase - beta * 0.5)).cos() * (1.0 - self.run * 0.6);
        let mut pelvis = DVec3::new(i.pos.x, pelvis_y, i.pos.z) + right * sway;
        // Never overstretch a planted leg: drop the pelvis until it reaches
        // (but not into a squat: past that the foot is about to lift). The
        // hips sink at once when they must and rise again smoothly, so a
        // foot leaving the ground does not pop them up.
        let mut need: f64 = 0.0;
        for f in 0..2 {
            let hip = pelvis + right * side_of(f) * p.hip_half;
            // A trailing foot rolls up onto its ball before the hips sink.
            let (ankle, _, _) = heel_roll(&self.feet[f], hip, &p, 0.97);
            let horiz = DVec3::new(hip.x - ankle.x, 0.0, hip.z - ankle.z).length();
            let reach = p.leg() * 0.985;
            if horiz < reach && self.feet[f].planted {
                let max_y = ankle.y + (reach * reach - horiz * horiz).sqrt();
                need = need.max((hip.y - max_y).clamp(0.0, 0.14));
            }
        }
        self.sink = if need > self.sink { need } else { self.sink + (need - self.sink) * ease(9.0, dt) };
        pelvis_y -= self.sink;
        pelvis.y = pelvis_y;

        // --- spine ----------------------------------------------------------
        let accel_lean = 0.0;
        let want_lean = 0.05 + 0.2 * self.run + 0.16 * self.sneak + 0.42 * self.crouch + 0.1 * self.ride + accel_lean;
        self.lean += (want_lean - self.lean) * ease(6.0, dt);
        let up = (DVec3::Y + fwd * self.lean).normalize();
        // Shoulders turn against the hips as the legs swing.
        let lf = (self.feet[LEFT].at - pelvis).dot(fwd);
        let rf = (self.feet[RIGHT].at - pelvis).dot(fwd);
        let want_twist = ((lf - rf) * 0.35 * (1.0 + 0.6 * self.run)).clamp(-0.35, 0.35) * (1.0 - self.ride);
        self.twist += (want_twist - self.twist) * ease(12.0, dt);
        let chest_fwd = rotate(fwd, up, -self.twist).normalize();
        let chest_right = DVec3::new(-chest_fwd.z, 0.0, chest_fwd.x).normalize();
        let waist = pelvis + up * (p.waist_height - p.hip_height);
        let chest = waist + up * (p.chest_height - p.waist_height);
        let neck = chest + up * (p.neck_height - p.chest_height);
        // The head looks where the camera does, within a comfortable range.
        let look_rel = wrap(i.look_yaw - self.yaw).clamp(-1.2, 1.2);
        let look_flat = rotate(fwd, DVec3::Y, look_rel);
        let look_right = DVec3::new(-look_flat.z, 0.0, look_flat.x);
        let look = rotate(look_flat, look_right, -i.look_pitch.clamp(-0.8, 0.7)).normalize();
        let head_up = (up + DVec3::Y * 0.5 + look * 0.15).normalize();
        let head = neck + head_up * (p.head_centre - p.neck_height);

        // --- legs -------------------------------------------------------------
        let mut jnt = [DVec3::ZERO; j::COUNT];
        jnt[j::PELVIS] = pelvis;
        jnt[j::WAIST] = waist;
        jnt[j::CHEST] = chest;
        jnt[j::NECK] = neck;
        jnt[j::HEAD] = head;
        for f in 0..2 {
            let s = side_of(f);
            let hip = pelvis + right * s * p.hip_half;
            let foot = &mut self.feet[f];
            let (ankle_goal, toe) = if foot.planted {
                let (a, t, th) = heel_roll(foot, hip, &p, 0.985);
                foot.roll = th;
                (a, t)
            } else {
                // Swinging, the toe hangs after lift-off and comes up level
                // just before the foot lands.
                let u = foot.swing;
                let hang = foot.lift_roll.max(0.35) * (1.0 - self.air);
                let pitch = -hang * (1.0 - u) * (1.0 - u) + 0.08 * u;
                let side = DVec3::new(-foot.dir.z, 0.0, foot.dir.x);
                let d = rotate(foot.dir, side, pitch);
                let ankle = foot.at + DVec3::Y * p.ankle_height;
                (ankle, ankle + d * ball(&p) - DVec3::Y * (p.ankle_height * 0.7))
            };
            // Knees forward and a touch outward.
            let pole = fwd + right * s * 0.15 + up * 0.1;
            let (knee, ankle) = two_bone(hip, ankle_goal, p.thigh, p.shank, pole);
            // A swinging toe hangs from wherever the leg actually got to,
            // and never dips into the sand.
            let toe = if foot.planted {
                toe
            } else {
                let mut t = toe + (ankle - ankle_goal);
                t.y = t.y.max(ground(t.x, t.z) + 0.01);
                t
            };
            jnt[j::HIP[f]] = hip;
            jnt[j::KNEE[f]] = knee;
            jnt[j::ANKLE[f]] = ankle;
            jnt[j::TOE[f]] = toe;
        }

        // --- arms -------------------------------------------------------------
        let shoulder_c = chest + up * (p.shoulder_height - p.chest_height);
        for f in 0..2 {
            let s = side_of(f);
            let shoulder = shoulder_c + chest_right * s * p.shoulder_half;
            let (elbow, wrist, fingers) = match i.activity {
                Activity::Ride { hands } => {
                    let goal = hands[f];
                    let pole = -up * 0.6 + chest_right * s * 0.8 - chest_fwd * 0.3;
                    let (e, w) = two_bone(shoulder, goal, p.upper_arm, p.forearm, pole);
                    let d = (w - e).normalize_or_zero();
                    (e, w, w + d * p.hand * 0.8)
                }
                _ => {
                    // Swing against the leg on the same side.
                    // Each arm is forward when the opposite foot is: the
                    // right foot strikes at phase 0.5, the left at 0.
                    let amp = moving_w * (0.18 + 0.1 * self.speed.min(2.0) + 0.45 * self.run);
                    let mut swing = amp * (std::f64::consts::TAU * self.phase).cos() * side_of(f);
                    swing *= 1.0 - 0.7 * self.sneak;
                    let abduct = 0.1 + 0.35 * self.sneak + 0.12 * self.crouch + 0.1 * self.air;
                    let flex = 0.25 + 1.2 * self.run + 0.5 * self.sneak + 0.6 * self.crouch + 0.3 * self.air;
                    let mut upper = rotate(-up, chest_right, swing);
                    upper = rotate(upper, chest_fwd, s * abduct).normalize();
                    // Special actions override one or both arms.
                    let (upper, flex) = match i.activity {
                        Activity::Throw { right, t } if (f == RIGHT) == right => {
                            // Wind back, then whip forward and up.
                            let k = (t / 0.45).min(1.0);
                            let ang = if k < 0.4 { -2.2 * (k / 0.4) } else { -2.2 + 4.0 * ((k - 0.4) / 0.6) };
                            (rotate(-up, chest_right, -ang).normalize(), 0.4 * (1.0 - k))
                        }
                        Activity::Plant { t } => {
                            // Both hands down to the stake in front.
                            let k = (t / 0.5).min(1.0);
                            let reach = (fwd * 0.9 - up * 0.6 + chest_right * s * -0.15).normalize();
                            (upper.lerp(reach, k).normalize(), 0.3)
                        }
                        _ => (upper, flex),
                    };
                    let e = shoulder + upper * p.upper_arm;
                    let fore = rotate(upper, chest_right, flex).normalize();
                    let w = e + fore * p.forearm;
                    (e, w, w + fore * p.hand * 0.8)
                }
            };
            jnt[j::SHOULDER[f]] = shoulder;
            jnt[j::ELBOW[f]] = elbow;
            jnt[j::WRIST[f]] = wrist;
            jnt[j::FINGERS[f]] = fingers;
        }

        Pose { j: jnt, fwd, up, chest_fwd, look, planted: [self.feet[LEFT].planted, self.feet[RIGHT].planted] }
    }

    /// Which foot should settle first when standing: the one furthest from
    /// where it should be.
    fn feet_turn(&self, at: DVec3, neutral: &impl Fn(usize, DVec3) -> DVec3) -> usize {
        let d0 = (self.feet[LEFT].at - neutral(LEFT, at)).length();
        let d1 = (self.feet[RIGHT].at - neutral(RIGHT, at)).length();
        if d0 >= d1 { LEFT } else { RIGHT }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::gait::Stride;
    use crate::player::{GroundHit, Player, PlayerInput};

    fn flat(_: f64, _: f64) -> f64 {
        0.0
    }

    fn input(pl: &Player, st: &Stride, strike: Option<bool>) -> AnimInput {
        AnimInput {
            pos: pl.pos,
            vel: pl.vel,
            ground_vel: DVec3::ZERO,
            look_yaw: 0.0,
            look_pitch: 0.0,
            gait: pl.gait,
            grounded: pl.grounded,
            crouch: pl.crouch,
            step_interval: st.interval(),
            last_left: st.last_left(),
            strike,
            landed: None,
            activity: Activity::Move,
        }
    }

    #[test]
    fn proportions_follow_the_table() {
        let p = Proportions::of_height(1.78);
        assert!((p.thigh - 0.436).abs() < 0.001 && (p.shank - 0.438).abs() < 0.001);
        assert!((p.upper_arm + p.forearm + p.hand - 0.44 * 1.78).abs() < 0.01);
        // Standing, hip height is thigh + shank + ankle height (to within a
        // centimetre or two — the table is from different sources of error).
        assert!((p.hip_height - (p.leg() + p.ankle_height)).abs() < 0.02);
    }

    #[test]
    fn two_bone_ik_keeps_lengths_and_reaches() {
        let root = DVec3::new(0.0, 1.0, 0.0);
        for target in [DVec3::new(0.2, 0.2, 0.1), DVec3::new(0.0, 0.3, 0.3), DVec3::new(0.0, -2.0, 0.0)] {
            let (mid, end) = two_bone(root, target, 0.44, 0.44, DVec3::Z);
            assert!(((mid - root).length() - 0.44).abs() < 1e-6);
            assert!(((end - mid).length() - 0.44).abs() < 1e-6);
            if (target - root).length() < 0.87 {
                assert!((end - target).length() < 1e-6);
            }
            // Bends toward the pole.
            assert!((mid - root).dot(DVec3::Z) >= -1e-9);
        }
    }

    fn walk(gait_input: PlayerInput, secs: f64) -> (Vec<Pose>, Animator) {
        let dt = 1.0 / 60.0;
        let mut pl = Player::new(DVec3::ZERO);
        pl.grounded = true;
        let mut st = Stride::new(3);
        let mut an = Animator::new(Proportions::of_height(1.78));
        let mut poses = vec![];
        let mut t = 0.0;
        while t < secs {
            pl.step(&gait_input, dt, |_, _| GroundHit::still(0.0, DVec3::Y));
            let speed = pl.vel.x.hypot(pl.vel.z);
            let strike = st.update(pl.gait, speed, dt).map(|s| s.left);
            poses.push(an.update(&input(&pl, &st, strike), dt, flat));
            t += dt;
        }
        (poses, an)
    }

    #[test]
    fn planted_feet_do_not_skate_and_legs_never_overstretch() {
        let (poses, an) = walk(PlayerInput { forward: 1.0, ..Default::default() }, 10.0);
        let p = an.p;
        let mut planted_frames = 0;
        for w in poses.windows(2).skip(60) {
            for f in 0..2 {
                if w[0].planted[f] && w[1].planted[f] {
                    planted_frames += 1;
                    // The ball of the foot stays put; the heel may roll up.
                    let slide = (w[1].j[j::TOE[f]] - w[0].j[j::TOE[f]]).length();
                    assert!(slide < 0.01, "planted foot moved {slide:.3} m in a frame");
                }
            }
        }
        assert!(planted_frames > 300);
        for pose in &poses {
            for f in 0..2 {
                let leg = (pose.j[j::HIP[f]] - pose.j[j::KNEE[f]]).length() + (pose.j[j::KNEE[f]] - pose.j[j::ANKLE[f]]).length();
                assert!((leg - p.leg()).abs() < 1e-6, "bones keep their length");
                assert!(pose.j.iter().all(|q| q.is_finite()));
            }
        }
    }

    #[test]
    fn feet_alternate_and_both_step() {
        let (poses, _) = walk(PlayerInput { forward: 1.0, ..Default::default() }, 8.0);
        let lifts = |f: usize| poses.windows(2).filter(|w| w[0].planted[f] && !w[1].planted[f]).count();
        assert!(lifts(LEFT) >= 5 && lifts(RIGHT) >= 5, "{} {}", lifts(LEFT), lifts(RIGHT));
        // Walking always has a foot down.
        assert!(poses.iter().skip(60).all(|p| p.planted[0] || p.planted[1]));
    }

    #[test]
    fn running_has_a_flight_phase() {
        let (poses, _) = walk(PlayerInput { forward: 1.0, run: true, ..Default::default() }, 8.0);
        let flights = poses.iter().skip(120).filter(|p| !p.planted[0] && !p.planted[1]).count();
        assert!(flights > 20, "{flights} frames with both feet off the ground");
    }

    #[test]
    fn motion_is_continuous_through_changes() {
        let dt = 1.0 / 60.0;
        let mut pl = Player::new(DVec3::ZERO);
        pl.grounded = true;
        let mut st = Stride::new(5);
        let mut an = Animator::new(Proportions::of_height(1.78));
        let mut last: Option<Pose> = None;
        for k in 0..(60 * 16) {
            let t = k as f64 * dt;
            let inp = match (t / 4.0) as i64 {
                0 => PlayerInput { forward: 1.0, ..Default::default() },
                1 => PlayerInput { forward: 1.0, run: true, ..Default::default() },
                2 => PlayerInput { forward: 1.0, sandwalk: true, ..Default::default() },
                _ => PlayerInput::default(),
            };
            let f = st.speed_factor(pl.gait);
            let mut i2 = inp;
            i2.forward *= f;
            pl.step(&i2, dt, |_, _| GroundHit::still(0.0, DVec3::Y));
            let speed = pl.vel.x.hypot(pl.vel.z);
            let strike = st.update(pl.gait, speed, dt).map(|s| s.left);
            let pose = an.update(&input(&pl, &st, strike), dt, flat);
            if let Some(prev) = &last {
                for q in 0..j::COUNT {
                    // Relative to the body, nothing jumps between frames.
                    let a = prev.j[q] - prev.j[j::PELVIS];
                    let b = pose.j[q] - pose.j[j::PELVIS];
                    assert!((a - b).length() < 0.25, "joint {q} jumped {:.2} m at t {t:.2}", (a - b).length());
                }
            }
            last = Some(pose);
        }
        // Standing at the end: both feet down, under the hips.
        let p = last.unwrap();
        assert!(p.planted[0] && p.planted[1]);
        let w = (p.j[j::ANKLE[0]] - p.j[j::ANKLE[1]]).length();
        assert!(w > 0.1 && w < 0.4, "stance width {w:.2}");
    }

    #[test]
    fn standing_tall_the_head_is_near_the_top() {
        let (poses, an) = walk(PlayerInput::default(), 2.0);
        let pose = poses.last().unwrap();
        let top = pose.j[j::HEAD].y + 0.115;
        assert!((top - an.p.height).abs() < 0.08, "head top at {top:.2}");
    }
}
