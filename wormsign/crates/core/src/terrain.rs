//! The desert, as a pure function.
//!
//! `Terrain::sample(x, z)` gives the ground height anywhere in an effectively
//! endless world, from the seed alone. Nothing is stored. The mesh that gets
//! drawn is a sampling of this function, and gameplay collision reads the
//! function itself — so a player's feet are exact whichever level of detail
//! happens to be on screen.
//!
//! # Why dunes are shaped rather than just noise
//!
//! Raw noise makes rounded hills, and rounded hills read as grassland with the
//! colour turned off. Real dunes are asymmetric: wind carries sand up a long
//! gentle windward face (the stoss) and it avalanches down a short steep lee
//! face (the slip face) at the angle of repose, about 34°. That asymmetry, and
//! the sharp brink between the two, is what the eye recognises as a dune.
//!
//! So each dune layer is a periodic asymmetric profile laid across the
//! prevailing wind, with its phase warped by noise so the crests meander,
//! fork and break into crescent segments instead of running as ruled lines.
//!
//! # Layers
//!
//! - a region field choosing between open plains and full dune seas
//! - primary dunes, hundreds of metres apart and tens of metres high
//! - secondary dunes riding on them, a different wind, a tenth the size
//! - a gentle large-scale swell so the horizon is never a ruler
//! - rock islands: sparse, raised, impassable to worms
//!
//! Wind-ripples, a few centimetres high, are left to the shader. Geometry at
//! that scale would cost millions of triangles to say what a normal map says
//! for free.

use fastnoise_lite::{FastNoiseLite, FractalType, NoiseType};

/// What the ground is like at one point.
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct Ground {
    /// Height above the datum, metres.
    pub height: f32,
    /// 0 = sand, 1 = rock. Worms cannot pass where this is high.
    pub rock: f32,
}

/// A rock island: a cell of the sparse grid that happens to hold one.
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct Rock {
    pub x: f64,
    pub z: f64,
    pub radius: f64,
    pub height: f64,
}

pub struct Terrain {
    seed: i32,
    region: FastNoiseLite,
    warp: FastNoiseLite,
    crest: FastNoiseLite,
    swell: FastNoiseLite,
    rough: FastNoiseLite,
    /// Unit vector the prevailing wind blows along (x, z).
    wind: (f64, f64),
    /// The secondary dunes' wind, turned off the primary.
    wind2: (f64, f64),
}

/// Primary dune spacing and height.
pub const DUNE_WAVELENGTH: f64 = 820.0;
pub const DUNE_HEIGHT: f64 = 80.0;
/// Secondary dunes riding on the primaries.
pub const DUNE2_WAVELENGTH: f64 = 118.0;
pub const DUNE2_HEIGHT: f64 = 7.5;
/// Fraction of each dune wavelength given to the windward face. The slip face
/// gets the rest, and the steepness comes from how little that is.
const STOSS: f64 = 0.78;
/// Rock islands live on a sparse grid of this spacing; most cells are empty.
pub const ROCK_CELL: f64 = 3200.0;
const ROCK_CHANCE: f64 = 0.34;

impl Terrain {
    pub fn new(seed: u32) -> Self {
        let seed = seed as i32;
        let mk = |salt: i32, freq: f32, octaves: i32| {
            let mut n = FastNoiseLite::with_seed(seed.wrapping_mul(7919).wrapping_add(salt));
            n.set_noise_type(Some(NoiseType::OpenSimplex2));
            n.set_frequency(Some(freq));
            if octaves > 1 {
                n.set_fractal_type(Some(FractalType::FBm));
                n.set_fractal_octaves(Some(octaves));
            }
            n
        };
        // Wind from the west-northwest, like the trade winds that sculpt most
        // of the Earth's great sand seas. The secondary wind is turned 28°.
        let a = 0.34_f64;
        let b = a + 0.49;
        Self {
            seed,
            region: mk(11, 1.0 / 7000.0, 2),
            warp: mk(23, 1.0 / 1800.0, 3),
            crest: mk(37, 1.0 / 900.0, 2),
            swell: mk(41, 1.0 / 11000.0, 2),
            rough: mk(53, 1.0 / 40.0, 2),
            wind: (a.cos(), a.sin()),
            wind2: (b.cos(), b.sin()),
        }
    }

    pub fn seed(&self) -> u32 {
        self.seed as u32
    }

