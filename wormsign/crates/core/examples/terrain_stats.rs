//! Prints a coarse picture of the terrain: height and duniness statistics,
//! and an ASCII map. `cargo run -p wormsign_core --example terrain_stats --release`
use wormsign_core::terrain::Terrain;

fn main() {
    let t = Terrain::new(0x5A2D_1965);
    let (n, step) = (60i32, 200.0);
    let mut hs = vec![];
    let mut dun = vec![];
    for j in -n..n {
        let mut line = String::new();
        for i in -n..n {
            let (x, z) = (i as f64 * step, j as f64 * step);
            let h = t.height(x, z);
            let d = t.duniness(x, z);
            hs.push(h);
            dun.push(d);
            let g = t.sample(x, z);
            line.push(if g.rock > 0.5 { '#' } else { [' ', '.', ':', '-', '=', '+', '*', '%', '@'][((h + 20.0) / 18.0).clamp(0.0, 8.0) as usize] });
        }
        if j % 2 == 0 { println!("{line}"); }
    }
    hs.sort_by(|a, b| a.partial_cmp(b).unwrap());
    let q = |p: f64| hs[((hs.len() - 1) as f64 * p) as usize];
    println!("height p1 {:.0} p10 {:.0} p50 {:.0} p90 {:.0} p99 {:.0}", q(0.01), q(0.1), q(0.5), q(0.9), q(0.99));
    let dn = dun.iter().filter(|d| **d > 0.6).count() as f64 / dun.len() as f64;
    println!("duniness>0.6: {:.0}%", dn * 100.0);
    // Local relief: height range along a 1.2 km transect at a few spots.
    for &(x0, z0) in &[(0.0, 0.0), (5000.0, 3000.0), (-8000.0, 6000.0), (9000.0, -9000.0)] {
        let (mut lo, mut hi) = (f32::MAX, f32::MIN);
        for k in 0..240 { let h = t.height(x0 + k as f64 * 5.0, z0); lo = lo.min(h); hi = hi.max(h); }
        println!("relief at ({x0},{z0}): {:.0} m  duniness {:.2}", hi - lo, t.duniness(x0, z0));
    }
}
