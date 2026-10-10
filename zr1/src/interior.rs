//! The cabin, as far as it can be seen through the glass: Jet Black
//! Competition Sport seats, the low wraparound dash, the tall centre
//! console ridge, the squircle steering wheel, carbon trim (FA6-style
//! console and DY0 display hood), and three-point belts in Tension Blue
//! (RPO 3A9). Left-hand drive: the driver sits at negative y.
//!
//! Interior dimensions are NOT published; positions here are fitted to
//! the cabin space (side-window and door positions from the drawing,
//! seat height from the floor of the cavity) and to GM's interior photos.
//! Treat them as approximate.

use odawn_geo::Vec3;

use crate::fields::*;

/// Seat centre lines, y (driver, passenger).
const SEAT_Y: [f64; 2] = [-370.0, 370.0];
/// Backrest recline, degrees.
const RECLINE: f64 = 22.0;

/// Where the backrest's front face is at height z, for a seat at its
/// centre x `bx`, centre height `bz`, half thickness `ht`.
fn back_face_x(z: f64) -> f64 {
    let bx_ = 1570.0;
    let bz = 655.0;
    let ht = 60.0;
    let t = RECLINE.to_radians();
    bx_ - ht / t.cos() + (z - bz) * t.tan()
}

fn seat(ys: f64) -> F {
    let rec = RECLINE.to_radians();
    let up = v3(rec.sin(), 0.0, rec.cos());
    let fwd = v3(-rec.cos(), 0.0, rec.sin());
    let back_c = v3(1570.0, ys, 655.0);
    // backrest shell, side bolsters, shoulder wings, integrated headrest
    let back = oriented_box(back_c, up, fwd, v3(330.0, 60.0, 225.0), 35.0);
    let mut parts = vec![back];
    for s in [-1.0, 1.0] {
        parts.push(oriented_box(back_c + fwd * 45.0 + v3(0.0, s * 195.0, 0.0) - up * 60.0, up, fwd, v3(250.0, 55.0, 38.0), 25.0));
    }
    parts.push(oriented_box(back_c + up * 400.0 - fwd * 5.0, up, fwd, v3(85.0, 55.0, 140.0), 30.0));
    // cushion and its bolsters
    parts.push(rbox(v3(1325.0, ys, 330.0), v3(235.0, 215.0, 48.0), 30.0));
    for s in [-1.0, 1.0] {
        parts.push(rbox(v3(1310.0, ys + s * 185.0, 380.0), v3(215.0, 38.0, 55.0), 28.0));
    }
    // seat base
    parts.push(rbox(v3(1380.0, ys, 270.0), v3(200.0, 170.0, 30.0), 10.0));
    uni_all(parts)
}

fn steering_wheel() -> F {
    // Squircle rim in the local (y, z) plane, |y/a|^4 + |z/b|^4 = 1.
    let (a, b) = (178.0, 158.0);
    let n = 24;
    let pts: Vec<Vec3> = (0..n)
        .map(|i| {
            let t = std::f64::consts::TAU * i as f64 / n as f64;
            let (s, c) = t.sin_cos();
            v3(0.0, a * c.signum() * c.abs().sqrt(), b * s.signum() * s.abs().sqrt())
        })
        .collect();
    let mut v = Vec::new();
    for i in 0..n {
        v.push(capsule(pts[i], pts[(i + 1) % n], 16.0));
    }
    v.push(rbox(Vec3::ZERO, v3(35.0, 75.0, 60.0), 20.0));
    v.push(capsule(v3(0.0, -60.0, 0.0), v3(0.0, -a + 5.0, -10.0), 12.0));
    v.push(capsule(v3(0.0, 60.0, 0.0), v3(0.0, a - 5.0, -10.0), 12.0));
    v.push(capsule(v3(0.0, 0.0, -50.0), v3(0.0, 0.0, -b + 5.0), 12.0));
    v.push(capsule(v3(-20.0, 0.0, 0.0), v3(-230.0, 0.0, -10.0), 30.0));
    // tilt: the top of the rim leans forward
    place(uni_all(v), v3(0.0, 1.0, 0.0), -24.0, v3(760.0, SEAT_Y[0], 780.0))
}

/// Black interior: seats, dash, console, steering wheel, buckles.
pub fn black() -> F {
    let mut v = vec![seat(SEAT_Y[0]), seat(SEAT_Y[1])];
    // dash: a low body across the car under the windshield, and the
    // binnacle wrapping the driver
    v.push(rbox(v3(470.0, 0.0, 720.0), v3(175.0, 700.0, 105.0), 50.0));
    v.push(rbox(v3(600.0, SEAT_Y[0], 790.0), v3(110.0, 200.0, 60.0), 35.0));
    // centre console tub between the seats and the climate ridge
    v.push(rbox(v3(1050.0, 0.0, 430.0), v3(620.0, 115.0, 130.0), 30.0));
    v.push(oriented_box(v3(780.0, -140.0, 650.0), v3(1.0, 0.0, -0.45), v3(0.0, 1.0, 0.0), v3(300.0, 16.0, 55.0), 8.0));
    // infotainment screen, angled to the driver
    v.push(oriented_box(v3(560.0, -40.0, 860.0), v3(0.0, -0.94, 0.34), v3(-1.0, 0.0, 0.25), v3(110.0, 6.0, 72.0), 3.0));
    v.push(steering_wheel());
    // buckles
    for ys in SEAT_Y {
        let inner = ys - ys.signum() * 205.0;
        v.push(rbox(v3(1420.0, inner, 440.0), v3(30.0, 18.0, 45.0), 8.0));
    }
    uni_all(v)
}

/// Visible carbon interior trim: console top plate and the display hood.
pub fn carbon() -> F {
    uni_all(vec![
        rbox(v3(1050.0, 0.0, 563.0), v3(560.0, 100.0, 4.0), 2.0),
        rbox(v3(570.0, SEAT_Y[0], 858.0), v3(80.0, 175.0, 10.0), 5.0),
    ])
}

/// Tension Blue three-point belts.
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
