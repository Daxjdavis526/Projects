//! A cloak: a small Verlet cloth.
//!
//! A grid of particles, `w` across and `h` down, joined by distance
//! constraints along the rows and columns (and diagonally, lightly, so it
//! does not shear into a ribbon). The top row is pinned every step to points
//! the caller supplies — a curve around the wearer's neck and shoulders — and
//! the rest hangs, swings with the body, lifts in the wind and is pushed out
//! of a few capsules standing in for the torso and legs.
//!
//! It knows nothing about bodies or rendering: pins, capsules, wind and the
//! ground come in, particle positions go out.

use glam::DVec3;

/// A collision shape: every point within `r` of the segment a–b is inside.
#[derive(Clone, Copy, Debug)]
pub struct Capsule {
    pub a: DVec3,
    pub b: DVec3,
    pub r: f64,
}

impl Capsule {
    /// Push `p` to the surface if it is inside.
    fn push_out(&self, p: DVec3) -> DVec3 {
        let ab = self.b - self.a;
        let t = ((p - self.a).dot(ab) / ab.length_squared().max(1e-12)).clamp(0.0, 1.0);
        let c = self.a + ab * t;
        let d = p - c;
        let l = d.length();
        if l >= self.r {
            return p;
        }
        if l < 1e-9 {
            return c + DVec3::Y * self.r;
        }
        c + d * (self.r / l)
    }
}

#[derive(Clone, Copy, Debug)]
struct Stick {
    a: usize,
    b: usize,
    len: f64,
    /// 1 for structural links, less for the shear braces.
    stiff: f64,
}

#[derive(Clone, Debug)]
pub struct Cloth {
    pub w: usize,
    pub h: usize,
    pub p: Vec<DVec3>,
    prev: Vec<DVec3>,
    sticks: Vec<Stick>,
    /// Leftover time not yet stepped.
    acc: f64,
    /// Where the pins were last step, to notice a teleport.
    last_pins: Vec<DVec3>,
    t: f64,
}

/// Internal step. The cloth is stiff and light; small steps keep it calm.
const STEP: f64 = 1.0 / 90.0;
const ITERATIONS: usize = 6;

impl Cloth {
    /// A cloth hanging straight down from `pins` (the top row, `w` of them),
    /// `length` metres long in `h` rows.
    pub fn new(pins: &[DVec3], h: usize, length: f64) -> Self {
        let w = pins.len();
        assert!(w >= 2 && h >= 2);
        let dy = length / (h - 1) as f64;
        let mut p = Vec::with_capacity(w * h);
        for r in 0..h {
            for c in 0..w {
                p.push(pins[c] - DVec3::Y * dy * r as f64);
            }
        }
        let mut sticks = Vec::new();
        let idx = |r: usize, c: usize| r * w + c;
        for r in 0..h {
            for c in 0..w {
                if c + 1 < w {
                    let len = (pins[c + 1] - pins[c]).length();
                    sticks.push(Stick { a: idx(r, c), b: idx(r, c + 1), len, stiff: 1.0 });
                }
                if r + 1 < h {
                    sticks.push(Stick { a: idx(r, c), b: idx(r + 1, c), len: dy, stiff: 1.0 });
                }
                if r + 1 < h && c + 1 < w {
                    let across = (pins[c + 1] - pins[c]).length();
                    let len = (across * across + dy * dy).sqrt();
                    sticks.push(Stick { a: idx(r, c), b: idx(r + 1, c + 1), len, stiff: 0.3 });
                    sticks.push(Stick { a: idx(r, c + 1), b: idx(r + 1, c), len, stiff: 0.3 });
                }
            }
        }
        Self { w, h, prev: p.clone(), p, sticks, acc: 0.0, last_pins: pins.to_vec(), t: 0.0 }
    }

    pub fn at(&self, row: usize, col: usize) -> DVec3 {
        self.p[row * self.w + col]
    }

