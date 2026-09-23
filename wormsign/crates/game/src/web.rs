//! The few places the game talks to the page around it.

/// Call `window[name](arg)` if the page defines it. Silent otherwise, and a
/// no-op off the web, so gameplay code never has to care.
#[cfg(target_arch = "wasm32")]
pub fn call(name: &str, arg: Option<&str>) {
    use wasm_bindgen::{JsCast, JsValue};
    let global = js_sys::global();
    let Ok(f) = js_sys::Reflect::get(&global, &JsValue::from_str(name)) else { return };
    let Some(f) = f.dyn_ref::<js_sys::Function>() else { return };
    let _ = match arg {
        Some(a) => f.call1(&JsValue::NULL, &JsValue::from_str(a)),
        None => f.call0(&JsValue::NULL),
    };
}

#[cfg(not(target_arch = "wasm32"))]
pub fn call(_name: &str, _arg: Option<&str>) {}

/// The page's query string, e.g. `?debug&scene=caller`. Empty off the web
/// unless `WORMSIGN_FLAGS` is set.
pub fn flags() -> String {
    #[cfg(target_arch = "wasm32")]
    {
        use wasm_bindgen::JsValue;
        let global = js_sys::global();
        js_sys::Reflect::get(&global, &JsValue::from_str("location"))
            .and_then(|l| js_sys::Reflect::get(&l, &JsValue::from_str("search")))
            .ok()
            .and_then(|s| s.as_string())
            .unwrap_or_default()
    }
    #[cfg(not(target_arch = "wasm32"))]
    {
        std::env::var("WORMSIGN_FLAGS").unwrap_or_default()
    }
}

pub fn has_flag(name: &str) -> bool {
    flags().trim_start_matches('?').split('&').any(|kv| kv.split('=').next() == Some(name))
}

/// The value of `name=value` in the query string, if present.
pub fn flag_value(name: &str) -> Option<String> {
    flags()
        .trim_start_matches('?')
        .split('&')
        .find_map(|kv| {
            let mut it = kv.splitn(2, '=');
            (it.next() == Some(name)).then(|| it.next().unwrap_or("").to_string())
        })
}

pub fn flag_f32(name: &str) -> Option<f32> {
    flag_value(name).and_then(|v| v.parse().ok())
}
