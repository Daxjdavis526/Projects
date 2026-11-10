//! Where the sun does not reach.
//!
//! A shadow map only covers the few hundred metres around the camera (WebGL2
//! gets one cascade), but dune shadows are what make a desert readable at
//! every distance. The sun never moves, so each terrain vertex's view of it
//! is baked when its tile is built: march from the vertex toward the sun and
//! see whether the ground rises above the ray.
//!
//! The march reads heights from the tile's own grid while it can (fine
//! detail, already paid for) and from a shared lattice of cached samples
//! beyond it, so neighbouring tiles reuse each other's work and a new tile
//! costs a few extra hundred height evaluations, not thousands.

use crate::terrain::Terrain;
use std::collections::HashMap;
use std::hash::{BuildHasherDefault, Hasher};

/// A tiny multiplicative hasher for lattice coordinates. The standard one is
/// built to resist attackers, which a sand dune is not, and is several times
/// slower for keys like these.
#[derive(Default)]
struct Fx(u64);

impl Hasher for Fx {
    fn write(&mut self, bytes: &[u8]) {
        for b in bytes {
            self.write_u64(*b as u64);
        }
    }
    fn write_u64(&mut self, v: u64) {
        self.0 = (self.0.rotate_left(5) ^ v).wrapping_mul(0x51_7c_c1_b7_27_22_0a_95);
    }
    fn write_i64(&mut self, v: i64) {
        self.write_u64(v as u64);
    }
    fn finish(&self) -> u64 {
        self.0
    }
}

type Lattice = HashMap<(i64, i64), f32, BuildHasherDefault<Fx>>;

/// Height of the sun above the horizon. Low enough that dunes throw long
/// shadows, like the morning or late afternoon.
pub const SUN_ELEVATION_DEG: f64 = 18.0;
/// Compass direction of the sun, radians from +x toward +z.
pub const SUN_AZIMUTH: f64 = 2.1;
/// How far a shadow is looked for. A 130 m rock at 18 degrees throws 400 m.
pub const SHADOW_REACH: f64 = 650.0;

/// Unit vector toward the sun.
pub fn sun_dir() -> [f64; 3] {
    let e = SUN_ELEVATION_DEG.to_radians();
    [SUN_AZIMUTH.cos() * e.cos(), e.sin(), SUN_AZIMUTH.sin() * e.cos()]
}

/// Height samples on regular lattices, kept between tiles.
#[derive(Default)]
pub struct HeightCache {
    lattices: HashMap<u32, Lattice>,
}

impl HeightCache {
    pub fn new() -> Self {
        Self::default()
    }

    /// Terrain height at a lattice node of the given spacing.
    fn node(&mut self, t: &Terrain, spacing: u32, i: i64, j: i64) -> f32 {
        let lat = self.lattices.entry(spacing).or_default();
        if lat.len() > 600_000 {
            // A long ride leaves old samples far behind; start again.
            lat.clear();
        }
        *lat.entry((i, j)).or_insert_with(|| t.height(i as f64 * spacing as f64, j as f64 * spacing as f64))
    }

    /// Bilinear height from the lattice of `spacing` metres.
    pub fn height(&mut self, t: &Terrain, spacing: u32, x: f64, z: f64) -> f32 {
        let s = spacing as f64;
        let (fx, fz) = (x / s, z / s);
        let (i, j) = (fx.floor() as i64, fz.floor() as i64);
        let (u, v) = ((fx - i as f64) as f32, (fz - j as f64) as f32);
        let h00 = self.node(t, spacing, i, j);
        let h10 = self.node(t, spacing, i + 1, j);
        let h01 = self.node(t, spacing, i, j + 1);
        let h11 = self.node(t, spacing, i + 1, j + 1);
        let a = h00 + (h10 - h00) * u;
        let b = h01 + (h11 - h01) * u;
        a + (b - a) * v
    }

