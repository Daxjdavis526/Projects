//! ZR1 — a 1:15.3 scale C8 Corvette ZR1 (ZTK, Arctic White and visible
//! carbon, blue calipers and belts, Jet Black interior) generated on the
//! Orbital Dawn geometry kernel from measurements of calibrated reference
//! views (`tools/measure`).
//!
//! `cargo run --release` builds every part and writes `model/zr1.step`,
//! `model/zr1.3mf` and `model/zr1.glb`.
//! `cargo run --release -- <filter>` rebuilds the parts whose names
//! contain `<filter>` (`=Name` for an exact name, several separated by
//! commas) and takes the rest from the cache; `assemble` rebuilds nothing.
//! `cargo run --release -- stl <filter>` builds the matching parts and
//! writes each as `out/<name>.stl` (for overlay checks) without touching
//! the model.
//! `cargo run --release -- skin [levels]` subdivides the measured body
//! cage, gates it and writes `out/skin.stl`.
//! `ZR1_DETAIL=2` doubles every voxel (a fast, coarse draft).

mod car;
mod export;
mod fields;
mod interior;
mod part;
mod regions;
mod skin;

use std::path::Path;

/// Rear axle, mm behind the front axle (GM: wheelbase 2723 mm).
pub const WHEELBASE: f64 = 2723.0;
/// The scale: a 7-inch wheelbase.
pub const SCALE: f64 = 7.0 * 25.4 / WHEELBASE;
/// Subdivision steps of the body cage.
const SKIN_LEVELS: usize = 3;

fn matches(name: &str, filter: &str) -> bool {
    filter.split(',').any(|o| match o.strip_prefix('=') {
        Some(exact) => name.eq_ignore_ascii_case(exact),
        None => name.to_lowercase().contains(&o.to_lowercase()),
    })
}

fn report(b: &part::Built) {
    println!(
        "{:22} {:>9} -> {:>8} triangles (STEP {:>7}), {} shell(s), deviation {:.2} / {:.2} mm full scale, {}, {:.1} s",
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
}

fn main() {
    let args: Vec<String> = std::env::args().collect();
    if args.get(1).map(String::as_str) == Some("skin") {
        let levels: usize = args.get(2).and_then(|s| s.parse().ok()).unwrap_or(SKIN_LEVELS);
        let cage = skin::Cage::load().expect("cage");
        let t0 = std::time::Instant::now();
        let m = skin::mesh(&cage, levels).expect("skin");
        std::fs::create_dir_all("out").expect("out dir");
        m.write_binary_stl(Path::new("out/skin.stl")).expect("stl");
        println!(
            "skin: cage {} vertices / {} quads, level {levels}: {} triangles, volume {:.4} m3, gated in {:.1} s",
            cage.vertices.len(),
            cage.quads.len(),
            m.triangle_count(),
            m.volume_mm3() / 1e9,
            t0.elapsed().as_secs_f64()
        );
        return;
    }
    let detail: f64 = std::env::var("ZR1_DETAIL").ok().and_then(|s| s.parse().ok()).unwrap_or(1.0);
    let body = car::Body::load(SKIN_LEVELS).expect("body skin");
    let cache = Path::new(if detail == 1.0 { "out/parts" } else { "out/parts-draft" });

    if args.get(1).map(String::as_str) == Some("slice") {
        // slice <part> <x|y|z> <coord> <c1,c2> <half> <px> <out.pgm>: the
        // part's field on a plane, inside dark (a diagnostic for the gate)
        let a = |i: usize| args.get(i).cloned().unwrap_or_default();
        let (name, axis, coord) = (a(2), a(3), a(4).parse::<f64>().expect("coord"));
        let c: Vec<f64> = a(5).split(',').map(|x| x.parse().expect("centre")).collect();
        let (half, px) = (a(6).parse::<f64>().expect("half"), a(7).parse::<f64>().expect("px"));
        let part = car::parts(detail, &body).into_iter().find(|p| p.name == name).expect("no such part");
        let n = (2.0 * half / px).round() as usize;
        let mut img = vec![0u8; n * n];
        use rayon::prelude::*;
        img.par_chunks_mut(n).enumerate().for_each(|(row, line)| {
            let v = c[1] + half - (row as f64 + 0.5) * px;
            for (col, out) in line.iter_mut().enumerate() {
                let u = c[0] - half + (col as f64 + 0.5) * px;
                let q = match axis.as_str() {
                    "x" => odawn_geo::Vec3::new(coord, u, v),
                    "y" => odawn_geo::Vec3::new(u, coord, v),
                    _ => odawn_geo::Vec3::new(u, v, coord),
                };
                let f = part.field.eval_mm(q);
                *out = if f < 0.0 { (60.0 + (-f).min(30.0) * 2.0) as u8 } else { (200.0 + f.min(25.0)) as u8 };
            }
        });
        let mut bytes = format!("P5\n{n} {n}\n255\n").into_bytes();
        bytes.extend_from_slice(&img);
        std::fs::write(a(8), bytes).expect("write");
        return;
    }
    if args.get(1).map(String::as_str) == Some("stl") {
        let filter = args.get(2).cloned().unwrap_or_default();
        std::fs::create_dir_all("out").expect("out dir");
        for p in car::parts(detail, &body) {
            if !matches(p.name, &filter) {
                continue;
            }
            let name = p.name;
            match part::build(p) {
                Ok(b) => {
                    report(&b);
                    let file = format!("out/{}.stl", name.to_lowercase().replace(' ', "_"));
                    b.mesh.write_binary_stl(Path::new(&file)).expect("stl");
                    part::save(&b, cache).expect("cache");
                }
                Err(e) => eprintln!("REFUSED {name}: {e}"),
            }
        }
        return;
    }

    let only: Option<String> = args.get(1).cloned();
    let mut built = Vec::new();
    let mut missing = Vec::new();
    for p in car::parts(detail, &body) {
        let rebuild = match &only {
            None => true,
            Some(o) if o == "assemble" => false,
            Some(o) => matches(p.name, o),
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
                report(&b);
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
    let x_mid = WHEELBASE / 2.0;
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
