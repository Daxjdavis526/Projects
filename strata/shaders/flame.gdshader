shader_type spatial;
render_mode unshaded, blend_add, cull_disabled, depth_draw_never, fog_disabled, shadows_disabled;

// A rocket flame: a cone from the nozzle (y = 0) down to its tip (y = -1),
// drawn additively so it glows and blooms. White-hot at the throat, yellow
// then orange along its length, flickering, with bright shock diamonds in
// thick air that fade out as the air thins and the plume spreads.

uniform float power = 0.0;      // 0..1: how hard the engine is pushing
uniform float thin = 0.0;       // 0 at sea level .. 1 in thin air
uniform float core = 0.0;       // 1 for the inner cone (hotter, whiter)
varying vec3 v_local;

float h(float n) { return fract(sin(n) * 43758.5453); }
float n1(float x) { float i = floor(x); float f = fract(x); f = f * f * (3.0 - 2.0 * f); return mix(h(i), h(i + 1.0), f); }

void vertex() {
    v_local = VERTEX;
}

// Not-a-number or infinite pixels (some drivers make them) become black, never a bloom blob.
vec3 safe_color(vec3 c, float hi) {
    if (any(isnan(c)) || any(isinf(c))) return vec3(0.0);
    return clamp(c, vec3(0.0), vec3(hi));
}

void fragment() {
    float t = clamp(-v_local.y, 0.0, 1.0);
    // Edges of the cone fade: brightest where we look through the most flame.
    float facing = abs(dot(normalize(NORMAL), normalize(VIEW)));
    float body = pow(facing, 1.5);
    float flick = 0.82 + 0.18 * n1(TIME * 23.0 + t * 7.0) + 0.1 * sin(TIME * 61.0 + t * 30.0);
    float fade = pow(1.0 - t, mix(1.3, 2.4, core));
    vec3 hot = vec3(1.0, 0.96, 0.86);
    vec3 warm = vec3(1.0, 0.62, 0.2);
    vec3 cool = vec3(0.95, 0.28, 0.06);
    vec3 c = mix(hot, warm, smoothstep(0.0, 0.35, t));
    c = mix(c, cool, smoothstep(0.35, 0.9, t));
    c = mix(c, hot, core * 0.6);
    // Shock diamonds: bright knots along the plume in thick air.
    float diamonds = pow(max(0.0, cos(t * 34.0)), 10.0) * (1.0 - thin) * (1.0 - smoothstep(0.1, 0.6, t)) * 1.6;
    float a = power * fade * flick * body * (1.0 + diamonds) * mix(1.0, 0.55, thin);
    ALBEDO = safe_color(c * a * mix(1.6, 2.6, core), 6.0);
}
