//! The car's own shape vocabulary, built on the kernel's `Field` trait.
//!
//! The kernel (`odawn-geo`) supplies the primitives (sphere, box, capsule,
//! cylinder, cone, torus, revolved profile), the booleans, blends,
//! offsets and placements, the mesh-to-field conversion, and the bake,
//! mesher and gate. What a car needs beyond that is small and lives here:
//!
//! - [`Prism`]: a 2-D polygon extruded along an axis — the exact distance
//!   to it, so it composes like any primitive. Side-view and plan-view
//!   outlines of windows, vents, panels and the wing are all prisms.
//! - [`Placed`]: a rigid placement (rotation then translation).
//! - [`MirrorY`]: a part on the right side of the car mirrored to the
//!   left, exact because the element lies wholly at `y ≥ 0`.
//! - [`loft`]: a closed surface through rings of points, gated by the
//!   kernel and wrapped as the kernel's exact `MeshField`. The body is one.
//!
//! Units are millimetres at FULL SCALE throughout; the 1:15.3 scale is
//! applied when the parts are written.

use odawn_geo::ops::{Difference, Intersection, Union};
use odawn_geo::{Aabb, Exactness, Field, Mat3, MeshField, RawMesh, ValidMesh, Vec3};

/// A boxed, type-erased field: what the car's parts are assembled from.
pub type F = Box<dyn Field>;

/// Box a concrete field.
pub fn bx<T: Field + 'static>(f: T) -> F {
    Box::new(f)
}

/// Union of two fields.
pub fn uni(a: F, b: F) -> F {
    bx(Union { a, b })
}

/// Union of many fields (panics on an empty list — a programming error).
pub fn uni_all(v: Vec<F>) -> F {
    let mut it = v.into_iter();
    let first = it.next().expect("uni_all of nothing");
    it.fold(first, uni)
}

/// `a` minus `b`.
pub fn sub(a: F, b: F) -> F {
    bx(Difference { a, b })
}

/// `a` intersected with `b`.
pub fn isect(a: F, b: F) -> F {
    bx(Intersection { a, b })
}

/// Shorthand point.
pub fn v3(x: f64, y: f64, z: f64) -> Vec3 {
    Vec3::new(x, y, z)
}

/// Exact signed distance to a simple polygon (negative inside), by the
/// winding of crossings — the standard closed form.
pub fn poly_sd(poly: &[[f64; 2]], p: [f64; 2]) -> f64 {
    let n = poly.len();
    let mut d = f64::INFINITY;
    let mut inside = false;
    let mut j = n - 1;
    for i in 0..n {
        let a = poly[i];
        let b = poly[j];
        let e = [b[0] - a[0], b[1] - a[1]];
        let w = [p[0] - a[0], p[1] - a[1]];
        let ee = e[0] * e[0] + e[1] * e[1];
        let t = if ee > 0.0 {
            ((w[0] * e[0] + w[1] * e[1]) / ee).clamp(0.0, 1.0)
        } else {
            0.0
        };
        let q = [w[0] - e[0] * t, w[1] - e[1] * t];
        d = d.min(q[0] * q[0] + q[1] * q[1]);
        if (a[1] > p[1]) != (b[1] > p[1]) {
            let x = a[0] + (p[1] - a[1]) * (b[0] - a[0]) / (b[1] - a[1]);
            if p[0] < x {
                inside = !inside;
            }
        }
        j = i;
    }
    let d = d.sqrt();
    if inside { -d } else { d }
}

/// The axis a prism is extruded along.
#[derive(Debug, Clone, Copy)]
pub enum Ax {
    /// Extruded along x; the outline is drawn in (y, z) — a front view.
    X,
    /// Extruded along y; the outline is drawn in (x, z) — a side view.
    Y,
    /// Extruded along z; the outline is drawn in (x, y) — a plan view.
    Z,
}

impl Ax {
    fn split(self, p: Vec3) -> ([f64; 2], f64) {
        match self {
            Ax::X => ([p.y, p.z], p.x),
            Ax::Y => ([p.x, p.z], p.y),
            Ax::Z => ([p.x, p.y], p.z),
        }
    }
    fn join(self, a: f64, b: f64, t: f64) -> Vec3 {
        match self {
            Ax::X => Vec3::new(t, a, b),
            Ax::Y => Vec3::new(a, t, b),
            Ax::Z => Vec3::new(a, b, t),
        }
    }
}

