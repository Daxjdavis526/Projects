//! The car, part by part. Every part is a field built from the kernel's
//! primitives and operations plus the few shapes in `fields`; `main`
//! sends each through the bake → mesh → gate → simplify → gate pipeline.
//!
//! Full-scale millimetres. x rearward from the front axle, y to the
//! car's right, z up from the ground.
//!
//! Where the numbers come from:
//! - The body skin (`skin`) and its regions (`regions`): measured from
//!   calibrated reference views by `tools/measure`.
//! - Wheel centres: x from the wheelbase (2723), y from the tracks (1685 /
//!   1678, GM fleet order guide), z — and the hub faces' offsets outboard
//!   of the track line — solved with the cameras (`tools/measure/joint.py`).
//! - Wheel-arch openings: measured edge points on the skin
//!   (`data/arches.json`).
//! - Tyres 275/30ZR20 and 345/25ZR21 on 20x10 and 21x13 wheels;
//!   carbon-ceramic rotors 400 x 38 front and 390 x 34 rear (GM ZR1
//!   release).
//! - Add-on aero (wing, splitter, dive planes, rockers, diffuser), the
//!   mirrors and the exhaust: fitted to the calibrated views by overlaying
//!   their outlines (`tools/measure`), parameters recorded where they are
//!   used.

use std::sync::Arc;

use odawn_geo::ops::RotationalArray;
use odawn_geo::{Aabb, Field, Vec3};
use serde_json::Value;

use crate::fields::*;
use crate::part::{Finish, Part};
use crate::regions::{self, Region};
use crate::{WHEELBASE, skin};

// ---------------------------------------------------------------- finishes

const fn fin(rgb: [f32; 3], metallic: f32, roughness: f32) -> Finish {
    Finish {
        rgb,
        metallic,
        roughness,
        alpha: 1.0,
    }
}
/// Arctic White (RPO G8G). GM publishes no colour value; a solid white,
/// slightly warm, as paint swatches show it.
pub const ARCTIC_WHITE: Finish = fin([0.95, 0.95, 0.94], 0.0, 0.25);
/// Visible carbon fibre (STEP and GLB carry a colour, not the weave).
pub const CARBON: Finish = fin([0.05, 0.051, 0.056], 0.1, 0.4);
/// Gloss black trim: mirror stalks, lug nuts.
pub const GLOSS_BLACK: Finish = fin([0.02, 0.02, 0.022], 0.0, 0.18);
/// Satin black: grilles, vent and intake liners, wheel-arch liners.
pub const SATIN_BLACK: Finish = fin([0.015, 0.015, 0.017], 0.0, 0.7);
/// Jet Black interior (leather and suede).
pub const INTERIOR_BLACK: Finish = fin([0.05, 0.05, 0.055], 0.0, 0.75);
/// Santorini Blue belts (RPO 3A9).
pub const BELT_BLUE: Finish = fin([0.10, 0.33, 0.75], 0.0, 0.6);
/// Tinted glass.
pub const GLASS: Finish = Finish {
    rgb: [0.06, 0.07, 0.08],
    metallic: 0.0,
    roughness: 0.04,
    alpha: 0.45,
};
/// Tyre rubber.
pub const RUBBER: Finish = fin([0.09, 0.09, 0.09], 0.0, 0.85);
/// Carbon-ceramic rotor.
pub const CERAMIC: Finish = fin([0.36, 0.36, 0.37], 0.4, 0.6);
/// Blue calipers (RPO J6B).
pub const CALIPER_BLUE: Finish = fin([0.05, 0.32, 0.78], 0.1, 0.3);
/// Headlamp: smoked lens over dark housings.
pub const HEADLAMP: Finish = fin([0.16, 0.16, 0.17], 0.7, 0.18);
/// Tail lamp red.
pub const TAILLAMP: Finish = fin([0.62, 0.03, 0.04], 0.1, 0.25);
/// Carbon Flash Metallic (SOG wheels): near-black, a little metallic.
pub const CARBON_FLASH: Finish = fin([0.075, 0.072, 0.072], 0.55, 0.28);
/// Exhaust tips: polished stainless, as the configurator renders them.
pub const EXHAUST: Finish = fin([0.62, 0.62, 0.64], 1.0, 0.22);
/// Licence plate blank.
pub const PLATE: Finish = fin([0.80, 0.80, 0.80], 0.6, 0.35);

