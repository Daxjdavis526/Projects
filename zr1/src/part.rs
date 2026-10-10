//! One coloured part through the kernel's pipeline:
//!
//! field → sparse bake (`SparseGrid::from_field`) → sharp surface nets
//! (`extract_surface_sharp`, vertices placed from the field's own
//! Hermite data) → the mesh gate (closed, oriented, non-degenerate,
//! no self-intersection, volume against the grid, declared shell count)
//! → quadric simplification inside a deviation band measured against
//! the baked field (`simplify`) → the gate again.
//!
//! Nothing reaches a file without passing the gate twice.

use std::time::Instant;

use odawn_geo::{Band, Field, SparseGrid, ValidMesh, extract_surface, extract_surface_sharp, simplify};

/// The STEP file's simplification band, mm full scale (0.1 mm on the
/// 1:15.3 model — under a desktop printer's resolution).
pub const STEP_BAND_MM: f64 = 1.5;

use crate::fields::F;

/// Surface finish, for the renderers (STEP carries the colour only).
#[derive(Debug, Clone, Copy)]
pub struct Finish {
    /// Linear-ish sRGB colour, 0..1.
    pub rgb: [f32; 3],
    /// glTF metallic factor.
    pub metallic: f32,
    /// glTF roughness factor.
    pub roughness: f32,
    /// Opacity (1 opaque).
    pub alpha: f32,
}

/// A part to build.
pub struct Part {
    /// Name, written into every output.
    pub name: &'static str,
    /// What it is painted / made of, in words.
    pub material: &'static str,
    /// Finish.
    pub finish: Finish,
    /// The shape, millimetres at full scale.
    pub field: F,
    /// Bake voxel, millimetres at full scale.
    pub voxel_mm: f64,
    /// Simplification band (±), millimetres at full scale; 0 = none.
    pub band_mm: f64,
    /// Expected closed shells (separate pieces); `None` = count them.
    pub shells: Option<usize>,
    /// Use the kernel's sharp-feature mesher (vertices on creases from
    /// the field's Hermite data). At 1:15.3 the plain mesher's crease
    /// rounding (≈ 0.45 voxel) is a few hundredths of a millimetre on
    /// the model, so only small mechanical parts ask for it; if the gate
    /// refuses the sharp mesh, the plain mesher is tried.
    pub sharp: bool,
}

/// A built part.
pub struct Built {
    /// Name.
    pub name: &'static str,
    /// Material in words.
    pub material: &'static str,
    /// Finish.
    pub finish: Finish,
    /// The gated, simplified mesh, millimetres at full scale.
    pub mesh: ValidMesh,
    /// The same surface simplified harder for the STEP file (a faceted
    /// B-rep pays ~300 bytes per triangle), gated likewise.
    pub step_mesh: ValidMesh,
    /// Its worst measured deviation, mm full scale.
    pub step_deviation_mm: f64,
    /// Shell count the gate held it to.
    pub shells: usize,
    /// Triangles straight out of the mesher.
    pub raw_triangles: usize,
    /// Worst measured deviation of the simplified mesh from the baked
    /// field, mm full scale (0 when not simplified).
    pub deviation_mm: f64,
    /// Seconds spent.
    pub seconds: f64,
    /// Which mesher produced it.
    pub mesher: &'static str,
}