/// Beyond this distance from its bounding box a prism reports the box
/// distance (see `eval_mm`).
const PRISM_FAR_MM: f64 = 50.0;

/// A simple polygon extruded along an axis between two planes. Exact
/// within `PRISM_FAR_MM` of its bounding box (the extrusion of an exact
/// 2-D distance combines in quadrature); a lower bound beyond it.
#[derive(Debug, Clone)]
pub struct Prism {
    poly: Vec<[f64; 2]>,
    axis: Ax,
    lo: f64,
    hi: f64,
    bounds: Aabb,
}

impl Prism {
    /// Extrude `poly` along `axis` from `lo` to `hi`.
    pub fn new(poly: Vec<[f64; 2]>, axis: Ax, lo: f64, hi: f64) -> Self {
        assert!(poly.len() >= 3 && hi > lo, "degenerate prism");
        let (mut a0, mut a1, mut b0, mut b1) = (f64::MAX, f64::MIN, f64::MAX, f64::MIN);
        for q in &poly {
            a0 = a0.min(q[0]);
            a1 = a1.max(q[0]);
            b0 = b0.min(q[1]);
            b1 = b1.max(q[1]);
        }
        let lo_c = axis.join(a0, b0, lo);
        let hi_c = axis.join(a1, b1, hi);
        let bounds = Aabb::new(lo_c.min(hi_c), lo_c.max(hi_c)).expect("prism bounds");
        Self {
            poly,
            axis,
            lo,
            hi,
            bounds,
        }
    }
}

impl Field for Prism {
    fn eval_mm(&self, p: Vec3) -> f64 {
        // Far from the prism, the distance to its bounding box: a lower
        // bound of the true distance, 1-Lipschitz, and far cheaper than
        // walking a measured outline's hundreds of edges.
        let b = &self.bounds;
        let dx = (b.min_mm.x - p.x).max(p.x - b.max_mm.x).max(0.0);
        let dy = (b.min_mm.y - p.y).max(p.y - b.max_mm.y).max(0.0);
        let dz = (b.min_mm.z - p.z).max(p.z - b.max_mm.z).max(0.0);
        let out = (dx * dx + dy * dy + dz * dz).sqrt();
        if out > PRISM_FAR_MM {
            return out;
        }
        let (q, t) = self.axis.split(p);
        let d2 = poly_sd(&self.poly, q);
        let dz = (self.lo - t).max(t - self.hi);
        let inside = d2.max(dz).min(0.0);
        let a = d2.max(0.0);
        let b = dz.max(0.0);
        inside + (a * a + b * b).sqrt()
    }
    fn exactness(&self) -> Exactness {
        Exactness::Bound
    }
    fn bounds_mm(&self) -> Option<Aabb> {
        Some(self.bounds)
    }
}

/// A prism given as an outline plus a symmetric half-depth about `mid`.
pub fn prism(poly: &[[f64; 2]], axis: Ax, lo: f64, hi: f64) -> F {
    bx(Prism::new(poly.to_vec(), axis, lo, hi))
}

/// A rigid placement: the inner field rotated by `r` then moved by `t`.
pub struct Placed {
    inner: F,
    r: Mat3,
    rt: Mat3,
    t: Vec3,
}

impl Placed {
    /// Place `inner`: a point `p` of the inner field lands at `r·p + t`.
    pub fn new(inner: F, r: Mat3, t: Vec3) -> Self {
        Self {
            inner,
            r,
            rt: r.transpose(),
            t,
        }
    }
}

impl Field for Placed {
    fn eval_mm(&self, p: Vec3) -> f64 {
        self.inner.eval_mm(self.rt.mul_vec(p - self.t))
    }
    fn exactness(&self) -> Exactness {
        self.inner.exactness()
    }
    fn bounds_mm(&self) -> Option<Aabb> {
        let b = self.inner.bounds_mm()?;
        let mut lo = Vec3::new(f64::MAX, f64::MAX, f64::MAX);
        let mut hi = Vec3::new(f64::MIN, f64::MIN, f64::MIN);
        for c in b.corners_mm() {
            let q = self.r.mul_vec(c) + self.t;
            lo = lo.min(q);
            hi = hi.max(q);
        }
        Aabb::new(lo, hi).ok()
    }
    fn lipschitz(&self) -> f64 {
        self.inner.lipschitz()
    }
}

