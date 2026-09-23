//! A sandworm's body: how it moves, where every part of it is, and what the
//! sand above it does.
//!
//! The head is steered like something with enormous mass: speed changes at
//! a limited rate, the turn *rate* itself can only change slowly, and the
//! tightest turn widens with speed. It never turns like a car. The body
//! follows the head's recorded route ([`Path`]), so the whole animal flows
//! along one line.
//!
//! Depth is measured from the sand surface down to the body's centreline at
//! the head. The head rides the terrain at that depth, so a worm goes up
//! and over dunes, and the body behind it repeats the climb.

use crate::path::Path;
use glam::DVec3;

#[derive(Clone, Copy, Debug)]
pub struct WormSpec {
    pub length: f64,
    /// Body radius at its thickest.
    pub radius: f64,
    pub cruise: f64,
    pub max_speed: f64,
    /// Forward acceleration and braking, m/s^2.
    pub accel: f64,
    /// Tightest turn at zero speed; grows with speed.
    pub min_turn_radius: f64,
    /// How fast the turn rate itself can change, rad/s^2.
    pub turn_accel: f64,
    /// Vertical speed limit of the head, m/s.
    pub climb: f64,
}

impl WormSpec {
    /// About 320 m long and 22 m across.
    pub fn standard() -> Self {
        Self {
            length: 320.0,
            radius: 11.0,
            cruise: 9.0,
            max_speed: 36.0,
            accel: 1.6,
            min_turn_radius: 70.0,
            turn_accel: 0.035,
            climb: 9.0,
        }
    }

    /// The rare giant: 900 m long, 60 m across.
    pub fn giant() -> Self {
        Self {
            length: 900.0,
            radius: 30.0,
            cruise: 11.0,
            max_speed: 44.0,
            accel: 0.9,
            min_turn_radius: 220.0,
            turn_accel: 0.012,
            climb: 12.0,
        }
    }

    /// Turning radius at speed `v`.
    pub fn turn_radius(&self, v: f64) -> f64 {
        self.min_turn_radius + 5.0 * v
    }

    /// Body radius `d` metres behind the head: a blunt, slightly narrower
    /// head, full girth for most of the length, a long taper to the tail.
    pub fn radius_at(&self, d: f64) -> f64 {
        let u = (d / self.length).clamp(0.0, 1.0);
        let head = 0.86 + 0.14 * smooth((u / 0.08).min(1.0));
        let tail = 1.0 - 0.78 * smooth(((u - 0.55) / 0.45).clamp(0.0, 1.0));
        self.radius * head * tail
    }
}

fn smooth(t: f64) -> f64 {
    t * t * (3.0 - 2.0 * t)
}

/// One sampled cross-section of the body.
#[derive(Clone, Copy, Debug)]
pub struct Ring {
    /// Metres behind the head.
    pub d: f64,
    pub centre: DVec3,
    /// Unit, toward the head.
    pub tangent: DVec3,
    pub radius: f64,
    /// Sand height (ignoring rock) directly above/below the centre.
    pub sand: f64,
}

/// A point on the worm's skin, and how that skin is moving.
#[derive(Clone, Copy, Debug)]
pub struct SurfaceHit {
    pub point: DVec3,
    pub normal: DVec3,
    pub velocity: DVec3,
    /// Metres behind the head.
    pub d: f64,
    /// Distance from the query point to the skin; negative inside.
    pub gap: f64,
}

#[derive(Clone, Debug)]
pub struct Worm {
    pub spec: WormSpec,
    pub path: Path,
    /// Heading, radians, measured from +x toward +z.
    pub heading: f64,
    pub turn_rate: f64,
    pub speed: f64,
    /// Depth of the centreline below the sand at the head.
    pub depth: f64,
    pub vy: f64,
    /// Where the controller (AI or rider) wants things.
    pub want_heading: f64,
    pub want_speed: f64,
    pub want_depth: f64,
    /// Sampled body, refreshed by [`Worm::step`].
    pub rings: Vec<Ring>,
    pub ring_spacing: f64,
    /// 0 closed (a blunt, sealed cone) .. 1 gaping.
    pub mouth: f64,
    pub want_mouth: f64,
    /// Attacking: depth changes are fast and the head can climb steeply,
    /// so it erupts out of the sand rather than easing up.
    pub lunge: bool,
}

