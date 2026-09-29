shader_type spatial;
render_mode unshaded, fog_disabled, cull_disabled, depth_draw_never, blend_mix, shadows_disabled;

// A flat deck of blocky clouds: value noise sampled on a coarse grid so each
// cloud is built from square cells, drifting with the wind.
global uniform float daylight;
global uniform vec3 sun_dir;
global uniform vec4 sky_horizon;
global uniform vec4 sky_top;
global uniform float cloud_cover;
global uniform vec4 cloud_shade;
global uniform float underwater;

uniform vec2 wind = vec2(1.6, 0.6);
uniform float cell = 12.0;

varying vec3 v_world;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

float vnoise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
}

void vertex() {
    v_world = (MODEL_MATRIX * vec4(VERTEX, 1.0)).xyz;
}

// Not-a-number or infinite pixels (some drivers make them) become black, never a bloom blob.
vec3 safe_color(vec3 c, float hi) {
    if (any(isnan(c)) || any(isinf(c))) return vec3(0.0);
    return clamp(c, vec3(0.0), vec3(hi));
}

void fragment() {
    vec2 p = v_world.xz + wind * TIME;
    vec2 c = floor(p / cell);
    float n = vnoise(c * 0.23) * 0.65 + vnoise(c * 0.61 + 17.0) * 0.35;
    float cover = 1.0 - cloud_cover;
    if (n < cover) discard;
    float dist = length(v_world.xz - CAMERA_POSITION_WORLD.xz);
    float fade = 1.0 - smoothstep(320.0, 560.0, dist);
    // Cloud edges catch a little less light than their middles.
    float edge = smoothstep(cover, cover + 0.12, n);
    // By day as bright as the daylight allows; by night dim grey shapes against the stars, lit only by the moon.
    float day = smoothstep(-0.14, 0.28, sun_dir.y);
    vec3 lit = mix(vec3(0.028, 0.031, 0.043), vec3(1.0) * clamp(daylight * 1.1, 0.0, 1.0), day);
    vec3 col = mix(sky_horizon.rgb, lit * cloud_shade.rgb, 0.85) * (0.86 + 0.14 * edge);
    ALBEDO = safe_color(col, 1.0);
    // A flat deck that follows the camera: from high above it would show as a patch; it fades
    // out as you climb, and the far terrain paints the planet's own clouds instead.
    float above = 1.0 - smoothstep(380.0, 820.0, CAMERA_POSITION_WORLD.y);
    ALPHA = mix(0.7, 0.82, day) * fade * above * (underwater > 0.5 ? 0.0 : 1.0);
}