    pub fn wind(&self) -> (f64, f64) {
        self.wind
    }

    /// How dune-covered the ground is here, 0 (open plain) to 1 (sand sea).
    pub fn duniness(&self, x: f64, z: f64) -> f64 {
        let r = self.region.get_noise_2d(x, z) as f64; // roughly -1..1
        // Most of the world is dune field; plains are the exception, which is
        // what makes crossing one feel exposed.
        smoothstep(-0.55, 0.15, r)
    }

    pub fn sample(&self, x: f64, z: f64) -> Ground {
        let dune = self.duniness(x, z);

        // --- primary dunes -------------------------------------------------
        let (wx, wz) = self.wind;
        let u = x * wx + z * wz;         // along the wind
        let v = -x * wz + z * wx;        // across it
        // Warp the phase so crests wander. The warp is sampled in rotated
        // coordinates so its structure lines up with the dunes.
        let warp = self.warp.get_noise_2d(u * 0.35, v) as f64;
        let phase = u / DUNE_WAVELENGTH + warp * 1.35;
        // Crest height varies along the ridge, which breaks long transverse
        // ridges into crescent-like segments where it dips.
        let crest = 0.5 + 0.5 * self.crest.get_noise_2d(u * 0.25, v) as f64;
        let amp1 = DUNE_HEIGHT * dune * (0.25 + 0.75 * crest * crest);
        let h1 = amp1 * dune_profile(phase);

        // --- secondary dunes -------------------------------------------------
        let (w2x, w2z) = self.wind2;
        let u2 = x * w2x + z * w2z;
        let v2 = -x * w2z + z * w2x;
        let warp2 = self.warp.get_noise_2d(v2 * 1.7, u2 * 1.7) as f64;
        let phase2 = u2 / DUNE2_WAVELENGTH + warp2 * 0.8;
        let amp2 = DUNE2_HEIGHT * (0.35 + 0.65 * dune);
        let h2 = amp2 * dune_profile(phase2);

        // --- swell, and a little roughness on the plains ----------------------
        let swell = self.swell.get_noise_2d(x, z) as f64 * 32.0;
        let rough = self.rough.get_noise_2d(x, z) as f64 * 0.35 * (1.0 - dune);

        let sand = h1 + h2 + swell + rough;

        // --- rock islands ------------------------------------------------------
        let (rock_h, rock_w) = self.rock_at(x, z, sand);
        let height = sand.max(rock_h);
        Ground { height: height as f32, rock: rock_w as f32 }
    }

    /// Height only, for callers that do not care about material.
    pub fn height(&self, x: f64, z: f64) -> f32 {
        self.sample(x, z).height
    }

    /// Surface normal by central differences on the function itself.
    pub fn normal(&self, x: f64, z: f64) -> [f32; 3] {
        let e = 0.75;
        let dx = (self.height(x + e, z) - self.height(x - e, z)) as f64 / (2.0 * e);
        let dz = (self.height(x, z + e) - self.height(x, z - e)) as f64 / (2.0 * e);
        let n = [-dx, 1.0, -dz];
        let l = (n[0] * n[0] + n[1] * n[1] + n[2] * n[2]).sqrt();
        [(n[0] / l) as f32, (n[1] / l) as f32, (n[2] / l) as f32]
    }

    /// The rock whose cell contains (x, z), if that cell holds one.
    pub fn rock_in_cell(&self, cx: i64, cz: i64) -> Option<Rock> {
        let h = hash3(self.seed as u64, cx as u64, cz as u64);
        if unit(h) > ROCK_CHANCE {
            return None;
        }
        let jx = unit(h.rotate_left(13));
        let jz = unit(h.rotate_left(27));
        let rr = unit(h.rotate_left(41));
        let rh = unit(h.rotate_left(53));
        Some(Rock {
            x: (cx as f64 + 0.2 + 0.6 * jx) * ROCK_CELL,
            z: (cz as f64 + 0.2 + 0.6 * jz) * ROCK_CELL,
            radius: 110.0 + 420.0 * rr * rr,
            height: 22.0 + 110.0 * rh,
        })
    }