    /// Advance by `dt`. `wind` is the air's velocity, m/s; `ground(x, z)` the
    /// surface height the hem cannot pass through.
    pub fn step(&mut self, dt: f64, pins: &[DVec3], capsules: &[Capsule], wind: DVec3, ground: impl Fn(f64, f64) -> f64) {
        assert_eq!(pins.len(), self.w);
        // A jump of the pins (respawn, a teleport) carries the cloth along
        // instead of stretching it across the desert.
        let jump = pins.iter().zip(&self.last_pins).map(|(a, b)| (*a - *b).length()).fold(0.0, f64::max);
        if jump > 1.5 {
            let shift = pins[self.w / 2] - self.last_pins[self.w / 2];
            for q in self.p.iter_mut().chain(self.prev.iter_mut()) {
                *q += shift;
            }
        }
        self.acc = (self.acc + dt.max(0.0)).min(STEP * 6.0);
        let from = self.last_pins.clone();
        let steps = (self.acc / STEP).floor() as usize;
        for k in 0..steps {
            // Pins move smoothly through the frame's substeps.
            let u = (k + 1) as f64 / steps as f64;
            let now: Vec<DVec3> = if jump > 1.5 { pins.to_vec() } else { from.iter().zip(pins).map(|(a, b)| a.lerp(*b, u)).collect() };
            self.substep(&now, capsules, wind, &ground);
            self.acc -= STEP;
        }
        self.last_pins = pins.to_vec();
    }

    fn substep(&mut self, pins: &[DVec3], capsules: &[Capsule], wind: DVec3, ground: &impl Fn(f64, f64) -> f64) {
        let dt = STEP;
        self.t += dt;
        let w = self.w;
        // Integrate: gravity, air drag toward the wind's velocity (with a
        // flutter that varies across the cloth), light damping.
        for i in w..self.p.len() {
            let p = self.p[i];
            let v = (p - self.prev[i]) / dt;
            let (r, c) = ((i / w) as f64, (i % w) as f64);
            let flutter = 1.0 + 0.35 * (self.t * 7.3 + r * 0.9 + c * 0.6).sin() + 0.2 * (self.t * 13.1 - c * 1.3).sin();
            // The hem catches more air than the shoulders do.
            let exposure = 0.5 + 0.5 * r / (self.h - 1) as f64;
            let a = DVec3::new(0.0, -9.81, 0.0) + (wind * flutter - v) * (0.9 * exposure);
            let next = p + (p - self.prev[i]) * 0.985 + a * dt * dt;
            self.prev[i] = p;
            self.p[i] = next;
        }
        for c in 0..w {
            self.prev[c] = self.p[c];
            self.p[c] = pins[c];
        }
        for _ in 0..ITERATIONS {
            for s in &self.sticks {
                let (pa, pb) = (self.p[s.a], self.p[s.b]);
                let d = pb - pa;
                let l = d.length();
                if l < 1e-9 {
                    continue;
                }
                // Cloth resists stretching, not bunching up.
                if l <= s.len && s.stiff < 1.0 {
                    continue;
                }
                let diff = (l - s.len) / l * s.stiff;
                let (wa, wb) = match (s.a < w, s.b < w) {
                    (true, true) => continue,
                    (true, false) => (0.0, 1.0),
                    (false, true) => (1.0, 0.0),
                    _ => (0.5, 0.5),
                };
                self.p[s.a] += d * diff * wa;
                self.p[s.b] -= d * diff * wb;
            }
            for i in w..self.p.len() {
                let mut q = self.p[i];
                for cap in capsules {
                    q = cap.push_out(q);
                }
                let g = ground(q.x, q.z) + 0.02;
                if q.y < g {
                    q.y = g;
                    // Friction on the sand.
                    let prev = self.prev[i];
                    q.x = q.x * 0.5 + prev.x * 0.5;
                    q.z = q.z * 0.5 + prev.z * 0.5;
                }
                self.p[i] = q;
            }
        }
    }

