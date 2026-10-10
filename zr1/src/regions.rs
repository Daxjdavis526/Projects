//! Measured regions of the skin (`data/regions.json`, written by
//! `tools/measure/regions.py`): where the body is not paint — glass,
//! carbon, lamps, vents, intakes, grilles.
//!
//! Each region is an oriented prism: an outline in the plane through
//! `origin` spanned by (`e1`, `e2`), extruded along the region's mean
//! normal `n` over [`lo`, `hi`]. The outline is the region's boundary on
//! the skin, smoothed and simplified, so the prism cuts the skin along the
//! measured edge. A region marked `mirror` was measured on the left (the
//! side most reference views show) and stands for both sides.

use odawn_geo::{Mat3, Vec3};
use serde_json::Value;

use crate::fields::{bx, mirror_y, Ax, Placed, Prism, F};
use crate::skin::SkinGraph;

#[derive(Clone, Debug)]
pub struct Region {
    pub name: String,
    pub material: String,
    pub origin: Vec3,
    pub e1: Vec3,
    pub e2: Vec3,
    pub n: Vec3,
    pub poly: Vec<[f64; 2]>,
    pub lo: f64,
    pub hi: f64,
    pub mirror: bool,
}

fn v3(v: &Value) -> Vec3 {
    let a = v.as_array().expect("vector");
    Vec3::new(a[0].as_f64().unwrap(), a[1].as_f64().unwrap(), a[2].as_f64().unwrap())
}

pub fn load() -> Vec<Region> {
    let text = std::fs::read_to_string(concat!(env!("CARGO_MANIFEST_DIR"), "/data/regions.json")).expect("data/regions.json");
    let doc: Value = serde_json::from_str(&text).expect("regions.json");
    doc["regions"]
        .as_array()
        .expect("regions")
        .iter()
        .map(|r| Region {
            name: r["name"].as_str().unwrap().to_string(),
            material: r["material"].as_str().unwrap().to_string(),
            origin: v3(&r["origin"]),
            e1: v3(&r["e1"]),
            e2: v3(&r["e2"]),
            n: v3(&r["n"]),
            poly: r["poly"].as_array().unwrap().iter().map(|p| [p[0].as_f64().unwrap(), p[1].as_f64().unwrap()]).collect(),
            lo: r["lo"].as_f64().unwrap(),
            hi: r["hi"].as_f64().unwrap(),
            mirror: r["mirror"].as_bool().unwrap_or(false),
        })
        .collect()
}

impl Region {
    /// The prism as a field. `grow` widens the outline (mm, + outward) and
    /// `deeper` extends the range along the normal at both ends.
    pub fn field(&self, grow: f64, deeper: f64) -> F {
        let poly: Vec<[f64; 2]> = if grow == 0.0 { self.poly.clone() } else { offset_poly(&self.poly, grow) };
        let prism = Prism::new(poly, Ax::Z, self.lo - deeper, self.hi + deeper);
        let (o, e1, e2, n) = if self.mirror {
            // measured on the left (y < 0): place the element on the right
            // and let mirror_y make both sides
            let m = |v: Vec3| Vec3::new(v.x, -v.y, v.z);
            (m(self.origin), m(self.e1), m(self.e2), m(self.n))
        } else {
            (self.origin, self.e1, self.e2, self.n)
        };
        let rot = Mat3 { rows: [[e1.x, e2.x, n.x], [e1.y, e2.y, n.y], [e1.z, e2.z, n.z]] };
        let placed = bx(Placed::new(bx(prism), rot, o));
        if self.mirror { mirror_y(placed) } else { placed }
    }
}

impl Region {
    /// How squarely a surface normal at `p` faces the region's direction
    /// (the cosine; for a mirrored region, the direction on `p`'s side).
    pub fn facing(&self, p: Vec3, normal: Vec3) -> f64 {
        if self.mirror && p.y > 0.0 {
            Vec3::new(normal.x, -normal.y, normal.z).dot(self.n)
        } else {
            normal.dot(self.n)
        }
    }
}

/// Where a vertex faces the region's direction at least this squarely,
/// its label is the prism's signed distance; less squarely, the
/// projection onto the outline's plane is too oblique to be trusted and
/// the label is filled in from the neighbours. Facing away more than
/// `LABEL_BACK`, the vertex is on the far side of the prism: outside.
pub const LABEL_FACING: f64 = 0.3;
pub const LABEL_BACK: f64 = -0.5;
/// Labels further outside than this are kept as they are (mm).
pub const LABEL_FAR: f64 = 40.0;

/// Per region, a label per skin vertex: the signed distance to the
/// region's outline (negative inside), from its prism where the vertex
/// faces the region's direction, and elsewhere the harmonic fill of its
/// neighbours' labels (Gauss–Seidel on the mesh graph), so it varies
/// smoothly across skin the projection cannot resolve — the side walls of
/// the shapes inside the nose opening face square to that region's
/// direction and would otherwise fray its outline into fragments.
pub fn labels(rs: &[Region], g: &SkinGraph) -> Vec<Vec<f64>> {
    use odawn_geo::Field;
    use rayon::prelude::*;
    rs.par_iter()
        .map(|r| {
            let f = r.field(0.0, 0.0);
            let mut m: Vec<f64> = g.v.iter().map(|p| f.eval_mm(*p)).collect();
            let mut free = Vec::new();
            for i in 0..m.len() {
                if m[i] > LABEL_FAR {
                    continue;
                }
                let c = r.facing(g.v[i], g.n[i]);
                if c < LABEL_BACK {
                    m[i] = LABEL_FAR;
                } else if c < LABEL_FACING {
                    free.push(i);
                }
            }
            for _ in 0..400 {
                for &i in &free {
                    let a = &g.adj[i];
                    if !a.is_empty() {
                        m[i] = a.iter().map(|j| m[*j as usize]).sum::<f64>() / a.len() as f64;
                    }
                }
            }
            m
        })
        .collect()
}

/// Offset a counter-clockwise polygon outward by `d` (miter at vertices,
/// limited): good enough for the gentle outlines here.
pub fn offset_poly(p: &[[f64; 2]], d: f64) -> Vec<[f64; 2]> {
    let n = p.len();
    (0..n)
        .map(|i| {
            let a = p[(i + n - 1) % n];
            let b = p[i];
            let c = p[(i + 1) % n];
            let n1 = norm2([b[1] - a[1], a[0] - b[0]]);
            let n2 = norm2([c[1] - b[1], b[0] - c[0]]);
            let m = norm2([n1[0] + n2[0], n1[1] + n2[1]]);
            let cos = (m[0] * n1[0] + m[1] * n1[1]).max(0.35);
            [b[0] + m[0] * d / cos, b[1] + m[1] * d / cos]
        })
        .collect()
}

fn norm2(v: [f64; 2]) -> [f64; 2] {
    let l = (v[0] * v[0] + v[1] * v[1]).sqrt().max(1e-12);
    [v[0] / l, v[1] / l]
}