    /// Rock height (absolute) and rock weight 0..1 at a point.
    ///
    /// A rock is a plateau with a craggy, noise-broken edge and a skirt of
    /// banked sand around it, the way dunes pile up against obstacles.
    fn rock_at(&self, x: f64, z: f64, sand: f64) -> (f64, f64) {
        let cx = (x / ROCK_CELL).floor() as i64;
        let cz = (z / ROCK_CELL).floor() as i64;
        let mut best_h = f64::MIN;
        let mut best_w = 0.0_f64;
        // A rock can reach into neighbouring cells, so look at all nine.
        for dz in -1..=1 {
            for dx in -1..=1 {
                let Some(r) = self.rock_in_cell(cx + dx, cz + dz) else { continue };
                let d = ((x - r.x).powi(2) + (z - r.z).powi(2)).sqrt();
                if d > r.radius * 1.6 {
                    continue;
                }
                // Craggy outline: the radius wobbles with angle and position.
                let wob = self.rough.get_noise_2d(x * 0.11, z * 0.11) as f64;
                let edge = r.radius * (1.0 + 0.28 * wob);
                let w = 1.0 - smoothstep(edge * 0.72, edge, d);
                if w <= 0.0 {
                    continue;
                }
                // The plateau sits on whatever the sand does around it, so a
                // rock never looks like it is floating in a trough.
                let top = sand.max(0.0) + r.height * (0.55 + 0.45 * w.powf(0.6));
                let h = top * w + sand * (1.0 - w);
                if h > best_h {
                    best_h = h;
                    best_w = w;
                }
            }
        }
        (best_h, best_w)
    }
}

/// One period of an asymmetric dune, 0 at the trough rising to 1 at the brink.
///
/// Windward face: a slow half-cosine over most of the wavelength. Slip face:
/// a fast one over the remainder. The derivative is continuous everywhere,
/// so there is no hard cusp to alias, but the slip face ends up about four
/// times steeper than the windward face — which at these amplitudes puts it
/// close to the angle of repose.
pub fn dune_profile(phase: f64) -> f64 {
    let t = phase - phase.floor();
    if t < STOSS {
        0.5 - 0.5 * (std::f64::consts::PI * t / STOSS).cos()
    } else {
        0.5 + 0.5 * (std::f64::consts::PI * (t - STOSS) / (1.0 - STOSS)).cos()
    }
}

pub fn smoothstep(a: f64, b: f64, x: f64) -> f64 {
    let t = ((x - a) / (b - a)).clamp(0.0, 1.0);
    t * t * (3.0 - 2.0 * t)
}

/// A good 64-bit mix of three values (splitmix-style), for deterministic
/// per-cell randomness that does not depend on the order cells are visited.
pub fn hash3(a: u64, b: u64, c: u64) -> u64 {
    let mut h = a ^ 0x9E37_79B9_7F4A_7C15;
    for v in [b, c] {
        h ^= v.wrapping_add(0x9E37_79B9_7F4A_7C15).wrapping_add(h << 6).wrapping_add(h >> 2);
        h = (h ^ (h >> 30)).wrapping_mul(0xBF58_476D_1CE4_E5B9);
        h = (h ^ (h >> 27)).wrapping_mul(0x94D0_49BB_1331_11EB);
        h ^= h >> 31;
    }
    h
}

