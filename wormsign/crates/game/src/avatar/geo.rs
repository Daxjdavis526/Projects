//! Building meshes out of lofts.
//!
//! Every piece of the figure is a surface swept along an axis: a ring of
//! points per step, each ring an ellipse whose size and centre change along
//! the way (a thigh tapering to the knee, a torso flattening front to back),
//! closed off with rounded caps. Details — ribs, straps, seams — come in
//! through a per-vertex function that can push the surface out a few
//! millimetres and colour it. Smaller pieces (pouches, buckles, the hooks)
//! are boxes and swept tubes placed by a transform.

use bevy::asset::RenderAssetUsages;
use bevy::math::{Mat4, Quat, Vec3};
use bevy::mesh::{Indices, Mesh, PrimitiveTopology};

/// One control ring of a loft, in the piece's own frame: along +Y, with
/// radii across (x) and front-to-back (z), and a centre offset.
#[derive(Clone, Copy, Debug)]
pub struct Ring {
    pub y: f32,
    pub rx: f32,
    pub rz: f32,
    pub cx: f32,
    pub cz: f32,
}

pub const fn ring(y: f32, rx: f32, rz: f32, cz: f32) -> Ring {
    Ring { y, rx, rz, cx: 0.0, cz }
}

/// What the surface looks like at a point: its colour (linear RGB) and how
/// far to push it out, metres.
pub struct Look {
    pub col: [f32; 3],
    pub bump: f32,
}

/// A mesh under construction.
#[derive(Default, Clone)]
pub struct Geo {
    pub pos: Vec<[f32; 3]>,
    pub nor: Vec<[f32; 3]>,
    pub col: Vec<[f32; 4]>,
    pub idx: Vec<u32>,
}

pub fn lin(r: f32, g: f32, b: f32) -> [f32; 3] {
    let f = |c: f32| if c <= 0.04045 { c / 12.92 } else { ((c + 0.055) / 1.055).powf(2.4) };
    [f(r), f(g), f(b)]
}

