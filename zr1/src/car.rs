//! The car, part by part. Every part is a field built from the kernel's
//! primitives and operations plus the few shapes in `fields`; `main`
//! sends each through the bake → mesh → gate → simplify → gate pipeline.
//!
//! Full-scale millimetres. x rearward from the front axle, y to the
//! car's right, z up from the ground.
//!
//! Where numbers come from (see README for the sources):
//! - GM fleet order guide 2025/2026: wheelbase 2723, width 2025, height
//!   1234, tracks 1685 / 1678.
//! - GM ZR1 reveal release: tyres 275/30ZR20 and 345/25ZR21 on 20x10 and
//!   21x13 wheels; carbon-ceramic rotors 400x38 front, 390x34 rear,
//!   6-piston front and 4-piston rear monobloc calipers.
//! - Tyre overall diameters 26.5 in and 27.8 in (retailer listings).
//! - Outlines of glass, carbon, vents and lights: traced from the
//!   four-view drawing, hand-cleaned (`trace`, `body`).
//! - Wing span 75 in (owner's measurement reported by CorvetteBlogger);
//!   wing section, uprights and endplates from the drawing and GM photos.

use std::sync::Arc;

use odawn_geo::ops::RotationalArray;
use odawn_geo::{Field, Vec3};

use crate::body;
use crate::fields::*;
use crate::part::{Finish, Part};

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
/// Gloss black trim, grille mesh, wheel liners.
pub const GLOSS_BLACK: Finish = fin([0.02, 0.02, 0.022], 0.0, 0.18);
/// Jet Black interior (leather and suede).
pub const INTERIOR_BLACK: Finish = fin([0.05, 0.05, 0.055], 0.0, 0.75);
/// Tension Blue belts (RPO 3A9; "Santorini Blue" for 2026).
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
/// "Blue" calipers (RPO J6B).
pub const CALIPER_BLUE: Finish = fin([0.05, 0.32, 0.78], 0.1, 0.3);
/// Clear headlamp lens over chrome reflectors.
pub const HEADLAMP: Finish = fin([0.80, 0.82, 0.85], 0.8, 0.15);
/// Tail lamp red.
pub const TAILLAMP: Finish = fin([0.62, 0.03, 0.04], 0.1, 0.25);
/// Chrome (lug nuts).
pub const CHROME: Finish = fin([0.85, 0.86, 0.88], 1.0, 0.12);
/// Exhaust tips.
pub const EXHAUST: Finish = fin([0.15, 0.15, 0.16], 0.9, 0.3);

// ------------------------------------------------------------- geometry

/// Front and rear wheel centres (right side): x, y, z.
pub const FRONT_WHEEL: [f64; 3] = [0.0, 1685.0 / 2.0, 26.5 * 25.4 / 2.0];
/// Rear wheel centre.
pub const REAR_WHEEL: [f64; 3] = [body::REAR_AXLE_X, 1678.0 / 2.0, 27.8 * 25.4 / 2.0];

/// Mirror a polygon given for the right half (y ≥ 0, listed from the
/// centre line outward and back) into a full symmetric outline.
fn sym(half: &[[f64; 2]]) -> Vec<[f64; 2]> {
    let mut v: Vec<[f64; 2]> = half.to_vec();
    for p in half.iter().rev() {
        if p[1].abs() > 1e-9 {
            v.push([p[0], -p[1]]);
        }
    }
    v
}

/// Plan-view (x, y) outline extruded vertically between z0 and z1.
fn plan(poly: &[[f64; 2]], z0: f64, z1: f64) -> F {
    prism(poly, Ax::Z, z0, z1)
}

/// Side-view (x, z) outline on the right side between y0 and y1, mirrored.
fn side(poly: &[[f64; 2]], y0: f64, y1: f64) -> F {
    mirror_y(prism(poly, Ax::Y, y0, y1))
}

/// Front/rear-view (y, z) outline (right side, y > 0) between x0 and x1, mirrored.
fn end(poly: &[[f64; 2]], x0: f64, x1: f64) -> F {
    mirror_y(prism(poly, Ax::X, x0, x1))
}