// ------------------------------------------------------------- geometry

/// Front wheel centre (right side): x, y (half the 1685 mm track), z
/// (solved with the cameras).
pub const FRONT_WHEEL: [f64; 3] = [0.0, 1685.0 / 2.0, 319.21];
/// Rear wheel centre (half the 1678 mm track).
pub const REAR_WHEEL: [f64; 3] = [WHEELBASE, 1678.0 / 2.0, 347.13];
/// The wheel's centre face, outboard of the track line (solved with the
/// cameras: the rear wheels are much deeper-dished than the fronts).
pub const FRONT_FACE_Y: f64 = 112.30;
/// Rear centre face outboard of the track line.
pub const REAR_FACE_Y: f64 = 89.73;

/// Depths under the skin, mm.
const SKIN_T: f64 = 8.0;
const GLASS_T: f64 = 10.0;
const CABIN_WALL: f64 = 30.0;
const LINING: f64 = 20.0;
const LINER: f64 = 10.0;

/// The skin as one shared surface field and the expression wrapper.
pub struct Body {
    surf: Arc<dyn Field>,
    bounds: Aabb,
}

impl Body {
    pub fn load(levels: usize) -> Result<Body, String> {
        let cage = skin::Cage::load()?;
        let f = skin::field(&cage, levels)?;
        let bounds = f.bounds_mm().ok_or("skin has no bounds")?.inflated(30.0);
        Ok(Body { surf: Arc::new(f), bounds })
    }
    fn over(&self, expr: E) -> F {
        bx(OverSurface {
            surf: self.surf.clone(),
            expr,
            bounds: self.bounds,
        })
    }
    /// An expression whose result lies inside `bounds` (e.g. a part clipped
    /// to the outside of the body lies inside the part).
    fn over_in(&self, expr: E, bounds: Aabb) -> F {
        bx(OverSurface {
            surf: self.surf.clone(),
            expr,
            bounds,
        })
    }
}

/// One measured wheel-arch opening: its outline in the side view (x, z),
/// closed below the ground, and how far in the cut reaches.
struct Arch {
    outline: Vec<[f64; 2]>,
    y_in: f64,
}

fn arches_data() -> Vec<Arch> {
    let text = std::fs::read_to_string(concat!(env!("CARGO_MANIFEST_DIR"), "/data/arches.json")).expect("data/arches.json");
    let doc: Value = serde_json::from_str(&text).expect("arches.json");
    ["front", "rear"]
        .iter()
        .map(|k| {
            let a = &doc[*k];
            let outline = a["outline"].as_array().expect("outline").iter().map(|p| [p[0].as_f64().unwrap(), p[1].as_f64().unwrap()]).collect();
            Arch {
                outline,
                y_in: a["y_in"].as_f64().expect("y_in"),
            }
        })
        .collect()
}

/// The wheel-arch cuts (`grow` > 0 enlarges them by the liner).
fn arches(grow: f64) -> F {
    mirror_y(uni_all(
        arches_data()
            .into_iter()
            .map(|a| {
                let poly = if grow == 0.0 { a.outline.clone() } else { regions::offset_poly(&a.outline, grow) };
                prism(&poly, Ax::Y, a.y_in - grow, 1400.0)
            })
            .collect(),
    ))
}

/// The cabin space behind the glass.
fn cabin_box() -> F {
    rbox(v3(1160.0, 0.0, 800.0), v3(880.0, 760.0, 560.0), 60.0)
}

/// What a measured region is in the build.
#[derive(Clone, Copy, PartialEq)]
enum Treat {
    /// Glass let into the skin, opening into the cabin.
    Glass,
    /// A skin panel of another finish (carbon, lamps), flush with the paint.
    Inlay,
    /// A recess `depth` deep with a satin-black floor.
    Pocket(f64),
}

fn treat(r: &Region) -> Treat {
    match r.material.as_str() {
        "glass" => Treat::Glass,
        "carbon" | "headlamp" | "taillamp" | "black" | "diffuser" => Treat::Inlay,
        "plate" => Treat::Pocket(12.0),
        "hatch" => Treat::Pocket(30.0),
        "grille" | "intake" => Treat::Pocket(60.0),
        _ => Treat::Pocket(45.0),
    }
}

