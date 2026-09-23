//! Hooks and riding, from the player's side.
//!
//!   left / right mouse   throw a hook, or let that one go
//!   R / F (hold)         reel in / pay out
//!   E                    let go of both
//!   G                    brace on the ropes and steer, or walk the back
//!   riding and braced:   A D pry left / right, W drive it on, S ease off,
//!                        C crouch to grip, Space jump clear
//!
//! All the physics lives in the core crate; this reads input, says where
//! hooks are thrown from and to, draws the ropes and says what is going on.

use bevy::prelude::*;
use wormsign_core::brain::{Reins, State};
use wormsign_core::glam::DVec3;
use wormsign_core::hook::{Hook, HookState, REEL_SPEED};

use crate::death::Fate;
use crate::player::{Controls, Look, PlayerBody};
use crate::worms::WormBody;
use crate::world::{Origin, Phase, SimSet};

pub struct RiderPlugin;

impl Plugin for RiderPlugin {
    fn build(&self, app: &mut App) {
        app.init_resource::<Riding>()
            .add_systems(Startup, setup)
            .add_systems(Update, scripted_mount.in_set(Phase::Simulate).before(SimSet))
            .add_systems(Update, input.in_set(Phase::Simulate).before(SimSet).after(crate::player::read_input))
            .add_systems(Update, (draw_ropes, hud).in_set(Phase::View).after(crate::player::camera));
    }
}

#[derive(Clone, Copy, PartialEq, Eq, Debug, Default)]
pub enum Mode {
    /// Braced on the ropes: WASD works the worm.
    #[default]
    Steer,
    /// Hands free: WASD walks, ropes pay out as you go.
    Move,
}

#[derive(Resource, Default)]
pub struct Riding {
    pub hooks: [Hook; 2],
    /// Which worm each hook is in.
    pub hooked: [Option<Entity>; 2],
    pub mode: Mode,
    pub reins: Reins,
    /// The worm being ridden: the one with a hook in it.
    pub worm: Option<Entity>,
    /// Standing on a worm's back this frame.
    pub on_back: bool,
    /// Speed of the ridden worm, for the camera.
    pub speed: f64,
    /// Requests from input, consumed by the simulation.
    pub throw: [bool; 2],
    pub reel: f64,
}

impl Riding {
    pub fn riding(&self) -> bool {
        self.worm.is_some() && self.hooks.iter().any(|h| h.anchored())
    }

    pub fn let_go(&mut self) {
        for h in &mut self.hooks {
            h.release();
        }
        self.hooked = [None, None];
        self.worm = None;
    }
}

fn input(
    keys: Res<ButtonInput<KeyCode>>,
    mouse: Res<ButtonInput<MouseButton>>,
    cursor: Query<&bevy::window::CursorOptions, With<bevy::window::PrimaryWindow>>,
    fate: Res<Fate>,
    mut riding: ResMut<Riding>,
    mut controls: ResMut<Controls>,
) {
    if !fate.alive() {
        riding.let_go();
        return;
    }
    // The click that captures the pointer is not a throw.
    let captured = cursor.single().map(|c| c.grab_mode != bevy::window::CursorGrabMode::None).unwrap_or(false);
    let web_test = crate::web::has_flag("hooktest");
    if captured || web_test {
        riding.throw[0] |= mouse.just_pressed(MouseButton::Left);
        riding.throw[1] |= mouse.just_pressed(MouseButton::Right);
    }
    // Keyboard alternatives, and for scripted runs.
    riding.throw[0] |= keys.just_pressed(KeyCode::KeyZ);
    riding.throw[1] |= keys.just_pressed(KeyCode::KeyX);
    riding.reel = keys.pressed(KeyCode::KeyF) as i32 as f64 - keys.pressed(KeyCode::KeyR) as i32 as f64;
    if keys.just_pressed(KeyCode::KeyE) {
        riding.let_go();
    }
    if keys.just_pressed(KeyCode::KeyG) {
        riding.mode = if riding.mode == Mode::Steer { Mode::Move } else { Mode::Steer };
    }
    // Braced on the ropes, the keys work the worm and the feet stay put.
    let i = &mut controls.0;
    if riding.riding() && riding.mode == Mode::Steer {
        riding.reins.steer = i.right;
        riding.reins.drive = i.forward;
        i.forward = 0.0;
        i.right = 0.0;
        i.run = false;
        i.sandwalk = false;
        if i.jump {
            // Jump clear.
            riding.let_go();
        }
    } else {
        riding.reins.steer = 0.0;
        riding.reins.drive = 0.0;
    }
}