pub fn mix(a: [f32; 3], b: [f32; 3], t: f32) -> [f32; 3] {
    [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
}

pub fn scale(a: [f32; 3], k: f32) -> [f32; 3] {
    [a[0] * k, a[1] * k, a[2] * k]
}

fn smooth(t: f32) -> f32 {
    let t = t.clamp(0.0, 1.0);
    t * t * (3.0 - 2.0 * t)
}

impl Geo {
    pub fn new() -> Self {
        Self::default()
    }

    /// A grid surface. `f(u, v)` gives the point and colour for u (rows,
    /// 0..1) and v (around, 0..1). `closed` joins v = 1 back to v = 0.
    /// Normals come from the surface itself and face away from `inside(u)`.
    pub fn surface(
        &mut self,
        rows: usize,
        cols: usize,
        closed: bool,
        f: impl Fn(f32, f32) -> (Vec3, [f32; 3]),
        inside: impl Fn(f32) -> Vec3,
    ) {
        let base = self.pos.len() as u32;
        let ncols = if closed { cols } else { cols + 1 };
        let mut grid = Vec::with_capacity((rows + 1) * ncols);
        let mut cols_rgb = Vec::with_capacity((rows + 1) * ncols);
        for r in 0..=rows {
            for c in 0..ncols {
                let (p, col) = f(r as f32 / rows as f32, c as f32 / cols as f32);
                grid.push(p);
                cols_rgb.push(col);
            }
        }
        let at = |r: usize, c: isize| -> Vec3 {
            let c = if closed { c.rem_euclid(ncols as isize) as usize } else { c.clamp(0, ncols as isize - 1) as usize };
            grid[r * ncols + c]
        };
        for r in 0..=rows {
            for c in 0..ncols {
                let p = grid[r * ncols + c];
                let du = at((r + 1).min(rows), c as isize) - at(r.saturating_sub(1), c as isize);
                let dv = at(r, c as isize + 1) - at(r, c as isize - 1);
                let mut n = du.cross(dv);
                let out = p - inside(r as f32 / rows as f32);
                if n.length_squared() < 1e-14 {
                    n = out;
                }
                if n.dot(out) < 0.0 {
                    n = -n;
                }
                let n = n.normalize_or(Vec3::Y);
                self.pos.push(p.to_array());
                self.nor.push(n.to_array());
                let k = cols_rgb[r * ncols + c];
                self.col.push([k[0], k[1], k[2], 1.0]);
            }
        }
        let span = if closed { cols } else { cols };
        for r in 0..rows {
            for c in 0..span {
                let c1 = if closed { (c + 1) % ncols } else { c + 1 };
                let a = base + (r * ncols + c) as u32;
                let b = base + (r * ncols + c1) as u32;
                let d = base + ((r + 1) * ncols + c) as u32;
                let e = base + ((r + 1) * ncols + c1) as u32;
                self.quad(a, b, e, d);
            }
        }
    }

    /// Two triangles, wound so they face the way the vertex normals do.
    fn quad(&mut self, a: u32, b: u32, c: u32, d: u32) {
        let p = |i: u32| Vec3::from_array(self.pos[i as usize]);
        let n = Vec3::from_array(self.nor[a as usize]) + Vec3::from_array(self.nor[c as usize]);
        let face = (p(b) - p(a)).cross(p(c) - p(a)) + (p(c) - p(a)).cross(p(d) - p(a));
        if face.dot(n) >= 0.0 {
            self.idx.extend_from_slice(&[a, b, c, a, c, d]);
        } else {
            self.idx.extend_from_slice(&[a, c, b, a, d, c]);
        }
    }

    /// A loft through the control rings, with rounded caps of `caps` (lower,
    /// upper) times the end radius, `per_m` rows per metre of length.
    /// `look(y, theta)` colours the surface and bumps it; theta 0 is +x,
    /// a quarter turn is +z (the back of the body).
    pub fn loft(&mut self, rings: &[Ring], around: usize, per_m: f32, caps: (f32, f32), look: impl Fn(f32, f32) -> Look) {
        self.loft_arc(rings, around, per_m, caps, (0.0, std::f32::consts::TAU), look);
    }

    /// A loft over part of the way round: theta from `arc.0` to `arc.1`.
    /// Open lofts (a hood) need a double-sided material.
    pub fn loft_arc(&mut self, rings: &[Ring], around: usize, per_m: f32, caps: (f32, f32), arc: (f32, f32), look: impl Fn(f32, f32) -> Look) {
        let closed = (arc.1 - arc.0 - std::f32::consts::TAU).abs() < 1e-4;
        let first = rings[0];
        let last = rings[rings.len() - 1];
        let cap0 = caps.0 * first.rx.min(first.rz);
        let cap1 = caps.1 * last.rx.min(last.rz);
        let y0 = first.y - cap0;
        let y1 = last.y + cap1;
        let rows = (((y1 - y0) * per_m).ceil() as usize).max(6) + if cap0 > 0.0 { 4 } else { 0 } + if cap1 > 0.0 { 4 } else { 0 };
        // Rows bunch up in the caps, where curvature is.
        let ys: Vec<f32> = {
            let mut v = Vec::new();
            let cap_rows = 5;
            let q = std::f32::consts::FRAC_PI_2;
            if cap0 > 0.0 {
                for k in 0..cap_rows {
                    v.push(first.y - cap0 * (q * k as f32 / cap_rows as f32).cos());
                }
            }
            let body = if rings.len() == 1 { 0 } else { rows.saturating_sub(2 * cap_rows).max(4) };
            for k in 0..=body {
                v.push(first.y + (last.y - first.y) * k as f32 / body.max(1) as f32);
            }
            if cap1 > 0.0 {
                for k in 1..=cap_rows {
                    v.push(last.y + cap1 * (q * (1.0 - k as f32 / cap_rows as f32)).cos());
                }
            }
            v
        };
        let sample = |y: f32| -> Ring {
            if y <= first.y {
                let d = if cap0 > 0.0 { ((first.y - y) / cap0).min(1.0) } else { 0.0 };
                let k = (1.0 - d * d).max(0.0).sqrt();
                return Ring { y, rx: first.rx * k, rz: first.rz * k, cx: first.cx, cz: first.cz };
            }
            if y >= last.y {
                let d = if cap1 > 0.0 { ((y - last.y) / cap1).min(1.0) } else { 0.0 };
                let k = (1.0 - d * d).max(0.0).sqrt();
                return Ring { y, rx: last.rx * k, rz: last.rz * k, cx: last.cx, cz: last.cz };
            }
            let i = rings.windows(2).position(|w| y >= w[0].y && y <= w[1].y).unwrap_or(0);
            let (a, b) = (rings[i], rings[i + 1]);
            let t = smooth((y - a.y) / (b.y - a.y).max(1e-6));
            let l = |p: f32, q: f32| p + (q - p) * t;
            Ring { y, rx: l(a.rx, b.rx), rz: l(a.rz, b.rz), cx: l(a.cx, b.cx), cz: l(a.cz, b.cz) }
        };
        let rows_n = ys.len() - 1;
        let ys2 = ys.clone();
        self.surface(
            rows_n,
            around,
            closed,
            |u, v| {
                let y = ys[((u * rows_n as f32).round() as usize).min(rows_n)];
                let r = sample(y);
                let th = arc.0 + (arc.1 - arc.0) * v;
                let lk = look(y, th);
                let (s, c) = th.sin_cos();
                // Bumps shrink to nothing at the cap tips.
                let tip = (r.rx.min(r.rz) / 0.01).min(1.0);
                let p = Vec3::new(r.cx + (r.rx + lk.bump * tip) * c, y, r.cz + (r.rz + lk.bump * tip) * s);
                (p, lk.col)
            },
            |u| {
                let y = ys2[((u * rows_n as f32).round() as usize).min(rows_n)];
                let r = sample(y);
                let mut c = Vec3::new(r.cx, y, r.cz);
                // At a cap tip the "inside" is back along the axis.
                if r.rx.min(r.rz) < 1e-4 {
                    c.y += if y < first.y { 0.01 } else { -0.01 };
                }
                c
            },
        );
    }

    /// A box with slightly bevelled look (flat faces), centred and rotated.
    pub fn boxy(&mut self, centre: Vec3, half: Vec3, rot: Quat, col: [f32; 3]) {
        let faces = [
            (Vec3::X, Vec3::Y, Vec3::Z),
            (-Vec3::X, Vec3::Y, -Vec3::Z),
            (Vec3::Y, Vec3::Z, Vec3::X),
            (-Vec3::Y, Vec3::Z, -Vec3::X),
            (Vec3::Z, Vec3::X, Vec3::Y),
            (-Vec3::Z, Vec3::X, -Vec3::Y),
        ];
        for (n, u, v) in faces {
            let base = self.pos.len() as u32;
            let c = n * half;
            let uu = u * half;
            let vv = v * half;
            for (a, b) in [(-1.0, -1.0), (1.0, -1.0), (1.0, 1.0), (-1.0, 1.0)] {
                let p = centre + rot * (c + uu * a + vv * b);
                self.pos.push(p.to_array());
                self.nor.push((rot * n).to_array());
                self.col.push([col[0], col[1], col[2], 1.0]);
            }
            self.quad(base, base + 1, base + 2, base + 3);
        }
    }

    /// A round tube along a path, radius per point.
    pub fn sweep(&mut self, path: &[Vec3], radius: &[f32], around: usize, col: [f32; 3]) {
        self.sweep_flat(path, radius, radius, |_| Vec3::Y, around, col);
    }

    /// A tube along a path with an elliptical section: `wide` across the
    /// direction `side(i)` and `thick` along the outward normal. Straps.
    pub fn sweep_flat(&mut self, path: &[Vec3], wide: &[f32], thick: &[f32], hint: impl Fn(usize) -> Vec3, around: usize, col: [f32; 3]) {
        let n = path.len();
        let frames: Vec<(Vec3, Vec3, Vec3)> = (0..n)
            .map(|i| {
                let t = (path[(i + 1).min(n - 1)] - path[i.saturating_sub(1)]).normalize_or(Vec3::Y);
                let mut a = hint(i) - t * hint(i).dot(t);
                if a.length_squared() < 1e-8 {
                    a = t.any_orthonormal_vector();
                }
                let a = a.normalize();
                let b = t.cross(a);
                (t, a, b)
            })
            .collect();
        let path2 = path.to_vec();
        self.surface(
            n - 1,
            around,
            true,
            |u, v| {
                let i = ((u * (n - 1) as f32).round() as usize).min(n - 1);
                let (_, a, b) = frames[i];
                let th = v * std::f32::consts::TAU;
                let p = path[i] + a * (thick[i] * th.cos()) + b * (wide[i] * th.sin());
                (p, col)
            },
            |u| path2[((u * (n - 1) as f32).round() as usize).min(n - 1)],
        );
    }

    /// An ellipsoid.
    pub fn blob(&mut self, centre: Vec3, r: Vec3, rot: Quat, col: [f32; 3]) {
        let start = self.pos.len();
        self.loft(&[ring(0.0, r.x, r.z, 0.0)], 12, 1.0, (1.0, 1.0), |_, _| Look { col, bump: 0.0 });
        // The single ring gave a sphere of radius min(rx, rz) in y; stretch.
        let k = r.y / r.x.min(r.z).max(1e-6);
        let m = Mat4::from_rotation_translation(rot, centre) * Mat4::from_scale(Vec3::new(1.0, k, 1.0));
        self.transform_from(start, m);
    }

    /// Transform everything added since vertex `start`.
    pub fn transform_from(&mut self, start: usize, m: Mat4) {
        let nm = m.inverse().transpose();
        for i in start..self.pos.len() {
            self.pos[i] = m.transform_point3(Vec3::from_array(self.pos[i])).to_array();
            self.nor[i] = nm.transform_vector3(Vec3::from_array(self.nor[i])).normalize_or(Vec3::Y).to_array();
        }
    }

    pub fn mark(&self) -> (usize, usize) {
        (self.pos.len(), self.idx.len())
    }

    pub fn is_empty(&self) -> bool {
        self.idx.is_empty()
    }

    pub fn mesh(self) -> Mesh {
        Mesh::new(PrimitiveTopology::TriangleList, RenderAssetUsages::RENDER_WORLD)
            .with_inserted_attribute(Mesh::ATTRIBUTE_POSITION, self.pos)
            .with_inserted_attribute(Mesh::ATTRIBUTE_NORMAL, self.nor)
            .with_inserted_attribute(Mesh::ATTRIBUTE_COLOR, self.col)
            .with_inserted_indices(Indices::U32(self.idx))
    }
}

/// Stillsuit ribbing: raised horizontal bands every `pitch` metres.
pub fn ribs(y: f32, pitch: f32, height: f32) -> f32 {
    let t = (y / pitch).rem_euclid(1.0);
    // A narrow raised band with soft edges.
    let d = (t - 0.5).abs() * 2.0;
    height * smooth((d - 0.55) / 0.3)
}
