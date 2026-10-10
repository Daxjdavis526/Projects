//! The measured body skin: a quad cage (`data/body_cage.json`, produced
//! by `tools/measure` from the calibrated reference views) and its
//! Catmull–Clark subdivision.
//!
//! The cage is a few thousand control points laid out as station loops
//! around the car, capped at nose and tail; the surface is its
//! subdivision limit, approximated by a fixed number of subdivision
//! steps. Every edge may carry an integer sharpness: a sharp edge is split
//! at its midpoint and its children carry one less, and a vertex on two
//! sharp edges follows the crease rule (e0 + 6 v + e1) / 8 (DeRose, Kass
//! and Truong, SIGGRAPH 1998, integer case). This is the same scheme the
//! measuring tool fits with (`tools/measure/subd.py`), so the surface built
//! here is the surface that was fitted to the views.

use std::collections::HashMap;

use odawn_geo::{MeshField, RawMesh, ValidMesh, Vec3};

/// The cage as stored: full (both halves), millimetres, x rearward from
/// the front axle, y to the right, z up from the ground.
#[derive(Clone)]
pub struct Cage {
    pub vertices: Vec<Vec3>,
    pub quads: Vec<[u32; 4]>,
    /// (a, b, sharpness) for the sharp edges.
    pub creases: Vec<(u32, u32, u32)>,
    /// Subdivision steps the displacement belongs to.
    pub levels: usize,
    /// Fine detail: per subdivided vertex, an offset along the vertex's
    /// normal (mm); empty for none.
    pub displacement: Vec<f64>,
}

impl Cage {
    /// Parse `data/body_cage.json` (a tiny hand-rolled reader: three
    /// arrays of numbers, no dependency).
    pub fn parse(text: &str) -> Result<Cage, String> {
        fn array<'a>(text: &'a str, key: &str) -> Result<Vec<f64>, String> {
            let k = format!("\"{key}\"");
            let at = text.find(&k).ok_or(format!("body cage: no {key}"))?;
            let rest = &text[at + k.len()..];
            let open = rest.find('[').ok_or(format!("body cage: {key} is not an array"))?;
            let mut depth = 0i32;
            let mut end = open;
            for (i, c) in rest[open..].char_indices() {
                match c {
                    '[' => depth += 1,
                    ']' => {
                        depth -= 1;
                        if depth == 0 {
                            end = open + i;
                            break;
                        }
                    }
                    _ => {}
                }
            }
            rest[open..=end]
                .split(|c: char| c == '[' || c == ']' || c == ',' || c.is_whitespace())
                .filter(|s| !s.is_empty())
                .map(|s| s.parse::<f64>().map_err(|e| format!("body cage: {key}: {e}")))
                .collect()
        }
        let v = array(text, "vertices")?;
        let q = array(text, "quads")?;
        let c = array(text, "creases")?;
        let levels = array(text, "levels").map(|l| l.first().copied().unwrap_or(3.0) as usize).unwrap_or(3);
        let disp_scale = array(text, "disp_scale_mm").map(|l| l.first().copied().unwrap_or(0.0)).unwrap_or(0.0);
        let disp: Vec<f64> = array(text, "disp").unwrap_or_default().into_iter().map(|d| d * disp_scale).collect();
        if v.len() % 3 != 0 || q.len() % 4 != 0 || c.len() % 3 != 0 {
            return Err("body cage: array lengths are not multiples of 3 / 4 / 3".into());
        }
        Ok(Cage {
            vertices: v.chunks(3).map(|p| Vec3::new(p[0], p[1], p[2])).collect(),
            quads: q.chunks(4).map(|p| [p[0] as u32, p[1] as u32, p[2] as u32, p[3] as u32]).collect(),
            creases: c.chunks(3).map(|p| (p[0] as u32, p[1] as u32, p[2] as u32)).collect(),
            levels,
            displacement: disp,
        })
    }

    pub fn load() -> Result<Cage, String> {
        let text = std::fs::read_to_string(concat!(env!("CARGO_MANIFEST_DIR"), "/data/body_cage.json"))
            .map_err(|e| format!("data/body_cage.json: {e}"))?;
        Cage::parse(&text)
    }
}