/// Place a field: rotate about `axis` by `deg` degrees, then translate.
pub fn place(inner: F, axis: Vec3, deg: f64, t: Vec3) -> F {
    let r = Mat3::from_axis_angle(axis.normalized().expect("axis"), deg.to_radians());
    bx(Placed::new(inner, r, t))
}

/// Translate a field.
pub fn at(inner: F, t: Vec3) -> F {
    bx(Placed::new(inner, Mat3::IDENTITY, t))
}

/// A right-side element (wholly at `y ≥ 0`) and its mirror image on the
/// left. Exact for such an element: for a query at `y ≥ 0` the nearer
/// copy is the right one, and `|y|` folds the left half onto it.
pub struct MirrorY {
    inner: F,
}

impl Field for MirrorY {
    fn eval_mm(&self, p: Vec3) -> f64 {
        self.inner.eval_mm(Vec3::new(p.x, p.y.abs(), p.z))
    }
    fn exactness(&self) -> Exactness {
        self.inner.exactness()
    }
    fn bounds_mm(&self) -> Option<Aabb> {
        let b = self.inner.bounds_mm()?;
        let m = b.max_mm.y.abs().max(b.min_mm.y.abs());
        Aabb::new(
            Vec3::new(b.min_mm.x, -m, b.min_mm.z),
            Vec3::new(b.max_mm.x, m, b.max_mm.z),
        )
        .ok()
    }
    fn lipschitz(&self) -> f64 {
        self.inner.lipschitz()
    }
}

/// Mirror a right-side element to both sides. The element must lie
/// strictly to the right of the centre plane: one that touches it would
/// leave its own boundary there as a zero-thickness wall between the two
/// halves (build such shapes whole instead).
pub fn mirror_y(inner: F) -> F {
    if let Some(b) = inner.bounds_mm() {
        assert!(b.min_mm.y > 1e-6, "mirror_y element touches or crosses the centre plane");
    }
    bx(MirrorY { inner })
}

/// A rounded box centred at `c` with half-extents `h` and edge radius `r`.
pub fn rbox(c: Vec3, h: Vec3, r: f64) -> F {
    use odawn_geo::primitives::Cuboid;
    let core = Cuboid::new(Vec3::new(h.x - r, h.y - r, h.z - r)).expect("rbox core");
    let f: F = if r > 0.0 {
        bx(odawn_geo::ops::Offset::new(core, r).expect("rbox offset"))
    } else {
        bx(core)
    };
    at(f, c)
}

/// A capsule between two points.
pub fn capsule(a: Vec3, b: Vec3, r: f64) -> F {
    bx(odawn_geo::primitives::Capsule::new(a, b, r).expect("capsule"))
}

/// A solid of revolution about the car's lateral (y) axis through
/// `centre`: `profile` is a closed outline in (radius, y-offset), the
/// kernel's revolved-profile primitive, which revolves about its own y.
pub fn revolve_y(profile: Vec<[f64; 2]>, centre: Vec3) -> F {
    let f = odawn_geo::RevolvedProfile::new(profile).expect("revolved profile");
    at(bx(f), centre)
}

/// Close a loft: rings of equal point count, each a closed loop, ends
/// capped by a fan to the ring's centroid. Returns the gated mesh as the
/// kernel's exact mesh field. Orientation is fixed by the signed volume.
pub fn loft(rings: &[Vec<Vec3>]) -> MeshField {
    MeshField::new(&loft_mesh(rings))
}

/// The loft's gated mesh itself (see [`loft`]).
pub fn loft_mesh(rings: &[Vec<Vec3>]) -> ValidMesh {
    let m = rings[0].len();
    assert!(rings.iter().all(|r| r.len() == m) && rings.len() >= 2);
    let mut vs: Vec<Vec3> = Vec::new();
    for r in rings {
        vs.extend_from_slice(r);
    }
    let mut ts: Vec<[u32; 3]> = Vec::new();
    for k in 0..rings.len() - 1 {
        let a = (k * m) as u32;
        let b = ((k + 1) * m) as u32;
        for i in 0..m as u32 {
            let i1 = (i + 1) % m as u32;
            ts.push([a + i, b + i, b + i1]);
            ts.push([a + i, b + i1, a + i1]);
        }
    }
    for (end, flip) in [(0usize, false), (rings.len() - 1, true)] {
        let r = &rings[end];
        let c = r.iter().fold(Vec3::ZERO, |s, p| s + *p) / m as f64;
        let ci = vs.len() as u32;
        vs.push(c);
        let base = (end * m) as u32;
        for i in 0..m as u32 {
            let i1 = (i + 1) % m as u32;
            if flip {
                ts.push([ci, base + i1, base + i]);
            } else {
                ts.push([ci, base + i, base + i1]);
            }
        }
    }
    // Orientation: outward means positive signed volume.
    let mut vol = 0.0;
    for t in &ts {
        let [a, b, c] = t.map(|i| vs[i as usize]);
        vol += a.dot(b.cross(c)) / 6.0;
    }
    if vol < 0.0 {
        for t in &mut ts {
            t.swap(1, 2);
        }
    }
    let raw = RawMesh {
        vertices_mm: vs,
        triangles: ts,
        multi_patch_cells: 0,
    };
    raw.validate(None, 1).expect("loft must pass the kernel's mesh gate")
}