/// Front/rear-view (y, z) outline given as its right half from the centre
/// line, made whole and extruded between x0 and x1.
fn end_whole(half: &[[f64; 2]], x0: f64, x1: f64) -> F {
    let mut v: Vec<[f64; 2]> = half.to_vec();
    for p in half.iter().rev() {
        if p[0].abs() > 1e-9 {
            v.push([-p[0], p[1]]);
        }
    }
    prism(&v, Ax::X, x0, x1)
}

/// Wheel-arch cylinder about the axle through `c`, radius `r`, from `y_in` outward.
fn arch(c: [f64; 3], r: f64, y_in: f64) -> F {
    revolve_y(
        vec![[0.0, y_in - c[1]], [r, y_in - c[1]], [r, 1300.0 - c[1]], [0.0, 1300.0 - c[1]]],
        v3(c[0], c[1], c[2]),
    )
}

/// The regions, all hand-cleaned from the traced drawing.
mod regions {
    /// Side windows (x, z).
    pub const SIDE_WINDOW: &[[f64; 2]] = &[
        [813.0, 970.0], [867.0, 857.0], [1329.0, 887.0], [1666.0, 928.0], [1696.0, 1114.0],
        [1341.0, 1138.0], [1209.0, 1126.0], [1077.0, 1096.0], [909.0, 1024.0],
    ];
    /// Rear quarter (dark) behind the side window (x, z).
    pub const QUARTER: &[[f64; 2]] = &[
        [1678.0, 923.0], [1792.0, 952.0], [1990.0, 1042.0], [1918.0, 1090.0], [1840.0, 1102.0],
        [1702.0, 1126.0],
    ];
    /// Windshield, plan, right half (x, y) from the centre line.
    pub const WINDSHIELD: &[[f64; 2]] = &[
        [178.0, 0.0], [202.0, 270.0], [262.0, 479.0], [387.0, 712.0], [423.0, 712.0],
        [932.0, 552.0], [962.0, 505.0], [902.0, 325.0], [884.0, 166.0], [830.0, 95.0], [830.0, 0.0],
    ];
    /// Carbon roof panel, plan, right half.
    pub const ROOF: &[[f64; 2]] = &[
        [880.0, 0.0], [880.0, 100.0], [905.0, 180.0], [925.0, 330.0], [980.0, 515.0],
        [1060.0, 560.0], [1489.0, 491.0], [1728.0, 466.0], [1794.0, 393.0], [1872.0, 190.0],
        [1878.0, 0.0],
    ];
    /// Rear hatch (carbon spine and louvres), plan, right half.
    pub const HATCH: &[[f64; 2]] = &[
        [2009.0, 0.0], [2009.0, 445.0], [2081.0, 497.0], [2793.0, 423.0], [2850.0, 345.0],
        [3021.0, 80.0], [3021.0, 0.0],
    ];
    /// One rear glass pane (right), plan.
    pub const REAR_GLASS: &[[f64; 2]] = &[
        [2105.0, 390.0], [2207.0, 172.0], [2823.0, 112.0], [2697.0, 325.0],
    ];
    /// Hood extractor vent, plan, right half.
    pub const HOOD_VENT: &[[f64; 2]] = &[
        [-534.0, 0.0], [-490.0, 150.0], [-445.0, 288.0], [-390.0, 400.0], [-320.0, 460.0],
        [-241.0, 497.0], [-199.0, 466.0], [-235.0, 368.0], [-262.0, 276.0], [-290.0, 120.0],
        [-295.0, 0.0],
    ];
    /// Slot intake on top of each rear fender (right), plan.
    pub const FENDER_SLOT: &[[f64; 2]] = &[
        [2111.0, 767.0], [2494.0, 650.0], [2584.0, 657.0], [2733.0, 706.0], [2721.0, 724.0],
        [2506.0, 761.0], [2141.0, 785.0],
    ];
    /// Side intake behind the door, side view (x, z).
    pub const SIDE_INTAKE: &[[f64; 2]] = &[
        [1407.0, 797.0], [1630.0, 737.0], [1840.0, 689.0], [1918.0, 647.0], [1924.0, 617.0],
        [1804.0, 455.0], [1828.0, 467.0], [1990.0, 659.0], [2176.0, 701.0], [2212.0, 755.0],
        [2152.0, 755.0], [1822.0, 743.0], [1486.0, 803.0],
    ];
    /// Headlamp, plan (right side, x, y).
    pub const HEADLAMP_PLAN: &[[f64; 2]] = &[
        [-469.0, 790.0], [-540.0, 775.0], [-648.0, 650.0], [-714.0, 528.0], [-618.0, 577.0],
        [-540.0, 644.0], [-487.0, 693.0],
    ];
    /// Headlamp, front view (right side, y, z).
    pub const HEADLAMP_FRONT: &[[f64; 2]] = &[
        [470.0, 690.0], [560.0, 610.0], [700.0, 585.0], [880.0, 610.0], [925.0, 680.0],
        [880.0, 765.0], [760.0, 790.0], [600.0, 760.0],
    ];
    /// Lower front grille, front view (right half, y, z).
    pub const GRILLE: &[[f64; 2]] = &[
        [0.0, 150.0], [845.0, 150.0], [839.0, 515.0], [591.0, 485.0], [412.0, 443.0],
        [152.0, 425.0], [0.0, 425.0],
    ];
    /// Tail lamp, rear view (right, y, z).
    pub const TAILLAMP_REAR: &[[f64; 2]] = &[
        [421.0, 760.0], [600.0, 730.0], [800.0, 715.0], [944.0, 740.0], [944.0, 805.0],
        [800.0, 835.0], [600.0, 845.0], [421.0, 805.0],
    ];
    /// Tail lamp, side view (x, z).
    pub const TAILLAMP_SIDE: &[[f64; 2]] = &[
        [3150.0, 860.0], [3300.0, 885.0], [3540.0, 910.0], [3600.0, 850.0], [3580.0, 740.0],
        [3400.0, 775.0], [3250.0, 825.0],
    ];
    /// Rear lower vents, rear view (right, y, z).
    pub const REAR_VENT: &[[f64; 2]] = &[
        [449.0, 551.0], [505.0, 515.0], [833.0, 509.0], [901.0, 509.0], [895.0, 605.0],
        [492.0, 599.0],
    ];
    /// Rear valance and diffuser (carbon), rear view, right half.
    pub const VALANCE: &[[f64; 2]] = &[
        [0.0, 0.0], [1000.0, 0.0], [1000.0, 288.0], [889.0, 270.0], [870.0, 413.0],
        [808.0, 449.0], [474.0, 455.0], [251.0, 497.0], [0.0, 497.0],
    ];
    /// Rocker panel (side view, x, z).
    pub const ROCKER: &[[f64; 2]] = &[
        [430.0, 110.0], [2290.0, 110.0], [2290.0, 235.0], [430.0, 215.0],
    ];
}