/// The union of the regions passing `keep`, each grown by `grow`.
fn region_union(rs: &[Region], keep: impl Fn(&Region) -> bool, grow: f64) -> Option<F> {
    let v: Vec<F> = rs.iter().filter(|r| keep(r)).map(|r| r.field(grow, 0.0)).collect();
    if v.is_empty() { None } else { Some(uni_all(v)) }
}

fn push(out: &mut Vec<Part>, name: &'static str, material: &'static str, finish: Finish, field: F, voxel: f64, band: f64, shells: Option<usize>) {
    out.push(Part {
        name,
        material,
        finish,
        field,
        voxel_mm: voxel,
        band_mm: band,
        sharp: false,
        shells,
    });
}

/// Everything the car is made of. `detail` scales every voxel.
pub fn parts(detail: f64, body: &Body) -> Vec<Part> {
    let vx = |base: f64| base * detail;
    let rs = regions::load();
    let r = E::R;
    // measured regions are tested at the foot point on the skin, so their
    // walls are square to it (see `fields::E`)
    let foot = E::Foot;
    let and = |a: E, b: E| E::Max(vec![a, b]);
    let mut out = Vec::new();

    // ---- body (white): everything not cut away or given to another part
    let mut cuts = vec![r(arches(LINER)), and(E::S(CABIN_WALL), r(cabin_box()))];
    for a in addons().into_iter().filter(|a| a.cut_body) {
        cuts.push(r(a.field));
    }
    if let Some(g) = region_union(&rs, |x| treat(x) == Treat::Glass, 0.0) {
        cuts.push(and(foot(g), E::layer(CABIN_WALL + 1.0)));
    }
    if let Some(g) = region_union(&rs, |x| treat(x) == Treat::Inlay, 0.0) {
        cuts.push(and(foot(g), E::layer(SKIN_T)));
    }
    for x in rs.iter() {
        if let Treat::Pocket(d) = treat(x) {
            cuts.push(and(foot(x.field(0.0, 0.0)), E::layer(d + LINER)));
        }
    }
    push(&mut out, "Body", "Arctic White (G8G)", ARCTIC_WHITE, body.over(E::minus(E::S(0.0), E::Min(cuts))), vx(4.0), 0.6, Some(1));

    let inlay = |mat: &str| -> Option<F> { region_union(&rs, |x| x.material == mat, 0.0).map(|g| body.over(and(foot(g), E::layer(SKIN_T)))) };
    if let Some(g) = region_union(&rs, |x| treat(x) == Treat::Glass, 0.0) {
        push(&mut out, "Glass", "Tinted glass", GLASS, body.over(and(foot(g), E::layer(GLASS_T))), vx(2.5), 0.4, None);
    }
    if let Some(f) = inlay("carbon") {
        push(&mut out, "Carbon panels", "Visible carbon fiber", CARBON, f, vx(2.5), 0.4, None);
    }
    if let Some(f) = inlay("headlamp") {
        push(&mut out, "Headlamps", "Smoked lens, black housing", HEADLAMP, f, vx(2.0), 0.3, None);
    }
    if let Some(f) = inlay("taillamp") {
        push(&mut out, "Tail lamps", "Red lens", TAILLAMP, f, vx(2.0), 0.3, None);
    }
    if let Some(f) = inlay("diffuser") {
        push(&mut out, "Rear valance", "Satin black", SATIN_BLACK, f, vx(3.0), 0.4, None);
    }
    if let Some(f) = inlay("black") {
        push(&mut out, "Black trim", "Gloss black", GLOSS_BLACK, f, vx(2.0), 0.3, None);
    }
    // pocket floors and the wheel-arch liners
    let mut liners = vec![E::minus(and(E::S(0.0), r(arches(LINER))), r(arches(0.0)))];
    for x in rs.iter() {
        if let Treat::Pocket(d) = treat(x) {
            if x.material == "plate" {
                continue;
            }
            liners.push(and(foot(x.field(0.0, 0.0)), E::band(d, d + LINER)));
        }
    }
    push(&mut out, "Vents and liners", "Satin black", SATIN_BLACK, body.over(E::Min(liners)), vx(3.0), 0.5, None);
    if let Some(p) = region_union(&rs, |x| x.material == "plate", 0.0) {
        push(&mut out, "Plate", "Licence plate blank", PLATE, body.over(and(foot(p), E::band(12.0, 12.0 + 4.0))), vx(1.5), 0.3, None);
    }
    push(
        &mut out,
        "Interior lining",
        "Jet Black",
        INTERIOR_BLACK,
        body.over(E::minus(
            and(E::S(CABIN_WALL), r(cabin_box())),
            and(E::S(CABIN_WALL + LINING), r(rbox(v3(1160.0, 0.0, 800.0), v3(860.0, 740.0, 540.0), 40.0))),
        )),
        vx(5.0),
        0.5,
        None,
    );
    push(&mut out, "Interior", "Jet Black", INTERIOR_BLACK, crate::interior::black(), vx(2.0), 0.3, None);
    push(&mut out, "Interior carbon trim", "Visible carbon fiber", CARBON, crate::interior::carbon(), vx(2.5), 0.2, None);
    push(&mut out, "Seat belts", "Santorini Blue (3A9)", BELT_BLUE, crate::interior::belts(), vx(1.2), 0.2, None);

    for a in addons() {
        let f = if a.outside_body {
            let b = a.field.bounds_mm().expect("add-on bounds").inflated(10.0);
            body.over_in(E::minus(r(a.field), E::S(0.0)), b)
        } else {
            a.field
        };
        push(&mut out, a.name, a.material, a.finish, f, vx(a.voxel), 0.3, None);
    }

    let g = running_gear();
    push(&mut out, "Lug nuts", "Gloss black", GLOSS_BLACK, g.lugs, vx(1.2), 0.2, Some(20));
    push(&mut out, "Wheels", "Carbon Flash Metallic forged aluminum, 20-spoke (SOG)", CARBON_FLASH, g.rims, vx(2.0), 0.25, Some(4));
    push(&mut out, "Tyres", "Michelin Pilot Sport Cup 2 R", RUBBER, g.tyres, vx(2.0), 0.3, Some(4));
    push(&mut out, "Brake rotors", "Carbon ceramic", CERAMIC, g.rotors, vx(1.5), 0.25, Some(4));
    push(&mut out, "Brake calipers", "Blue (J6B)", CALIPER_BLUE, g.calipers, vx(1.2), 0.2, Some(4));
    out
}