/// Catmull–Rom interpolation through `(t, value)` keys (t increasing),
/// clamped at the ends; the curve passes through every key.
pub fn spline(keys: &[(f64, f64)], t: f64) -> f64 {
    let n = keys.len();
    if t <= keys[0].0 {
        return keys[0].1;
    }
    if t >= keys[n - 1].0 {
        return keys[n - 1].1;
    }
    let mut i = 0;
    while keys[i + 1].0 < t {
        i += 1;
    }
    let (t1, p1) = keys[i];
    let (t2, p2) = keys[i + 1];
    let (t0, p0) = if i > 0 { keys[i - 1] } else { (t1 - (t2 - t1), p1) };
    let (t3, p3) = if i + 2 < n { keys[i + 2] } else { (t2 + (t2 - t1), p2) };
    // Non-uniform Catmull-Rom tangents (finite-difference form), cubic
    // Hermite between the keys.
    let m1 = (p2 - p0) / (t2 - t0);
    let m2 = (p3 - p1) / (t3 - t1);
    let h = t2 - t1;
    let s = (t - t1) / h;
    let s2 = s * s;
    let s3 = s2 * s;
    (2.0 * s3 - 3.0 * s2 + 1.0) * p1
        + (s3 - 2.0 * s2 + s) * h * m1
        + (-2.0 * s3 + 3.0 * s2) * p2
        + (s3 - s2) * h * m2
}

/// An expression over ONE expensive surface field `f` (the body) and any
/// number of cheap region fields, evaluated with `f` read once per point.
/// `S(d)` is `f + d` — the solid lying deeper than `d` under the surface
/// (`S(0)` is the body itself); `R` a region (any field); `Lab` measured
/// regions, read on the surface at the point's foot; `SA` the surface
/// offset by the local recess allowance; `Min` union, `Max` intersection,
/// `Neg` complement.
///
/// `R`, `S`, `Min`, `Max` and `Neg` keep the 1-Lipschitz property.
///
/// `Lab` is there because a measured region is an outline in a plane,
/// projected onto the skin along ONE direction, and two things go wrong
/// with the prism that projection sweeps out. Where the surface turns
/// away from the direction (the rear valance and the front openings wrap
/// around the corners) the prism's wall meets the skin almost
/// tangentially: the panel cut by it ends in a knife edge thinner than
/// any voxel, which no mesher can close. And skin that faces square to
/// the direction (the side walls of the shapes inside the nose opening)
/// projects onto a line, so the outline frays there into fragments. So
/// every vertex of the skin carries, per region, a label (the signed
/// distance to the outline, from the prism where the vertex faces the
/// direction, filled in smoothly from its neighbours where it does not;
/// `regions::labels`), and a point is tested by the labels at its foot
/// `p - f(p)·n`: the region's wall is then the surface's normal line
/// through its outline, square to the skin everywhere. The foot map
/// stretches tangential distances by R/(R − δ) at depth δ under a convex
/// surface of radius R, so the value is divided by `FOOT_SCALE`:
/// 1-Lipschitz again wherever δ ≤ 2R/3. Beyond `FOOT_BAND` from the
/// surface the term is the constant `FOOT_CAP`, so it must only ever be
/// intersected with a layer no deeper than `FOOT_BAND - FOOT_CAP` (every
/// use in `car.rs` is: 70 mm at most).
pub enum E {
    /// The surface solid offset inward by `d`.
    S(f64),
    /// A region.
    R(F),
    /// The union of the measured regions in these channels of the surface
    /// table, read at the foot point.
    Lab(Vec<usize>),
    /// `SA(max, off)`: the surface offset inward by the local recess
    /// allowance (channel 0 of the surface table, `skin::pocket_allowance`)
    /// but never deeper than `max`, then by `off` more; halved, because
    /// the allowance read at the foot point may change by up to 0.3 × 3 mm
    /// per mm.
    SA(f64, f64),
    /// Union.
    Min(Vec<E>),
    /// Smooth union `SMin(k, v)`: the quadratic polynomial blend of radius
    /// `k` (mm), folded over `v`. Two cuts whose boundaries come within
    /// about k/2 of each other merge instead of leaving a sliver between
    /// them; elsewhere it is the union, at most k/4 deeper where two
    /// boundaries cross. Its gradient is a convex combination of the
    /// operands', so it keeps the 1-Lipschitz property.
    SMin(f64, Vec<E>),
    /// Smooth intersection `SMax(k, v)`, the mirror of `SMin`: a piece
    /// thinner than about k between two of the operands' boundaries is
    /// trimmed away and the edge they make is rounded.
    SMax(f64, Vec<E>),
    /// Intersection.
    Max(Vec<E>),
    /// Complement.
    Neg(Box<E>),
}