/// Count closed shells by flood fill over shared vertices.
/// Where the shells of a mesh are, all but the largest: " [shell at
/// (x, y, z) w × d × h mm, n triangles; …]" — for a refusal that expected
/// fewer.
fn shell_sites(v: &[odawn_geo::Vec3], tris: &[[u32; 3]]) -> String {
    let mut parent: Vec<u32> = (0..v.len() as u32).collect();
    fn find(p: &mut [u32], mut x: u32) -> u32 {
        while p[x as usize] != x {
            p[x as usize] = p[p[x as usize] as usize];
            x = p[x as usize];
        }
        x
    }
    for t in tris {
        let a = find(&mut parent, t[0]);
        for &o in &t[1..] {
            let b = find(&mut parent, o);
            if a != b {
                parent[b as usize] = a;
            }
        }
    }
    let mut groups: std::collections::HashMap<u32, (usize, [f64; 3], [f64; 3])> = std::collections::HashMap::new();
    for t in tris {
        let r = find(&mut parent, t[0]);
        let e = groups.entry(r).or_insert((0, [f64::INFINITY; 3], [f64::NEG_INFINITY; 3]));
        e.0 += 1;
        for &i in t {
            let p = v[i as usize];
            for (k, c) in [p.x, p.y, p.z].into_iter().enumerate() {
                e.1[k] = e.1[k].min(c);
                e.2[k] = e.2[k].max(c);
            }
        }
    }
    let mut g: Vec<_> = groups.into_values().collect();
    g.sort_by(|a, b| b.0.cmp(&a.0));
    let parts: Vec<String> = g
        .iter()
        .skip(1)
        .take(8)
        .map(|(n, lo, hi)| {
            format!(
                "shell at ({:.0}, {:.0}, {:.0}) {:.0} x {:.0} x {:.0} mm, {n} triangles",
                (lo[0] + hi[0]) / 2.0,
                (lo[1] + hi[1]) / 2.0,
                (lo[2] + hi[2]) / 2.0,
                hi[0] - lo[0],
                hi[1] - lo[1],
                hi[2] - lo[2]
            )
        })
        .collect();
    if parts.is_empty() { String::new() } else { format!(" [{}]", parts.join("; ")) }
}

fn count_shells(nv: usize, tris: &[[u32; 3]]) -> usize {
    let mut parent: Vec<u32> = (0..nv as u32).collect();
    fn find(p: &mut [u32], mut x: u32) -> u32 {
        while p[x as usize] != x {
            p[x as usize] = p[p[x as usize] as usize];
            x = p[x as usize];
        }
        x
    }
    for t in tris {
        let a = find(&mut parent, t[0]);
        for &o in &t[1..] {
            let b = find(&mut parent, o);
            if a != b {
                parent[b as usize] = a;
            }
        }
    }
    let mut used = vec![false; nv];
    for t in tris {
        for &i in t {
            used[i as usize] = true;
        }
    }
    let mut roots = std::collections::HashSet::new();
    for i in 0..nv {
        if used[i] {
            roots.insert(find(&mut parent, i as u32));
        }
    }
    roots.len()
}

/// Build one part through the whole pipeline.
pub fn build(part: Part) -> Result<Built, String> {
    let t0 = Instant::now();
    let name = part.name;
    let base = part
        .field
        .bounds_mm()
        .ok_or_else(|| format!("{name}: unbounded field"))?;
    // A sliver thinner than a voxel can meet the lattice so that the
    // surface touches itself inside one cell, and the gate refuses the
    // mesh as non-manifold. Whether it does depends on where the lattice
    // falls, so a refused mesh is baked again on a lattice shifted by part
    // of a voxel, then on a finer one. Every attempt goes through the same
    // gate; nothing ungated is ever kept.
    let attempts = [(1.0, 0.0), (1.0, 0.5), (0.8, 0.0), (0.8, 0.37), (0.6, 0.0)];
    let mut last_err = String::new();
    let mut found = None;
    for (k, &(f, shift)) in attempts.iter().enumerate() {
        let voxel = part.voxel_mm * f;
        let s = shift * voxel;
        let b = base.inflated(4.0 * voxel);
        let b = odawn_geo::Aabb::new(b.min_mm - odawn_geo::Vec3::new(s, s, s), b.max_mm).expect("bounds");
        let grid = match SparseGrid::from_field(&part.field, b, voxel) {
            Ok(g) => g,
            Err(e) => return Err(format!("{name}: bake: {e}")),
        };
        match mesh_and_gate(&part, &grid) {
            Ok(r) => {
                if k > 0 {
                    eprintln!("  {name}: gated on attempt {} (voxel {:.2} mm, lattice shifted {:.2} mm)", k + 1, voxel, s);
                }
                found = Some((grid, r));
                break;
            }
            Err(e) => {
                eprintln!("  {e}");
                last_err = e;
            }
        }
    }
    let (grid, (mesh, shells, raw_tris, mesher)) = found.ok_or(last_err)?;
    let classes = vec![0u8; mesh.triangle_count()];
    let simplified = |band: f64| -> Result<(ValidMesh, f64), String> {
        let s = simplify(&mesh, &grid, &classes, &[Band::symmetric(band)])
            .map_err(|e| format!("{name}: simplify: {e}"))?;
        let dev = s
            .deviation
            .iter()
            .map(|d| d.max_inward_mm.max(d.max_outward_mm))
            .fold(0.0, f64::max);
        let m = s
            .mesh
            .validate(Some(&grid), shells)
            .map_err(|e| format!("{name}: gate (simplified to {band} mm): {e}"))?;
        Ok((m, dev))
    };
    // If a simplified mesh fails its re-gate, tighten the band and try
    // again; the gated, unsimplified mesh is the last resort.
    let settle = |band: f64| -> Result<(ValidMesh, f64), String> {
        let mut b = band;
        for _ in 0..3 {
            match simplified(b) {
                Ok(r) => return Ok(r),
                Err(e) => {
                    eprintln!("  {e}; retrying at {:.3} mm", b / 2.0);
                    b /= 2.0;
                }
            }
        }
        Ok((mesh.clone(), 0.0))
    };
    let (fine, dev) = settle(part.band_mm)?;
    let (step_mesh, step_dev) = settle((part.band_mm * 3.0).max(STEP_BAND_MM))?;
    let mesh = fine;
    Ok(Built {
        name,
        material: part.material,
        finish: part.finish,
        shells,
        raw_triangles: raw_tris,
        deviation_mm: dev,
        step_mesh,
        step_deviation_mm: step_dev,
        seconds: t0.elapsed().as_secs_f64(),
        mesher,
        mesh,
    })
}


