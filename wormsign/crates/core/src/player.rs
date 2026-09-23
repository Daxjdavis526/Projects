//! The player's body: a small kinematic walker on an arbitrary ground.
//!
//! No physics engine. The player is a point at the feet with a velocity,
//! gravity, and a ground query that answers "how high is the ground here and
//! which way does it face". Sand today; the worm's back, which moves, later —
//! which is why the ground reports its own velocity.
//!
//! Speeds are deliberately slow. Soft sand is hard going, and the player is
//! meant to feel small: a run is 5.5 m/s, a dune slip face is barely
//! climbable, and a 60 m dune is a real obstacle.

use glam::DVec3;

pub const GRAVITY: f64 = 9.81;
pub const WALK: f64 = 1.7;
pub const RUN: f64 = 5.5;
pub const CROUCH: f64 = 0.9;
pub const SANDWALK: f64 = 1.15;
pub const JUMP_SPEED: f64 = 4.3;
/// Loose dry sand will not stand steeper than about this.
pub const REPOSE: f64 = 33f64.to_radians();
pub const EYE_STAND: f64 = 1.62;
pub const EYE_CROUCH: f64 = 1.0;

#[derive(Clone, Copy, Debug, Default)]
pub struct PlayerInput {
    /// Desired movement in the player's frame, each in -1..=1.
    pub forward: f64,
    pub right: f64,
    /// Heading, radians; 0 looks down -z.
    pub yaw: f64,
    pub run: bool,
    pub crouch: bool,
    pub sandwalk: bool,
    pub jump: bool,
}

/// What the player is standing on at some point.
#[derive(Clone, Copy, Debug)]
pub struct GroundHit {
    pub height: f64,
    pub normal: DVec3,
    /// Velocity of the surface itself: zero for sand, the worm's for the worm.
    pub velocity: DVec3,
    /// How hard feet can push against it, m/s^2.
    pub grip: f64,
    /// Steepest it can be stood on.
    pub repose: f64,
    /// It is a worm's back.
    pub worm: bool,
}

impl GroundHit {
    pub fn still(height: f64, normal: DVec3) -> Self {
        Self { height, normal, velocity: DVec3::ZERO, grip: SAND_GRIP, repose: REPOSE, worm: false }
    }

    /// A worm's hide: slick, curved, and moving.
    pub fn hide(height: f64, normal: DVec3, velocity: DVec3) -> Self {
        Self { height, normal, velocity, grip: HIDE_GRIP, repose: HIDE_REPOSE, worm: true }
    }
}

pub const SAND_GRIP: f64 = 16.0;
/// Ring-plated hide gives some purchase, much less than sand.
pub const HIDE_GRIP: f64 = 6.0;
pub const HIDE_REPOSE: f64 = 26f64.to_radians();

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Gait {
    Still,
    Walk,
    Run,
    Crouch,
    Sandwalk,
    Air,
}

#[derive(Clone, Debug)]
pub struct Player {
    pub pos: DVec3,
    pub vel: DVec3,
    pub grounded: bool,
    /// 0 standing .. 1 fully crouched, eased.
    pub crouch: f64,
    pub gait: Gait,
    /// Seconds since last leaving the ground.
    pub air_time: f64,
}

/// Things that happened during a step that other systems care about.
#[derive(Clone, Copy, Debug, Default)]
pub struct StepReport {
    /// Downward speed at touchdown, if the player landed this step.
    pub landed: Option<f64>,
    pub jumped: bool,
}

impl Player {
    pub fn new(pos: DVec3) -> Self {
        Self { pos, vel: DVec3::ZERO, grounded: false, crouch: 0.0, gait: Gait::Air, air_time: 0.0 }
    }

    pub fn eye_height(&self) -> f64 {
        EYE_STAND + (EYE_CROUCH - EYE_STAND) * self.crouch
    }

