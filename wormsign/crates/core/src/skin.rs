//! One skin over the whole body.
//!
//! The figure is built as lofted segments, one per bone, but it is drawn as
//! a single surface: near every joint a vertex belongs partly to its own
//! bone and partly to the neighbouring one (linear blend skinning), so the
//! two meshes that meet there bend together into one continuous skin instead
//! of two pieces hinged on a gap.
//!
//! A bone's frame maps its own bind-pose space to the world. The weight a
//! vertex gives the neighbouring bone depends only on how far past the joint
//! it lies along the bone, and it is exactly one half at the joint; so a
//! point at the joint lands on the joint from either side, whatever the
//! bend, and the skin cannot split there.

use glam::{DMat3, DVec3};

/// A bone's placement: `origin + rot * scale_y(p)`, p in the bone's own
/// frame (y along the bone from its first joint).
#[derive(Clone, Copy, Debug)]
pub struct Frame {
    pub origin: DVec3,
    pub rot: DMat3,
    /// Stretch along the bone (a ragdoll's bones are not quite rigid).
    pub stretch: f64,
}

impl Frame {
    pub fn to_world(&self, local: DVec3) -> DVec3 {
        self.origin + self.rot * DVec3::new(local.x, local.y * self.stretch, local.z)
    }

    pub fn to_local(&self, world: DVec3) -> DVec3 {
        let l = self.rot.transpose() * (world - self.origin);
        DVec3::new(l.x, l.y / self.stretch.max(1e-9), l.z)
    }
}

/// Weight given to the neighbouring bone for a vertex `past` metres beyond
/// the joint (negative: still inside its own bone), blending over `radius`
/// either side. Half at the joint, none a radius inside, all a radius out.
pub fn neighbour_weight(past: f64, radius: f64) -> f64 {
    let t = ((past + radius) / (2.0 * radius.max(1e-9))).clamp(0.0, 1.0);
    t * t * (3.0 - 2.0 * t)
}

/// Where a vertex goes: `local` in its own bone's frame (bind pose), blended
/// with weight `w` toward a neighbour. Each bone maps bind to now; the vertex
/// is taken through both and mixed.
pub fn skin_point(local: DVec3, own_bind: &Frame, own_now: &Frame, other: Option<(&Frame, &Frame, f64)>) -> DVec3 {
    let a = own_now.to_world(local);
    match other {
        Some((bind, now, w)) if w > 0.0 => {
            let bind_world = own_bind.to_world(local);
            let b = now.to_world(bind.to_local(bind_world));
            a * (1.0 - w) + b * w
        }
        _ => a,
    }
}

/// The same for a direction (a normal): rotations only, renormalised.
pub fn skin_normal(n: DVec3, own_bind: &Frame, own_now: &Frame, other: Option<(&Frame, &Frame, f64)>) -> DVec3 {
    let a = own_now.rot * n;
    match other {
        Some((bind, now, w)) if w > 0.0 => {
            let b = now.rot * (bind.rot.transpose() * (own_bind.rot * n));
            (a * (1.0 - w) + b * w).normalize_or(a)
        }
        _ => a,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn bone(from: DVec3, to: DVec3) -> Frame {
        let y = (to - from).normalize();
        let z0 = if y.x.abs() < 0.9 { DVec3::X } else { DVec3::Z };
        let x = y.cross(z0).normalize();
        let z = x.cross(y);
        Frame { origin: from, rot: DMat3::from_cols(x, y, z), stretch: 1.0 }
    }

    #[test]
    fn weights_are_half_at_the_joint_and_complete_outside() {
        assert!((neighbour_weight(0.0, 0.05) - 0.5).abs() < 1e-12);
        assert_eq!(neighbour_weight(-0.05, 0.05), 0.0);
        assert_eq!(neighbour_weight(0.05, 0.05), 1.0);
        let mut last = 0.0;
        for k in 0..=100 {
            let w = neighbour_weight(-0.1 + 0.002 * k as f64, 0.05);
            assert!((0.0..=1.0).contains(&w) && w >= last);
            last = w;
        }
    }

    #[test]
    fn the_skin_never_splits_at_a_bent_joint() {
        // A thigh and shank, straight in the bind pose, meeting at a knee.
        let hip = DVec3::new(0.0, 0.9, 0.0);
        let knee = DVec3::new(0.0, 0.47, 0.0);
        let ankle = DVec3::new(0.0, 0.04, 0.0);
        let (thigh_b, shank_b) = (bone(hip, knee), bone(knee, ankle));
        let r = 0.06;
        for deg in [0.0f64, 45.0, 90.0, 150.0] {
            let a = deg.to_radians();
            let ankle_now = knee + DVec3::new(0.0, -a.cos(), -a.sin()) * 0.43;
            let (thigh_n, shank_n) = (bone(hip, knee), bone(knee, ankle_now));
            // Points on a ring round the knee, described from each bone.
            for k in 0..12 {
                let th = k as f64 / 12.0 * std::f64::consts::TAU;
                for past in [-0.03, 0.0, 0.03] {
                    let world_bind = knee + DVec3::new(th.cos(), 0.0, th.sin()) * 0.05 - DVec3::Y * past;
                    let from_thigh = {
                        let l = thigh_b.to_local(world_bind);
                        let w = neighbour_weight(l.y - 0.43, r);
                        skin_point(l, &thigh_b, &thigh_n, Some((&shank_b, &shank_n, w)))
                    };
                    let from_shank = {
                        let l = shank_b.to_local(world_bind);
                        let w = neighbour_weight(-l.y, r);
                        skin_point(l, &shank_b, &shank_n, Some((&thigh_b, &thigh_n, w)))
                    };
                    assert!((from_thigh - from_shank).length() < 1e-9, "split at {deg} deg: {:.4}", (from_thigh - from_shank).length());
                }
            }
            // The joint itself stays on the joint.
            let l = thigh_b.to_local(knee);
            let p = skin_point(l, &thigh_b, &thigh_n, Some((&shank_b, &shank_n, 0.5)));
            assert!((p - knee).length() < 1e-9);
        }
    }

    #[test]
    fn far_from_joints_a_bone_is_rigid() {
        let b = bone(DVec3::ZERO, DVec3::Y);
        let n = Frame { origin: DVec3::new(1.0, 2.0, 3.0), rot: DMat3::from_rotation_z(0.7), stretch: 1.0 };
        let l = DVec3::new(0.05, 0.5, -0.02);
        let p = skin_point(l, &b, &n, None);
        assert!((p - n.to_world(l)).length() < 1e-12);
        let nn = skin_normal(DVec3::X, &b, &n, None);
        assert!((nn - n.rot * DVec3::X).length() < 1e-12);
    }
}