/// Where a mesh uses a directed edge more than once (a non-manifold
/// seam): a few positions, for the refusal message. Empty when none.
fn nonmanifold_sites(vs: &[odawn_geo::Vec3], ts: &[[u32; 3]]) -> String {
    let mut seen: std::collections::HashMap<(u32, u32), u32> = std::collections::HashMap::new();
    for t in ts {
        for e in 0..3 {
            *seen.entry((t[e], t[(e + 1) % 3])).or_insert(0) += 1;
        }
    }
    let mut pts: Vec<odawn_geo::Vec3> = seen
        .iter()
        .filter(|(_, n)| **n > 1)
        .map(|((a, b), _)| (vs[*a as usize] + vs[*b as usize]) * 0.5)
        .collect();
    if pts.is_empty() {
        return String::new();
    }
    pts.sort_by(|a, b| a.x.total_cmp(&b.x));
    let pick: Vec<String> = pts
        .iter()
        .step_by((pts.len() / 8).max(1))
        .map(|p| format!("({:.0}, {:.0}, {:.0})", p.x, p.y, p.z))
        .collect();
    format!(" [non-manifold near {}]", pick.join(" "))
}

/// Save a built part's two meshes (the cache `assemble` reads back).
pub fn save(b: &Built, dir: &std::path::Path) -> std::io::Result<()> {
    use std::io::Write;
    std::fs::create_dir_all(dir)?;
    let mut out = Vec::new();
    out.extend_from_slice(&(b.shells as u32).to_le_bytes());
    out.extend_from_slice(&b.deviation_mm.to_le_bytes());
    out.extend_from_slice(&b.step_deviation_mm.to_le_bytes());
    for m in [&b.mesh, &b.step_mesh] {
        out.extend_from_slice(&(m.vertex_count() as u32).to_le_bytes());
        for v in m.vertices_mm() {
            for c in [v.x, v.y, v.z] {
                out.extend_from_slice(&c.to_le_bytes());
            }
        }
        out.extend_from_slice(&(m.triangle_count() as u32).to_le_bytes());
        for t in m.triangles() {
            for i in t {
                out.extend_from_slice(&i.to_le_bytes());
            }
        }
    }
    let mut f = std::fs::File::create(dir.join(format!("{}.mesh", b.name)))?;
    f.write_all(&out)
}

