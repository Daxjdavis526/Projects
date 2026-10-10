//! ZR1 — a 1:15.3 scale C8 Corvette ZR1 (ZTK, Arctic White and visible
//! carbon, blue calipers and belts, Jet Black interior) generated on the
//! Orbital Dawn geometry kernel.
//!
//! `cargo run --release` writes `model/zr1.step` and `model/zr1.glb`.
//! `cargo run --release -- preview` writes only the body loft as STL.
//! `ZR1_DETAIL=2` doubles every voxel (a fast, coarse draft).

mod body;
mod car;
mod export;
mod fields;
mod interior;
mod part;
mod trace;

use std::path::Path;

/// The scale: a 7-inch wheelbase.
pub const SCALE: f64 = 7.0 * 25.4 / body::REAR_AXLE_X;

fn main() {
    let args: Vec<String> = std::env::args().collect();
    if args.get(1).map(String::as_str) == Some("preview") {
        std::fs::create_dir_all("out").expect("out dir");
        let m = body::outer_mesh(20.0, 12);
        m.write_binary_stl(Path::new("out/body_loft.stl")).expect("stl");
        println!("loft: {} triangles, volume {:.3} m3", m.triangle_count(), m.volume_mm3() / 1e9);
        let b = part::Built {
            name: "Body",
            material: "Arctic White (G8G)",
            finish: car::ARCTIC_WHITE,
            mesh: m.clone(),
            step_mesh: m,
            shells: 1,
            raw_triangles: 0,
            deviation_mm: 0.0,
            step_deviation_mm: 0.0,
            seconds: 0.0,
            mesher: "loft",
        };
        export::write_glb(&[b], SCALE, body::REAR_AXLE_X / 2.0, Path::new("out/preview.glb")).expect("glb");
        return;
    }
    let detail: f64 = std::env::var("ZR1_DETAIL").ok().and_then(|s| s.parse().ok()).unwrap_or(1.0);
    // `zr1` builds every part; `zr1 <name>` rebuilds the matching parts
    // (`=Name` for an exact name; several separated by commas) and reuses
    // the cache for the rest;
    // `zr1 assemble` only re-writes the files from the cache.
    let only: Option<String> = args.get(1).cloned();
    let cache = Path::new(if detail == 1.0 { "out/parts" } else { "out/parts-draft" });
    let mut built = Vec::new();
    let mut missing = Vec::new();
    for p in car::parts(detail) {
        let rebuild = match &only {
            None => true,
            Some(o) if o == "assemble" => false,
            Some(o) => o.split(',').any(|o| match o.strip_prefix('=') {
                Some(exact) => p.name.eq_ignore_ascii_case(exact),
                None => p.name.to_lowercase().contains(&o.to_lowercase()),
            }),
        };
        if !rebuild {
            match part::load(&p, cache) {
                Some(Ok(b)) => built.push(b),
                Some(Err(e)) => {
                    eprintln!("REFUSED {e}");
                    missing.push(p.name);
                }
                None => missing.push(p.name),
            }
            continue;
        }
        let name = p.name;
        match part::build(p) {
            Ok(b) => {
                println!(
                    "{:20} {:>9} -> {:>8} triangles (STEP {:>7}), {} shell(s), deviation {:.2} / {:.2} mm full scale, {}, {:.1} s",
                    b.name,
                    b.raw_triangles,
                    b.mesh.triangle_count(),
                    b.step_mesh.triangle_count(),
                    b.shells,
                    b.deviation_mm,
                    b.step_deviation_mm,
                    b.mesher,
                    b.seconds
                );
                part::save(&b, cache).expect("cache");
                built.push(b);
            }
            Err(e) => {
                eprintln!("REFUSED {name}: {e}");
                missing.push(name);
            }
        }
    }
    if !missing.is_empty() {
        eprintln!("not in the model (refused or never built): {}", missing.join(", "));
    }
    std::fs::create_dir_all("model").expect("model dir");
    let x_mid = body::REAR_AXLE_X / 2.0;
    let tris: usize = built.iter().map(|b| b.mesh.triangle_count()).sum();
    let tag = if missing.is_empty() { "zr1" } else { "zr1-partial" };
    let n = export::write_step(
        &built,
        SCALE,
        x_mid,
        "Corvette ZR1 1-15.3",
        "C8 Corvette ZR1 coupe, ZTK, 1:15.3 (7 in wheelbase), millimetres, z up, +x rearward; generated on the Orbital Dawn geometry kernel",
        Path::new(&format!("model/{tag}.step")),
    )
    .expect("step");
    let g = export::write_glb(&built, SCALE, x_mid, Path::new(&format!("model/{tag}.glb"))).expect("glb");
    let m = export::write_3mf(&built, SCALE, x_mid, "Corvette ZR1 1:15.3", Path::new(&format!("model/{tag}.3mf"))).expect("3mf");
    let st: usize = built.iter().map(|b| b.step_mesh.triangle_count()).sum();
    println!(
        "{} parts; {tris} triangles (GLB {:.1} MB, 3MF {:.1} MB); STEP {st} faces, {:.1} MB",
        built.len(),
        g as f64 / 1e6,
        m as f64 / 1e6,
        n as f64 / 1e6
    );
}
