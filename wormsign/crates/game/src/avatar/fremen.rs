//! The figure: a Fremen in a stillsuit, built piece by piece.
//!
//! Proportions are Drillis & Contini's (see `wormsign_core::anim`), for a
//! person 1.78 m tall; girths are ordinary adult ones. The costume is an
//! original design worked from the novel's description, not any film's:
//!
//! - a close-fitting **stillsuit** from neck to wrists and ankles, dark grey
//!   and faintly sheened, with the horizontal ribbing of its layered
//!   "micro-sandwich" construction; **catchpockets** on the thighs; a
//!   **catchtube** from the collar to a **mask** over mouth and nose, with
//!   the nose plugs' tube;
//! - heavy **desert boots** with thick soles, and **gloves**;
//! - a **belt** with pouches and a sheathed **crysknife**, and a cross-strap
//!   **harness** carrying the **worm caller** and two **maker hooks** on the
//!   back;
//! - over it all a long **cloak** (simulated cloth, see `mod.rs`) and a
//!   **hood**.
//!
//! Each piece lives in its segment's frame: +y runs from the segment's first
//! joint to its second, +z toward the back of the body (or, for a foot,
//! toward the sole), x = y × z.

use super::geo::{lin, mix, ribs, ring, scale, Geo, Look, Ring};
use bevy::math::{Quat, Vec3};
use wormsign_core::anim::Proportions;

/// What a piece is made of; each has its own material.
#[derive(Clone, Copy, PartialEq, Eq, Debug, Hash)]
pub enum Stuff {
    Suit,
    Leather,
    Cloth,
    Metal,
    Skin,
}

/// The rigid segments of the body.
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum Seg {
    Pelvis,
    Abdomen,
    Chest,
    Head,
    Thigh(usize),
    Shank(usize),
    Foot(usize),
    UpperArm(usize),
    Forearm(usize),
    Hand(usize),
}

pub const SEGS: [Seg; 16] = [
    Seg::Pelvis,
    Seg::Abdomen,
    Seg::Chest,
    Seg::Head,
    Seg::Thigh(0),
    Seg::Thigh(1),
    Seg::Shank(0),
    Seg::Shank(1),
    Seg::Foot(0),
    Seg::Foot(1),
    Seg::UpperArm(0),
    Seg::UpperArm(1),
    Seg::Forearm(0),
    Seg::Forearm(1),
    Seg::Hand(0),
    Seg::Hand(1),
];

pub struct Palette {
    pub suit: [f32; 3],
    pub suit_dark: [f32; 3],
    pub leather: [f32; 3],
    pub leather_dark: [f32; 3],
    pub cloth: [f32; 3],
    pub metal: [f32; 3],
    pub skin: [f32; 3],
    pub eye: [f32; 3],
}

pub fn palette() -> Palette {
    Palette {
        suit: lin(0.29, 0.26, 0.22),
        suit_dark: lin(0.15, 0.135, 0.12),
        leather: lin(0.33, 0.23, 0.14),
        leather_dark: lin(0.19, 0.13, 0.08),
        cloth: lin(0.62, 0.53, 0.40),
        metal: lin(0.48, 0.45, 0.40),
        skin: lin(0.56, 0.39, 0.29),
        // Blue within blue: the whites are gone too.
        eye: lin(0.10, 0.20, 0.52),
    }
}

/// Deterministic wear and grime, so the suit is not a flat colour.
fn grime(a: f32, b: f32) -> f32 {
    let h = ((a * 127.1 + b * 311.7).sin() * 43758.547).fract().abs();
    let h2 = ((a * 12.9 + b * 78.2).sin() * 23421.63).fract().abs();
    0.9 + 0.1 * h * 0.5 + 0.1 * h2 * 0.5
}

fn suit_look(pal: &Palette, y: f32, th: f32, pitch: f32) -> Look {
    let rib = ribs(y, pitch, 0.0028);
    // Raised bands are the darker layer showing; the valleys are dusty.
    let k = rib / 0.0028;
    let col = mix(pal.suit, pal.suit_dark, k * 0.7);
    // Seams down the sides.
    let seam = (th.cos().abs() > 0.985) as i32 as f32;
    let col = mix(col, pal.suit_dark, seam * 0.6);
    Look { col: scale(col, grime(y * 9.0, th * 3.0)), bump: rib }
}