/// Load a cached part, re-validated through the kernel's gate (closed,
/// oriented, no self-intersection, the recorded shell count) — a cached
/// file is never trusted as-is. `None` when the part was never built.
pub fn load(part: &Part, dir: &std::path::Path) -> Option<Result<Built, String>> {
    let bytes = std::fs::read(dir.join(format!("{}.mesh", part.name))).ok()?;
    let shells = u32::from_le_bytes(bytes[0..4].try_into().expect("u32")) as usize;
    let mut at = 4usize;
    let f64_at = |at: &mut usize| {
        let v = f64::from_le_bytes(bytes[*at..*at + 8].try_into().expect("f64"));
        *at += 8;
        v
    };
    let dev = f64_at(&mut at);
    let sdev = f64_at(&mut at);
    let mut meshes = Vec::new();
    for _ in 0..2 {
        let nv = u32::from_le_bytes(bytes[at..at + 4].try_into().expect("u32")) as usize;
        at += 4;
        let mut vs = Vec::with_capacity(nv);
        for _ in 0..nv {
            let x = f64_at(&mut at);
            let y = f64_at(&mut at);
            let z = f64_at(&mut at);
            vs.push(odawn_geo::Vec3::new(x, y, z));
        }
        let nt = u32::from_le_bytes(bytes[at..at + 4].try_into().expect("u32")) as usize;
        at += 4;
        let mut ts = Vec::with_capacity(nt);
        for _ in 0..nt {
            let mut t = [0u32; 3];
            for c in &mut t {
                *c = u32::from_le_bytes(bytes[at..at + 4].try_into().expect("u32"));
                at += 4;
            }
            ts.push(t);
        }
        let raw = odawn_geo::RawMesh {
            vertices_mm: vs,
            triangles: ts,
            multi_patch_cells: 0,
        };
        match raw.validate(None, shells) {
            Ok(m) => meshes.push(m),
            Err(e) => return Some(Err(format!("{}: cached mesh fails the gate: {e}", part.name))),
        }
    }
    let step_mesh = meshes.pop().expect("two meshes");
    let mesh = meshes.pop().expect("two meshes");
    Some(Ok(Built {
        name: part.name,
        material: part.material,
        finish: part.finish,
        mesh,
        step_mesh,
        shells,
        raw_triangles: 0,
        deviation_mm: dev,
        step_deviation_mm: sdev,
        seconds: 0.0,
        mesher: "cached",
    }))
}

/// Mesh a baked part and pass it through the gate (sharp mesher first when
/// the part asks for it, the plain one otherwise or as the fallback).
fn mesh_and_gate(part: &Part, grid: &SparseGrid) -> Result<(ValidMesh, usize, usize, &'static str), String> {
    let name = part.name;
    let gate = |raw: odawn_geo::RawMesh| -> Result<(ValidMesh, usize, usize), String> {
        let raw_tris = raw.triangles.len();
        let where_bad = nonmanifold_sites(&raw.vertices_mm, &raw.triangles);
        let shells = match part.shells {
            Some(s) => s,
            None => count_shells(raw.vertices_mm.len(), &raw.triangles),
        };
        let where_shells = match part.shells {
            Some(s) if count_shells(raw.vertices_mm.len(), &raw.triangles) != s => shell_sites(&raw.vertices_mm, &raw.triangles),
            _ => String::new(),
        };
        let m = raw
            .validate(Some(grid), shells)
            .map_err(|e| format!("{name}: gate (as meshed): {e}{where_bad}{where_shells}"))?;
        Ok((m, shells, raw_tris))
    };
    let plain = || -> Result<(ValidMesh, usize, usize), String> {
        gate(extract_surface(grid).map_err(|e| format!("{name}: mesh: {e}"))?)
    };
    if part.sharp {
        match extract_surface_sharp(grid, &part.field)
            .map_err(|e| format!("{name}: sharp mesh: {e}"))
            .and_then(gate)
        {
            Ok((m, s, r)) => Ok((m, s, r, "sharp")),
            Err(e) => {
                eprintln!("  {e}; falling back to the plain mesher");
                let (m, s, r) = plain()?;
                Ok((m, s, r, "plain (sharp refused)"))
            }
        }
    } else {
        let (m, s, r) = plain()?;
        Ok((m, s, r, "plain"))
    }
}