/// The four corners' running gear, each a field over both sides.
pub struct Gear {
    pub rims: F,
    pub tyres: F,
    pub rotors: F,
    pub calipers: F,
    pub lugs: F,
}

/// Wheels (SOG, ten Y-spokes forking to twenty at the rim), tyres,
/// rotors and calipers, all four corners.
pub fn running_gear() -> Gear {
    struct Corner {
        c: [f64; 3],
        /// Hub face, outboard of the wheel's centre plane.
        face: f64,
        /// Tyre bead radius, unloaded outer radius, section half width.
        bead: f64,
        outer: f64,
        half: f64,
        /// Rim half width.
        rim_half: f64,
        rotor_r: f64,
        rotor_t: f64,
        /// Caliper centre, degrees from rearward (+x) toward up (+z).
        caliper_deg: f64,
    }
    let inch = 25.4;
    let corners = [
        Corner {
            c: FRONT_WHEEL,
            face: FRONT_FACE_Y,
            bead: 10.0 * inch + 8.0,
            // 275/30R20: 20 in + 2 x 30 % of 275 mm
            outer: 10.0 * inch + 0.30 * 275.0,
            half: 275.0 / 2.0,
            rim_half: 5.0 * inch,
            rotor_r: 200.0,
            rotor_t: 38.0,
            caliper_deg: 20.0, // behind the axle, a little above it
        },
        Corner {
            c: REAR_WHEEL,
            face: REAR_FACE_Y,
            bead: 10.5 * inch + 8.0,
            // 345/25R21
            outer: 10.5 * inch + 0.25 * 345.0,
            half: 345.0 / 2.0,
            rim_half: 6.5 * inch,
            rotor_r: 195.0,
            rotor_t: 34.0,
            caliper_deg: 170.0, // ahead of the axle
        },
    ];
    let mut rims = Vec::new();
    let mut tyres = Vec::new();
    let mut rotors = Vec::new();
    let mut calipers = Vec::new();
    let mut lugs = Vec::new();
    for k in &corners {
        let c = v3(k.c[0], k.c[1], k.c[2]);
        let (b, o, h) = (k.bead, k.outer, k.half);
        // Tyre section (r, dy): beads at the rim, rounded shoulders; the
        // tread is cut flat where it meets the ground (the loaded tyre's
        // contact patch: the hub sits lower than the unloaded radius).
        let tyre = revolve_y(
            vec![
                [b, -h + 14.0],
                [b + 15.0, -h + 2.0],
                [b + 0.45 * (o - b), -h - 3.0],
                [o - 18.0, -h + 6.0],
                [o, -h + 28.0],
                [o, h - 28.0],
                [o - 18.0, h - 6.0],
                [b + 0.45 * (o - b), h + 3.0],
                [b + 15.0, h - 2.0],
                [b, h - 14.0],
            ],
            c,
        );
        let ground = rbox(v3(k.c[0], k.c[1], -1000.0), v3(1000.0, 1000.0, 1000.0), 0.0);
        tyres.push(sub(tyre, ground));
        // Rim barrel and flanges.
        let rh = k.rim_half;
        let rim = revolve_y(
            vec![
                [b - 34.0, -rh],
                [b + 6.0, -rh],
                [b + 6.0, -rh + 10.0],
                [b - 22.0, -rh + 15.0],
                [b - 22.0, rh - 15.0],
                [b + 6.0, rh - 8.0],
                [b + 6.0, rh + 4.0],
                [b - 10.0, rh + 8.0],
                [b - 34.0, rh],
            ],
            c,
        );
        // Hub disc, its outer face at the measured offset.
        let hub_dy = k.face - 14.0;
        let hub = revolve_y(
            vec![[0.0, hub_dy - 40.0], [110.0, hub_dy - 40.0], [110.0, hub_dy], [70.0, hub_dy + 10.0], [0.0, hub_dy + 14.0]],
            c,
        );
        // Ten spokes, each forking into a Y a little over half way out;
        // twenty rim attachments in all. Dished from the hub face to the
        // rim's outer flange.
        let rr = b - 30.0;
        let fork_r = 0.58 * rr;
        let arm = 8.5f64.to_radians();
        let fork_y = hub_dy + 0.55 * (rh - 10.0 - hub_dy);
        let hub_p = v3(0.0, hub_dy - 5.0, 95.0);
        let fork = v3(0.0, fork_y, fork_r);
        let rim_a = v3(rr * arm.sin(), rh - 10.0, rr * arm.cos());
        let rim_b = v3(-rr * arm.sin(), rh - 10.0, rr * arm.cos());
        // Three arrays (stems, left arms, right arms): the kernel's fit
        // check measures an element's angular width from its bounding box,
        // and a whole Y's box is wider than its 36° sector.
        let ring = |el: F, n: usize| -> F { bx(RotationalArray::new(el, n, Vec3::ZERO, v3(0.0, 1.0, 0.0)).expect("spoke array")) };
        let spokes = uni_all(vec![
            ring(capsule(hub_p, fork, 11.0), 10),
            ring(capsule(fork, rim_a, 7.5), 10),
            ring(capsule(fork, rim_b, 7.5), 10),
        ]);
        rims.push(uni_all(vec![rim, hub, at(spokes, c)]));
        // five lug nuts on the 120 mm bolt circle
        let lug = capsule(v3(0.0, hub_dy, 60.0), v3(0.0, hub_dy + 16.0, 60.0), 11.0);
        lugs.push(at(bx(RotationalArray::new(lug, 5, Vec3::ZERO, v3(0.0, 1.0, 0.0)).expect("lug array")), c));
        // Rotor: disc plus hat, its centre plane 30 mm inboard of the wheel centre.
        let rp = -30.0;
        let t2 = k.rotor_t / 2.0;
        let disc = revolve_y(
            vec![
                [60.0, rp + t2 + 30.0],
                [140.0, rp + t2 + 30.0],
                [140.0, rp + t2],
                [k.rotor_r, rp + t2],
                [k.rotor_r, rp - t2],
                [125.0, rp - t2],
                [125.0, rp + t2 + 18.0],
                [60.0, rp + t2 + 18.0],
            ],
            Vec3::ZERO,
        );
        // Cross-drilling: three staggered rings of 24 holes, 7 mm across.
        let hole = |r: f64, deg: f64| {
            let a = deg.to_radians();
            capsule(v3(r * a.sin(), rp - t2 - 5.0, r * a.cos()), v3(r * a.sin(), rp + t2 + 5.0, r * a.cos()), 3.5)
        };
        let span = k.rotor_r - 150.0;
        let drill = uni_all(vec![hole(150.0, 0.0), hole(150.0 + 0.5 * span, 4.5), hole(150.0 + 0.72 * span, 9.0)]);
        let holes = ring(drill, 24);
        rotors.push(at(sub(disc, holes), c));
        // Caliper: an arc of the rotor's rim, 72° long, straddling the disc.
        // In the prism's (x, z) outline, angle 0 is rearward, 90 up.
        let dir = k.caliper_deg.to_radians();
        let half_span = 36f64.to_radians();
        let reach = 400.0;
        let wedge = prism(
            &[
                [0.0, 0.0],
                [reach * (dir - half_span).cos(), reach * (dir - half_span).sin()],
                [reach * dir.cos(), reach * dir.sin()],
                [reach * (dir + half_span).cos(), reach * (dir + half_span).sin()],
            ],
            Ax::Y,
            rp - t2 - 46.0,
            rp + t2 + 42.0,
        );
        let arc = revolve_y(
            vec![[k.rotor_r - 62.0, rp - t2 - 46.0], [b - 34.0, rp - t2 - 46.0], [b - 34.0, rp + t2 + 42.0], [k.rotor_r - 62.0, rp + t2 + 42.0]],
            Vec3::ZERO,
        );
        calipers.push(at(isect(arc, wedge), c));
    }
    let four = |v: Vec<F>| mirror_y(uni_all(v));
    Gear {
        rims: four(rims),
        tyres: four(tyres),
        rotors: four(rotors),
        calipers: four(calipers),
        lugs: four(lugs),
    }
}