/// Window regions: side windows, windshield, rear panes.
fn windows() -> F {
    use regions::*;
    uni_all(vec![
        side(SIDE_WINDOW, 300.0, 1200.0),
        plan(&sym(WINDSHIELD), 800.0, 1400.0),
        mirror_y(plan(REAR_GLASS, 900.0, 1400.0)),
    ])
}

/// The turbo-air inlets on the rear hatch: transverse louvre slots in
/// the carbon beside and behind the two glass panes (GM: "carbon inlets
/// on top of the rear hatch"). Slots 28 mm wide on an 85 mm pitch.
fn hatch_louvres() -> F {
    use regions::*;
    let mut slots = Vec::new();
    // (the first slot starts clear of the glass panes' front corners: a
    // slot end meeting a pane's margin at a point leaves a pinch of
    // carbon the mesh gate refuses)
    let mut x = 2121.5;
    while x < 2990.0 {
        slots.push(plan(&[[x, -600.0], [x + 28.0, -600.0], [x + 28.0, 600.0], [x, 600.0]], 850.0, 1400.0));
        x += 85.0;
    }
    // inside the hatch, outside the glass panes and the centre spine
    let spine = plan(&[[1900.0, -70.0], [3100.0, -70.0], [3100.0, 70.0], [1900.0, 70.0]], 850.0, 1400.0);
    isect(
        isect(uni_all(slots), plan(&sym(HATCH), 850.0, 1400.0)),
        bx(odawn_geo::ops::Difference {
            a: bx(odawn_geo::primitives::Cuboid::new(v3(5000.0, 5000.0, 5000.0)).expect("all space")),
            b: uni(mirror_y(plan(&grow(REAR_GLASS, 25.0), 850.0, 1400.0)), spine),
        }),
    )
}