fn key(a: u32, b: u32) -> (u32, u32) {
    if a < b { (a, b) } else { (b, a) }
}

/// One Catmull–Clark step with integer edge sharpness.
fn step(v: &[Vec3], quads: &[[u32; 4]], sharp: &HashMap<(u32, u32), u32>) -> (Vec<Vec3>, Vec<[u32; 4]>, HashMap<(u32, u32), u32>) {
    let n = v.len();
    // unique edges in lexicographic (min, max) order -- the order numpy's
    // `unique` gives the measuring tool, so vertex numbering matches it
    let mut keys: Vec<(u32, u32)> = Vec::with_capacity(quads.len() * 4);
    for q in quads {
        for k in 0..4 {
            keys.push(key(q[k], q[(k + 1) % 4]));
        }
    }
    keys.sort_unstable();
    keys.dedup();
    let edges = keys;
    let edge_id: HashMap<(u32, u32), u32> = edges.iter().enumerate().map(|(i, &e)| (e, i as u32)).collect();
    let mut edge_faces: Vec<Vec<u32>> = vec![Vec::new(); edges.len()];
    let mut face_edges: Vec<[u32; 4]> = Vec::with_capacity(quads.len());
    for (f, q) in quads.iter().enumerate() {
        let mut fe = [0u32; 4];
        for k in 0..4 {
            let id = edge_id[&key(q[k], q[(k + 1) % 4])];
            edge_faces[id as usize].push(f as u32);
            fe[k] = id;
        }
        face_edges.push(fe);
    }
    let face_pt: Vec<Vec3> = quads.iter().map(|q| (v[q[0] as usize] + v[q[1] as usize] + v[q[2] as usize] + v[q[3] as usize]) * 0.25).collect();
    let is_sharp = |e: (u32, u32)| sharp.get(&e).copied().unwrap_or(0) > 0;
    let edge_pt: Vec<Vec3> = edges
        .iter()
        .enumerate()
        .map(|(i, &(a, b))| {
            let mid = (v[a as usize] + v[b as usize]) * 0.5;
            if is_sharp((a, b)) || edge_faces[i].len() != 2 {
                mid
            } else {
                let f0 = face_pt[edge_faces[i][0] as usize];
                let f1 = face_pt[edge_faces[i][1] as usize];
                (v[a as usize] + v[b as usize] + f0 + f1) * 0.25
            }
        })
        .collect();
    // vertex points
    let mut v_faces: Vec<Vec<u32>> = vec![Vec::new(); n];
    for (f, q) in quads.iter().enumerate() {
        for &i in q {
            v_faces[i as usize].push(f as u32);
        }
    }
    let mut v_edges: Vec<Vec<u32>> = vec![Vec::new(); n];
    for (i, &(a, b)) in edges.iter().enumerate() {
        v_edges[a as usize].push(i as u32);
        v_edges[b as usize].push(i as u32);
    }
    let vert_pt: Vec<Vec3> = (0..n)
        .map(|i| {
            let es = &v_edges[i];
            let k = es.len() as f64;
            let sh: Vec<u32> = es.iter().copied().filter(|&e| is_sharp(edges[e as usize])).collect();
            if sh.len() >= 3 {
                v[i]
            } else if sh.len() == 2 {
                let other = |e: u32| {
                    let (a, b) = edges[e as usize];
                    if a as usize == i { b } else { a }
                };
                v[i] * 0.75 + (v[other(sh[0]) as usize] + v[other(sh[1]) as usize]) * 0.125
            } else {
                let q = v_faces[i].iter().fold(Vec3::ZERO, |s, &f| s + face_pt[f as usize]) * (1.0 / v_faces[i].len() as f64);
                let r = es.iter().fold(Vec3::ZERO, |s, &e| {
                    let (a, b) = edges[e as usize];
                    s + (v[a as usize] + v[b as usize]) * 0.5
                }) * (1.0 / k);
                (q + r * 2.0 + v[i] * (k - 3.0)) * (1.0 / k)
            }
        })
        .collect();
    let ne = edges.len() as u32;
    let mut out = vert_pt;
    out.extend(edge_pt);
    out.extend(face_pt);
    let nn = n as u32;
    let mut q2 = Vec::with_capacity(quads.len() * 4);
    for (f, q) in quads.iter().enumerate() {
        let fe = face_edges[f];
        for k in 0..4 {
            q2.push([q[k], nn + fe[k], nn + ne + f as u32, nn + fe[(k + 3) % 4]]);
        }
    }
    let mut s2 = HashMap::new();
    for (i, &(a, b)) in edges.iter().enumerate() {
        let s = sharp.get(&(a, b)).copied().unwrap_or(0);
        if s > 1 {
            s2.insert(key(a, nn + i as u32), s - 1);
            s2.insert(key(b, nn + i as u32), s - 1);
        }
    }
    (out, q2, s2)
}

