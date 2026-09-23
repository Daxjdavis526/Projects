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
use crate::terrain::Terrain;

pub struct TileMesh {
    pub positions: Vec<[f32; 3]>,
    pub normals: Vec<[f32; 3]>,
    /// 0 = sand, 1 = rock, for the material to blend on.
    pub rock: Vec<f32>,
    pub indices: Vec<u32>,
    /// Lowest and highest vertex heights, for culling bounds.
    pub min_y: f32,
    pub max_y: f32,
}

pub fn build_tile(terrain: &Terrain, key: TileKey) -> TileMesh {
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
    let (mut min_y, mut max_y) = (f32::MAX, f32::MIN);

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

    TileMesh { positions, normals, rock: rocks, indices, min_y, max_y }
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
}
