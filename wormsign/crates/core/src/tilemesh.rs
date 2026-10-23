//! Turning a terrain tile into triangles.
//!
//! Plain arrays, no engine types — the game crate copies them into a Bevy
//! mesh. Vertex positions are relative to the tile's minimum corner so they
//! stay small and precise however far from the origin the tile is; the
//! entity's transform places it.
//!
//! Normals come from the sampled grid itself, with a one-sample border, so a
//! tile costs (n+3)² height evaluations rather than five per vertex, and
//! adjacent tiles at the same level agree exactly along their shared edge.
//!
//! Tiles at different levels meet with a small mismatch along the seam. A
//! skirt — a strip hanging down from every edge — hides the crack. On sand,
//! a few metres of sand-coloured wall seen edge-on is invisible.

use crate::lod::{TileKey, TILE_QUADS};
use crate::shade::{lattice_for, visibility, HeightCache};
use crate::terrain::Terrain;

pub struct TileMesh {
    pub positions: Vec<[f32; 3]>,
    pub normals: Vec<[f32; 3]>,
    /// 0 = sand, 1 = rock, for the material to blend on.
    pub rock: Vec<f32>,
    /// How much of the sun each vertex sees, 0..1 (baked dune shadows).
    pub sun: Vec<f32>,
    /// Surface curvature: positive on crests, negative in troughs, roughly
    /// metres of bulge per 10 m. Crests read lighter, troughs darker.
    pub curv: Vec<f32>,
    pub indices: Vec<u32>,
    /// Lowest and highest vertex heights, for culling bounds.
    pub min_y: f32,
    pub max_y: f32,
}

/// A tile with no shared height cache (tests, one-offs).
pub fn build_tile(terrain: &Terrain, key: TileKey) -> TileMesh {
    build_tile_shaded(terrain, key, &mut HeightCache::new())
}