/// The pieces of one segment, by material. `side` is 0 (left) or 1.
pub fn build(seg: Seg, p: &Proportions) -> Vec<(Stuff, Geo)> {
    let pal = palette();
    let mut suit = Geo::new();
    let mut leather = Geo::new();
    let mut cloth = Geo::new();
    let mut metal = Geo::new();
    let mut skin = Geo::new();
    let h = p.height as f32 / 1.78;
    let s = |v: f32| v * h;
    match seg {
        Seg::Pelvis => {
            let l = (p.waist_height - p.hip_height) as f32;
            let rings = [
                ring(s(-0.12), s(0.115), s(0.085), s(0.01)),
                ring(s(-0.07), s(0.16), s(0.105), s(0.012)),
                ring(s(-0.01), s(0.172), s(0.11), s(0.008)),
                ring(l * 0.6, s(0.162), s(0.104), 0.0),
                ring(l, s(0.148), s(0.098), 0.0),
            ];
            suit.loft(&rings, 28, 120.0, (0.5, 0.0), |y, th| suit_look(&pal, y, th, s(0.034)));
            // Belt.
            let by = l - s(0.035);
            let belt = [ring(by - s(0.028), s(0.156), s(0.106), 0.0), ring(by + s(0.028), s(0.152), s(0.103), 0.0)];
            leather.loft(&belt, 28, 200.0, (0.0, 0.0), |y, th| Look {
                col: scale(pal.leather_dark, 0.9 + 0.1 * (y * 300.0 + th).sin().abs()),
                bump: 0.0,
            });
            // Buckle.
            metal.boxy(Vec3::new(0.0, by, -s(0.108)), Vec3::new(s(0.028), s(0.024), s(0.006)), Quat::IDENTITY, pal.metal);
            // Pouches round the belt, and the knife on the left hip for a
            // cross draw.
            for (ang, w) in [(-0.9f32, 0.045f32), (-2.3, 0.05), (1.9, 0.04), (0.9, 0.04)] {
                let (sn, cs) = ang.sin_cos();
                let at = Vec3::new(cs * s(0.165), by - s(0.035), sn * s(0.115));
                let rot = Quat::from_rotation_y(-ang + std::f32::consts::FRAC_PI_2);
                leather.boxy(at, Vec3::new(s(w), s(0.045), s(0.022)), rot, pal.leather);
                leather.boxy(at + Vec3::Y * s(0.035) + rot * Vec3::Z * s(0.004), Vec3::new(s(w + 0.004), s(0.012), s(0.024)), rot, pal.leather_dark);
            }
            // Crysknife: a curved sheath hanging forward of the left hip,
            // a pale bone-coloured grip above the belt.
            let knife: Vec<Vec3> = (0..8)
                .map(|k| {
                    let t = k as f32 / 7.0;
                    Vec3::new(-s(0.172) - s(0.012) * t, by - s(0.02) - s(0.2) * t, -s(0.05) + s(0.05) * t * t)
                })
                .collect();
            let widths: Vec<f32> = (0..8).map(|k| s(0.02) * (1.0 - 0.55 * k as f32 / 7.0)).collect();
            let thick: Vec<f32> = (0..8).map(|_| s(0.008)).collect();
            leather.sweep_flat(&knife, &widths, &thick, |_| Vec3::X, 10, pal.leather_dark);
            let grip = [Vec3::new(-s(0.17), by + s(0.0), -s(0.05)), Vec3::new(-s(0.17), by + s(0.075), -s(0.06))];
            skin.sweep(&grip, &[s(0.013), s(0.011)], 8, lin(0.78, 0.74, 0.64));
        }
        Seg::Abdomen => {
            let l = (p.chest_height - p.waist_height) as f32;
            let rings = [ring(-s(0.01), s(0.148), s(0.098), 0.0), ring(l * 0.5, s(0.152), s(0.103), -s(0.004)), ring(l + s(0.01), s(0.162), s(0.112), -s(0.008))];
            suit.loft(&rings, 28, 120.0, (0.0, 0.0), |y, th| {
                let mut lk = suit_look(&pal, y, th, s(0.034));
                // The two harness straps crossing the belly.
                let strap = harness(y - l, th);
                if strap > 0.0 {
                    lk.col = mix(lk.col, pal.leather, strap);
                    lk.bump += 0.004 * strap;
                }
                lk
            });
        }
        Seg::Chest => {
            let l = (p.neck_height - p.chest_height) as f32;
            let sh = (p.shoulder_height - p.chest_height) as f32;
            let rings = [
                ring(-s(0.01), s(0.162), s(0.112), -s(0.008)),
                ring(sh * 0.55, s(0.176), s(0.122), -s(0.012)),
                ring(sh * 0.92, s(0.196), s(0.108), -s(0.002)),
                ring(sh + s(0.035), s(0.14), s(0.082), 0.0),
                ring(l - s(0.035), s(0.062), s(0.058), s(0.004)),
                ring(l + s(0.02), s(0.056), s(0.054), s(0.006)),
            ];
            // Closed at the neck, so first person never looks down into it.
            suit.loft(&rings, 30, 120.0, (0.0, 0.8), |y, th| {
                let mut lk = suit_look(&pal, y, th, s(0.034));
                let strap = harness(y, th);
                if strap > 0.0 {
                    lk.col = mix(lk.col, pal.leather, strap);
                    lk.bump += 0.004 * strap;
                }
                lk
            });
            // Collar: the suit's sealed neck ring.
            let collar = [ring(l - s(0.045), s(0.07), s(0.066), s(0.004)), ring(l - s(0.01), s(0.066), s(0.062), s(0.004))];
            leather.loft(&collar, 20, 200.0, (0.0, 0.0), |_, _| Look { col: pal.suit_dark, bump: 0.0 });
            // Caller on the back: a short drum in a sling, slanted.
            let at = Vec3::new(s(0.05), -s(0.06), s(0.14));
            let rot = Quat::from_rotation_z(0.9) * Quat::from_rotation_x(0.1);
            let start = metal.mark();
            metal.loft(&[ring(-s(0.13), s(0.035), s(0.035), 0.0), ring(s(0.13), s(0.035), s(0.035), 0.0)], 14, 40.0, (0.3, 0.3), |y, _| Look {
                col: if (y / s(0.05)).fract() < 0.2 { pal.leather_dark } else { pal.metal },
                bump: 0.0,
            });
            metal.transform_from(start.0, bevy::math::Mat4::from_rotation_translation(rot, at));
        }
        Seg::Head => {
            // From the neck joint up the head's axis to its centre, then on
            // to the crown.
            let l = (p.head_centre - p.neck_height) as f32;
            let neck = [ring(-s(0.02), s(0.052), s(0.05), s(0.006)), ring(l * 0.55, s(0.05), s(0.048), s(0.004))];
            suit.loft(&neck, 18, 120.0, (0.0, 0.0), |y, th| suit_look(&pal, y, th, s(0.02)));
            let head = [
                ring(l - s(0.1), s(0.045), s(0.05), -s(0.02)),
                ring(l - s(0.06), s(0.066), s(0.085), -s(0.008)),
                ring(l, s(0.075), s(0.097), 0.0),
                ring(l + s(0.05), s(0.074), s(0.094), s(0.004)),
            ];
            skin.loft(&head, 24, 150.0, (0.25, 0.9), |y, th| {
                let (sn, cs) = th.sin_cos();
                let _ = cs;
                // Front of the face is -z: sin(theta) = -1.
                let front = (-sn).max(0.0);
                let mut col = pal.skin;
                let mut bump = 0.0;
                // Brow ridge and nose.
                let rel = y - l;
                if front > 0.9 {
                    bump += 0.006 * (1.0 - ((rel - s(0.005)) / s(0.012)).powi(2)).max(0.0) * ((front - 0.9) / 0.1);
                }
                // Stubble and sun: a little darker low on the face.
                col = scale(col, 0.92 + 0.08 * ((rel + s(0.1)) / s(0.2)).clamp(0.0, 1.0));
                if front > 0.985 && rel < -s(0.01) && rel > -s(0.05) {
                    bump += 0.012 * (1.0 - ((rel + s(0.02)) / s(0.028)).abs()).max(0.0);
                }
                Look { col, bump }
            });
            // Eyes, deep blue.
            for x in [-1.0f32, 1.0] {
                skin.blob(Vec3::new(x * s(0.031), l + s(0.004), -s(0.086)), Vec3::new(s(0.013), s(0.008), s(0.008)), Quat::IDENTITY, pal.eye);
            }
            // Mask over mouth and nose, with the filter on the front.
            let mask_y = l - s(0.045);
            let start = suit.mark();
            suit.loft_arc(
                &[ring(mask_y - s(0.032), s(0.05), s(0.06), -s(0.02)), ring(mask_y + s(0.034), s(0.058), s(0.075), -s(0.022))],
                16,
                200.0,
                (0.0, 0.0),
                (3.5, 5.93),
                |_, _| Look { col: pal.suit_dark, bump: 0.0 },
            );
            let _ = start;
            metal.blob(Vec3::new(0.0, mask_y - s(0.005), -s(0.1)), Vec3::new(s(0.022), s(0.018), s(0.012)), Quat::IDENTITY, pal.metal);
            // Nose-plug tube, up from the mask into the nostrils.
            suit.sweep(&[Vec3::new(s(0.01), mask_y + s(0.03), -s(0.097)), Vec3::new(s(0.006), mask_y + s(0.045), -s(0.104))], &[s(0.004), s(0.004)], 6, pal.suit_dark);
            // Catchtube: from the mask's side, round under the jaw, down
            // into the collar.
            let tube: Vec<Vec3> = (0..10)
                .map(|k| {
                    let t = k as f32 / 9.0;
                    Vec3::new(-s(0.05) - s(0.012) * (t * 3.1).sin(), mask_y - s(0.01) - s(0.1) * t, -s(0.055) + s(0.06) * t)
                })
                .collect();
            let r: Vec<f32> = (0..10).map(|_| s(0.0065)).collect();
            suit.sweep(&tube, &r, 8, pal.suit_dark);
            // Hood: open at the face, falling to the shoulders.
            let hood = [
                ring(-s(0.03), s(0.13), s(0.12), s(0.03)),
                ring(l - s(0.07), s(0.095), s(0.112), s(0.012)),
                ring(l, s(0.092), s(0.118), s(0.006)),
                ring(l + s(0.05), s(0.09), s(0.114), s(0.01)),
            ];
            cloth.loft_arc(&hood, 26, 100.0, (0.0, 0.95), (5.26, 5.26 + std::f32::consts::TAU - 1.1), |y, th| {
                let fold = (th * 7.0 + y * 20.0).sin() * 0.003;
                Look { col: scale(pal.cloth, 0.95 + 0.05 * (th * 5.0).sin()), bump: fold }
            });
        }
        Seg::Thigh(side) => {
            let l = p.thigh as f32;
            // Local x points to the body's left along a downward bone.
            let out = if side == 0 { 1.0 } else { -1.0 };
            let rings = [
                Ring { y: -s(0.02), rx: s(0.088), rz: s(0.092), cx: out * s(0.008), cz: 0.0 },
                ring(l * 0.3, s(0.08), s(0.086), -s(0.006)),
                ring(l * 0.75, s(0.064), s(0.068), -s(0.004)),
                ring(l + s(0.02), s(0.054), s(0.058), 0.0),
            ];
            suit.loft(&rings, 22, 120.0, (0.6, 0.0), |y, th| suit_look(&pal, y, th, s(0.03)));
            // Catchpocket on the outside of the thigh.
            let at = Vec3::new(out * s(0.083), l * 0.4, -s(0.01));
            let rot = Quat::from_rotation_y(0.0);
            suit.boxy(at, Vec3::new(s(0.012), s(0.06), s(0.045)), rot, pal.suit_dark);
            leather.boxy(at + Vec3::new(out * s(0.004), -s(0.052), 0.0), Vec3::new(s(0.01), s(0.012), s(0.047)), rot, pal.leather_dark);
            // Harness leg loop.
            let loop_y = s(0.04);
            leather.loft(&[ring(loop_y, s(0.093), s(0.097), 0.0), ring(loop_y + s(0.03), s(0.092), s(0.096), 0.0)], 22, 300.0, (0.0, 0.0), |_, _| Look { col: pal.leather, bump: 0.0 });
        }
        Seg::Shank(_side) => {
            let l = p.shank as f32;
            let rings = [
                ring(-s(0.02), s(0.055), s(0.058), -s(0.004)),
                ring(l * 0.22, s(0.056), s(0.063), s(0.012)),
                ring(l * 0.45, s(0.05), s(0.054), s(0.006)),
            ];
            suit.loft(&rings, 20, 120.0, (0.0, 0.0), |y, th| suit_look(&pal, y, th, s(0.03)));
            // Knee pad.
            leather.blob(Vec3::new(0.0, s(0.0), -s(0.052)), Vec3::new(s(0.045), s(0.05), s(0.018)), Quat::IDENTITY, pal.suit_dark);
            // Boot shaft, to mid-calf, turned over at the top.
            let top = l * 0.42;
            let boot = [
                ring(top, s(0.064), s(0.068), s(0.006)),
                ring(top + s(0.03), s(0.058), s(0.062), s(0.004)),
                ring(l - s(0.04), s(0.047), s(0.05), s(0.002)),
                ring(l + s(0.03), s(0.05), s(0.058), s(0.004)),
            ];
            leather.loft(&boot, 20, 100.0, (0.0, 0.0), |y, th| {
                let cuff = (y < top + s(0.03)) as i32 as f32;
                let lace = ((-th.sin()) > 0.97 && y > top + s(0.05)) as i32 as f32;
                Look { col: mix(scale(pal.leather, grime(y * 5.0, th)), pal.leather_dark, (cuff * 0.6 + lace * 0.8).min(1.0)), bump: 0.0 }
            });
        }
        Seg::Foot(_side) => {
            // The bone runs from the ankle down to the ball of the foot; +z
            // is toward the sole. The ground is ankle-height below the ankle.
            let ah = p.ankle_height as f32;
            let ball = (p.foot * 0.62) as f32;
            let drop = ah * 0.7;
            let l = (ball * ball + drop * drop).sqrt();
            let (sa, ca) = (drop / l, ball / l);
            let sole = |y: f32| (ah - y * sa) / ca;
            let heel = -s(0.075);
            let toe = l + s(0.075);
            let n = 9;
            let rings: Vec<Ring> = (0..=n)
                .map(|k| {
                    let t = k as f32 / n as f32;
                    let y = heel + (toe - heel) * t;
                    // Top of the boot: high over the instep, low at the toe.
                    let top = -s(0.03) + s(0.045) * (t * t);
                    let bottom = sole(y) + s(0.012);
                    let wide = s(0.038) + s(0.012) * (1.0 - ((t - 0.7) / 0.5).powi(2)).max(0.0);
                    Ring { y, rx: wide, rz: (bottom - top) * 0.5, cx: 0.0, cz: (bottom + top) * 0.5 }
                })
                .collect();
            let sole2 = sole;
            leather.loft(&rings, 20, 150.0, (0.35, 0.6), |y, th| {
                // The sole: the outermost few centimetres toward +z.
                let s_th = th.sin();
                let is_sole = (s_th > 0.55) as i32 as f32;
                let _ = sole2(y);
                Look { col: mix(scale(pal.leather, grime(y * 7.0, th)), lin(0.09, 0.08, 0.07), is_sole), bump: 0.0 }
            });
        }
        Seg::UpperArm(side) => {
            let l = p.upper_arm as f32;
            let out = if side == 0 { 1.0 } else { -1.0 };
            let rings = [
                Ring { y: -s(0.01), rx: s(0.06), rz: s(0.062), cx: out * s(0.004), cz: 0.0 },
                ring(l * 0.4, s(0.052), s(0.056), -s(0.004)),
                ring(l + s(0.015), s(0.042), s(0.045), 0.0),
            ];
            suit.loft(&rings, 18, 120.0, (0.8, 0.0), |y, th| suit_look(&pal, y, th, s(0.03)));
        }
        Seg::Forearm(_side) => {
            let l = p.forearm as f32;
            let rings = [ring(-s(0.015), s(0.043), s(0.045), 0.0), ring(l * 0.3, s(0.045), s(0.044), 0.0), ring(l, s(0.031), s(0.027), 0.0)];
            suit.loft(&rings, 16, 120.0, (0.6, 0.0), |y, th| suit_look(&pal, y, th, s(0.028)));
            // Glove gauntlet.
            let cuff = [ring(l - s(0.065), s(0.041), s(0.037), 0.0), ring(l + s(0.01), s(0.036), s(0.032), 0.0)];
            leather.loft(&cuff, 16, 200.0, (0.0, 0.0), |_, _| Look { col: pal.leather_dark, bump: 0.0 });
        }
        Seg::Hand(side) => {
            // Gloved. The palm faces the body when the arm hangs (x); the
            // hand's width runs front to back (z); the thumb is at the front.
            let l = (p.hand * 0.8) as f32;
            let out = if side == 0 { 1.0 } else { -1.0 };
            let rings = [
                ring(-s(0.01), s(0.022), s(0.03), 0.0),
                ring(l * 0.35, s(0.02), s(0.043), 0.0),
                ring(l * 0.7, s(0.016), s(0.041), s(0.002)),
                ring(l, s(0.013), s(0.036), s(0.004)),
            ];
            leather.loft(&rings, 16, 200.0, (0.0, 0.7), |y, th| {
                // Knuckle and finger lines.
                let fingers = if y > l * 0.6 { ((th.sin() * 0.5 + 0.5) * 4.0).fract() } else { 0.5 };
                let groove = (1.0 - (fingers - 0.5).abs() * 2.0 < 0.15) as i32 as f32;
                Look { col: mix(pal.leather_dark, scale(pal.leather_dark, 0.7), groove), bump: 0.0 }
            });
            let thumb = [Vec3::new(-out * s(0.006), s(0.02), -s(0.03)), Vec3::new(-out * s(0.012), s(0.06), -s(0.05)), Vec3::new(-out * s(0.012), s(0.095), -s(0.052))];
            leather.sweep(&thumb, &[s(0.014), s(0.012), s(0.01)], 8, pal.leather_dark);
        }
    }
    let mut out = Vec::new();
    for (k, g) in [(Stuff::Suit, suit), (Stuff::Leather, leather), (Stuff::Cloth, cloth), (Stuff::Metal, metal), (Stuff::Skin, skin)] {
        if !g.is_empty() {
            out.push((k, g));
        }
    }
    out
}