/// An add-on part fitted to the views (`data/addons.json`, written by the
/// fitting tools): lofted sections and extruded outlines.
pub struct Addon {
    pub name: &'static str,
    pub material: &'static str,
    pub finish: Finish,
    pub field: F,
    pub voxel: f64,
    /// Clip the part to the outside of the body skin (it sits on it).
    pub outside_body: bool,
    /// The part cuts the body instead (it takes the space it overlaps).
    pub cut_body: bool,
}

fn finish_named(s: &str) -> Finish {
    match s {
        "carbon" => CARBON,
        "white" => ARCTIC_WHITE,
        "gloss_black" => GLOSS_BLACK,
        "satin_black" => SATIN_BLACK,
        "exhaust" => EXHAUST,
        other => panic!("addons.json: unknown finish {other}"),
    }
}

fn pts3(v: &Value) -> Vec<Vec3> {
    v.as_array().expect("points").iter().map(|p| v3(p[0].as_f64().unwrap(), p[1].as_f64().unwrap(), p[2].as_f64().unwrap())).collect()
}

fn pts2(v: &Value) -> Vec<[f64; 2]> {
    v.as_array().expect("outline").iter().map(|p| [p[0].as_f64().unwrap(), p[1].as_f64().unwrap()]).collect()
}

/// Every add-on part in `data/addons.json`.
pub fn addons() -> Vec<Addon> {
    let text = std::fs::read_to_string(concat!(env!("CARGO_MANIFEST_DIR"), "/data/addons.json")).expect("data/addons.json");
    let doc: Value = serde_json::from_str(&text).expect("addons.json");
    let leak = |s: &str| -> &'static str { Box::leak(s.to_string().into_boxed_str()) };
    doc["parts"]
        .as_array()
        .expect("parts")
        .iter()
        .map(|p| {
            let mut fs: Vec<F> = Vec::new();
            for l in p["lofts"].as_array().map(|a| a.as_slice()).unwrap_or(&[]) {
                let rings: Vec<Vec<Vec3>> = l["rings"].as_array().expect("rings").iter().map(pts3).collect();
                let f = bx(loft(&rings));
                fs.push(if l["mirror"].as_bool().unwrap_or(false) { mirror_y(f) } else { f });
            }
            for m in p["meshes"].as_array().map(|a| a.as_slice()).unwrap_or(&[]) {
                // a closed triangle mesh (e.g. a carved visual hull), gated
                let raw = odawn_geo::RawMesh {
                    vertices_mm: pts3(&m["vertices"]),
                    triangles: m["triangles"]
                        .as_array()
                        .expect("triangles")
                        .iter()
                        .map(|t| [t[0].as_u64().unwrap() as u32, t[1].as_u64().unwrap() as u32, t[2].as_u64().unwrap() as u32])
                        .collect(),
                    multi_patch_cells: 0,
                };
                let mesh = raw.validate(None, 1).expect("addons.json: a mesh fails the kernel's gate");
                let f = bx(odawn_geo::MeshField::new(&mesh));
                fs.push(if m["mirror"].as_bool().unwrap_or(false) { mirror_y(f) } else { f });
            }
            for b in p["boxes"].as_array().map(|a| a.as_slice()).unwrap_or(&[]) {
                // an oriented rounded box: `axes` is the rotation taking the
                // box's own axes to the car's (rows of the matrix)
                let ax: Vec<Vec3> = pts3(&b["axes"]);
                let rot = odawn_geo::Mat3 { rows: [[ax[0].x, ax[0].y, ax[0].z], [ax[1].x, ax[1].y, ax[1].z], [ax[2].x, ax[2].y, ax[2].z]] };
                let h = &b["half"];
                let half = v3(h[0].as_f64().unwrap(), h[1].as_f64().unwrap(), h[2].as_f64().unwrap());
                let c = &b["centre"];
                let centre = v3(c[0].as_f64().unwrap(), c[1].as_f64().unwrap(), c[2].as_f64().unwrap());
                let f = bx(Placed::new(rbox(Vec3::ZERO, half, b["radius"].as_f64().unwrap()), rot, centre));
                fs.push(if b["mirror"].as_bool().unwrap_or(false) { mirror_y(f) } else { f });
            }
            for t in p["tubes"].as_array().map(|a| a.as_slice()).unwrap_or(&[]) {
                fs.push(tube(t));
            }
            for c in p["capsules"].as_array().map(|a| a.as_slice()).unwrap_or(&[]) {
                let e = pts3(&Value::Array(vec![c["a"].clone(), c["b"].clone()]));
                let f = capsule(e[0], e[1], c["radius"].as_f64().unwrap());
                fs.push(if c["mirror"].as_bool().unwrap_or(false) { mirror_y(f) } else { f });
            }
            for q in p["prisms"].as_array().map(|a| a.as_slice()).unwrap_or(&[]) {
                let ax = match q["axis"].as_str().expect("axis") {
                    "x" => Ax::X,
                    "y" => Ax::Y,
                    _ => Ax::Z,
                };
                let f = prism(&pts2(&q["outline"]), ax, q["lo"].as_f64().unwrap(), q["hi"].as_f64().unwrap());
                fs.push(if q["mirror"].as_bool().unwrap_or(false) { mirror_y(f) } else { f });
            }
            Addon {
                name: leak(p["name"].as_str().expect("name")),
                material: leak(p["material"].as_str().expect("material")),
                finish: finish_named(p["finish"].as_str().expect("finish")),
                field: {
                    let f = uni_all(fs);
                    let cut: Vec<F> = p["subtract_tubes"].as_array().map(|a| a.iter().map(tube).collect()).unwrap_or_default();
                    if cut.is_empty() { f } else { sub(f, uni_all(cut)) }
                },
                voxel: p["voxel_mm"].as_f64().unwrap_or(2.0),
                outside_body: p["outside_body"].as_bool().unwrap_or(false),
                cut_body: p["cut_body"].as_bool().unwrap_or(false),
            }
        })
        .collect()
}

/// A straight tube along x (`axis` "x"; the only one used): `centre` is
/// the start of its axis, `length` mm long, radii `r_in` (0: a solid rod)
/// and `r_out`.
fn tube(t: &Value) -> F {
    assert_eq!(t["axis"].as_str(), Some("x"), "addons.json: tubes run along x");
    let c = pts3(&Value::Array(vec![t["centre"].clone()]))[0];
    let (l, ri, ro) = (t["length"].as_f64().unwrap(), t["r_in"].as_f64().unwrap(), t["r_out"].as_f64().unwrap());
    let profile = if ri > 0.0 { vec![[ri, 0.0], [ro, 0.0], [ro, l], [ri, l]] } else { vec![[0.0, 0.0], [ro, 0.0], [ro, l], [0.0, l]] };
    // revolved about y, then turned so that y runs along x
    let f = place(revolve_y(profile, Vec3::ZERO), v3(0.0, 0.0, 1.0), -90.0, c);
    if t["mirror"].as_bool().unwrap_or(false) { mirror_y(f) } else { f }
}