/// A plan outline pushed outward by `d` about its own centroid (enough
/// for the small margins it is used for).
fn grow(poly: &[[f64; 2]], d: f64) -> Vec<[f64; 2]> {
    let n = poly.len() as f64;
    let c = poly.iter().fold([0.0, 0.0], |s, p| [s[0] + p[0] / n, s[1] + p[1] / n]);
    poly.iter()
        .map(|p| {
            let (dx, dy) = (p[0] - c[0], p[1] - c[1]);
            let l = (dx * dx + dy * dy).sqrt().max(1e-9);
            [p[0] + dx / l * d, p[1] + dy / l * d]
        })
        .collect()
}

/// Recessed vents: hood extractor, fender-top slots, side intakes,
/// lower grille, rear vents, hatch louvres.
fn vents() -> F {
    use regions::*;
    uni_all(vec![
        hatch_louvres(),
        plan(&sym(HOOD_VENT), 550.0, 1000.0),
        mirror_y(plan(FENDER_SLOT, 800.0, 1200.0)),
        side(SIDE_INTAKE, 650.0, 1200.0),
        end_whole(GRILLE, -1100.0, -650.0),
        end(REAR_VENT, 3300.0, 3700.0),
    ])
}

/// Visible-carbon skin regions: the C2Z roof, the split-window spine and
/// hatch inlets, the rear valance, rockers, rear quarters.
fn carbon_regions() -> F {
    use regions::*;
    uni_all(vec![
        plan(&sym(ROOF), 1000.0, 1400.0),
        plan(&sym(HATCH), 850.0, 1400.0),
        end_whole(VALANCE, 3150.0, 3700.0),
        side(ROCKER, 700.0, 1200.0),
        side(QUARTER, 300.0, 1200.0),
    ])
}

fn headlamps() -> F {
    use regions::*;
    isect(mirror_y(plan(HEADLAMP_PLAN, 450.0, 950.0)), end(HEADLAMP_FRONT, -1100.0, -300.0))
}

fn taillamps() -> F {
    use regions::*;
    isect(end(TAILLAMP_REAR, 3000.0, 3700.0), side(TAILLAMP_SIDE, 300.0, 1100.0))
}

/// Wheel-arch cut (`lined` adds the liner thickness).
fn arches(lined: bool) -> F {
    let e = if lined { 10.0 } else { 0.0 };
    mirror_y(uni(arch(FRONT_WHEEL, 392.0 + e, 650.0 - e), arch(REAR_WHEEL, 408.0 + e, 610.0 - e)))
}

/// The cabin space behind the glass.
pub fn cabin_box() -> F {
    rbox(v3(1160.0, 0.0, 800.0), v3(880.0, 760.0, 560.0), 60.0)
}

/// Depth of the cabin cavity's wall, of the lining, of recessed vents,
/// of skin panels and glass, mm.
const CABIN_WALL: f64 = 30.0;
const LINING: f64 = 20.0;
const VENT_DEPTH: f64 = 45.0;
const SKIN_T: f64 = 8.0;
const GLASS_T: f64 = 10.0;