/// See [`E`]: the foot-tested region's value divisor, the distance from
/// the surface beyond which it is not tested, and its value there (mm).
pub const FOOT_SCALE: f64 = 3.0;
pub const FOOT_BAND: f64 = 150.0;
pub const FOOT_CAP: f64 = 50.0;
/// Finite-difference step for the surface gradient (mm).
const FOOT_STEP: f64 = 0.25;

/// What one evaluation has read of the surface so far.
#[derive(Default)]
struct At {
    f: Option<f64>,
    near: Option<Option<Near>>,
}

/// The surface and its table, as an expression sees them.
struct Cx<'a> {
    surf: &'a dyn Field,
    table: Option<&'a SurfaceTable>,
}

impl At {
    fn f(&mut self, p: Vec3, surf: &dyn Field) -> f64 {
        *self.f.get_or_insert_with(|| surf.eval_mm(p))
    }
    /// The table's weights at the foot point; None beyond `FOOT_BAND` or
    /// off the table. The exact field's gradient gives a first foot; the
    /// table's normal there, interpolated across the facets, gives the
    /// foot used. (Straight from the gradient, the foot of a point deep
    /// under a facet edge jumps from one facet to the next, and a 55 mm
    /// deep wall steps by depth × dihedral angle, a millimetre or more,
    /// at every edge.)
    fn near(&mut self, p: Vec3, cx: &Cx) -> Option<&Near> {
        if self.near.is_none() {
            let n = self.find_near(p, cx);
            self.near = Some(n);
        }
        self.near.as_ref().and_then(|n| n.as_ref())
    }
    fn find_near(&mut self, p: Vec3, cx: &Cx) -> Option<Near> {
        let t = cx.table?;
        let surf = cx.surf;
        let f = self.f(p, surf);
        if f.abs() > FOOT_BAND {
            return None;
        }
        let g = Vec3::new(
            surf.eval_mm(p + Vec3::new(FOOT_STEP, 0.0, 0.0)) - f,
            surf.eval_mm(p + Vec3::new(0.0, FOOT_STEP, 0.0)) - f,
            surf.eval_mm(p + Vec3::new(0.0, 0.0, FOOT_STEP)) - f,
        );
        // on the medial axis the gradient can vanish; any foot will do
        let q0 = match g.normalized() {
            Some(n) => p - n * f,
            None => p,
        };
        let n0 = t.near(q0)?;
        match t.normal(&n0).normalized() {
            Some(n) => t.near(p - n * f).or(Some(n0)),
            None => Some(n0),
        }
    }
}