/// A hash as a number in [0, 1).
pub fn unit(h: u64) -> f64 {
    (h >> 11) as f64 / (1u64 << 53) as f64
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn same_seed_same_world() {
        let a = Terrain::new(7);
        let b = Terrain::new(7);
        for i in 0..200 {
            let x = i as f64 * 137.3 - 9000.0;
            let z = i as f64 * -71.9 + 4000.0;
            assert_eq!(a.sample(x, z), b.sample(x, z));
        }
    }

    #[test]
    fn different_seed_different_world() {
        let a = Terrain::new(1);
        let b = Terrain::new(2);
        let differs = (0..100).filter(|&i| {
            let x = i as f64 * 311.0;
            (a.height(x, 50.0) - b.height(x, 50.0)).abs() > 0.5
        }).count();
        assert!(differs > 80, "only {differs} of 100 points differ");
    }

    #[test]
    fn profile_is_asymmetric_and_continuous() {
        // Rises over STOSS of the period, falls over the rest.
        assert!(dune_profile(0.0).abs() < 1e-12);
        assert!((dune_profile(STOSS) - 1.0).abs() < 1e-12);
        let max_rise = (0..1000).map(|i| {
            let t = i as f64 / 1000.0 * STOSS;
            (dune_profile(t + 1e-4) - dune_profile(t)) / 1e-4
        }).fold(0.0, f64::max);
        let max_fall = (0..1000).map(|i| {
            let t = STOSS + i as f64 / 1000.0 * (1.0 - STOSS) - 1e-4;
            (dune_profile(t) - dune_profile(t + 1e-4)) / 1e-4
        }).fold(0.0, f64::max);
        assert!(max_fall > 3.0 * max_rise, "slip {max_fall} vs stoss {max_rise}");
        // No jump at the wrap.
        assert!((dune_profile(0.999_999) - dune_profile(1.0)).abs() < 1e-6);
    }

    #[test]
    fn slip_faces_are_steep_but_not_cliffs() {
        // Walk across dunes along the wind and look at the steepest sand slope.
        // Real slip faces sit near 34 degrees; rock islands are excluded.
        let t = Terrain::new(3);
        let (wx, wz) = t.wind();
        let mut steepest: f64 = 0.0;
        for line in 0..40 {
            let ox = line as f64 * 911.0;
            let oz = line as f64 * -577.0;
            for i in 0..3000 {
                let s = i as f64 * 1.0;
                let (x, z) = (ox + wx * s, oz + wz * s);
                let g0 = t.sample(x, z);
                let g1 = t.sample(x + wx, z + wz);
                if g0.rock > 0.01 || g1.rock > 0.01 {
                    continue;
                }
                steepest = steepest.max(((g1.height - g0.height) as f64).abs());
            }
        }
        let deg = steepest.atan().to_degrees();
        assert!(deg > 22.0 && deg < 50.0, "steepest sand slope {deg:.1} deg");
    }

    #[test]
    fn there_are_plains_and_there_are_seas() {
        let t = Terrain::new(5);
        let mut plain = 0;
        let mut sea = 0;
        let n = 60 * 60;
        for i in 0..60 {
            for j in 0..60 {
                let d = t.duniness(i as f64 * 1500.0, j as f64 * 1500.0);
                if d < 0.15 { plain += 1; }
                if d > 0.85 { sea += 1; }
            }
        }
        let (p, s) = (plain as f64 / n as f64, sea as f64 / n as f64);
        assert!(p > 0.05 && p < 0.45, "plain fraction {p:.2}");
        assert!(s > 0.3, "sea fraction {s:.2}");
    }

    #[test]
    fn rock_islands_are_sparse_but_present() {
        let t = Terrain::new(9);
        let mut rocks = 0;
        for cz in 0..30 {
            for cx in 0..30 {
                if t.rock_in_cell(cx, cz).is_some() {
                    rocks += 1;
                }
            }
        }
        // 900 cells of 3.2 km: expect roughly a third to hold a rock.
        assert!((220..=400).contains(&rocks), "{rocks} rocks in 900 cells");
    }

    #[test]
    fn rocks_stand_above_the_sand() {
        let t = Terrain::new(9);
        let r = (0..400)
            .find_map(|i| t.rock_in_cell(i % 20, i / 20))
            .expect("some rock");
        let top = t.sample(r.x, r.z);
        let far = t.sample(r.x + r.radius * 3.0, r.z);
        assert!(top.rock > 0.9, "rock weight at centre {}", top.rock);
        assert!(far.rock < 0.01);
        assert!(top.height > t.sample(r.x + r.radius * 1.7, r.z).height + 10.0);
    }

    #[test]
    fn heights_stay_in_a_sane_band() {
        let t = Terrain::new(11);
        let mut lo = f32::MAX;
        let mut hi = f32::MIN;
        for i in 0..200 {
            for j in 0..200 {
                let h = t.height(i as f64 * 97.0 - 9000.0, j as f64 * 97.0 - 9000.0);
                lo = lo.min(h);
                hi = hi.max(h);
                assert!(h.is_finite());
            }
        }
        assert!(lo > -60.0 && hi < 320.0, "height band {lo}..{hi}");
        assert!(hi - lo > 60.0, "a desert should have relief: {lo}..{hi}");
    }

    #[test]
    fn far_from_the_origin_still_works() {
        // A long ride goes tens of kilometres. The function must not degrade.
        let t = Terrain::new(4);
        for &x in &[0.0, 50_000.0, 250_000.0, -1_000_000.0] {
            let a = t.height(x, x * 0.3);
            let b = t.height(x + 1.0, x * 0.3);
            assert!(a.is_finite() && (a - b).abs() < 3.0, "at {x}: {a} vs {b}");
        }
    }
}