/// One substep of the hooks, run inside the player's simulation loop so the
/// rope acts on exactly the state the walker just produced.
pub fn step_hooks(
    riding: &mut Riding,
    body: &mut wormsign_core::player::Player,
    look: &Look,
    worms: &[(Entity, &WormBody)],
    ground: impl Fn(f64, f64) -> f64 + Copy,
    dt: f64,
) {
    let grip = |p: DVec3| p + DVec3::Y * 1.3;
    for i in 0..2 {
        if std::mem::take(&mut riding.throw[i]) {
            if matches!(riding.hooks[i].state, HookState::Stowed) {
                let rot = Quat::from_euler(EulerRot::YXZ, look.yaw, look.pitch, 0.0);
                let dir = (rot * -Vec3::Z).as_dvec3();
                // Thrown a little upward of the aim, the way you would.
                riding.hooks[i].throw(grip(body.pos), dir + DVec3::Y * 0.06, body.vel);
            } else {
                riding.hooks[i].release();
                riding.hooked[i] = None;
            }
        }
        match riding.hooks[i].state {
            HookState::Flying { pos, .. } => {
                // Whichever worm is nearest the hook gets the chance to be hit.
                let near = worms
                    .iter()
                    .min_by(|a, b| {
                        let da = (a.1.worm.head() - pos).length().min(a.1.worm.rings.iter().step_by(10).map(|r| (r.centre - pos).length()).fold(f64::MAX, f64::min));
                        let db = (b.1.worm.head() - pos).length().min(b.1.worm.rings.iter().step_by(10).map(|r| (r.centre - pos).length()).fold(f64::MAX, f64::min));
                        da.partial_cmp(&db).unwrap()
                    })
                    .copied();
                riding.hooks[i].fly(dt, near.map(|n| &n.1.worm), ground);
                if riding.hooks[i].anchored() {
                    riding.hooked[i] = near.map(|n| n.0);
                }
            }
            HookState::Anchored { .. } => {
                let Some(w) = riding.hooked[i].and_then(|e| worms.iter().find(|x| x.0 == e)) else {
                    riding.hooks[i].release();
                    riding.hooked[i] = None;
                    continue;
                };
                // An anchor dragged under the sand tears out: a diving worm
                // sheds its rider.
                if let Some(a) = riding.hooks[i].position(Some(&w.1.worm)) {
                    if a.y < ground(a.x, a.z) - 1.0 {
                        riding.hooks[i].release();
                        riding.hooked[i] = None;
                        continue;
                    }
                }
                riding.hooks[i].reel(riding.reel * REEL_SPEED * dt);
                // Walking the back, the rope pays out as needed.
                if riding.mode == Mode::Move {
                    riding.hooks[i].reel(REEL_SPEED * 0.5 * dt);
                }
                let (mut p, mut v) = (body.pos, body.vel);
                riding.hooks[i].constrain(&w.1.worm, grip(body.pos), &mut p, &mut v, dt);
                body.pos = p;
                body.vel = v;
            }
            HookState::Stowed => riding.hooked[i] = None,
        }
    }
    // Which worm is being ridden, and the reins for it.
    riding.worm = riding.hooked.iter().flatten().next().copied();
    riding.reins.hooks.clear();
    if let Some(e) = riding.worm {
        for i in 0..2 {
            if riding.hooked[i] == Some(e) {
                if let HookState::Anchored { d, angle, .. } = riding.hooks[i].state {
                    let side = if let Some(w) = worms.iter().find(|x| x.0 == e) { (angle + w.1.worm.roll).sin() } else { 0.0 };
                    riding.reins.hooks.push((d, side.clamp(-1.0, 1.0)));
                }
            }
        }
        if let Some(w) = worms.iter().find(|x| x.0 == e) {
            riding.speed = w.1.worm.speed;
        }
    } else {
        riding.speed = 0.0;
    }
}