impl E {
    fn eval(&self, p: Vec3, at: &mut At, cx: &Cx) -> f64 {
        match self {
            E::S(d) => at.f(p, cx.surf) + d,
            E::SA(max, off) => {
                let a = match (cx.table, at.near(p, cx)) {
                    (Some(t), Some(n)) => t.value(n, 0),
                    _ => f64::INFINITY,
                };
                0.5 * (at.f(p, cx.surf) + max.min(a) + off)
            }
            E::R(r) => r.eval_mm(p),
            E::Lab(chs) => match (cx.table, at.near(p, cx)) {
                (Some(t), Some(n)) => (chs.iter().map(|c| t.value(n, *c)).fold(f64::INFINITY, f64::min) / FOOT_SCALE).min(FOOT_CAP),
                _ => FOOT_CAP,
            },
            E::Min(v) => v.iter().map(|e| e.eval(p, at, cx)).fold(f64::INFINITY, f64::min),
            E::SMin(k, v) => v.iter().map(|e| e.eval(p, at, cx)).fold(f64::INFINITY, |a, b| {
                let h = (k - (a - b).abs()).max(0.0) / k;
                a.min(b) - h * h * k / 4.0
            }),
            E::SMax(k, v) => v.iter().map(|e| e.eval(p, at, cx)).fold(f64::NEG_INFINITY, |a, b| {
                let h = (k - (a - b).abs()).max(0.0) / k;
                a.max(b) + h * h * k / 4.0
            }),
            E::Max(v) => v.iter().map(|e| e.eval(p, at, cx)).fold(f64::NEG_INFINITY, f64::max),
            E::Neg(e) => -e.eval(p, at, cx),
        }
    }
    /// `a` minus `b`.
    pub fn minus(a: E, b: E) -> E {
        E::Max(vec![a, E::Neg(Box::new(b))])
    }
    /// The outer layer `d` thick.
    pub fn layer(d: f64) -> E {
        E::minus(E::S(0.0), E::S(d))
    }
    /// The layer between depths `d0` and `d1`.
    pub fn band(d0: f64, d1: f64) -> E {
        E::minus(E::S(d0), E::S(d1))
    }
    /// The outer layer `d` thick, or as thick as the recess allowance
    /// lets it be (see [`E::SA`]): the cut a measured recess makes.
    pub fn rlayer(d: f64) -> E {
        E::minus(E::S(0.0), E::SA(d, 0.0))
    }
    /// The layer between depths `d0` and `d1` at the bottom of a
    /// `rlayer(d1)`: both depths rise together where the allowance is less
    /// than `d1`, and it stops at the surface.
    pub fn rband(d0: f64, d1: f64) -> E {
        E::Max(vec![E::S(0.0), E::minus(E::SA(d1, d0 - d1), E::SA(d1, 0.0))])
    }
}

/// An [`E`] expression as a field.
pub struct OverSurface {
    /// The expensive surface.
    pub surf: std::sync::Arc<dyn Field>,
    /// Its table (recess allowance, region labels), if the expression
    /// reads one.
    pub table: Option<std::sync::Arc<SurfaceTable>>,
    /// The expression.
    pub expr: E,
    /// A box containing the result.
    pub bounds: Aabb,
}

impl Field for OverSurface {
    fn eval_mm(&self, p: Vec3) -> f64 {
        let cx = Cx { surf: &*self.surf, table: self.table.as_deref() };
        self.expr.eval(p, &mut At::default(), &cx)
    }
    fn exactness(&self) -> Exactness {
        Exactness::Bound
    }
    fn bounds_mm(&self) -> Option<Aabb> {
        Some(self.bounds)
    }
}

/// A rounded box placed in an arbitrary orthonormal frame: `d` its long
/// axis, `n` its thickness axis (made perpendicular to `d`), centre `c`.
pub fn oriented_box(c: Vec3, d: Vec3, n: Vec3, half: Vec3, r: f64) -> F {
    let d = d.normalized().expect("box axis");
    let n = (n - d * n.dot(d)).normalized().expect("box normal");
    let w = d.cross(n);
    let rot = Mat3 {
        rows: [[d.x, n.x, w.x], [d.y, n.y, w.y], [d.z, n.z, w.z]],
    };
    bx(Placed::new(rbox(Vec3::ZERO, half, r), rot, c))
}

/// A flat strap from `a` to `b`, `width` wide and `thick` thick, lying
/// with its face toward `n`.
pub fn strap(a: Vec3, b: Vec3, width: f64, thick: f64, n: Vec3) -> F {
    let len = (b - a).length();
    oriented_box(
        (a + b) * 0.5,
        b - a,
        n,
        Vec3::new(len / 2.0, thick / 2.0, width / 2.0),
        (thick / 2.0).min(2.0),
    )
}

