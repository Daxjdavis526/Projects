//! Maker hooks: a barbed hook on a rope, thrown into a worm's hide.
//!
//! In flight a hook is a projectile. When it touches the hide it anchors in
//! the worm's own coordinates — metres behind the head and an angle around
//! the body measured in the hide — so the anchor travels, bends and rolls
//! with the worm instead of staying at a point in the world.
//!
//! The rope is a one-sided distance constraint: it can go slack, it cannot
//! stretch. When it is taut it pulls the rider along with the worm, and the
//! velocity it has to remove to stay taut is the rope's tension, which is
//! what the rider uses to pry at the worm.

use crate::worm::Worm;
use glam::DVec3;

pub const THROW_SPEED: f64 = 48.0;
/// Rope on the reel.
pub const MAX_ROPE: f64 = 30.0;
pub const MIN_ROPE: f64 = 1.2;
/// How fast the reel takes in or pays out, m/s.
pub const REEL_SPEED: f64 = 3.5;

#[derive(Clone, Copy, Debug, PartialEq)]
pub enum HookState {
    Stowed,
    Flying { pos: DVec3, vel: DVec3, travelled: f64 },
    /// In the hide at `d` metres behind the head, `angle` around the body.
    Anchored { d: f64, angle: f64, len: f64 },
}

#[derive(Clone, Copy, Debug)]
pub struct Hook {
    pub state: HookState,
    /// Tension from the last constraint pass: velocity removed per second,
    /// so in m/s^2. Zero when slack.
    pub tension: f64,
}

impl Default for Hook {
    fn default() -> Self {
        Self { state: HookState::Stowed, tension: 0.0 }
    }
}

impl Hook {
    pub fn anchored(&self) -> bool {
        matches!(self.state, HookState::Anchored { .. })
    }

    /// Throw from `from` along `dir`, adding the thrower's own velocity.
    pub fn throw(&mut self, from: DVec3, dir: DVec3, carry: DVec3) {
        self.state = HookState::Flying { pos: from, vel: dir.normalize_or_zero() * THROW_SPEED + carry, travelled: 0.0 };
        self.tension = 0.0;
    }

    pub fn release(&mut self) {
        self.state = HookState::Stowed;
        self.tension = 0.0;
    }

    /// Where the hook is, if it is out.
    pub fn position(&self, worm: Option<&Worm>) -> Option<DVec3> {
        match self.state {
            HookState::Stowed => None,
            HookState::Flying { pos, .. } => Some(pos),
            HookState::Anchored { d, angle, .. } => worm.map(|w| w.skin_point(d, angle)),
        }
    }

    pub fn reel(&mut self, amount: f64) {
        if let HookState::Anchored { len, .. } = &mut self.state {
            *len = (*len + amount).clamp(MIN_ROPE, MAX_ROPE);
        }
    }

    /// Fly, and bite if the hide is reached. `ground(x, z)` stops a throw
    /// that hits sand.
    pub fn fly(&mut self, dt: f64, worm: Option<&Worm>, ground: impl Fn(f64, f64) -> f64) {
        let HookState::Flying { pos, vel, travelled } = self.state else { return };
        let mut v = vel;
        v.y -= 9.81 * dt;
        let step = v * dt;
        // Sub-sample so a fast hook cannot skip through the hide.
        let n = (step.length() / 0.5).ceil().max(1.0) as usize;
        for k in 1..=n {
            let p = pos + step * (k as f64 / n as f64);
            if let Some(w) = worm {
                if let Some(hit) = w.surface(p) {
                    if hit.gap < 0.4 {
                        let angle = w.skin_angle(hit.d, hit.normal);
                        // Rope length: whatever has run out, so it starts taut.
                        let len = (travelled + step.length() * k as f64 / n as f64).clamp(MIN_ROPE, MAX_ROPE);
                        self.state = HookState::Anchored { d: hit.d, angle, len };
                        return;
                    }
                }
            }
            if p.y < ground(p.x, p.z) {
                self.release();
                return;
            }
        }
        let travelled = travelled + step.length();
        if travelled > MAX_ROPE {
            // End of the rope: it falls back.
            self.release();
            return;
        }
        self.state = HookState::Flying { pos: pos + step, vel: v, travelled };
    }

