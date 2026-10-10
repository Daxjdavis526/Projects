//! The cabin, as far as it can be seen through the glass, as Chevrolet
//! renders it for the 2026 3LZ with this option set (HTE Jet Black Napa,
//! AH2 GT2 seats, 3A9 Santorini Blue belts): the GT2 seats with their
//! integrated headrests and carbon shoulder trim, the 2026 dashboard (a
//! 14-inch driver display, a 12.7-inch centre touchscreen angled to the
//! driver and a 6.6-inch screen left of the wheel, over a low dash), the
//! 2026 console (shifter and cupholders, no "button wall" ridge), the
//! squircle steering wheel with its carbon top and bottom, and the
//! three-point belts. Left-hand drive: the driver sits at negative y.
//!
//! Interior dimensions are NOT published; positions here are fitted to
//! the cabin space (side-window and door positions, seat height from the
//! floor of the cavity) and to GM's 2026 interior renders by eye. Treat
//! them as approximate.

use odawn_geo::Vec3;

use crate::fields::*;

/// Seat centre lines, y (driver, passenger).
const SEAT_Y: [f64; 2] = [-370.0, 370.0];
/// Backrest recline, degrees.
const RECLINE: f64 = 22.0;
/// Backrest centre (x, z) and half thickness.
const BACK_X: f64 = 1570.0;
const BACK_Z: f64 = 655.0;
const BACK_HT: f64 = 55.0;

/// Where the backrest's front face is at height z.
fn back_face_x(z: f64) -> f64 {
    let t = RECLINE.to_radians();
    BACK_X - BACK_HT / t.cos() + (z - BACK_Z) * t.tan()
}

/// The backrest's frame: up its length, forward out of its face.
fn back_frame() -> (Vec3, Vec3) {
    let rec = RECLINE.to_radians();
    (v3(rec.sin(), 0.0, rec.cos()), v3(-rec.cos(), 0.0, rec.sin()))
}

/// A GT2 seat: the backrest shell with moderate side bolsters, shoulder
/// wings, a narrow neck and the integrated headrest; the cushion with its
/// bolsters; the base.
fn seat(ys: f64) -> F {
    let (up, fwd) = back_frame();
    let back_c = v3(BACK_X, ys, BACK_Z);
    let side = v3(0.0, 1.0, 0.0);
    let mut parts = vec![oriented_box(back_c, up, fwd, v3(300.0, BACK_HT, 205.0), 35.0)];
    for s in [-1.0, 1.0] {
        // side bolsters (lower than the Competition Sport seat's)
        parts.push(oriented_box(back_c + fwd * 30.0 + side * (s * 185.0) - up * 80.0, up, fwd, v3(200.0, 45.0, 35.0), 22.0));
        // shoulder wings
        parts.push(oriented_box(back_c + fwd * 25.0 + side * (s * 170.0) + up * 215.0, up, fwd, v3(95.0, 50.0, 45.0), 22.0));
    }
    // neck and headrest
    parts.push(oriented_box(back_c + up * 320.0, up, fwd, v3(45.0, 45.0, 90.0), 25.0));
    parts.push(oriented_box(back_c + up * 410.0 - fwd * 5.0, up, fwd, v3(80.0, 52.0, 130.0), 40.0));
    // cushion and its bolsters
    parts.push(rbox(v3(1325.0, ys, 330.0), v3(235.0, 210.0, 48.0), 30.0));
    for s in [-1.0, 1.0] {
        parts.push(rbox(v3(1310.0, ys + s * 180.0, 372.0), v3(215.0, 36.0, 45.0), 26.0));
    }
    // seat base
    parts.push(rbox(v3(1380.0, ys, 270.0), v3(200.0, 170.0, 30.0), 10.0));
    uni_all(parts)
}

/// The carbon trim on a GT2 seat's shoulder wings, on their front faces.
fn seat_carbon(ys: f64) -> F {
    let (up, fwd) = back_frame();
    let back_c = v3(BACK_X, ys, BACK_Z);
    let side = v3(0.0, 1.0, 0.0);
    let v: Vec<F> = [-1.0, 1.0]
        .iter()
        .map(|s| oriented_box(back_c + fwd * (25.0 + 50.0 + 2.5) + side * (s * 170.0) + up * 215.0, up, fwd, v3(80.0, 2.5, 34.0), 2.0))
        .collect();
    uni_all(v)
}

/// The steering wheel's rim, a squircle |y/a|^4 + |z/b|^4 = 1 in its
/// local (y, z) plane, as capsules between samples; `carbon` picks the
/// flat top and bottom (true) or the leather sides (false).
fn rim(carbon: bool) -> Vec<F> {
    let (a, b) = (178.0, 158.0);
    let n = 24;
    let pts: Vec<Vec3> = (0..n)
        .map(|i| {
            let t = std::f64::consts::TAU * i as f64 / n as f64;
            let (s, c) = t.sin_cos();
            v3(0.0, a * c.signum() * c.abs().sqrt(), b * s.signum() * s.abs().sqrt())
        })
        .collect();
    (0..n)
        .filter(|i| {
            let t = std::f64::consts::TAU * (*i as f64 + 0.5) / n as f64;
            (t.sin().abs() > 0.75) == carbon
        })
        .map(|i| capsule(pts[i], pts[(i + 1) % n], 16.0))
        .collect()
}