pub fn wrap_angle(a: f64) -> f64 {
    let t = std::f64::consts::TAU;
    let mut a = a % t;
    if a > std::f64::consts::PI {
        a -= t;
    } else if a < -std::f64::consts::PI {
        a += t;
    }
    a
}

impl Worm {
    /// A worm at (x, z) heading along `heading`, `depth` below the sand.
    pub fn new(spec: WormSpec, x: f64, z: f64, heading: f64, depth: f64, sand: impl Fn(f64, f64) -> f64) -> Self {
        let dir = DVec3::new(heading.cos(), 0.0, heading.sin());
        let head = DVec3::new(x, sand(x, z) - depth, z);
        let mut path = Path::straight(head, dir, spec.length + 20.0);
        // Lay the initial body along the sand rather than on a flat line.
        let mut p2 = Path::straight(head - dir * (spec.length + 20.0), dir, 1.0);
        let n = (spec.length + 20.0) as usize;
        for i in (0..=n).rev() {
            let q = head - dir * i as f64;
            p2.advance(DVec3::new(q.x, sand(q.x, q.z) - depth, q.z));
        }
        if p2.len() > 10 {
            path = p2;
        }
        let ring_spacing = if spec.length > 500.0 { 4.0 } else { 2.0 };
        let mut w = Self {
            spec,
            path,
            heading,
            turn_rate: 0.0,
            speed: spec.cruise,
            depth,
            vy: 0.0,
            want_heading: heading,
            want_speed: spec.cruise,
            want_depth: depth,
            rings: Vec::new(),
            ring_spacing,
            mouth: 0.0,
            want_mouth: 0.0,
            lunge: false,
        };
        w.resample(&sand);
        w
    }

    pub fn head(&self) -> DVec3 {
        self.path.head()
    }

    pub fn forward(&self) -> DVec3 {
        DVec3::new(self.heading.cos(), 0.0, self.heading.sin())
    }

    /// Fastest the heading can currently turn.
    pub fn max_turn_rate(&self) -> f64 {
        self.speed.max(2.0) / self.spec.turn_radius(self.speed)
    }

    /// Advance the body by `dt`. `sand(x, z)` is the sand surface height.
    pub fn step(&mut self, dt: f64, sand: impl Fn(f64, f64) -> f64) {
        let s = self.spec;

        // Speed: limited acceleration either way.
        let dv = (self.want_speed.clamp(0.0, s.max_speed) - self.speed).clamp(-s.accel * dt, s.accel * dt);
        self.speed += dv;

        // Heading: aim the turn rate at the error, but the turn rate itself
        // has inertia and a speed-dependent ceiling.
        let err = wrap_angle(self.want_heading - self.heading);
        let ceiling = self.max_turn_rate();
        let want_rate = (err * 0.6).clamp(-ceiling, ceiling);
        let dr = (want_rate - self.turn_rate).clamp(-s.turn_accel * dt, s.turn_accel * dt);
        self.turn_rate = (self.turn_rate + dr).clamp(-ceiling, ceiling);
        self.heading = wrap_angle(self.heading + self.turn_rate * dt);

        // Depth: eased, and the head's vertical speed is limited, so it
        // cannot pop out of the sand instantly — unless it is lunging.
        let (ease, climb) = if self.lunge { (3.0, s.climb * 3.2) } else { (0.8, s.climb) };
        self.depth += (self.want_depth - self.depth) * (1.0 - (-dt * ease).exp());

        // The mouth opens deliberately and snaps shut.
        let rate = if self.want_mouth > self.mouth { 1.4 } else { 6.0 };
        self.mouth += (self.want_mouth - self.mouth).clamp(-rate * dt, rate * dt);

        let head = self.head();
        let fwd = self.forward();
        let nx = head.x + fwd.x * self.speed * dt;
        let nz = head.z + fwd.z * self.speed * dt;
        let want_y = sand(nx, nz) - self.depth;
        let want_vy = ((want_y - head.y) * 1.5).clamp(-climb, climb);
        let jerk = if self.lunge { 40.0 } else { 6.0 };
        self.vy += (want_vy - self.vy).clamp(-jerk * dt, jerk * dt);
        let ny = head.y + self.vy * dt;
        self.path.advance(DVec3::new(nx, ny, nz));
        self.resample(&sand);
    }