    pub fn len(&self) -> usize {
        self.lattices.values().map(|l| l.len()).sum()
    }

    pub fn is_empty(&self) -> bool {
        self.len() == 0
    }
}

/// Lattice spacing to use for a tile whose vertices are `vertex_spacing`
/// apart: never finer than 16 m (shadows do not need it), never finer than
/// half the tile's own spacing.
pub fn lattice_for(vertex_spacing: f64) -> u32 {
    (vertex_spacing * 0.5).max(16.0).round() as u32
}

/// Sun visibility, 0 in full shadow to 1 fully lit, of a point at `h` above
/// (x, z). `near(x, z)` returns a height from finer data where it has some.
pub fn visibility(
    x: f64,
    z: f64,
    h: f64,
    first_step: f64,
    near: impl Fn(f64, f64) -> Option<f32>,
    far: &mut impl FnMut(f64, f64) -> f32,
) -> f32 {
    let s = sun_dir();
    let flat = (s[0] * s[0] + s[2] * s[2]).sqrt();
    let (dx, dz) = (s[0] / flat, s[2] / flat);
    let rise = s[1] / flat;
    let mut t = first_step.max(1.5);
    let mut vis: f64 = 1.0;
    // Sitting just above the surface keeps a slope from shadowing itself.
    let h0 = h + 0.4;
    while t < SHADOW_REACH {
        let (px, pz) = (x + dx * t, z + dz * t);
        let ground = near(px, pz).unwrap_or_else(|| far(px, pz)) as f64;
        let ray = h0 + t * rise;
        // Soft edge: partly shadowed while the ground is within a small
        // angle of the ray, which reads as the penumbra of a low sun.
        let clearance = (ray - ground) / (0.03 * t + 0.6);
        vis = vis.min((clearance + 0.5).clamp(0.0, 1.0));
        if vis <= 0.0 {
            break;
        }
        t *= 1.24;
    }
    vis as f32
}

#[cfg(test)]
mod tests {
    use super::*;

    fn march_on(heights: impl Fn(f64, f64) -> f64, x: f64, z: f64) -> f32 {
        let h = heights(x, z);
        let mut far = |px: f64, pz: f64| heights(px, pz) as f32;
        visibility(x, z, h, 2.0, |_, _| None, &mut far)
    }

    #[test]
    fn open_ground_is_lit_and_a_ridge_casts_a_shadow() {
        let s = sun_dir();
        let flat = (s[0] * s[0] + s[2] * s[2]).sqrt();
        let (dx, dz) = (s[0] / flat, s[2] / flat);
        // A 60 m ridge 100 m toward the sun from the origin.
        let ridge = move |x: f64, z: f64| {
            let along = x * dx + z * dz;
            60.0 * (-((along - 100.0) / 15.0).powi(2)).exp()
        };
        assert!(march_on(|_, _| 0.0, 0.0, 0.0) > 0.99, "flat ground sees the sun");
        assert!(march_on(ridge, 0.0, 0.0) < 0.05, "in the lee of the ridge");
        // Far enough behind it, the shadow ends: 60 / tan(18 deg) ~ 185 m.
        assert!(march_on(ridge, -150.0 * dx, -150.0 * dz) > 0.9);
        // On the ridge's sunny face, lit.
        assert!(march_on(ridge, 110.0 * dx, 110.0 * dz) > 0.9);
    }

    #[test]
    fn cache_matches_terrain_on_its_nodes_and_is_reused() {
        let t = Terrain::new(3);
        let mut c = HeightCache::new();
        let h = c.height(&t, 16, 32.0, -48.0);
        assert!((h - t.height(32.0, -48.0)).abs() < 1e-4);
        let n = c.len();
        c.height(&t, 16, 33.0, -47.0);
        assert!(c.len() <= n + 4);
        c.height(&t, 16, 33.0, -47.0);
        assert_eq!(c.len(), c.len());
    }
}