    /// Keep the rider within rope's reach of the anchor. `grip` is the point
    /// on the rider the rope is held at; `pos` and `vel` are the rider's.
    /// Returns the correction applied to the position.
    pub fn constrain(&mut self, worm: &Worm, grip: DVec3, pos: &mut DVec3, vel: &mut DVec3, dt: f64) -> DVec3 {
        self.tension = 0.0;
        let HookState::Anchored { d, angle, len } = self.state else { return DVec3::ZERO };
        if d > worm.spec.length {
            // The hide slid past the tail of the recorded route; let go.
            self.release();
            return DVec3::ZERO;
        }
        let a = worm.skin_point(d, angle);
        let off = grip - a;
        let dist = off.length();
        if dist <= len || dist < 1e-6 {
            return DVec3::ZERO;
        }
        let dir = off / dist;
        let fix = -dir * (dist - len);
        *pos += fix;
        let av = worm.skin_velocity(d, a);
        let out = (*vel - av).dot(dir);
        if out > 0.0 {
            *vel -= dir * out;
            self.tension = out / dt;
        }
        fix
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::worm::WormSpec;

    fn flat(_: f64, _: f64) -> f64 {
        0.0
    }

    #[test]
    fn a_throw_bites_the_hide_and_rides_with_it() {
        let mut w = Worm::new(WormSpec::standard(), 0.0, 0.0, 0.0, 6.0, flat);
        w.speed = 15.0;
        w.want_speed = 15.0;
        let mut h = Hook::default();
        // Standing 12 m to the side of the body, 80 m behind the head, throw
        // at the flank.
        let from = DVec3::new(-80.0, 1.5, 16.0);
        h.throw(from, DVec3::new(0.0, 0.25, -1.0), DVec3::ZERO);
        for _ in 0..120 {
            h.fly(1.0 / 120.0, Some(&w), flat);
        }
        let HookState::Anchored { d, len, .. } = h.state else { panic!("did not bite: {:?}", h.state) };
        assert!((d - 80.0).abs() < 3.0, "at d {d}");
        assert!(len > 5.0 && len < 15.0);
        let before = h.position(Some(&w)).unwrap();
        for _ in 0..120 {
            w.step(1.0 / 120.0, flat);
        }
        let after = h.position(Some(&w)).unwrap();
        assert!((after - before).x > 14.0, "anchor moved with the worm: {:?} -> {:?}", before, after);
    }

    #[test]
    fn a_miss_falls_back() {
        let w = Worm::new(WormSpec::standard(), 0.0, 0.0, 0.0, 6.0, flat);
        let mut h = Hook::default();
        h.throw(DVec3::new(-80.0, 1.5, 60.0), DVec3::new(0.0, 0.1, 1.0), DVec3::ZERO);
        for _ in 0..240 {
            h.fly(1.0 / 120.0, Some(&w), flat);
        }
        assert_eq!(h.state, HookState::Stowed);
    }

    #[test]
    fn a_taut_rope_drags_the_rider_along_and_goes_slack_when_closer() {
        let mut w = Worm::new(WormSpec::standard(), 0.0, 0.0, 0.0, 6.0, flat);
        w.speed = 20.0;
        let mut h = Hook::default();
        let angle = w.skin_angle(60.0, DVec3::Z);
        h.state = HookState::Anchored { d: 60.0, angle, len: 5.0 };
        let a = w.skin_point(60.0, angle);
        // Rider standing still, 8 m out: the rope snaps taut.
        let mut pos = a + DVec3::new(0.0, 0.0, 8.0);
        let mut vel = DVec3::ZERO;
        h.constrain(&w, pos, &mut pos.clone(), &mut vel, 1.0 / 120.0);
        let mut p2 = pos;
        h.constrain(&w, pos, &mut p2, &mut vel, 1.0 / 120.0);
        assert!(((p2 - a).length() - 5.0).abs() < 1e-6);
        assert!(h.tension >= 0.0);
        // Closer than the rope: slack, nothing happens.
        let mut near = a + DVec3::new(0.0, 0.0, 2.0);
        let mut v = DVec3::new(0.0, 0.0, 3.0);
        let fix = h.constrain(&w, near, &mut near, &mut v, 1.0 / 120.0);
        assert_eq!(fix, DVec3::ZERO);
        assert_eq!(v, DVec3::new(0.0, 0.0, 3.0));
        // Moving away from a taut rope: the outward velocity is removed and
        // the worm's own velocity along it is kept.
        let mut p3 = a + DVec3::new(0.0, 0.0, 5.0);
        let mut v3 = DVec3::new(0.0, 0.0, 4.0);
        h.constrain(&w, p3 + DVec3::new(0.0, 0.0, 0.01), &mut p3, &mut v3, 1.0 / 120.0);
        assert!(v3.z.abs() < 1e-6 && h.tension > 100.0);
    }

    #[test]
    fn reel_in_and_out_within_limits() {
        let mut h = Hook { state: HookState::Anchored { d: 50.0, angle: 0.0, len: 10.0 }, tension: 0.0 };
        h.reel(-100.0);
        assert!(matches!(h.state, HookState::Anchored { len, .. } if len == MIN_ROPE));
        h.reel(1000.0);
        assert!(matches!(h.state, HookState::Anchored { len, .. } if len == MAX_ROPE));
    }
}