/// Vertex normals from the quads' diagonals (cross(c - a, d - b) summed
/// over the quads around each vertex), the same rule the measuring tool
/// used to define the displacement.
pub fn quad_normals(v: &[Vec3], q: &[[u32; 4]]) -> Vec<Vec3> {
    let mut n = vec![Vec3::ZERO; v.len()];
    for f in q {
        let [a, b, c, d] = *f;
        let fnrm = (v[c as usize] - v[a as usize]).cross(v[d as usize] - v[b as usize]);
        for i in f {
            n[*i as usize] = n[*i as usize] + fnrm;
        }
    }
    n.into_iter().map(|x| x.normalized().unwrap_or(Vec3::ZERO)).collect()
}

/// The subdivided skin as a gated, closed mesh.
pub fn mesh(cage: &Cage, levels: usize) -> Result<ValidMesh, String> {
    let mut v = cage.vertices.clone();
    let mut q = cage.quads.clone();
    let mut sharp: HashMap<(u32, u32), u32> = cage.creases.iter().map(|&(a, b, s)| (key(a, b), s)).collect();
    for _ in 0..levels {
        let (v2, q2, s2) = step(&v, &q, &sharp);
        v = v2;
        q = q2;
        sharp = s2;
    }
    if levels == cage.levels && !cage.displacement.is_empty() {
        if cage.displacement.len() != v.len() {
            return Err(format!("body cage: {} displacements for {} vertices", cage.displacement.len(), v.len()));
        }
        let n = quad_normals(&v, &q);
        for (i, p) in v.iter_mut().enumerate() {
            *p = *p + n[i] * cage.displacement[i];
        }
    }
    // split each quad along its shorter diagonal
    let mut tris = Vec::with_capacity(q.len() * 2);
    for f in &q {
        let [a, b, c, d] = *f;
        let d02 = (v[a as usize] - v[c as usize]).length();
        let d13 = (v[b as usize] - v[d as usize]).length();
        if d02 <= d13 {
            tris.push([a, b, c]);
            tris.push([a, c, d]);
        } else {
            tris.push([a, b, d]);
            tris.push([b, c, d]);
        }
    }
    RawMesh { vertices_mm: v, triangles: tris, multi_patch_cells: 0 }
        .validate(None, 1)
        .map_err(|e| format!("body skin fails the gate: {e}"))
}

/// The skin as a signed distance field (exact distance to the gated mesh).
pub fn field(cage: &Cage, levels: usize) -> Result<MeshField, String> {
    Ok(MeshField::new(&mesh(cage, levels)?))
}
