//! The body: a loft of cross-sections whose extremes are pinned to the
//! traced silhouettes at every station.
//!
//! At each station x along the car the section is drawn through eight
//! control points on the right half (mirrored to the left), each given as
//! a FRACTION — y as a fraction of the plan half-width w(x), z as a
//! fraction of the way from the underbody zb(x) to the side-silhouette
//! top zt(x). Because the widest point sits at y-fraction 1 and the
//! highest at z-fraction 1, the solid reproduces the drawing's side and
//! plan silhouettes by construction; the fractions only shape what lies
//! between (crowns, tumblehome, the greenhouse), and they vary slowly, so
//! a handful of key stations describes them.
//!
//! The eight points, from the top centre round to the bottom centre:
//! A top centre (hood, roof, hatch), B roof or hood edge, C beltline or
//! fender crown, D shoulder, E widest point, F lower side, G underbody
//! corner, H bottom centre (always (0, 0)).

use odawn_geo::{MeshField, Vec3};

use crate::fields::{closed_curve_tension, loft, loft_mesh, spline};
use crate::trace::BODY;

/// Front axle x (the origin) and rear axle x, mm.
pub const REAR_AXLE_X: f64 = 2723.0;

/// One key station of the section template: x, then (y-fraction,
/// z-fraction) for A..G.
type Row = (f64, [[f64; 2]; 7]);

/// The section template, nose to tail.
const ROWS: &[Row] = &[
    // nose tip: the bumper's leading lip
    (-1030.0, [[0.0, 1.0], [0.40, 0.98], [0.72, 0.90], [0.92, 0.75], [1.0, 0.55], [0.93, 0.25], [0.60, 0.0]]),
    // front fascia and headlamps: the fenders stand above the nose and are
    // widest near their tops (the drawing's front view: widest at
    // 700-800 mm, tucking in to ~960 mm half-width below)
    (-800.0, [[0.0, 0.93], [0.42, 0.95], [0.72, 1.0], [0.97, 0.86], [1.0, 0.62], [0.96, 0.22], [0.86, 0.0]]),
    // over the front wheels: a low hood between crowned fenders
    (-300.0, [[0.0, 0.90], [0.44, 0.93], [0.74, 1.0], [0.98, 0.90], [1.0, 0.70], [0.95, 0.22], [0.88, 0.0]]),
    // cowl
    (100.0, [[0.0, 0.93], [0.46, 0.95], [0.76, 1.0], [0.98, 0.88], [1.0, 0.66], [0.95, 0.20], [0.90, 0.0]]),
    // windshield
    (450.0, [[0.0, 1.0], [0.52, 0.94], [0.73, 0.85], [0.97, 0.76], [1.0, 0.55], [0.95, 0.15], [0.90, 0.0]]),
    // roof over the doors: wide flat roof (591 mm half-width at 1168 mm),
    // beltline at ~715 mm / 990 mm, door widest under the beltline
    (1300.0, [[0.0, 1.0], [0.60, 0.945], [0.73, 0.78], [0.92, 0.66], [1.0, 0.45], [0.95, 0.12], [0.92, 0.0]]),
    // behind the doors: buttress and the side-intake scoop
    (2000.0, [[0.0, 1.0], [0.45, 0.97], [0.62, 0.84], [0.88, 0.76], [1.0, 0.58], [0.95, 0.18], [0.92, 0.0]]),
    // rear haunches: shoulders at ~950 mm, widest at ~750 mm
    (2800.0, [[0.0, 1.0], [0.38, 0.985], [0.62, 0.95], [0.86, 0.92], [1.0, 0.70], [0.95, 0.25], [0.88, 0.0]]),
    // tail: a flat deck ending in the ducktail
    (3400.0, [[0.0, 1.0], [0.48, 0.995], [0.78, 0.97], [0.95, 0.88], [1.0, 0.62], [0.96, 0.25], [0.80, 0.0]]),
    (3640.0, [[0.0, 1.0], [0.48, 0.99], [0.78, 0.94], [0.94, 0.82], [1.0, 0.55], [0.96, 0.22], [0.82, 0.0]]),
];

/// Crease tension of A..H (0 smooth, 1 sharp).
const TENSION: [f64; 8] = [0.0, 0.35, 0.75, 0.6, 0.1, 0.35, 0.6, 0.0];

/// The underbody height zb(x), mm: the lower edge of the side silhouette
/// with the splitter, tyres and wing taken out.
const UNDER: &[(f64, f64)] = &[
    (-1030.0, 400.0),
    (-1000.0, 320.0),
    (-970.0, 250.0),
    (-935.0, 195.0),
    (-900.0, 178.0),
    (-850.0, 170.0),
    (-500.0, 165.0),
    (-200.0, 150.0),
    (0.0, 140.0),
    (300.0, 126.0),
    (2500.0, 126.0),
    (2800.0, 140.0),
    (3100.0, 170.0),
    (3300.0, 230.0),
    (3450.0, 290.0),
    (3560.0, 320.0),
    (3600.0, 330.0),
    (3640.0, 345.0),
];