/// A closed cardinal spline through `ctrl` with a tension per point:
/// 0 is Catmull–Rom (smooth), 1 a sharp corner (zero tangent there).
/// Crease lines of a body section — a fender peak, a beltline — are
/// points of high tension.
pub fn closed_curve_tension(ctrl: &[[f64; 2]], tension: &[f64], per: usize) -> Vec<[f64; 2]> {
    let n = ctrl.len();
    let tan = |i: usize| -> [f64; 2] {
        let a = ctrl[(i + n - 1) % n];
        let b = ctrl[(i + 1) % n];
        let k = 0.5 * (1.0 - tension[i]);
        [k * (b[0] - a[0]), k * (b[1] - a[1])]
    };
    let mut out = Vec::with_capacity(n * per);
    for i in 0..n {
        let p1 = ctrl[i];
        let p2 = ctrl[(i + 1) % n];
        let m1 = tan(i);
        let m2 = tan((i + 1) % n);
        for k in 0..per {
            let s = k as f64 / per as f64;
            let (s2, s3) = (s * s, s * s * s);
            let h00 = 2.0 * s3 - 3.0 * s2 + 1.0;
            let h10 = s3 - 2.0 * s2 + s;
            let h01 = -2.0 * s3 + 3.0 * s2;
            let h11 = s3 - s2;
            out.push([
                h00 * p1[0] + h10 * m1[0] + h01 * p2[0] + h11 * m2[0],
                h00 * p1[1] + h10 * m1[1] + h01 * p2[1] + h11 * m2[1],
            ]);
        }
    }
    out
}

/// Values and a normal per vertex of a surface, read at points on it by
/// compactly supported inverse-distance weights over the vertices within
/// `radius` (Wendland's (1 - r²/ρ²)²): smooth across the mesh's facets,
/// where the exact distance field's gradient is not. Each channel is one
/// value per vertex.
pub struct SurfaceTable {
    radius: f64,
    grid: std::collections::HashMap<(i32, i32, i32), Vec<u32>>,
    verts: Vec<Vec3>,
    normals: Vec<Vec3>,
    channels: Vec<Vec<f64>>,
}

/// The vertices near a point and their weights.
pub struct Near {
    ids: Vec<(u32, f64)>,
    sw: f64,
}

impl SurfaceTable {
    pub fn new(verts: Vec<Vec3>, normals: Vec<Vec3>, channels: Vec<Vec<f64>>, radius: f64) -> SurfaceTable {
        let mut grid: std::collections::HashMap<(i32, i32, i32), Vec<u32>> = std::collections::HashMap::new();
        for (i, p) in verts.iter().enumerate() {
            grid.entry(Self::cell(*p, radius)).or_default().push(i as u32);
        }
        SurfaceTable { radius, grid, verts, normals, channels }
    }
    fn cell(p: Vec3, r: f64) -> (i32, i32, i32) {
        ((p.x / r).floor() as i32, (p.y / r).floor() as i32, (p.z / r).floor() as i32)
    }
    pub fn channel(&self, c: usize) -> &[f64] {
        &self.channels[c]
    }
    pub fn set_channel(&mut self, c: usize, v: Vec<f64>) {
        self.channels[c] = v;
    }
    /// The vertices within the radius of `q`; `None` where there are none.
    pub fn near(&self, q: Vec3) -> Option<Near> {
        let (cx, cy, cz) = Self::cell(q, self.radius);
        let r2 = self.radius * self.radius;
        let mut ids = Vec::new();
        let mut sw = 0.0;
        for dx in -1..=1 {
            for dy in -1..=1 {
                for dz in -1..=1 {
                    if let Some(cell) = self.grid.get(&(cx + dx, cy + dy, cz + dz)) {
                        for &i in cell {
                            let d2 = (self.verts[i as usize] - q).length_squared();
                            if d2 < r2 {
                                let w = (1.0 - d2 / r2).powi(2);
                                sw += w;
                                ids.push((i, w));
                            }
                        }
                    }
                }
            }
        }
        if sw > 0.0 { Some(Near { ids, sw }) } else { None }
    }
    /// Channel `c` at the point `n` was taken at.
    pub fn value(&self, n: &Near, c: usize) -> f64 {
        let ch = &self.channels[c];
        n.ids.iter().map(|(i, w)| w * ch[*i as usize]).sum::<f64>() / n.sw
    }
    /// The (unnormalised) surface normal there.
    pub fn normal(&self, n: &Near) -> Vec3 {
        n.ids.iter().fold(Vec3::ZERO, |a, (i, w)| a + self.normals[*i as usize] * *w)
    }
}