    fn resample(&mut self, sand: &impl Fn(f64, f64) -> f64) {
        let n = (self.spec.length / self.ring_spacing).ceil() as usize + 1;
        self.rings.clear();
        for i in 0..n {
            let d = (i as f64 * self.ring_spacing).min(self.spec.length);
            let c = self.path.at(d);
            self.rings.push(Ring {
                d,
                centre: c,
                tangent: self.path.tangent(d),
                radius: self.spec.radius_at(d),
                sand: sand(c.x, c.z),
            });
        }
    }

    /// Unit direction the mouth faces: along the body at the head, which
    /// tilts up during a breach.
    pub fn facing(&self) -> DVec3 {
        self.rings[0].tangent
    }

    /// Centre of the mouth opening.
    pub fn mouth_centre(&self) -> DVec3 {
        self.rings[0].centre + self.facing() * self.spec.radius * 0.3
    }

    /// Radius of the opening right now.
    pub fn mouth_radius(&self) -> f64 {
        self.spec.radius * 0.9 * (0.3 + 0.7 * self.mouth)
    }

    /// Is `p` in the way of the open mouth: close to the opening and not
    /// behind the head?
    pub fn in_mouth(&self, p: DVec3) -> bool {
        if self.mouth < 0.35 {
            return false;
        }
        let c = self.mouth_centre();
        let f = self.facing();
        let rel = p - c;
        let along = rel.dot(f);
        let across = (rel - f * along).length();
        along > -self.spec.radius * 0.8 && along < self.spec.radius * 1.2 && across < self.mouth_radius() + 2.5
    }

    /// The closest point of the skin to `p`, with its outward normal and the
    /// velocity of the skin there. Every part of the body moves along the
    /// route at the head's speed.
    pub fn surface(&self, p: DVec3) -> Option<SurfaceHit> {
        let mut best: Option<(f64, usize, f64)> = None; // (dist to centreline, seg, t)
        for i in 0..self.rings.len().saturating_sub(1) {
            let a = self.rings[i].centre;
            let b = self.rings[i + 1].centre;
            // Cheap reject: far outside this segment's bounding sphere.
            let r = self.rings[i].radius.max(self.rings[i + 1].radius);
            let mid = (a + b) * 0.5;
            if (p - mid).length_squared() > (r + self.ring_spacing + 40.0).powi(2) {
                continue;
            }
            let ab = b - a;
            let t = ((p - a).dot(ab) / ab.length_squared().max(1e-9)).clamp(0.0, 1.0);
            let dist = (p - (a + ab * t)).length() - (self.rings[i].radius * (1.0 - t) + self.rings[i + 1].radius * t);
            if best.map_or(true, |b| dist < b.0) {
                best = Some((dist, i, t));
            }
        }
        let (gap, i, t) = best?;
        let (r0, r1) = (&self.rings[i], &self.rings[i + 1]);
        let c = r0.centre.lerp(r1.centre, t);
        let tan = r0.tangent.lerp(r1.tangent, t).normalize();
        let rad = r0.radius * (1.0 - t) + r1.radius * t;
        let mut out = p - c;
        out -= tan * out.dot(tan);
        let normal = if out.length_squared() < 1e-9 { DVec3::Y } else { out.normalize() };
        Some(SurfaceHit {
            point: c + normal * rad,
            normal,
            velocity: tan * self.speed,
            d: r0.d * (1.0 - t) + r1.d * t,
            gap,
        })
    }