/// Everything the car is made of. `detail` scales every voxel.
pub fn parts(detail: f64) -> Vec<Part> {
    let vx = |base: f64| base * detail;
    let surf: Arc<dyn Field> = Arc::new(body::outer(20.0, 12));
    let bounds = surf.bounds_mm().expect("body bounds").inflated(20.0);
    let over = |expr: E| -> F {
        bx(OverSurface {
            surf: surf.clone(),
            expr,
            bounds,
        })
    };
    let r = E::R;
    let and = |a: E, b: E| E::Max(vec![a, b]);
    let mut out = Vec::new();

    // ---- body (white): everything not cut away or given to another part
    out.push(Part {
        name: "Body",
        material: "Arctic White (G8G)",
        finish: ARCTIC_WHITE,
        field: over(E::minus(
            E::S(0.0),
            E::Min(vec![
                r(arches(true)),
                and(r(windows()), E::layer(CABIN_WALL)),
                and(r(vents()), E::layer(VENT_DEPTH + 12.0)),
                and(r(carbon_regions()), E::layer(SKIN_T)),
                and(r(uni(headlamps(), taillamps())), E::layer(SKIN_T)),
                and(E::S(CABIN_WALL), r(cabin_box())),
            ]),
        )),
        voxel_mm: vx(4.0),
        band_mm: 0.6,
        sharp: false,
        shells: None,
    });
    out.push(Part {
        name: "Glass",
        material: "Tinted glass",
        finish: GLASS,
        field: over(and(r(windows()), E::layer(GLASS_T))),
        voxel_mm: vx(2.5),
        band_mm: 0.4,
        sharp: false,
        shells: None,
    });
    out.push(Part {
        name: "Carbon panels",
        material: "Visible carbon fiber",
        finish: CARBON,
        field: over(E::minus(
            and(r(carbon_regions()), E::layer(SKIN_T)),
            E::Min(vec![r(mirror_y(plan(regions::REAR_GLASS, 900.0, 1400.0))), r(arches(true)), r(vents())]),
        )),
        voxel_mm: vx(2.5),
        band_mm: 0.4,
        sharp: false,
        shells: None,
    });
    out.push(Part {
        name: "Vents and liners",
        material: "Gloss black",
        finish: GLOSS_BLACK,
        field: over(E::Min(vec![
            and(r(vents()), E::band(VENT_DEPTH, VENT_DEPTH + 12.0)),
            E::minus(and(E::S(0.0), r(arches(true))), r(arches(false))),
        ])),
        voxel_mm: vx(3.0),
        band_mm: 0.5,
        sharp: false,
        shells: None,
    });
    out.push(Part {
        name: "Interior lining",
        material: "Jet Black",
        finish: INTERIOR_BLACK,
        field: over(E::minus(
            and(E::S(CABIN_WALL), r(cabin_box())),
            and(E::S(CABIN_WALL + LINING), r(rbox(v3(1160.0, 0.0, 800.0), v3(860.0, 740.0, 540.0), 40.0))),
        )),
        voxel_mm: vx(5.0),
        band_mm: 0.5,
        sharp: false,
        shells: None,
    });
    out.push(Part {
        name: "Headlamps",
        material: "Clear lens, chrome",
        finish: HEADLAMP,
        field: over(and(r(headlamps()), E::layer(SKIN_T))),
        voxel_mm: vx(2.0),
        band_mm: 0.3,
        sharp: false,
        shells: None,
    });
    out.push(Part {
        name: "Tail lamps",
        material: "Red lens",
        finish: TAILLAMP,
        field: over(and(r(taillamps()), E::layer(SKIN_T))),
        voxel_mm: vx(2.0),
        band_mm: 0.3,
        sharp: false,
        shells: None,
    });
    out.push(Part {
        name: "Front aero",
        material: "Visible carbon fiber",
        finish: CARBON,
        field: front_aero(),
        voxel_mm: vx(2.0),
        band_mm: 0.3,
        sharp: false,
        shells: None,
    });
    out.push(Part {
        name: "Wing",
        material: "Visible carbon fiber",
        finish: CARBON,
        field: wing(),
        voxel_mm: vx(2.0),
        band_mm: 0.3,
        sharp: false,
        shells: None,
    });
    let (housing, stalk) = mirrors();
    out.push(Part {
        name: "Mirrors",
        material: "Arctic White (G8G)",
        finish: ARCTIC_WHITE,
        field: housing,
        voxel_mm: vx(2.0),
        band_mm: 0.3,
        sharp: false,
        shells: Some(2),
    });
    out.push(Part {
        name: "Mirror stalks",
        material: "Gloss black",
        finish: GLOSS_BLACK,
        field: stalk,
        voxel_mm: vx(1.5),
        band_mm: 0.3,
        sharp: false,
        shells: Some(2),
    });
    out.push(Part {
        name: "Exhaust tips",
        material: "Black chrome",
        finish: EXHAUST,
        field: exhaust(),
        voxel_mm: vx(1.5),
        band_mm: 0.2,
        sharp: false,
        shells: Some(4),
    });
    out.push(Part {
        name: "Interior",
        material: "Jet Black",
        finish: INTERIOR_BLACK,
        field: crate::interior::black(),
        voxel_mm: vx(2.0),
        band_mm: 0.3,
        sharp: false,
        shells: None,
    });
    out.push(Part {
        name: "Interior carbon trim",
        material: "Visible carbon fiber",
        finish: CARBON,
        field: crate::interior::carbon(),
        voxel_mm: vx(2.5),
        band_mm: 0.2,
        sharp: false,
        shells: None,
    });
    out.push(Part {
        name: "Seat belts",
        material: "Tension Blue (3A9)",
        finish: BELT_BLUE,
        field: crate::interior::belts(),
        voxel_mm: vx(1.2),
        band_mm: 0.2,
        sharp: false,
        shells: None,
    });
    let (rims, tyres, rotors, calipers, lugs) = running_gear();
    out.push(Part {
        name: "Lug nuts",
        material: "Chrome",
        finish: CHROME,
        field: lugs,
        voxel_mm: vx(1.2),
        band_mm: 0.2,
        sharp: false,
        shells: Some(20),
    });
    out.push(Part {
        name: "Wheels",
        material: "Visible carbon fiber (SU1)",
        finish: CARBON,
        field: rims,
        voxel_mm: vx(2.0),
        band_mm: 0.25,
        sharp: false,
        shells: None,
    });
    out.push(Part {
        name: "Tyres",
        material: "Michelin Pilot Sport Cup 2 R",
        finish: RUBBER,
        field: tyres,
        voxel_mm: vx(2.0),
        band_mm: 0.3,
        sharp: false,
        shells: Some(4),
    });
    out.push(Part {
        name: "Brake rotors",
        material: "Carbon ceramic",
        finish: CERAMIC,
        field: rotors,
        voxel_mm: vx(1.5),
        band_mm: 0.25,
        sharp: false,
        shells: Some(4),
    });
    out.push(Part {
        name: "Brake calipers",
        material: "Blue (J6B)",
        finish: CALIPER_BLUE,
        field: calipers,
        voxel_mm: vx(1.2),
        band_mm: 0.2,
        sharp: false,
        shells: Some(4),
    });
    out
}