/// The wheel in place: the top of the rim leans forward.
fn wheel_place(f: F) -> F {
    place(f, v3(0.0, 1.0, 0.0), -24.0, v3(760.0, SEAT_Y[0], 780.0))
}

fn steering_wheel() -> F {
    let (a, b) = (178.0, 158.0);
    let mut v = rim(false);
    v.push(rbox(Vec3::ZERO, v3(35.0, 75.0, 60.0), 20.0));
    v.push(capsule(v3(0.0, -60.0, 0.0), v3(0.0, -a + 5.0, -10.0), 12.0));
    v.push(capsule(v3(0.0, 60.0, 0.0), v3(0.0, a - 5.0, -10.0), 12.0));
    v.push(capsule(v3(0.0, 0.0, -50.0), v3(0.0, 0.0, -b + 5.0), 12.0));
    v.push(capsule(v3(-20.0, 0.0, 0.0), v3(-230.0, 0.0, -10.0), 30.0));
    // the carbon rim segments are their own part: the leather keeps out
    // of them, so the two never overlap
    wheel_place(sub(uni_all(v), uni_all(rim(true))))
}

/// A thin display: centre, the direction its width runs, the direction
/// it faces, half width and half height (mm).
fn display(c: Vec3, across: Vec3, facing: Vec3, hw: f64, hh: f64) -> F {
    oriented_box(c, across, facing, v3(hw, 5.0, hh), 3.0)
}

/// Black interior: seats, dash, displays, console, steering wheel,
/// buckles.
pub fn black() -> F {
    let mut v = vec![seat(SEAT_Y[0]), seat(SEAT_Y[1])];
    // dash: a low body across the car under the windshield, and the
    // hood over the driver display
    v.push(rbox(v3(470.0, 0.0, 720.0), v3(175.0, 700.0, 105.0), 50.0));
    v.push(rbox(v3(590.0, SEAT_Y[0], 815.0), v3(85.0, 190.0, 50.0), 30.0));
    // the 2026 displays: 14-inch driver display behind the wheel, the
    // 12.7-inch touchscreen turned toward the driver, the 6.6-inch screen
    // outboard of the wheel
    let to_driver = v3(0.94, -0.34, 0.25);
    v.push(display(v3(650.0, SEAT_Y[0], 862.0), v3(0.0, 1.0, 0.0), v3(1.0, 0.0, 0.3), 160.0, 58.0));
    v.push(display(v3(640.0, -95.0, 850.0), v3(0.34, 0.94, 0.0), to_driver, 140.0, 76.0));
    v.push(display(v3(640.0, -640.0, 835.0), v3(-0.34, 0.94, 0.0), v3(0.94, 0.34, 0.25), 70.0, 40.0));
    // console: the tub between the seats, the shifter and cupholder deck
    // rising to the dash, and the armrest
    v.push(rbox(v3(1050.0, 0.0, 430.0), v3(620.0, 115.0, 130.0), 30.0));
    v.push(oriented_box(v3(760.0, 0.0, 600.0), v3(1.0, 0.0, -0.25), v3(0.25, 0.0, 1.0), v3(200.0, 35.0, 110.0), 25.0));
    v.push(rbox(v3(1250.0, 0.0, 595.0), v3(170.0, 95.0, 38.0), 30.0));
    v.push(steering_wheel());
    // buckles
    for ys in SEAT_Y {
        let inner = ys - ys.signum() * 205.0;
        v.push(rbox(v3(1420.0, inner, 440.0), v3(30.0, 18.0, 45.0), 8.0));
    }
    uni_all(v)
}

/// Visible carbon interior trim: the steering wheel's flat top and bottom
/// and the GT2 seats' shoulder trim.
pub fn carbon() -> F {
    uni_all(vec![wheel_place(uni_all(rim(true))), seat_carbon(SEAT_Y[0]), seat_carbon(SEAT_Y[1])])
}

/// Santorini Blue three-point belts (RPO 3A9).
pub fn belts() -> F {
    let mut v = Vec::new();
    for ys in SEAT_Y {
        let out = ys.signum();
        let anchor = v3(1700.0, ys + out * 300.0, 1040.0);
        let shoulder = v3(back_face_x(960.0) - 10.0, ys + out * 150.0, 960.0);
        let buckle = v3(1405.0, ys - out * 205.0, 455.0);
        let hip = v3(1420.0, ys + out * 225.0, 420.0);
        let normal = v3(-1.0, 0.0, 0.35);
        // the two shoulder segments overlap past their joint, so the
        // strap is one solid there rather than two meeting along a line
        let past = |a: Vec3, b: Vec3, by: f64| b + (b - a) * (by / (b - a).length());
        v.push(strap(anchor, past(anchor, shoulder, 20.0), 48.0, 5.0, normal));
        v.push(strap(past(buckle, shoulder, 20.0), buckle, 48.0, 5.0, normal));
        v.push(strap(hip, buckle, 48.0, 5.0, v3(-0.4, 0.0, 1.0)));
    }
    uni_all(v)
}
