//! Draws the animator's poses side-on, as an SVG strip per gait, so the
//! walk cycle can be looked at without a browser:
//!
//!     cargo run -p wormsign_core --example gait_svg > gaits.svg

use wormsign_core::anim::{j, Activity, AnimInput, Animator, Proportions};
use wormsign_core::gait::Stride;
use wormsign_core::glam::DVec3;
use wormsign_core::player::{GroundHit, Player, PlayerInput};

fn main() {
    let gaits: [(&str, PlayerInput); 5] = [
        ("walk", PlayerInput { forward: 1.0, ..Default::default() }),
        ("run", PlayerInput { forward: 1.0, run: true, ..Default::default() }),
        ("sandwalk", PlayerInput { forward: 1.0, sandwalk: true, ..Default::default() }),
        ("crouch", PlayerInput { forward: 1.0, crouch: true, ..Default::default() }),
        ("still", PlayerInput::default()),
    ];
    let frames = 14;
    let (fw, fh) = (90.0, 220.0);
    let mut out = String::new();
    out += &format!("<svg xmlns='http://www.w3.org/2000/svg' width='{}' height='{}' style='background:#f4ead8'>\n", fw * frames as f64 + 80.0, fh * gaits.len() as f64);
    for (row, (name, inp)) in gaits.iter().enumerate() {
        let dt = 1.0 / 60.0;
        let mut pl = Player::new(DVec3::ZERO);
        pl.grounded = true;
        let mut st = Stride::new(3);
        let mut an = Animator::new(Proportions::of_height(1.78));
        let mut poses = vec![];
        for k in 0..(60 * 6) {
            let f = st.speed_factor(pl.gait);
            let mut i2 = *inp;
            i2.forward *= f;
            pl.step(&i2, dt, |_, _| GroundHit::still(0.0, DVec3::Y));
            let speed = pl.vel.x.hypot(pl.vel.z);
            let strike = st.update(pl.gait, speed, dt).map(|s| s.left);
            let input = AnimInput {
                pos: pl.pos,
                vel: pl.vel,
                ground_vel: DVec3::ZERO,
                look_yaw: 0.0,
                look_pitch: 0.0,
                gait: pl.gait,
                grounded: pl.grounded,
                crouch: pl.crouch,
                step_interval: st.interval(),
                last_left: st.last_left(),
                strike,
                landed: None,
                activity: Activity::Move,
            };
            let pose = an.update(&input, dt, |_, _| 0.0);
            if k >= 60 * 4 {
                poses.push(pose);
            }
        }
        let y0 = fh * (row as f64 + 1.0) - 12.0;
        out += &format!("<text x='4' y='{}' font-size='13' font-family='sans-serif'>{name}</text>\n", y0 - fh + 30.0);
        let step = poses.len() / frames;
        for f in 0..frames {
            let pose = &poses[f * step];
            let x0 = 80.0 + fw * f as f64 + fw * 0.5;
            let pel = pose.j[j::PELVIS];
            // Side-on: forward (-z) to the right, up is up; 100 px per metre.
            let pt = |q: DVec3| (x0 + (pel.z - q.z) * 100.0, y0 - q.y * 100.0);
            let line = |a: usize, b: usize, w: f64, c: &str| {
                let (p, q) = (pt(pose.j[a]), pt(pose.j[b]));
                format!("<line x1='{:.1}' y1='{:.1}' x2='{:.1}' y2='{:.1}' stroke='{c}' stroke-width='{w}' stroke-linecap='round'/>\n", p.0, p.1, q.0, q.1)
            };
            out += &format!("<line x1='{}' y1='{y0}' x2='{}' y2='{y0}' stroke='#b9a37f'/>\n", x0 - fw * 0.5, x0 + fw * 0.5);
            // Far side first, lighter.
            for (side, c) in [(0usize, "#8a9bb5"), (1usize, "#23324a")] {
                out += &line(j::HIP[side], j::KNEE[side], 7.0, c);
                out += &line(j::KNEE[side], j::ANKLE[side], 6.0, c);
                out += &line(j::ANKLE[side], j::TOE[side], 5.0, c);
                if side == 0 {
                    out += &line(j::SHOULDER[side], j::ELBOW[side], 5.0, c);
                    out += &line(j::ELBOW[side], j::WRIST[side], 4.0, c);
                    out += &line(j::WRIST[side], j::FINGERS[side], 3.0, c);
                }
            }
            out += &line(j::PELVIS, j::WAIST, 12.0, "#5a4632");
            out += &line(j::WAIST, j::CHEST, 13.0, "#5a4632");
            out += &line(j::CHEST, j::NECK, 12.0, "#5a4632");
            out += &line(j::NECK, j::HEAD, 6.0, "#5a4632");
            let h = pt(pose.j[j::HEAD]);
            out += &format!("<circle cx='{:.1}' cy='{:.1}' r='11' fill='#5a4632'/>\n", h.0, h.1);
            out += &line(j::SHOULDER[1], j::ELBOW[1], 5.0, "#23324a");
            out += &line(j::ELBOW[1], j::WRIST[1], 4.0, "#23324a");
            out += &line(j::WRIST[1], j::FINGERS[1], 3.0, "#23324a");
            for side in 0..2 {
                if pose.planted[side] {
                    let p = pt(pose.j[j::TOE[side]]);
                    out += &format!("<circle cx='{:.1}' cy='{:.1}' r='3' fill='#c0392b'/>\n", p.0, p.1 + 4.0);
                }
            }
        }
    }
    out += "</svg>\n";
    print!("{out}");
}
