//! A body that has stopped being a player.
//!
//! Verlet particles for the joints, distance constraints for the bones.
//! Cheap, unconditionally stable, and happy to be thrown, dragged, crushed
//! and torn: a link can be broken, and the pieces then fall and tumble on
//! their own. External forces (a mouth's suction, a worm's surface) come in
//! through a closure, so this knows nothing about worms.

use glam::DVec3;

pub const HEAD: usize = 0;
pub const CHEST: usize = 1;
pub const PELVIS: usize = 2;
pub const L_ELBOW: usize = 3;
pub const L_HAND: usize = 4;
pub const R_ELBOW: usize = 5;
pub const R_HAND: usize = 6;
pub const L_KNEE: usize = 7;
pub const L_FOOT: usize = 8;
pub const R_KNEE: usize = 9;
pub const R_FOOT: usize = 10;
pub const L_SHOULDER: usize = 11;
pub const R_SHOULDER: usize = 12;
pub const L_HIP: usize = 13;
pub const R_HIP: usize = 14;
pub const L_TOE: usize = 15;
pub const R_TOE: usize = 16;
pub const JOINTS: usize = 17;

/// A joint and everything beyond it on the same limb: what comes away when
/// the bone above it is torn.
pub fn limb(j: usize) -> &'static [usize] {
    match j {
        L_ELBOW => &[L_ELBOW, L_HAND],
        R_ELBOW => &[R_ELBOW, R_HAND],
        L_KNEE => &[L_KNEE, L_FOOT, L_TOE],
        R_KNEE => &[R_KNEE, R_FOOT, R_TOE],
        L_FOOT => &[L_FOOT, L_TOE],
        R_FOOT => &[R_FOOT, R_TOE],
        HEAD => &[HEAD],
        L_HAND => &[L_HAND],
        R_HAND => &[R_HAND],
        _ => &[],
    }
}

#[derive(Clone, Copy, Debug)]
pub struct Link {
    pub a: usize,
    pub b: usize,
    pub len: f64,
    /// Drawn as a limb (true) or an invisible brace (false).
    pub bone: bool,
    pub intact: bool,
}

#[derive(Clone, Debug)]
pub struct Ragdoll {
    pub p: Vec<DVec3>,
    prev: Vec<DVec3>,
    pub links: Vec<Link>,
    /// Collision radius per joint.
    pub radius: Vec<f64>,
}

/// Joint positions of a 1.8 m person standing with feet at the origin,
/// facing -z, in metres.
fn rest_pose() -> [DVec3; JOINTS] {
    let v = |x: f64, y: f64| DVec3::new(x, y, 0.0);
    [
        v(0.0, 1.68),   // head
        v(0.0, 1.40),   // chest
        v(0.0, 0.98),   // pelvis
        v(-0.30, 1.15), // l elbow
        v(-0.34, 0.86), // l hand
        v(0.30, 1.15),  // r elbow
        v(0.34, 0.86),  // r hand
        v(-0.11, 0.52), // l knee
        v(-0.12, 0.06), // l foot
        v(0.11, 0.52),  // r knee
        v(0.12, 0.06),  // r foot
        v(-0.19, 1.45), // l shoulder
        v(0.19, 1.45),  // r shoulder
        v(-0.09, 0.95), // l hip
        v(0.09, 0.95),  // r hip
        DVec3::new(-0.12, 0.03, -0.16), // l toe
        DVec3::new(0.12, 0.03, -0.16),  // r toe
    ]
}

impl Ragdoll {
    /// A ragdoll in the player's pose at `feet`, facing `yaw`, already moving
    /// at `vel`.
    pub fn new(feet: DVec3, yaw: f64, vel: DVec3, dt: f64) -> Self {
        let (s, c) = yaw.sin_cos();
        let rot = |v: DVec3| DVec3::new(v.x * c + v.z * s, v.y, -v.x * s + v.z * c);
        let p: Vec<DVec3> = rest_pose().iter().map(|v| feet + rot(*v)).collect();
        let mut j = [DVec3::ZERO; JOINTS];
        j.copy_from_slice(&p);
        Self::from_joints(j, vel, dt)
    }