    /// Longest stretch of any structural link, as a fraction of its rest
    /// length (1 = unstretched).
    pub fn max_stretch(&self) -> f64 {
        self.sticks.iter().filter(|s| s.stiff >= 1.0).map(|s| (self.p[s.b] - self.p[s.a]).length() / s.len).fold(0.0, f64::max)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn pins_at(centre: DVec3) -> Vec<DVec3> {
        (0..9).map(|c| centre + DVec3::new(-0.4 + 0.1 * c as f64, 0.0, 0.0)).collect()
    }

    fn flat(_: f64, _: f64) -> f64 {
        -100.0
    }

    #[test]
    fn hangs_still_and_does_not_stretch() {
        let pins = pins_at(DVec3::new(0.0, 1.5, 0.0));
        let mut cl = Cloth::new(&pins, 10, 1.2);
        for _ in 0..300 {
            cl.step(1.0 / 60.0, &pins, &[], DVec3::ZERO, flat);
        }
        assert!(cl.max_stretch() < 1.05, "stretch {}", cl.max_stretch());
        let hem = cl.at(9, 4);
        assert!((hem.y - 0.3).abs() < 0.08, "hangs its length: hem at {:.2}", hem.y);
        assert!(hem.x.abs() < 0.05 && hem.z.abs() < 0.05);
    }

    #[test]
    fn wind_lifts_it_downwind_and_a_body_holds_it_off() {
        let pins = pins_at(DVec3::new(0.0, 1.5, 0.0));
        let mut cl = Cloth::new(&pins, 10, 1.2);
        for _ in 0..300 {
            cl.step(1.0 / 60.0, &pins, &[], DVec3::new(0.0, 0.0, 6.0), flat);
        }
        assert!(cl.at(9, 4).z > 0.3, "blown downwind: {:.2}", cl.at(9, 4).z);

        // A torso just behind the pins: the cloth drapes over it.
        let body = Capsule { a: DVec3::new(0.0, 0.3, 0.2), b: DVec3::new(0.0, 1.4, 0.2), r: 0.18 };
        let mut cl = Cloth::new(&pins, 10, 1.2);
        for _ in 0..300 {
            cl.step(1.0 / 60.0, &pins, &[body], DVec3::new(0.0, 0.0, -3.0), flat);
        }
        for q in &cl.p {
            let inside = q.y > 0.3 && q.y < 1.4 && (q.x.powi(2) + (q.z - 0.2).powi(2)).sqrt() < 0.17;
            assert!(!inside, "cloth inside the body at {q:?}");
        }
    }

    #[test]
    fn follows_its_wearer_and_survives_a_teleport() {
        let mut cl = Cloth::new(&pins_at(DVec3::new(0.0, 1.5, 0.0)), 10, 1.2);
        let mut x = 0.0;
        for _ in 0..240 {
            x += 5.0 / 60.0;
            cl.step(1.0 / 60.0, &pins_at(DVec3::new(x, 1.5, 0.0)), &[], DVec3::ZERO, flat);
        }
        // Running, it trails behind.
        assert!(cl.at(9, 4).x < x - 0.2);
        assert!(cl.max_stretch() < 1.1);
        let far = DVec3::new(3000.0, 1.5, 0.0);
        cl.step(1.0 / 60.0, &pins_at(far), &[], DVec3::ZERO, flat);
        assert!((cl.at(9, 4) - far).length() < 2.0);
        assert!(cl.p.iter().all(|q| q.is_finite()));
    }

    #[test]
    fn the_hem_rests_on_the_ground() {
        let pins = pins_at(DVec3::new(0.0, 0.8, 0.0));
        let mut cl = Cloth::new(&pins, 10, 1.2);
        for _ in 0..300 {
            cl.step(1.0 / 60.0, &pins, &[], DVec3::ZERO, |_, _| 0.0);
        }
        assert!(cl.p.iter().all(|q| q.y >= 0.0));
    }
}
