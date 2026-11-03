// MathVerse's native entry point. On Windows release builds there is no console window.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    mathverse_lib::run()
}