    /// A ragdoll taking over a body posed at `j` (indexed by the constants
    /// above), moving at `vel`. Bone lengths are whatever the pose has, so a
    /// figure drawn from the animated skeleton keeps its shape when it falls.
    pub fn from_joints(j: [DVec3; JOINTS], vel: DVec3, dt: f64) -> Self {
        let p: Vec<DVec3> = j.to_vec();
        let prev = p.iter().map(|q| *q - vel * dt).collect();
        let bones = [
            (CHEST, HEAD),
            (CHEST, PELVIS),
            (L_SHOULDER, L_ELBOW),
            (L_ELBOW, L_HAND),
            (R_SHOULDER, R_ELBOW),
            (R_ELBOW, R_HAND),
            (L_HIP, L_KNEE),
            (L_KNEE, L_FOOT),
            (R_HIP, R_KNEE),
            (R_KNEE, R_FOOT),
            (L_FOOT, L_TOE),
            (R_FOOT, R_TOE),
        ];
        // Girdles hold shoulders and hips square to the spine; the rest
        // keep limbs from folding through the body.
        let braces = [
            (CHEST, L_SHOULDER),
            (CHEST, R_SHOULDER),
            (L_SHOULDER, R_SHOULDER),
            (L_SHOULDER, PELVIS),
            (R_SHOULDER, PELVIS),
            (PELVIS, L_HIP),
            (PELVIS, R_HIP),
            (L_HIP, R_HIP),
            (L_HIP, CHEST),
            (R_HIP, CHEST),
            (HEAD, PELVIS),
            (HEAD, L_SHOULDER),
            (HEAD, R_SHOULDER),
            (L_KNEE, R_KNEE),
            (L_ELBOW, PELVIS),
            (R_ELBOW, PELVIS),
            (L_KNEE, CHEST),
            (R_KNEE, CHEST),
            (L_KNEE, L_TOE),
            (R_KNEE, R_TOE),
        ];
        let mut links = Vec::new();
        for (a, b) in bones {
            links.push(Link { a, b, len: (p[a] - p[b]).length(), bone: true, intact: true });
        }
        for (a, b) in braces {
            links.push(Link { a, b, len: (p[a] - p[b]).length(), bone: false, intact: true });
        }
        let mut radius = vec![0.07; JOINTS];
        radius[HEAD] = 0.12;
        radius[CHEST] = 0.16;
        radius[PELVIS] = 0.14;
        radius[L_TOE] = 0.04;
        radius[R_TOE] = 0.04;
        radius[L_SHOULDER] = 0.08;
        radius[R_SHOULDER] = 0.08;
        Self { p, prev, links, radius }
    }

    pub fn velocity(&self, i: usize, dt: f64) -> DVec3 {
        (self.p[i] - self.prev[i]) / dt
    }

    /// Advance by `dt`. `ground(x, z)` is the surface height; `force(i, p)`
    /// adds an acceleration to joint `i`.
    pub fn step(&mut self, dt: f64, ground: impl Fn(f64, f64) -> f64, force: impl Fn(usize, DVec3) -> DVec3) {
        let g = DVec3::new(0.0, -9.81, 0.0);
        for i in 0..self.p.len() {
            let a = g + force(i, self.p[i]);
            let v = (self.p[i] - self.prev[i]) * 0.999;
            self.prev[i] = self.p[i];
            self.p[i] += v + a * dt * dt;
        }
        for _ in 0..6 {
            for l in &self.links {
                if !l.intact {
                    continue;
                }
                let d = self.p[l.b] - self.p[l.a];
                let len = d.length().max(1e-9);
                let corr = d * ((len - l.len) / len * 0.5);
                self.p[l.a] += corr;
                self.p[l.b] -= corr;
            }
            for i in 0..self.p.len() {
                let floor = ground(self.p[i].x, self.p[i].z) + self.radius[i];
                if self.p[i].y < floor {
                    self.p[i].y = floor;
                    // Sand is grabby: kill most of the sliding on contact.
                    let v = self.p[i] - self.prev[i];
                    self.prev[i].x = self.p[i].x - v.x * 0.4;
                    self.prev[i].z = self.p[i].z - v.z * 0.4;
                    self.prev[i].y = self.p[i].y.max(self.prev[i].y);
                }
            }
        }
    }