// --- ropes -----------------------------------------------------------------

#[derive(Component)]
struct Rope(usize);

#[derive(Component)]
struct HookHead(usize);

fn setup(mut commands: Commands, mut meshes: ResMut<Assets<Mesh>>, mut mats: ResMut<Assets<StandardMaterial>>) {
    let rope = mats.add(StandardMaterial { base_color: Color::srgb(0.18, 0.14, 0.10), perceptual_roughness: 0.9, ..default() });
    let steel = mats.add(StandardMaterial { base_color: Color::srgb(0.55, 0.52, 0.48), metallic: 0.8, perceptual_roughness: 0.35, ..default() });
    let cyl = meshes.add(Cylinder::new(1.0, 1.0));
    let cone = meshes.add(Cone { radius: 0.12, height: 0.45 });
    for i in 0..2 {
        commands.spawn((Rope(i), Mesh3d(cyl.clone()), MeshMaterial3d(rope.clone()), Transform::default(), Visibility::Hidden));
        commands.spawn((HookHead(i), Mesh3d(cone.clone()), MeshMaterial3d(steel.clone()), Transform::default(), Visibility::Hidden));
    }
}

type RopeQ<'w, 's> = Query<'w, 's, (&'static Rope, &'static mut Transform, &'static mut Visibility), Without<HookHead>>;
type HeadQ<'w, 's> = Query<'w, 's, (&'static HookHead, &'static mut Transform, &'static mut Visibility), Without<Rope>>;

fn draw_ropes(
    origin: Res<Origin>,
    riding: Res<Riding>,
    look: Res<Look>,
    player: Query<&PlayerBody>,
    worms: Query<&WormBody>,
    mut ropes: RopeQ,
    mut heads: HeadQ,
) {
    let Ok(pb) = player.single() else { return };
    let yaw = look.yaw as f64;
    let right = DVec3::new(yaw.cos(), 0.0, -yaw.sin());
    for (rope, mut t, mut v) in &mut ropes {
        let i = rope.0;
        let worm = riding.hooked[i].and_then(|e| worms.get(e).ok()).map(|w| &w.worm);
        let Some(end) = riding.hooks[i].position(worm) else {
            *v = Visibility::Hidden;
            continue;
        };
        let side = if i == 0 { -0.25 } else { 0.25 };
        let hand = pb.0.pos + DVec3::Y * 1.25 + right * side;
        let (a, b) = (origin.to_render(hand), origin.to_render(end));
        let d = b - a;
        let len = d.length().max(0.01);
        t.translation = (a + b) * 0.5;
        t.rotation = Quat::from_rotation_arc(Vec3::Y, d / len);
        // Slack ropes read thinner.
        let taut = riding.hooks[i].tension > 0.0;
        let r = if taut { 0.03 } else { 0.02 };
        t.scale = Vec3::new(r, len, r);
        *v = Visibility::Inherited;
    }
    for (head, mut t, mut v) in &mut heads {
        let i = head.0;
        let worm = riding.hooked[i].and_then(|e| worms.get(e).ok()).map(|w| &w.worm);
        let Some(end) = riding.hooks[i].position(worm) else {
            *v = Visibility::Hidden;
            continue;
        };
        let hand = pb.0.pos + DVec3::Y * 1.25;
        let dir = (end - hand).normalize_or_zero().as_vec3();
        t.translation = origin.to_render(end);
        t.rotation = Quat::from_rotation_arc(Vec3::Y, if dir.length_squared() > 0.5 { dir } else { Vec3::Y });
        *v = Visibility::Inherited;
    }
}

// --- what is going on ----------------------------------------------------------

#[derive(Component)]
struct RideText;

fn hud(
    mut commands: Commands,
    riding: Res<Riding>,
    clock: Res<crate::world::SimClock>,
    worms: Query<&WormBody>,
    mut text: Query<(&mut Text, &mut Visibility), With<RideText>>,
    mut made: Local<bool>,
) {
    if !*made {
        *made = true;
        commands.spawn((
            RideText,
            Text::new(""),
            TextFont { font_size: FontSize::Px(13.0), ..default() },
            TextColor(Color::srgba(1.0, 0.93, 0.80, 0.9)),
            TextLayout::justify(Justify::Center),
            Node { position_type: PositionType::Absolute, top: px(70), left: percent(50), margin: UiRect::left(px(-220)), width: px(440), ..default() },
            Visibility::Hidden,
        ));
        return;
    }
    let Ok((mut t, mut v)) = text.single_mut() else { return };
    let any = riding.hooks.iter().any(|h| !matches!(h.state, HookState::Stowed));
    if !any {
        if *v != Visibility::Hidden {
            *v = Visibility::Hidden;
        }
        return;
    }
    let hook = |h: &Hook, name: &str| match h.state {
        HookState::Stowed => format!("{name} ready"),
        HookState::Flying { .. } => format!("{name} -"),
        HookState::Anchored { len, .. } => format!("{name} in | {len:.0} m{}", if h.tension > 0.0 { " taut" } else { "" }),
    };
    let mut s = format!("{}     {}", hook(&riding.hooks[0], "L"), hook(&riding.hooks[1], "R"));
    if riding.riding() {
        let mode = match riding.mode {
            Mode::Steer => "braced - A/D pry, W drive, S ease, space jump clear",
            Mode::Move => "walking the back - G to brace",
        };
        s.push_str(&format!("\n{:.0} m/s   {mode}", riding.speed));
        if let Some(w) = riding.worm.and_then(|e| worms.get(e).ok()) {
            if w.brain.thrashing(clock.0) {
                s.push_str("\nIT IS ROLLING - hold on, crouch (C)");
            } else if w.worm.depth > w.worm.spec.radius * 0.9 && w.brain.state == State::Ridden {
                s.push_str("\nit is going under - pry it up (W) or get off");
            } else if w.brain.agitation > 0.7 {
                s.push_str("\nit is getting angry - ease off");
            }
        }
    }
    if t.0 != s {
        t.0 = s;
    }
    if *v != Visibility::Inherited {
        *v = Visibility::Inherited;
    }
}

/// `?ride`: start already on the nearest worm's back, both hooks set, at
/// its speed — for trying the riding without first catching one.
fn scripted_mount(
    mut done: Local<bool>,
    mut riding: ResMut<Riding>,
    mut player: Query<&mut PlayerBody>,
    mut worms: Query<(Entity, &mut WormBody)>,
) {
    if *done {
        return;
    }
    *done = true;
    if !crate::web::has_flag("ride") {
        return;
    }
    let Ok(mut pb) = player.single_mut() else { return };
    let p = pb.0.pos;
    let Some((e, mut wb)) = worms.iter_mut().min_by(|a, b| {
        (a.1.worm.head() - p).length().partial_cmp(&(b.1.worm.head() - p).length()).unwrap()
    }) else {
        return;
    };
    wb.brain.hold = None;
    let w = &mut wb.worm;
    // Bring it up to riding depth and a lope before climbing on.
    let r = w.spec.radius;
    w.depth = 0.62 * r;
    w.want_depth = 0.62 * r;
    w.speed = 18.0;
    w.want_speed = 18.0;
    let d = 80.0;
    let (c, _, up, side, rad) = w.frame(d);
    let top = c + up * rad;
    pb.0.pos = top + DVec3::Y * 0.05;
    pb.0.vel = w.skin_velocity(d, top);
    pb.0.grounded = true;
    for (i, s) in [(0usize, -1.0f64), (1, 1.0)] {
        let dir = (up * 0.75 + side * s * 0.66).normalize();
        let angle = w.skin_angle(d - 6.0, dir);
        riding.hooks[i].state = HookState::Anchored { d: d - 6.0, angle, len: 3.0 };
        riding.hooked[i] = Some(e);
    }
    riding.worm = Some(e);
}
