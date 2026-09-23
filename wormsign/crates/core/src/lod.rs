//! Which terrain tiles to draw, and at what detail.
//!
//! A quadtree over the ground plane. Every tile has the same number of
//! vertices; what changes with level is how much ground it covers, so a
//! level-0 tile near the player spaces its vertices 4 m apart and a level-6
//! tile on the horizon spaces them 256 m apart. Tiles split while they are
//! close to the player relative to their own size, which gives a smooth
//! falloff of detail with distance and a total tile count in the low
//! hundreds regardless of how far the view reaches.
//!
//! This decides *what* should exist. Building the meshes, over several
//! frames, is the streamer's job in the game crate.

/// Edge length of the smallest tile, metres.
pub const BASE_TILE: f64 = 256.0;
/// Quads along each tile edge, at every level.
pub const TILE_QUADS: u32 = 64;
/// Coarsest level. Level-6 tiles are 16.4 km across.
pub const MAX_LEVEL: u8 = 6;
/// A tile splits while the player is within this many tile-widths of it.
/// At 1.0 a ring is ~24 tiles per level and the total stays 80-160;
/// 1.25 costs ~215 tiles (and draw calls) for detail nobody can see.
pub const SPLIT_K: f64 = 1.0;

#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, PartialOrd, Ord)]
pub struct TileKey {
    pub level: u8,
    pub ix: i64,
    pub iz: i64,
}

impl TileKey {
    pub fn size(&self) -> f64 {
        BASE_TILE * (1u64 << self.level) as f64
    }
    /// World-space minimum corner (x, z).
    pub fn origin(&self) -> (f64, f64) {
        let s = self.size();
        (self.ix as f64 * s, self.iz as f64 * s)
    }
    pub fn centre(&self) -> (f64, f64) {
        let (x, z) = self.origin();
        let h = self.size() * 0.5;
        (x + h, z + h)
    }
    pub fn spacing(&self) -> f64 {
        self.size() / TILE_QUADS as f64
    }
    pub fn children(&self) -> [TileKey; 4] {
        let l = self.level - 1;
        let (x, z) = (self.ix * 2, self.iz * 2);
        [
            TileKey { level: l, ix: x, iz: z },
            TileKey { level: l, ix: x + 1, iz: z },
            TileKey { level: l, ix: x, iz: z + 1 },
            TileKey { level: l, ix: x + 1, iz: z + 1 },
        ]
    }
    pub fn parent(&self) -> Option<TileKey> {
        (self.level < MAX_LEVEL).then(|| TileKey {
            level: self.level + 1,
            ix: self.ix.div_euclid(2),
            iz: self.iz.div_euclid(2),
        })
    }
    /// Distance from a point to the nearest point of this tile, in the plane.
    pub fn distance_to(&self, x: f64, z: f64) -> f64 {
        let (ox, oz) = self.origin();
        let s = self.size();
        let dx = (ox - x).max(0.0).max(x - (ox + s));
        let dz = (oz - z).max(0.0).max(z - (oz + s));
        (dx * dx + dz * dz).sqrt()
    }
    pub fn contains(&self, x: f64, z: f64) -> bool {
        let (ox, oz) = self.origin();
        let s = self.size();
        x >= ox && x < ox + s && z >= oz && z < oz + s
    }
}

/// Every tile that should be drawn for a viewer at (x, z), finest near,
/// coarsest far. The tiles tile the plane over a 3x3 block of roots around
/// the viewer with no gaps and no overlaps.
pub fn desired_tiles(x: f64, z: f64) -> Vec<TileKey> {
    let root = BASE_TILE * (1u64 << MAX_LEVEL) as f64;
    let rx = (x / root).floor() as i64;
    let rz = (z / root).floor() as i64;
    let mut out = Vec::with_capacity(256);
    for dz in -1..=1 {
        for dx in -1..=1 {
            split(TileKey { level: MAX_LEVEL, ix: rx + dx, iz: rz + dz }, x, z, &mut out);
        }
    }
    // Nearest first, so a streamer that works down this list builds what the
    // player is standing on before what is on the horizon.
    out.sort_by(|a, b| {
        a.distance_to(x, z).partial_cmp(&b.distance_to(x, z)).unwrap().then(a.level.cmp(&b.level))
    });
    out
}

fn split(t: TileKey, x: f64, z: f64, out: &mut Vec<TileKey>) {
    if t.level > 0 && t.distance_to(x, z) < SPLIT_K * t.size() {
        for c in t.children() {
            split(c, x, z, out);
        }
    } else {
        out.push(t);
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn the_viewer_stands_on_the_finest_tile() {
        for &(x, z) in &[(0.0, 0.0), (1234.5, -987.0), (50_000.3, 70_000.9), (-3.0, -3.0)] {
            let tiles = desired_tiles(x, z);
            let under: Vec<_> = tiles.iter().filter(|t| t.contains(x, z)).collect();
            assert_eq!(under.len(), 1, "exactly one tile under the viewer");
            assert_eq!(under[0].level, 0);
        }
    }

    #[test]
    fn tiles_cover_without_gaps_or_overlaps() {
        let (vx, vz) = (777.0, -4321.0);
        let tiles = desired_tiles(vx, vz);
        // Probe a grid of points spanning well past the finest ring.
        for i in -60..60 {
            for j in -60..60 {
                let (x, z) = (vx + i as f64 * 211.7, vz + j as f64 * 197.3);
                let n = tiles.iter().filter(|t| t.contains(x, z)).count();
                assert_eq!(n, 1, "point ({x},{z}) covered {n} times");
            }
        }
        // And the areas add up to the 3x3 roots exactly.
        let root = BASE_TILE * (1u64 << MAX_LEVEL) as f64;
        let area: f64 = tiles.iter().map(|t| t.size() * t.size()).sum();
        assert!((area - 9.0 * root * root).abs() < 1.0);
    }

    #[test]
    fn detail_falls_off_with_distance() {
        let tiles = desired_tiles(100.0, 100.0);
        for t in &tiles {
            let d = t.distance_to(100.0, 100.0);
            // A tile is never coarser than it needs to be close in...
            if t.level > 0 {
                assert!(d >= SPLIT_K * t.size() * 0.999, "{t:?} at {d:.0} m should have split");
            }
        }
        let levels: Vec<u8> = tiles.iter().map(|t| t.level).collect();
        assert!(levels.contains(&0) && levels.contains(&MAX_LEVEL));
    }

    #[test]
    fn tile_count_stays_modest() {
        // Draw calls on WebGL2 are the budget; this is it.
        for &(x, z) in &[(0.0, 0.0), (8191.0, 8191.0), (-12345.0, 600.0)] {
            let n = desired_tiles(x, z).len();
            assert!(n < 180, "{n} tiles at ({x},{z})");
        }
    }

    #[test]
    fn family_relations_round_trip() {
        let t = TileKey { level: 3, ix: -5, iz: 7 };
        for c in t.children() {
            assert_eq!(c.parent(), Some(t));
        }
        assert_eq!(TileKey { level: MAX_LEVEL, ix: 0, iz: 0 }.parent(), None);
    }

    #[test]
    fn moving_a_little_changes_a_little() {
        // Walking 10 m should not re-plan the world.
        let a = desired_tiles(1000.0, 1000.0);
        let b = desired_tiles(1010.0, 1000.0);
        let changed = b.iter().filter(|t| !a.contains(t)).count();
        assert!(changed <= 16, "{changed} tiles changed for a 10 m step");
    }
}
