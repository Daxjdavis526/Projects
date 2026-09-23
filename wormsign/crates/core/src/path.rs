//! The route the worm's head has taken, which its body then follows.
//!
//! A ring buffer of centreline points, one roughly every [`SPACING`] metres,
//! each stamped with the cumulative arc length at which the head passed it.
//! A body segment `d` metres behind the head is simply the point at arc
//! length `head_s - d`. That is the whole trick: every part of the body goes
//! exactly where the head went, so turns sweep back along the body and a
//! surfacing ripples down it, like a real serpent and unlike a rigid capsule.

use glam::DVec3;
use std::collections::VecDeque;

pub const SPACING: f64 = 1.0;

#[derive(Clone, Debug)]
pub struct Path {
    /// (arc length, position), oldest first.
    pts: VecDeque<(f64, DVec3)>,
    /// Arc length at the head.
    head_s: f64,
    head: DVec3,
    /// How much history to keep, metres.
    keep: f64,
}

impl Path {
    /// A straight path laid out behind `head` along `-dir`, `keep` metres long.
    pub fn straight(head: DVec3, dir: DVec3, keep: f64) -> Self {
        let dir = dir.normalize();
        let n = (keep / SPACING).ceil() as usize + 2;
        let mut pts = VecDeque::with_capacity(n + 8);
        for i in (0..n).rev() {
            let d = i as f64 * SPACING;
            pts.push_back((keep + 2.0 * SPACING - d, head - dir * d));
        }
        let head_s = keep + 2.0 * SPACING;
        Self { pts, head_s, head, keep }
    }

    pub fn head(&self) -> DVec3 {
        self.head
    }

    pub fn head_s(&self) -> f64 {
        self.head_s
    }

    /// Move the head to `p`. Records a new point whenever it has travelled
    /// far enough, and forgets history beyond `keep`.
    pub fn advance(&mut self, p: DVec3) {
        let step = (p - self.head).length();
        self.head_s += step;
        self.head = p;
        let last_s = self.pts.back().map(|x| x.0).unwrap_or(f64::MIN);
        if self.head_s - last_s >= SPACING {
            self.pts.push_back((self.head_s, p));
        }
        while self.pts.len() > 2 && self.head_s - self.pts[1].0 > self.keep {
            self.pts.pop_front();
        }
    }

    /// Position `d` metres behind the head along the route.
    pub fn at(&self, d: f64) -> DVec3 {
        let s = self.head_s - d.max(0.0);
        let last = self.pts.back().unwrap();
        if s >= last.0 {
            // Between the last recorded point and the live head.
            let span = self.head_s - last.0;
            if span <= 1e-9 {
                return self.head;
            }
            return last.1.lerp(self.head, (s - last.0) / span);
        }
        // Binary search for the bracketing pair.
        let (mut lo, mut hi) = (0usize, self.pts.len() - 1);
        if s <= self.pts[0].0 {
            return self.pts[0].1;
        }
        while hi - lo > 1 {
            let mid = (lo + hi) / 2;
            if self.pts[mid].0 <= s { lo = mid } else { hi = mid }
        }
        let (s0, p0) = self.pts[lo];
        let (s1, p1) = self.pts[hi];
        p0.lerp(p1, (s - s0) / (s1 - s0).max(1e-9))
    }

    /// Unit tangent (pointing toward the head) at `d` metres behind it.
    pub fn tangent(&self, d: f64) -> DVec3 {
        let a = self.at(d + 1.5);
        let b = self.at((d - 1.5).max(0.0));
        let t = b - a;
        if t.length_squared() < 1e-12 { DVec3::X } else { t.normalize() }
    }

    pub fn len(&self) -> usize {
        self.pts.len()
    }

    pub fn is_empty(&self) -> bool {
        self.pts.is_empty()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn straight_path_is_straight() {
        let p = Path::straight(DVec3::new(5.0, 0.0, 0.0), DVec3::X, 100.0);
        for d in [0.0, 1.0, 10.5, 99.0] {
            let q = p.at(d);
            assert!((q - DVec3::new(5.0 - d, 0.0, 0.0)).length() < 1e-9, "{d}: {q}");
        }
        assert!((p.tangent(30.0) - DVec3::X).length() < 1e-9);
    }

    #[test]
    fn body_follows_the_heads_route_through_a_turn() {
        // Drive the head around a quarter circle of radius 80 m, then check
        // that points behind it lie on that circle, not cutting the corner.
        let r = 80.0;
        let mut p = Path::straight(DVec3::new(0.0, 0.0, -r), DVec3::X, 300.0);
        let s0 = p.head_s();
        let steps = 2000;
        for i in 1..=steps {
            let a = std::f64::consts::FRAC_PI_2 * i as f64 / steps as f64;
            p.advance(DVec3::new(r * a.sin(), 0.0, -r * a.cos()));
        }
        // Arc length travelled: pi/2 * r ~ 125.7 m. Points up to that far
        // back should sit on the circle.
        for d in [5.0, 40.0, 100.0, 120.0] {
            let q = p.at(d);
            let rad = (q.x * q.x + q.z * q.z).sqrt();
            assert!((rad - r).abs() < 0.05, "d {d}: radius {rad}");
        }
        // Further back, on the straight run-in.
        let q = p.at(200.0);
        assert!((q.z + r).abs() < 1e-6 && q.x < 0.0);
        // Arc length is consistent: distance along matches.
        let travelled = p.head_s() - s0;
        assert!((travelled - std::f64::consts::FRAC_PI_2 * r).abs() < 0.1, "{travelled}");
    }

    #[test]
    fn history_is_bounded() {
        let mut p = Path::straight(DVec3::ZERO, DVec3::X, 50.0);
        for i in 0..10_000 {
            p.advance(DVec3::new(i as f64 * 0.5, 0.0, 0.0));
        }
        assert!(p.len() < 60, "{} points kept", p.len());
        // The oldest kept point is still at least `keep` behind.
        let q = p.at(50.0);
        assert!((q.x - (4999.5 - 50.0)).abs() < 1.0);
    }
}