    /// Advance by `dt`. `ground(x, z)` is queried at the player's position.
    pub fn step(&mut self, input: &PlayerInput, dt: f64, ground: impl Fn(f64, f64) -> GroundHit) -> StepReport {
        let mut report = StepReport::default();
        let want_crouch = if input.crouch { 1.0 } else { 0.0 };
        self.crouch += (want_crouch - self.crouch) * (1.0 - (-dt * 10.0).exp());

        // Desired horizontal velocity in world space.
        let (s, c) = input.yaw.sin_cos();
        let fwd = DVec3::new(-s, 0.0, -c);
        let right = DVec3::new(c, 0.0, -s);
        let mut dir = fwd * input.forward + right * input.right;
        if dir.length_squared() > 1.0 {
            dir = dir.normalize();
        }
        let moving = dir.length_squared() > 1e-4;
        let speed = if input.crouch {
            CROUCH
        } else if input.sandwalk {
            SANDWALK
        } else if input.run {
            RUN
        } else {
            WALK
        };

        let g = ground(self.pos.x, self.pos.z);
        if self.grounded {
            // Work relative to the surface we stand on.
            let rel = self.vel - g.velocity;
            let mut target = dir * speed;

            // Uphill in sand is slow; along the slope's fall line only.
            let n = g.normal;
            let downhill = DVec3::new(n.x, 0.0, n.z);
            let slope = n.y.clamp(-1.0, 1.0).acos();
            if moving && downhill.length_squared() > 1e-9 {
                let up_component = -dir.normalize().dot(downhill.normalize()); // +1 straight uphill
                let grade = slope.tan() * up_component.max(0.0);
                target *= (1.0 - grade * 1.4).clamp(0.25, 1.0);
            }

            // Ground friction pulls toward the target velocity.
            // On a face steeper than repose the sand itself is moving (or
            // the hide is too steep to stand on), so feet get little
            // purchase. Crouching lowers you and grips better.
            let failing = ((slope - g.repose) / 0.12).clamp(0.0, 1.0);
            let stance = 1.0 + 0.6 * self.crouch;
            let accel = g.grip * if moving { 0.9 } else { 1.1 } * stance * (1.0 - 0.85 * failing);
            let mut hrel = DVec3::new(rel.x, 0.0, rel.z);
            let delta = target - hrel;
            let max = accel * dt;
            hrel += if delta.length() > max { delta.normalize() * max } else { delta };

            // Past the angle of repose the sand gives way and you slide.
            if slope > g.repose && downhill.length_squared() > 1e-9 {
                hrel += downhill.normalize() * GRAVITY * slope.sin() * failing * dt;
            }

            self.vel = g.velocity + hrel;
            self.vel.y = g.velocity.y;

            if input.jump && self.crouch < 0.5 {
                self.vel.y += JUMP_SPEED;
                self.grounded = false;
                self.air_time = 0.0;
                report.jumped = true;
            }
        } else {
            // A little air control, no more.
            let h = DVec3::new(self.vel.x, 0.0, self.vel.z);
            let target = dir * speed;
            let delta = target - h;
            let max = 1.5 * dt;
            let dv = if delta.length() > max { delta.normalize() * max } else { delta };
            if moving {
                self.vel += dv;
            }
            self.vel.y -= GRAVITY * dt;
            self.air_time += dt;
        }

        self.pos += self.vel * dt;

        // Ground contact at the new position.
        let g2 = ground(self.pos.x, self.pos.z);
        if self.pos.y <= g2.height {
            if !self.grounded {
                report.landed = Some((g2.velocity.y - self.vel.y).max(0.0));
                // The impact itself soaks up part of any mismatch with a
                // moving surface; the rest is a slide.
                let rel = self.vel - g2.velocity;
                let h = DVec3::new(rel.x, 0.0, rel.z);
                self.vel -= h * 0.45;
            }
            self.pos.y = g2.height;
            self.grounded = true;
            self.air_time = 0.0;
        } else if self.grounded && !report.jumped {
            // Walking over a crest: stick to the ground unless it drops away
            // faster than a step can follow.
            let gap = self.pos.y - g2.height;
            if gap < 0.35 + self.vel.length() * dt * 0.8 {
                self.pos.y = g2.height;
            } else {
                self.grounded = false;
            }
        }

        let hspeed = DVec3::new(self.vel.x - g2.velocity.x, 0.0, self.vel.z - g2.velocity.z).length();
        self.gait = if !self.grounded {
            Gait::Air
        } else if hspeed < 0.2 {
            Gait::Still
        } else if input.crouch {
            Gait::Crouch
        } else if input.sandwalk {
            Gait::Sandwalk
        } else if input.run && hspeed > WALK * 1.3 {
            Gait::Run
        } else {
            Gait::Walk
        };
        report
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn flat(_: f64, _: f64) -> GroundHit {
        GroundHit::still(0.0, DVec3::Y)
    }

    fn run_for(p: &mut Player, input: &PlayerInput, secs: f64, ground: impl Fn(f64, f64) -> GroundHit + Copy) {
        let dt = 1.0 / 60.0;
        for _ in 0..(secs / dt) as usize {
            p.step(input, dt, ground);
        }
    }

    #[test]
    fn falls_and_lands() {
        let mut p = Player::new(DVec3::new(0.0, 5.0, 0.0));
        let mut landed = None;
        for _ in 0..200 {
            let r = p.step(&PlayerInput::default(), 1.0 / 60.0, flat);
            landed = landed.or(r.landed);
        }
        assert!(p.grounded && p.pos.y == 0.0);
        let v = landed.expect("should report the landing");
        assert!((v - (2.0 * GRAVITY * 5.0).sqrt()).abs() < 0.5, "impact {v}");
    }

    #[test]
    fn gaits_reach_their_speeds() {
        for (input, want, gait) in [
            (PlayerInput { forward: 1.0, ..Default::default() }, WALK, Gait::Walk),
            (PlayerInput { forward: 1.0, run: true, ..Default::default() }, RUN, Gait::Run),
            (PlayerInput { forward: 1.0, sandwalk: true, ..Default::default() }, SANDWALK, Gait::Sandwalk),
            (PlayerInput { forward: 1.0, crouch: true, ..Default::default() }, CROUCH, Gait::Crouch),
        ] {
            let mut p = Player::new(DVec3::ZERO);
            p.grounded = true;
            run_for(&mut p, &input, 2.0, flat);
            let v = DVec3::new(p.vel.x, 0.0, p.vel.z).length();
            assert!((v - want).abs() < 0.05, "{gait:?}: {v} vs {want}");
            assert_eq!(p.gait, gait);
        }
    }

    #[test]
    fn yaw_zero_walks_down_negative_z() {
        let mut p = Player::new(DVec3::ZERO);
        p.grounded = true;
        run_for(&mut p, &PlayerInput { forward: 1.0, ..Default::default() }, 1.0, flat);
        assert!(p.pos.z < -0.5 && p.pos.x.abs() < 1e-9);
    }

    #[test]
    fn jump_goes_up_and_comes_down() {
        let mut p = Player::new(DVec3::ZERO);
        p.grounded = true;
        let r = p.step(&PlayerInput { jump: true, ..Default::default() }, 1.0 / 60.0, flat);
        assert!(r.jumped && !p.grounded);
        let mut peak: f64 = 0.0;
        for _ in 0..120 {
            p.step(&PlayerInput::default(), 1.0 / 60.0, flat);
            peak = peak.max(p.pos.y);
        }
        assert!(p.grounded);
        let want = JUMP_SPEED * JUMP_SPEED / (2.0 * GRAVITY);
        assert!((peak - want).abs() < 0.1, "peak {peak} vs {want}");
    }

    #[test]
    fn uphill_is_slower_than_flat() {
        // 20 degree slope rising toward -z.
        let t = 20f64.to_radians().tan();
        let slope = move |_x: f64, z: f64| GroundHit::still(-z * t, DVec3::new(0.0, 1.0, t).normalize());
        let mut up = Player::new(DVec3::ZERO);
        up.grounded = true;
        let input = PlayerInput { forward: 1.0, run: true, ..Default::default() };
        run_for(&mut up, &input, 3.0, slope);
        let mut level = Player::new(DVec3::ZERO);
        level.grounded = true;
        run_for(&mut level, &input, 3.0, flat);
        assert!(up.pos.z > level.pos.z * 0.8, "uphill {} flat {}", up.pos.z, level.pos.z);
        assert!(up.pos.y > 1.0, "should have climbed");
    }

    #[test]
    fn slides_down_a_slip_face() {
        let t = 42f64.to_radians().tan();
        let steep = move |x: f64, _z: f64| GroundHit::still(x * t, DVec3::new(-t, 1.0, 0.0).normalize());
        let mut p = Player::new(DVec3::new(0.0, 0.0, 0.0));
        p.grounded = true;
        run_for(&mut p, &PlayerInput::default(), 2.0, steep);
        assert!(p.pos.x < -1.0, "should slide downhill, x = {}", p.pos.x);
    }

    #[test]
    fn carried_by_a_moving_floor() {
        let belt = |_: f64, _: f64| GroundHit { velocity: DVec3::new(10.0, 0.0, 0.0), ..GroundHit::still(0.0, DVec3::Y) };
        let mut p = Player::new(DVec3::ZERO);
        p.grounded = true;
        p.vel = DVec3::new(10.0, 0.0, 0.0);
        run_for(&mut p, &PlayerInput::default(), 1.0, belt);
        assert!((p.pos.x - 10.0).abs() < 0.3, "x = {}", p.pos.x);
    }
}