    /// How far the sand is pushed up at (x, z) by this worm. The same
    /// function drives the drawn mound and the ground the player stands on.
    pub fn wake(&self, x: f64, z: f64) -> f64 {
        let head = self.head();
        let reach = self.spec.length + self.spec.radius * 4.0;
        if (head.x - x).abs() > reach || (head.z - z).abs() > reach {
            return 0.0;
        }
        let mut h: f64 = 0.0;
        for r in self.rings.iter().step_by(2) {
            let w = r.radius * 1.35;
            let dx = x - r.centre.x;
            let dz = z - r.centre.z;
            let d2 = dx * dx + dz * dz;
            if d2 > 9.0 * w * w {
                continue;
            }
            let a = bulge(r) * (0.55 + 0.45 * (-r.d / 60.0).exp());
            h = h.max(a * (-d2 / (w * w)).exp());
        }
        // A bow wave shoved ahead of a fast-moving head.
        let fwd = self.forward();
        let r0 = &self.rings[0];
        let bow = r0.centre + fwd * r0.radius * 1.1;
        let w = r0.radius * 1.2;
        let d2 = (x - bow.x).powi(2) + (z - bow.z).powi(2);
        let push = (self.speed / self.spec.max_speed).clamp(0.0, 1.0);
        h = h.max(bulge(r0) * (0.6 + 0.6 * push) * (-d2 / (w * w)).exp());
        h
    }
}

/// Height of the sand heaped over one ring. Nothing if the body is deep;
/// growing as the top of the body nears the surface; capped once it breaks
/// through, since then the body itself is what shows.
fn bulge(r: &Ring) -> f64 {
    let top_depth = r.sand - (r.centre.y + r.radius);
    let k = (1.0 - top_depth / (2.5 * r.radius)).clamp(0.0, 1.0);
    0.45 * r.radius * k * k
}

#[cfg(test)]
mod tests {
    use super::*;

    fn flat(_: f64, _: f64) -> f64 {
        0.0
    }

    #[test]
    fn cannot_turn_like_a_car() {
        let mut w = Worm::new(WormSpec::standard(), 0.0, 0.0, 0.0, 20.0, flat);
        w.speed = 30.0;
        w.want_speed = 30.0;
        w.want_heading = std::f64::consts::PI; // straight back
        let mut turned = 0.0;
        let dt = 1.0 / 60.0;
        for _ in 0..(3.0 / dt) as usize {
            let before = w.heading;
            w.step(dt, flat);
            turned += wrap_angle(w.heading - before).abs();
        }
        // In three seconds at 30 m/s it manages only a small fraction of a
        // U-turn, and never beyond its turning circle.
        assert!(turned < 0.35, "turned {turned:.2} rad in 3 s");
        let ceiling = w.max_turn_rate();
        assert!(w.turn_rate.abs() <= ceiling + 1e-9);
        // Given long enough, it gets there.
        for _ in 0..(60.0 / dt) as usize {
            w.step(dt, flat);
        }
        assert!(wrap_angle(w.heading - std::f64::consts::PI).abs() < 0.05);
    }

    #[test]
    fn speed_changes_slowly() {
        let mut w = Worm::new(WormSpec::standard(), 0.0, 0.0, 0.0, 20.0, flat);
        w.want_speed = 36.0;
        for _ in 0..60 {
            w.step(1.0 / 60.0, flat);
        }
        assert!(w.speed < w.spec.cruise + 2.0, "a second of acceleration: {}", w.speed);
        for _ in 0..60 * 30 {
            w.step(1.0 / 60.0, flat);
        }
        assert!((w.speed - 36.0).abs() < 1e-6);
    }

