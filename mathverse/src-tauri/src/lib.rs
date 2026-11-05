// The native shell: one window running the web interface (WebView2 on Windows),
// plus the file-dialog and file-system plugins used for .mathverse projects and
// exports. All mathematics runs inside the window (TypeScript and Pyodide);
// the Rust side does no computation and opens no network connections.

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .run(tauri::generate_context!())
        .expect("error while running MathVerse");
}