/// Door mirrors: body-colour housings on black stalks (as Chevrolet's
/// own render of this build shows them).
fn mirrors() -> (F, F) {
    let housing = mirror_y(rbox(v3(935.0, 1000.0, 905.0), v3(78.0, 56.0, 42.0), 22.0));
    let stalk = mirror_y(sub(
        capsule(v3(860.0, 870.0, 875.0), v3(925.0, 975.0, 895.0), 14.0),
        rbox(v3(935.0, 1000.0, 905.0), v3(78.0, 56.0, 42.0), 22.0),
    ));
    (housing, stalk)
}

/// The ZTK / TOM wing: main plane, endplates and uprights.
pub fn wing() -> F {
    // Wing: a symmetric 12 % section, 300 mm chord, trailing edge raised
    // 10°, bowed back 215 mm at the centre relative to the tips (plan
    // view of the drawing), span 1890 mm between the endplates.
    let chord = 300.0;
    let aoa = 10f64.to_radians();
    let section: Vec<[f64; 2]> = {
        let n = 24;
        let mut up = Vec::new();
        let mut lo = Vec::new();
        for i in 0..=n {
            let t = 0.5 - 0.5 * (std::f64::consts::PI * i as f64 / n as f64).cos();
            // NACA 12 % thickness plus a linear ramp to an 8 mm blunt
            // trailing edge (a knife edge is below any printer, and the
            // real wing's edge carries a Gurney strip).
            let th = 0.12
                * 5.0
                * (0.2969 * t.sqrt() - 0.1260 * t - 0.3516 * t * t + 0.2843 * t.powi(3) - 0.1036 * t.powi(4))
                + 4.0 / chord * t;
            up.push([t, th]);
            lo.push([t, -th]);
        }
        let mut s: Vec<[f64; 2]> = up.into_iter().rev().collect();
        s.extend(lo.into_iter().skip(1).take(n - 1));
        s.iter()
            .map(|p| {
                let (x, z) = (p[0] * chord, p[1] * chord);
                [x * aoa.cos() - z * aoa.sin(), x * aoa.sin() + z * aoa.cos()]
            })
            .collect()
    };
    let half_span = 945.0;
    let mut rings = Vec::new();
    let ns = 40;
    for i in 0..=ns {
        let y = -half_span + 2.0 * half_span * i as f64 / ns as f64;
        let x_le = 3480.0 - 215.0 * (y / 930.0).powi(2);
        rings.push(section.iter().map(|p| v3(x_le + p[0], y, 1105.0 + p[1])).collect());
    }
    let wing = bx(loft(&rings));
    let endplates = side(
        &[[3262.0, 1040.0], [3500.0, 1040.0], [3640.0, 1150.0], [3650.0, 1218.0], [3600.0, 1218.0], [3290.0, 1148.0]],
        930.0,
        950.0,
    );
    let uprights = side(
        &[[3405.0, 860.0], [3480.0, 860.0], [3590.0, 1040.0], [3600.0, 1120.0], [3555.0, 1120.0], [3535.0, 1060.0]],
        352.0,
        382.0,
    );
    uni_all(vec![wing, endplates, uprights])
}