    #[test]
    fn body_follows_the_head_and_rides_the_terrain() {
        // A single long dune: the head goes over it and the body repeats the
        // climb, rather than cutting straight through.
        let dune = |x: f64, _z: f64| 40.0 * (-((x - 200.0) / 60.0).powi(2)).exp();
        let mut w = Worm::new(WormSpec::standard(), 0.0, 0.0, 0.0, 15.0, dune);
        w.want_depth = 15.0;
        w.speed = 20.0;
        w.want_speed = 20.0;
        for _ in 0..(20.0 * 60.0) as usize {
            w.step(1.0 / 60.0, dune);
        }
        // Head is now ~400 m on; the part of the body 200 m behind it is
        // at x ~200 and should be high, near the crest.
        let ring = w.rings.iter().min_by(|a, b| (a.centre.x - 200.0).abs().partial_cmp(&(b.centre.x - 200.0).abs()).unwrap()).unwrap();
        assert!(ring.centre.y > 40.0 - 15.0 - 10.0, "body over the crest at y {}", ring.centre.y);
        // And every ring is spaced along the body by arc length.
        for pair in w.rings.windows(2) {
            let gap = (pair[1].centre - pair[0].centre).length();
            assert!(gap <= w.ring_spacing + 1e-6 && gap > w.ring_spacing * 0.5, "gap {gap}");
        }
    }

    #[test]
    fn surface_reports_skin_and_its_motion() {
        let mut w = Worm::new(WormSpec::standard(), 0.0, 0.0, 0.0, 0.0, flat);
        w.speed = 25.0;
        // Straight along +x at y = 0, radius 11 mid-body. Point above d=100.
        let p = DVec3::new(-100.0, 30.0, 0.0);
        let hit = w.surface(p).unwrap();
        assert!((hit.point.y - w.spec.radius_at(100.0)).abs() < 0.5, "top at {}", hit.point.y);
        assert!(hit.normal.y > 0.99);
        assert!((hit.velocity - DVec3::new(25.0, 0.0, 0.0)).length() < 0.5);
        assert!((hit.gap - (30.0 - hit.point.y)).abs() < 0.5);
        assert!((hit.d - 100.0).abs() < 2.0);
    }

    #[test]
    fn wake_is_a_mound_over_a_shallow_worm_and_nothing_over_a_deep_one() {
        let shallow = Worm::new(WormSpec::standard(), 0.0, 0.0, 0.0, 14.0, flat);
        let deep = Worm::new(WormSpec::standard(), 0.0, 0.0, 0.0, 60.0, flat);
        let over = shallow.wake(-50.0, 0.0);
        assert!(over > 1.0, "mound {over}");
        assert!(shallow.wake(-50.0, 60.0) < 0.1 * over, "falls off to the sides");
        assert!(deep.wake(-50.0, 0.0) < 0.01);
        assert!(shallow.wake(5000.0, 0.0) == 0.0);
    }

    #[test]
    fn a_lunge_erupts_out_of_the_sand() {
        let mut w = Worm::new(WormSpec::standard(), 0.0, 0.0, 0.0, 13.0, flat);
        w.speed = 34.0;
        w.want_speed = 34.0;
        w.want_depth = -1.4 * w.spec.radius;
        w.lunge = true;
        w.want_mouth = 1.0;
        let mut t: f64 = 0.0;
        let mut steepest: f64 = 0.0;
        while w.head().y < w.spec.radius && t < 5.0 {
            w.step(1.0 / 60.0, flat);
            steepest = steepest.max(w.facing().y);
            t += 1.0 / 60.0;
        }
        assert!(t < 2.0, "took {t:.1} s to get its head clear of the sand");
        assert!(steepest > 0.45, "the head rears up as it rises: {steepest:.2}");
        assert!((w.mouth - (1.4 * t).min(1.0)).abs() < 0.05, "mouth {}", w.mouth);
        // Something standing just ahead of the mouth is in it.
        let p = w.mouth_centre() + w.facing() * 2.0;
        assert!(w.in_mouth(p));
        assert!(!w.in_mouth(w.mouth_centre() - w.facing() * 40.0));
    }
}