/// Side-silhouette top, plan half-width and underbody at x.
pub fn envelope(x: f64) -> (f64, f64, f64) {
    let (x0, _, _) = BODY[0];
    let step = BODY[1].0 - BODY[0].0;
    let f = ((x - x0) / step).clamp(0.0, (BODY.len() - 1) as f64);
    let i = (f.floor() as usize).min(BODY.len() - 2);
    let t = f - i as f64;
    let zt = BODY[i].1 * (1.0 - t) + BODY[i + 1].1 * t;
    let w = BODY[i].2 * (1.0 - t) + BODY[i + 1].2 * t;
    let zb = spline(UNDER, x);
    if x > TAIL[0].0 {
        // The tail is a near-vertical face (the drawing's side profile:
        // x 3550–3640 mm from 350 to 900 mm up), so the last stations
        // keep their size and the loft is capped flat, not drawn to a point.
        let zt_t: Vec<(f64, f64)> = TAIL.iter().map(|k| (k.0, k.1)).collect();
        let w_t: Vec<(f64, f64)> = TAIL.iter().map(|k| (k.0, k.2)).collect();
        let blend = ((x - TAIL[0].0) / 40.0).min(1.0);
        return (
            zt * (1.0 - blend) + spline(&zt_t, x) * blend,
            w * (1.0 - blend) + spline(&w_t, x) * blend,
            zb,
        );
    }
    (zt, w, zb)
}

/// The tail: x, side-silhouette top, plan half-width.
const TAIL: &[(f64, f64, f64)] = &[
    (3480.0, 918.0, 925.0),
    (3540.0, 905.0, 905.0),
    (3590.0, 892.0, 885.0),
    (3640.0, 872.0, 860.0),
];

/// The template's fractions at x (interpolated between key rows).
fn fractions(x: f64) -> [[f64; 2]; 7] {
    let mut out = [[0.0; 2]; 7];
    for (k, o) in out.iter_mut().enumerate() {
        for c in 0..2 {
            let keys: Vec<(f64, f64)> = ROWS.iter().map(|r| (r.0, r.1[k][c])).collect();
            o[c] = spline(&keys, x).clamp(0.0, 1.0);
        }
    }
    out
}

/// The section at x as a closed loop of (y, z) points, counter-clockwise
/// seen from the front (from −x).
pub fn section(x: f64, per_span: usize) -> Vec<[f64; 2]> {
    let (zt, w, zb) = envelope(x);
    let fr = fractions(x);
    let pt = |f: [f64; 2]| [f[0] * w, zb + f[1] * (zt - zb)];
    // H, then the right side G..A, then the left side B..G.
    let mut ctrl: Vec<[f64; 2]> = vec![[0.0, zb]];
    for k in (0..7).rev() {
        ctrl.push(pt(fr[k]));
    }
    for k in 1..7 {
        let p = pt(fr[k]);
        ctrl.push([-p[0], p[1]]);
    }
    // The loop is H, G, F, E, D, C, B, A, B', C', ..., G'; creases at
    // the beltline / fender crown (C), the shoulder (D) and the
    // underbody corner (G).
    let t = TENSION;
    let tension: Vec<f64> = [t[7], t[6], t[5], t[4], t[3], t[2], t[1], t[0]]
        .into_iter()
        .chain([t[1], t[2], t[3], t[4], t[5], t[6]])
        .collect();
    closed_curve_tension(&ctrl, &tension, per_span)
}

/// Nose and tail of the loft.
pub const NOSE_X: f64 = -1030.0;
/// Tail of the loft.
pub const TAIL_X: f64 = 3640.0;

/// The outer body's loft rings, every `dx` mm.
pub fn rings(dx: f64, per_span: usize) -> Vec<Vec<Vec3>> {
    let n = ((TAIL_X - NOSE_X) / dx).ceil() as usize;
    let mut rings = Vec::with_capacity(n + 1);
    for i in 0..=n {
        let x = NOSE_X + (TAIL_X - NOSE_X) * i as f64 / n as f64;
        let mut sec = section(x, per_span);
        // Round the tail's edge: the last 40 mm of sections are drawn in
        // toward their centre (a ~25 mm radius at the cap).
        let into = x - (TAIL_X - 40.0);
        if into > 0.0 {
            let t = into / 40.0;
            let f = 1.0 - 0.035 * t * t;
            let n = sec.len() as f64;
            let c = sec.iter().fold([0.0, 0.0], |s, p| [s[0] + p[0] / n, s[1] + p[1] / n]);
            for p in &mut sec {
                *p = [c[0] + (p[0] - c[0]) * f, c[1] + (p[1] - c[1]) * f];
            }
        }
        rings.push(sec.iter().map(|p| Vec3::new(x, p[0], p[1])).collect());
    }
    rings
}

/// The outer body as the kernel's exact mesh field.
pub fn outer(dx: f64, per_span: usize) -> MeshField {
    loft(&rings(dx, per_span))
}

/// The outer body's gated loft mesh (for quick previews).
pub fn outer_mesh(dx: f64, per_span: usize) -> odawn_geo::ValidMesh {
    loft_mesh(&rings(dx, per_span))
}