/// A tile, with its dune shadows baked using (and filling) `cache`.
pub fn build_tile_shaded(terrain: &Terrain, key: TileKey, cache: &mut HeightCache) -> TileMesh {
    let q = TILE_QUADS as usize;
    let n = q + 1; // vertices per edge
    let step = key.spacing();
    let (ox, oz) = key.origin();

    // Sample with a one-vertex border for normals: indices -1..=q+1.
    let b = n + 2;
    let mut h = vec![0.0f32; b * b];
    let mut rock = vec![0.0f32; n * n];
    for j in 0..b {
        for i in 0..b {
            let x = ox + (i as f64 - 1.0) * step;
            let z = oz + (j as f64 - 1.0) * step;
            let g = terrain.sample(x, z);
            h[j * b + i] = g.height;
            if (1..=n).contains(&i) && (1..=n).contains(&j) {
                rock[(j - 1) * n + (i - 1)] = g.rock;
            }
        }
    }

    let skirt_depth = (step * 2.0 + 3.0) as f32;
    let top = n * n;
    let skirt = 4 * n;
    let mut positions = Vec::with_capacity(top + skirt);
    let mut normals = Vec::with_capacity(top + skirt);
    let mut rocks = Vec::with_capacity(top + skirt);
    let mut sun = Vec::with_capacity(top + skirt);
    let mut curv = Vec::with_capacity(top + skirt);
    let (mut min_y, mut max_y) = (f32::MAX, f32::MIN);

    // Heights for the shadow march: the tile's own grid where the ray is
    // over the tile, the shared lattice beyond.
    let grid = |x: f64, z: f64| -> Option<f32> {
        let fx = (x - ox) / step + 1.0;
        let fz = (z - oz) / step + 1.0;
        if fx < 0.0 || fz < 0.0 || fx >= (b - 1) as f64 || fz >= (b - 1) as f64 {
            return None;
        }
        let (i, j) = (fx.floor() as usize, fz.floor() as usize);
        let (u, v) = ((fx - i as f64) as f32, (fz - j as f64) as f32);
        let a = h[j * b + i] + (h[j * b + i + 1] - h[j * b + i]) * u;
        let c = h[(j + 1) * b + i] + (h[(j + 1) * b + i + 1] - h[(j + 1) * b + i]) * u;
        Some(a + (c - a) * v)
    };
    let lattice = lattice_for(step);
    let mut far = |x: f64, z: f64| cache.height(terrain, lattice, x, z);

    let two_step = (2.0 * step) as f32;
    for j in 0..n {
        for i in 0..n {
            let (bi, bj) = (i + 1, j + 1);
            let y = h[bj * b + bi];
            let dx = h[bj * b + bi + 1] - h[bj * b + bi - 1];
            let dz = h[(bj + 1) * b + bi] - h[(bj - 1) * b + bi];
            let nx = -dx / two_step;
            let nz = -dz / two_step;
            let l = (nx * nx + 1.0 + nz * nz).sqrt();
            positions.push([(i as f64 * step) as f32, y, (j as f64 * step) as f32]);
            normals.push([nx / l, 1.0 / l, nz / l]);
            rocks.push(rock[j * n + i]);
            let (wx, wz) = (ox + i as f64 * step, oz + j as f64 * step);
            sun.push(visibility(wx, wz, y as f64, step, &grid, &mut far));
            // Laplacian over the neighbours, scaled to a 10 m baseline.
            let lap = h[bj * b + bi + 1] + h[bj * b + bi - 1] + h[(bj + 1) * b + bi] + h[(bj - 1) * b + bi] - 4.0 * y;
            curv.push(-lap / (step as f32 * step as f32) * 25.0);
            min_y = min_y.min(y);
            max_y = max_y.max(y);
        }
    }

    let mut indices = Vec::with_capacity(q * q * 6 + 4 * q * 6);
    for j in 0..q {
        for i in 0..q {
            let v00 = (j * n + i) as u32;
            let v10 = v00 + 1;
            let v01 = v00 + n as u32;
            let v11 = v01 + 1;
            // Counter-clockwise seen from above, so the faces point up.
            indices.extend_from_slice(&[v00, v01, v11, v00, v11, v10]);
        }
    }

    // Skirts: each edge's vertices again, dropped, stitched to the edge.
    // The four edges, each walked so its skirt faces outward.
    let edges: [Vec<usize>; 4] = [
        (0..n).map(|i| i).collect(),                         // z = 0 edge
        (0..n).map(|j| j * n + q).collect(),                 // x = max edge
        (0..n).rev().map(|i| q * n + i).collect(),           // z = max edge
        (0..n).rev().map(|j| j * n).collect(),               // x = 0 edge
    ];
    for edge in &edges {
        let base = positions.len() as u32;
        for &v in edge {
            let [x, y, z] = positions[v];
            positions.push([x, y - skirt_depth, z]);
            normals.push(normals[v]);
            rocks.push(rocks[v]);
            sun.push(sun[v]);
            curv.push(curv[v]);
        }
        for k in 0..q {
            let a = edge[k] as u32;
            let c = edge[k + 1] as u32;
            let a2 = base + k as u32;
            let c2 = base + k as u32 + 1;
            indices.extend_from_slice(&[a, a2, c2, a, c2, c]);
        }
    }
    min_y -= skirt_depth;

    TileMesh { positions, normals, rock: rocks, sun, curv, indices, min_y, max_y }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn vertices_sit_on_the_terrain() {
        let t = Terrain::new(2);
        let key = TileKey { level: 1, ix: 3, iz: -2 };
        let m = build_tile(&t, key);
        let (ox, oz) = key.origin();
        for &k in &[0usize, 17, 64 * 65 + 3, 65 * 65 - 1] {
            let [x, y, z] = m.positions[k];
            let want = t.height(ox + x as f64, oz + z as f64);
            assert!((y - want).abs() < 1e-3, "vertex {k}: {y} vs {want}");
        }
    }

    #[test]
    fn surface_faces_point_up_and_normals_are_unit() {
        let t = Terrain::new(2);
        let m = build_tile(&t, TileKey { level: 0, ix: 0, iz: 0 });
        let top_tris = 64 * 64 * 2;
        for tri in m.indices.chunks(3).take(top_tris) {
            let [a, b, c] = [m.positions[tri[0] as usize], m.positions[tri[1] as usize], m.positions[tri[2] as usize]];
            let u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
            let v = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
            let ny = u[2] * v[0] - u[0] * v[2];
            assert!(ny > 0.0, "a surface triangle faces down");
        }
        for n in &m.normals {
            let l = (n[0] * n[0] + n[1] * n[1] + n[2] * n[2]).sqrt();
            assert!((l - 1.0).abs() < 1e-4);
        }
    }

    #[test]
    fn neighbours_at_one_level_agree_on_the_seam() {
        let t = Terrain::new(8);
        let a = build_tile(&t, TileKey { level: 2, ix: 0, iz: 0 });
        let b = build_tile(&t, TileKey { level: 2, ix: 1, iz: 0 });
        // a's x = max edge against b's x = 0 edge.
        for j in 0..65 {
            let ya = a.positions[j * 65 + 64][1];
            let yb = b.positions[j * 65][1];
            assert!((ya - yb).abs() < 1e-3, "seam row {j}: {ya} vs {yb}");
            let na = a.normals[j * 65 + 64];
            let nb = b.normals[j * 65];
            assert!((na[1] - nb[1]).abs() < 1e-4, "seam normals differ at row {j}");
        }
    }

    #[test]
    fn indices_are_in_range() {
        let t = Terrain::new(1);
        let m = build_tile(&t, TileKey { level: 4, ix: -1, iz: 2 });
        let n = m.positions.len() as u32;
        assert!(m.indices.iter().all(|&i| i < n));
        assert_eq!(m.indices.len() % 3, 0);
        assert_eq!(m.positions.len(), m.normals.len());
        assert_eq!(m.positions.len(), m.rock.len());
    }

    #[test]
    fn shadows_are_baked_and_deterministic() {
        let t = Terrain::new(0x5A2D_1965);
        let key = TileKey { level: 0, ix: 1, iz: -2 };
        let a = build_tile(&t, key);
        let b = build_tile(&t, key);
        assert_eq!(a.sun, b.sun);
        assert_eq!(a.sun.len(), a.positions.len());
        assert!(a.sun.iter().all(|v| (0.0..=1.0).contains(v)));
        // Somewhere in a dune field there is shade and there is sun.
        let mut lit = 0;
        let mut dark = 0;
        for ix in -4..4 {
            let m = build_tile(&t, TileKey { level: 1, ix, iz: 3 });
            lit += m.sun.iter().filter(|v| **v > 0.9).count();
            dark += m.sun.iter().filter(|v| **v < 0.1).count();
        }
        assert!(lit > 1000 && dark > 200, "lit {lit}, dark {dark}");
    }

    #[test]
    fn a_shared_cache_makes_tiles_cheap() {
        let t = Terrain::new(4);
        let mut cache = HeightCache::new();
        let start = std::time::Instant::now();
        for ix in 0..8 {
            build_tile_shaded(&t, TileKey { level: 0, ix, iz: 0 }, &mut cache);
        }
        let per = start.elapsed().as_secs_f64() / 8.0;
        let s2 = std::time::Instant::now();
        for ix in 0..8 {
            build_tile_shaded(&t, TileKey { level: 0, ix: ix + 20, iz: 40 }, &mut HeightCache::new());
        }
        eprintln!("cold-cache tile: {:.1} ms", s2.elapsed().as_secs_f64() / 8.0 * 1000.0);
        // Native release: a tile should be a few milliseconds.
        eprintln!("shaded tile: {:.1} ms", per * 1000.0);
        assert!(per < 0.05, "{:.1} ms per tile", per * 1000.0);
    }
}