/// The front carbon: splitter, dive planes (one per side, on the fascia
/// corners ahead of the front wheels) and the tall hood Gurney.
pub fn front_aero() -> F {
    let splitter = plan(
        &sym(&[
            [-1097.0, 0.0], [-1075.0, 300.0], [-1040.0, 560.0], [-990.0, 800.0], [-950.0, 940.0],
            [-860.0, 992.0], [-560.0, 992.0], [-560.0, 0.0],
        ]),
        140.0,
        178.0,
    );
    let dive_planes = side(&[[-760.0, 330.0], [-745.0, 350.0], [-575.0, 432.0], [-568.0, 414.0]], 900.0, 990.0);
    let hood_gurney = prism(&[[-205.0, 690.0], [-185.0, 690.0], [-185.0, 795.0], [-200.0, 795.0]], Ax::Y, -430.0, 430.0);
    uni_all(vec![splitter, dive_planes, hood_gurney])
}

/// Quad centre-exit tips.
fn exhaust() -> F {
    let mut v = Vec::new();
    for y in [-165.0, -55.0, 55.0, 165.0] {
        // a tube along y from 0 to 110, turned so it runs along +x
        let tube = revolve_y(vec![[42.0, 0.0], [52.0, 0.0], [52.0, 110.0], [42.0, 110.0]], Vec3::ZERO);
        v.push(place(tube, v3(0.0, 0.0, 1.0), -90.0, v3(3535.0, y, 285.0)));
    }
    uni_all(v)
}