    /// Set a joint's previous position, which is how Verlet sets velocity.
    pub fn set_prev(&mut self, i: usize, p: DVec3) {
        self.prev[i] = p;
    }

    /// Give every joint an extra velocity.
    pub fn kick(&mut self, dv: DVec3, dt: f64) {
        for i in 0..self.p.len() {
            self.prev[i] -= dv * dt;
        }
    }

    /// Tear every bone with an end inside the sphere. Returns where each
    /// tear happened, for the blood.
    pub fn tear(&mut self, centre: DVec3, radius: f64) -> Vec<DVec3> {
        let mut out = Vec::new();
        for l in &mut self.links {
            if l.intact && ((self.p[l.a] - centre).length() < radius || (self.p[l.b] - centre).length() < radius) {
                l.intact = false;
                if l.bone {
                    out.push((self.p[l.a] + self.p[l.b]) * 0.5);
                }
            }
        }
        out
    }

    /// Tear a specific bone (by its endpoints, body side first), if still
    /// attached. Everything beyond `b` on its limb comes away with it.
    pub fn tear_bone(&mut self, a: usize, b: usize) -> Option<DVec3> {
        for l in &mut self.links {
            if l.intact && ((l.a == a && l.b == b) || (l.a == b && l.b == a)) {
                l.intact = false;
                // Braces holding the limb on go too; those within it stay.
                let (pa, pb) = (self.p[a], self.p[b]);
                let piece = limb(b);
                for m in self.links.iter_mut() {
                    if !m.bone && m.intact && (piece.contains(&m.a) != piece.contains(&m.b)) {
                        m.intact = false;
                    }
                }
                return Some((pa + pb) * 0.5);
            }
        }
        None
    }

    pub fn centre(&self) -> DVec3 {
        self.p[CHEST]
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn falls_and_comes_to_rest_in_one_piece() {
        let mut r = Ragdoll::new(DVec3::new(0.0, 5.0, 0.0), 0.3, DVec3::new(3.0, 4.0, 0.0), 1.0 / 120.0);
        for _ in 0..(120 * 8) {
            r.step(1.0 / 120.0, |_, _| 0.0, |_, _| DVec3::ZERO);
        }
        for i in 0..JOINTS {
            assert!(r.p[i].y >= r.radius[i] - 1e-6, "joint {i} below ground");
            assert!(r.velocity(i, 1.0 / 120.0).length() < 0.3, "joint {i} still moving");
        }
        for l in &r.links {
            let len = (r.p[l.a] - r.p[l.b]).length();
            assert!((len - l.len).abs() < 0.05 * l.len + 0.01, "link {}-{} stretched to {len} from {}", l.a, l.b, l.len);
        }
    }

    #[test]
    fn torn_limbs_come_away() {
        let mut r = Ragdoll::new(DVec3::new(0.0, 0.0, 0.0), 0.0, DVec3::ZERO, 1.0 / 120.0);
        assert!(r.tear_bone(L_SHOULDER, L_ELBOW).is_some());
        assert!(r.tear_bone(L_SHOULDER, L_ELBOW).is_none(), "cannot tear twice");
        // Pull the arm away hard; it should go, the torso should not follow.
        for _ in 0..240 {
            r.step(1.0 / 120.0, |_, _| -100.0, |i, _| if i == L_ELBOW || i == L_HAND { DVec3::new(-60.0, 0.0, 0.0) } else { DVec3::ZERO });
        }
        assert!((r.p[L_HAND] - r.p[CHEST]).length() > 10.0);
        assert!(r.p[CHEST].x.abs() < 1.0);
    }

    #[test]
    fn tear_reports_bone_breaks() {
        let mut r = Ragdoll::new(DVec3::ZERO, 0.0, DVec3::ZERO, 1.0 / 120.0);
        let breaks = r.tear(r.p[PELVIS], 0.3);
        assert!(breaks.len() >= 3, "pelvis connects spine and both legs: {}", breaks.len());
    }
}
