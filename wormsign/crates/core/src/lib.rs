//! WORMSIGN's logic, with no engine in it.
//!
//! Everything that decides what happens — the shape of the desert, whether a
//! worm hears you, where its body goes, whether you stay on it — lives here,
//! in plain Rust that `cargo test` can run without a GPU or a browser. The
//! Bevy crate only draws it and feeds it input.

pub use glam;

pub mod anim;
pub mod brain;
pub mod cloth;
pub mod gait;
pub mod hook;
pub mod lod;
pub mod path;
pub mod player;
pub mod ragdoll;
pub mod rng;
pub mod shade;
pub mod skin;
pub mod terrain;
pub mod tilemesh;
pub mod vibration;
pub mod worm;