/// Wheels (SU1 carbon, split five-spoke), tyres, rotors and calipers,
/// all four corners. Returns (rims, tyres, rotors, calipers, lug nuts).
fn running_gear() -> (F, F, F, F, F) {
    struct Corner {
        c: [f64; 3],
        // tyre: bead radius, outer radius, half width
        bead: f64,
        outer: f64,
        half: f64,
        // rim half width (10 in / 13 in)
        rim_half: f64,
        rotor_r: f64,
        rotor_t: f64,
        caliper_dir_deg: f64,
    }
    let corners = [
        Corner {
            c: FRONT_WHEEL,
            bead: 262.0,
            outer: 26.5 * 25.4 / 2.0,
            half: 140.0,
            rim_half: 127.0,
            rotor_r: 200.0,
            rotor_t: 38.0,
            caliper_dir_deg: 30.0, // trailing side, above the axle
        },
        Corner {
            c: REAR_WHEEL,
            bead: 275.0,
            outer: 27.8 * 25.4 / 2.0,
            half: 175.0,
            rim_half: 165.0,
            rotor_r: 195.0,
            rotor_t: 34.0,
            caliper_dir_deg: 160.0, // leading side
        },
    ];
    let mut rims = Vec::new();
    let mut tyres = Vec::new();
    let mut rotors = Vec::new();
    let mut calipers = Vec::new();
    let mut lug_nuts = Vec::new();
    for k in &corners {
        let c = v3(k.c[0], k.c[1], k.c[2]);
        let (b, o, h) = (k.bead, k.outer, k.half);
        // Tyre section (r, dy): beads at the rim, rounded shoulders.
        tyres.push(revolve_y(
            vec![
                [b, -h + 12.0], [b + 15.0, -h], [b + 0.45 * (o - b), -h - 3.0], [o - 18.0, -h + 6.0],
                [o, -h + 28.0], [o, h - 28.0], [o - 18.0, h - 6.0], [b + 0.45 * (o - b), h + 3.0],
                [b + 15.0, h], [b, h - 12.0],
            ],
            c,
        ));
        // Rim barrel and flanges.
        let rh = k.rim_half;
        let rim = revolve_y(
            vec![
                [b - 34.0, -rh], [b, -rh], [b, -rh + 10.0], [b - 22.0, -rh + 15.0],
                [b - 22.0, rh - 15.0], [b, rh - 8.0], [b, rh + 4.0], [b - 10.0, rh + 8.0],
                [b - 34.0, rh],
            ],
            c,
        );
        // Hub disc and centre.
        let hub_dy = rh - 70.0;
        let hub = revolve_y(
            vec![[0.0, hub_dy - 40.0], [115.0, hub_dy - 40.0], [115.0, hub_dy], [70.0, hub_dy + 10.0], [0.0, hub_dy + 14.0]],
            c,
        );
        // Five split spokes: each a V of two spokes from the hub to the rim.
        let rr = b - 30.0;
        let spread = 9f64.to_radians();
        let hub_p = v3(0.0, hub_dy - 5.0, 105.0);
        let rim_a = v3(rr * spread.sin(), rh - 6.0, rr * spread.cos());
        let rim_b = v3(-rr * spread.sin(), rh - 6.0, rr * spread.cos());
        let vpair = uni(capsule(hub_p, rim_a, 13.0), capsule(hub_p, rim_b, 13.0));
        let spokes = bx(RotationalArray::new(vpair, 5, Vec3::ZERO, v3(0.0, 1.0, 0.0)).expect("spoke array"));
        let lugs_el = capsule(v3(0.0, hub_dy, 62.0), v3(0.0, hub_dy + 16.0, 62.0), 11.0);
        let lugs = bx(RotationalArray::new(lugs_el, 5, Vec3::ZERO, v3(0.0, 1.0, 0.0)).expect("lug array"));
        rims.push(uni_all(vec![rim, hub, at(spokes, c)]));
        lug_nuts.push(at(lugs, c));
        // Rotor: disc plus hat, its centre plane 30 mm inboard of the wheel centre.
        let rp = -30.0;
        let t2 = k.rotor_t / 2.0;
        let disc = revolve_y(
            vec![
                [60.0, rp + t2 + 30.0], [140.0, rp + t2 + 30.0], [140.0, rp + t2], [k.rotor_r, rp + t2],
                [k.rotor_r, rp - t2], [125.0, rp - t2], [125.0, rp + t2 + 18.0], [60.0, rp + t2 + 18.0],
            ],
            Vec3::ZERO,
        );
        // Cross-drilling: three staggered rings of 24 holes, 7 mm across.
        let hole = |r: f64, deg: f64| {
            let a = deg.to_radians();
            capsule(v3(r * a.sin(), rp - t2 - 5.0, r * a.cos()), v3(r * a.sin(), rp + t2 + 5.0, r * a.cos()), 3.5)
        };
        let span = k.rotor_r - 150.0;
        let drill = uni_all(vec![
            hole(150.0, 0.0),
            hole(150.0 + 0.5 * span, 4.5),
            hole(150.0 + 0.72 * span, 9.0),
        ]);
        let holes = bx(RotationalArray::new(drill, 24, Vec3::ZERO, v3(0.0, 1.0, 0.0)).expect("drill array"));
        rotors.push(at(sub(disc, holes), c));
        // Caliper: an arc of the rotor's rim, 72° long, straddling the disc.
        let dir = k.caliper_dir_deg.to_radians();
        let span = 36f64.to_radians();
        let reach = 400.0;
        let wedge = prism(
            &[
                [0.0, 0.0],
                [reach * (dir - span).cos(), reach * (dir - span).sin()],
                [reach * dir.cos(), reach * dir.sin()],
                [reach * (dir + span).cos(), reach * (dir + span).sin()],
            ],
            Ax::Y,
            rp - t2 - 46.0,
            rp + t2 + 42.0,
        );
        let ring = revolve_y(
            vec![[k.rotor_r - 62.0, rp - t2 - 46.0], [b - 30.0, rp - t2 - 46.0], [b - 30.0, rp + t2 + 42.0], [k.rotor_r - 62.0, rp + t2 + 42.0]],
            Vec3::ZERO,
        );
        calipers.push(at(isect(ring, wedge), c));
    }
    let four = |v: Vec<F>| mirror_y(uni_all(v));
    (four(rims), four(tyres), four(rotors), four(calipers), four(lug_nuts))
}