/// Where the harness straps cross the torso, 0..1, in the chest frame
/// (y up from the chest joint, theta 0 at the right side, a quarter turn
/// at the back). Two straps run from each shoulder diagonally to the opposite
/// hip, front and back.
fn harness(y: f32, th: f32) -> f32 {
    // Unwrap around the torso: u = theta (radians), each strap a line
    // u = a + k y.
    let mut best: f32 = 0.0;
    for (a, k) in [(1.2f32, 5.0f32), (1.95, -5.0), (4.3, 5.0), (5.1, -5.0)] {
        let u = a + k * y;
        let mut d = (th - u).rem_euclid(std::f32::consts::TAU);
        if d > std::f32::consts::PI {
            d -= std::f32::consts::TAU;
        }
        let w = 1.0 - (d.abs() / 0.13);
        best = best.max(w.clamp(0.0, 1.0) * 3.0);
    }
    best.min(1.0)
}

/// A maker hook: a long shaft with a curved steel hook at the top. Built
/// along +y from the butt; the hook curls toward -z.
pub fn maker_hook(h: f32) -> Vec<(Stuff, Geo)> {
    let pal = palette();
    let mut wood = Geo::new();
    let mut steel = Geo::new();
    let len = 0.95 * h;
    wood.sweep(&[Vec3::ZERO, Vec3::Y * len * 0.5, Vec3::Y * len], &[0.014 * h, 0.013 * h, 0.012 * h], 10, lin(0.36, 0.28, 0.2));
    // Grip bindings.
    for k in 0..4 {
        let y = len * (0.3 + 0.06 * k as f32);
        wood.loft(&[ring(y, 0.016 * h, 0.016 * h, 0.0), ring(y + 0.025 * h, 0.016 * h, 0.016 * h, 0.0)], 10, 200.0, (0.0, 0.0), |_, _| Look { col: pal.leather_dark, bump: 0.0 });
    }
    let hook: Vec<Vec3> = (0..10)
        .map(|k| {
            let a = k as f32 / 9.0 * 3.3;
            Vec3::new(0.0, len + (a.sin()) * 0.09 * h, -(1.0 - a.cos()) * 0.09 * h)
        })
        .collect();
    let r: Vec<f32> = (0..10).map(|k| (0.012 - 0.0085 * k as f32 / 9.0) * h).collect();
    steel.sweep(&hook, &r, 8, pal.metal);
    vec![(Stuff::Leather, wood), (Stuff::Metal, steel)]
}
